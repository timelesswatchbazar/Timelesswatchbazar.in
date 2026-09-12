/**
 * End-to-end store smoke test (order + email + track + contact).
 * Run: node scripts/e2e-store-test.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const storeInbox = process.env.STORE_NOTIFY_EMAIL || "timelesswatchbazar@gmail.com";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
}

async function checkPages(base) {
  const paths = ["/", "/products", "/cart", "/contact", "/track-order", "/about"];
  for (const path of paths) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(base + path, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) pass(`page ${path}`, `${base} ${res.status}`);
      else fail(`page ${path}`, `${base} ${res.status}`);
    } catch (err) {
      fail(`page ${path}`, `${base} ${err.message}`);
    }
  }
}

async function main() {
  console.log("\n=== Timeless Watch Bazar E2E ===\n");

  if (!url || !serviceKey || !anonKey) {
    fail("env", "Missing Supabase env");
    return;
  }
  if (!resendKey) {
    fail("env", "Missing RESEND_API_KEY");
  }

  // Prefer 3001 (current next), fallback 3000
  let base = "http://localhost:3001";
  try {
    const r = await fetch(base + "/", { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    base = "http://localhost:3000";
  }

  await checkPages(base);

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicDb = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: products, error: productsError } = await publicDb
    .from("products")
    .select("id, name, slug, image_url, sale_price, is_active")
    .eq("is_active", true)
    .limit(1);

  if (productsError || !products?.length) {
    fail("load product", productsError?.message || "No active products");
    summarize();
    return;
  }

  const product = products[0];
  pass("load product", product.name);

  const testEmail = "timelesswatchbazar@gmail.com";
  const customerName = "E2E Test Customer";
  const phone = "9755527578";
  const city = "Ujjain";
  const address = "Shop 15, Nanakheda, Ujjain";
  const unit = Number(product.sale_price) || 999;
  const qty = 1;

  // Upsert customer
  const { data: existing } = await db
    .from("customers")
    .select("id")
    .ilike("email", testEmail)
    .maybeSingle();

  let customerId = existing?.id || null;
  if (customerId) {
    await db
      .from("customers")
      .update({ full_name: customerName, phone, address, city })
      .eq("id", customerId);
  } else {
    const { data: created, error } = await db
      .from("customers")
      .insert({
        full_name: customerName,
        email: testEmail,
        phone,
        address,
        city,
      })
      .select("id")
      .single();
    if (error) {
      fail("create customer", error.message);
      summarize();
      return;
    }
    customerId = created.id;
  }
  pass("create/update customer", customerId);

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      customer_email: testEmail,
      customer_phone: phone,
      shipping_address: address,
      city,
      status: "pending",
      payment_status: "cod",
      subtotal: unit * qty,
      discount: 0,
      shipping_fee: 0,
      total: unit * qty,
      notes: "E2E automated test order",
      order_number: "",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    fail("place order", orderError?.message || "No order returned");
    summarize();
    return;
  }
  pass("place order", order.order_number);

  const { error: itemsError } = await db.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    product_slug: product.slug,
    image_url: product.image_url,
    unit_price: unit,
    quantity: qty,
    line_total: unit * qty,
  });

  if (itemsError) fail("order items", itemsError.message);
  else pass("order items", "1 line");

  // Track lookup (same logic as server action)
  const { data: tracked, error: trackError } = await db
    .from("orders")
    .select("id, order_number, status, payment_status, total, city")
    .eq("order_number", order.order_number)
    .ilike("customer_email", testEmail)
    .maybeSingle();

  if (trackError || !tracked) fail("track order", trackError?.message || "Not found");
  else pass("track order", `${tracked.order_number} / ${tracked.status}`);

  // Emails via Resend (order + contact)
  if (resendKey) {
    const resend = new Resend(resendKey);

    const orderMail = await resend.emails.send({
      from,
      to: testEmail,
      subject: `Order confirmed — ${order.order_number} | Timeless Watch Bazar`,
      html: `<p>E2E test order <strong>${order.order_number}</strong></p>
             <p>Order ID: ${order.id}</p>
             <p>Item: ${product.name} × ${qty}</p>
             <p>Total: ₹${unit * qty}</p>
             <p>Ship to: ${address}, ${city}</p>`,
    });
    if (orderMail.error) fail("order email", orderMail.error.message);
    else pass("order email", orderMail.data?.id || "sent");

    const contactMail = await resend.emails.send({
      from,
      to: storeInbox,
      replyTo: testEmail,
      subject: "Contact form — E2E Test | Timeless Watch Bazar",
      html: `<p><strong>Name:</strong> E2E Tester</p>
             <p><strong>Email:</strong> ${testEmail}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Message:</strong> Automated contact form test.</p>`,
    });
    if (contactMail.error) fail("contact email", contactMail.error.message);
    else pass("contact email", contactMail.data?.id || "sent");
  }

  summarize();
  console.log(`\nOrder number for manual track UI: ${order.order_number}`);
  console.log(`Email: ${testEmail}`);
  console.log(`Site base tested: ${base}\n`);
}

function summarize() {
  const failed = results.filter((r) => !r.ok);
  console.log("\n=== Summary ===");
  console.log(`Passed: ${results.filter((r) => r.ok).length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    for (const f of failed) console.log(` - ${f.name}: ${f.detail}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

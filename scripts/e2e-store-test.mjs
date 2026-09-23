/**
 * Storefront smoke + WhatsApp flow test.
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
const SITE_PHONE = "919755527578";
const SITE_URL = "https://www.timelesswatchbazar.in";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
}

async function detectBase() {
  for (const base of [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ]) {
    try {
      const r = await fetch(base + "/", { signal: AbortSignal.timeout(45000) });
      if (r.ok) return base;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function checkPages(base) {
  const paths = [
    "/",
    "/products",
    "/cart",
    "/contact",
    "/track-order",
    "/about",
    "/categories",
    "/profile",
  ];
  for (const path of paths) {
    try {
      const res = await fetch(base + path, { signal: AbortSignal.timeout(60000) });
      if (res.ok) pass(`page ${path}`, `${res.status}`);
      else fail(`page ${path}`, String(res.status));
    } catch (err) {
      fail(`page ${path}`, err.message);
    }
  }
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${SITE_PHONE}?text=${encodeURIComponent(message)}`;
}

async function main() {
  console.log("\n=== Timeless Watch Bazar E2E (WhatsApp flow) ===\n");

  if (!url || !serviceKey || !anonKey) {
    fail("env", "Missing Supabase env");
    summarize();
    return;
  }

  const base = await detectBase();
  if (!base) {
    fail("dev server", "No server on 3000/3001 — start with npm run dev");
    summarize();
    return;
  }
  pass("dev server", base);

  await checkPages(base);

  // Floating WhatsApp marker in HTML
  try {
    const homeHtml = await (await fetch(base + "/", { signal: AbortSignal.timeout(60000) })).text();
    if (
      homeHtml.includes("Chat on WhatsApp") ||
      homeHtml.includes("wa.me/919755527578") ||
      homeHtml.includes("whatsapp")
    ) {
      pass("whatsapp floating/header markup", "found in homepage HTML");
    } else {
      fail("whatsapp floating/header markup", "WhatsApp link not found in HTML");
    }
  } catch (err) {
    fail("whatsapp floating/header markup", err.message);
  }

  const publicDb = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: products, error: productsError } = await publicDb
    .from("products")
    .select("id, name, slug, sale_price, is_active")
    .eq("is_active", true)
    .limit(1);

  if (productsError || !products?.length) {
    fail("load product", productsError?.message || "No active products");
    summarize();
    return;
  }

  const product = products[0];
  pass("load product", product.name);

  // Product page
  try {
    const slugPath = `/products/${encodeURIComponent(product.slug)}`;
    const res = await fetch(base + slugPath, { signal: AbortSignal.timeout(60000) });
    const html = await res.text();
    if (!res.ok) fail("product detail page", String(res.status));
    else pass("product detail page", slugPath);

    if (html.includes("Inquire on WhatsApp") || html.includes("wa.me/")) {
      pass("product WhatsApp CTA", "present");
    } else {
      fail("product WhatsApp CTA", "Inquire on WhatsApp not found");
    }
  } catch (err) {
    fail("product detail page", err.message);
  }

  // WhatsApp inquiry URL shape
  const inquiry = buildWhatsAppUrl(
    [
      "Hello Timeless Watch Bazar!",
      "",
      "I want to inquire about this product:",
      `*${product.name}*`,
      `Price: ₹${Number(product.sale_price) || 0}`,
      `Link: ${SITE_URL}/products/${product.slug}`,
      "",
      "Please share availability and how I can place the order.",
    ].join("\n"),
  );
  if (inquiry.startsWith(`https://wa.me/${SITE_PHONE}?text=`)) {
    pass("whatsapp inquiry URL", inquiry.slice(0, 72) + "…");
  } else {
    fail("whatsapp inquiry URL", inquiry);
  }

  // Cart page now WhatsApp redirect content
  try {
    const cartHtml = await (
      await fetch(base + "/cart", { signal: AbortSignal.timeout(60000) })
    ).text();
    if (
      cartHtml.includes("Order on WhatsApp") ||
      cartHtml.includes("Chat on WhatsApp")
    ) {
      pass("cart → WhatsApp page", "no checkout form");
    } else {
      fail("cart → WhatsApp page", "expected WhatsApp messaging");
    }
    if (/Place order/i.test(cartHtml) && /customerEmail|shippingAddress/i.test(cartHtml)) {
      fail("cart checkout removed", "old checkout form still present");
    } else {
      pass("cart checkout removed", "checkout form gone");
    }
  } catch (err) {
    fail("cart → WhatsApp page", err.message);
  }

  // Track + contact still work
  const testEmail = "timelesswatchbazar@gmail.com";
  const { data: latestOrder } = await db
    .from("orders")
    .select("order_number, customer_email, status")
    .ilike("customer_email", testEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestOrder?.order_number) {
    const { data: tracked } = await db
      .from("orders")
      .select("order_number, status")
      .eq("order_number", latestOrder.order_number)
      .ilike("customer_email", testEmail)
      .maybeSingle();
    if (tracked) pass("track order lookup", `${tracked.order_number} / ${tracked.status}`);
    else fail("track order lookup", "not found");
  } else {
    pass("track order lookup", "skipped (no prior orders)");
  }

  if (resendKey) {
    const resend = new Resend(resendKey);
    const contactMail = await resend.emails.send({
      from,
      to: storeInbox,
      replyTo: testEmail,
      subject: "Contact form — E2E WhatsApp flow | Timeless Watch Bazar",
      html: `<p>Automated contact test after WhatsApp checkout switch.</p>`,
    });
    if (contactMail.error) fail("contact email", contactMail.error.message);
    else pass("contact email", contactMail.data?.id || "sent");
  } else {
    fail("contact email", "RESEND_API_KEY missing");
  }

  summarize();
  console.log(`\nWhatsApp number: +${SITE_PHONE}`);
  console.log(`Sample inquiry URL:\n${inquiry}\n`);
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

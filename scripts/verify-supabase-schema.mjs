/**
 * Verify required Supabase tables/columns exist.
 * Run: node scripts/verify-supabase-schema.mjs
 */
import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRED_MIGRATIONS = [
  "01_schema.sql — base tables",
  "02_storage.sql — product images bucket",
  "03_rls.sql — row level security",
  "09_customer_auth_and_grants.sql — customer policies",
  "11_product_variants.sql — color variations",
  "12_fix_variant_public_read.sql — variant read for storefront",
  "13_product_has_variants.sql — has_variants on products",
  "15_variant_gallery.sql — variant gallery jsonb (multi-image)",
  "17_remove_cod_payment.sql — remove COD payment status",
];

async function main() {
  console.log("\n=== Supabase schema verification ===\n");

  if (!url || !serviceKey) {
    console.error("FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const checks = [
    { name: "categories", run: () => db.from("categories").select("id", { count: "exact", head: true }) },
    { name: "products", run: () => db.from("products").select("id, has_variants, gallery", { head: true }).limit(1) },
    { name: "product_variants", run: () => db.from("product_variants").select("id, gallery", { head: true }).limit(1) },
    { name: "banners", run: () => db.from("banners").select("id", { head: true }).limit(1) },
    { name: "customers", run: () => db.from("customers").select("id", { head: true }).limit(1) },
    { name: "orders", run: () => db.from("orders").select("id, payment_status", { head: true }).limit(1) },
    { name: "order_items", run: () => db.from("order_items").select("id, variant_id", { head: true }).limit(1) },
    { name: "admin_users", run: () => db.from("admin_users").select("user_id").limit(1) },
  ];

  let failed = 0;
  for (const check of checks) {
    const { error } = await check.run();
    if (error) {
      failed++;
      console.log(`FAIL  ${check.name} — ${error.message}`);
    } else {
      console.log(`PASS  ${check.name}`);
    }
  }

  // Detect missing variant gallery column
  const { error: galleryErr } = await db
    .from("product_variants")
    .select("gallery")
    .limit(1);
  if (galleryErr && /gallery|column/i.test(galleryErr.message)) {
    failed++;
    console.log("FAIL  product_variants.gallery — run supabase/15_variant_gallery.sql");
  } else if (!galleryErr) {
    console.log("PASS  product_variants.gallery");
  }

  console.log("\n--- Migration files (run in Supabase SQL Editor if not applied) ---");
  for (const m of REQUIRED_MIGRATIONS) console.log(`  • ${m}`);

  console.log("\n--- Local storage audit ---");
  console.log("  • Storefront catalog: Supabase only (lib/catalog.ts)");
  console.log("  • Cart localStorage: removed (WhatsApp ordering)");
  console.log("  • Auth: Supabase session cookies only");
  console.log("  • Next.js unstable_cache: short-lived server cache, not business data store");

  console.log("\n=== Summary ===");
  if (failed) {
    console.log(`Failed checks: ${failed}`);
    process.exit(1);
  }
  console.log("All schema checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

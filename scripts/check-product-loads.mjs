/**
 * Verify all active products appear in listing pages (mobile + desktop SSR).
 * Run: node scripts/check-product-loads.mjs
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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
}

function countProductCards(html) {
  return (html.match(/<article[^>]*\bproduct-card\b/g) || []).length;
}

function extractProductLinks(html) {
  const slugs = new Set();
  const re = /href="\/products\/([^"?#/]+)"/g;
  let m;
  while ((m = re.exec(html))) slugs.add(decodeURIComponent(m[1]));
  return slugs;
}

async function detectBase() {
  for (const base of ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]) {
    try {
      const [home, products] = await Promise.all([
        fetch(base + "/", { signal: AbortSignal.timeout(90000) }),
        fetch(base + "/products", { signal: AbortSignal.timeout(90000) }),
      ]);
      if (home.ok && products.ok) return base;
    } catch {
      /* next */
    }
  }
  return null;
}

async function fetchHtml(base, path, userAgent) {
  const res = await fetch(base + path, {
    headers: { "User-Agent": userAgent, Accept: "text/html" },
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.text();
}

async function main() {
  console.log("\n=== Product load check (mobile + desktop) ===\n");

  if (!url || !anonKey) {
    fail("env", "Missing Supabase env");
    summarize();
    return;
  }

  const base = await detectBase();
  if (!base) {
    fail("dev server", "Start with npm run dev");
    summarize();
    return;
  }
  pass("dev server", base);

  const db = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error } = await db
    .from("products")
    .select("id, slug, name, is_active, category_id, categories(slug)")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !rows?.length) {
    fail("supabase products", error?.message || "No active products");
    summarize();
    return;
  }

  const catalog = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.categories?.slug || "",
  }));

  pass("supabase catalog", `${catalog.length} active products`);

  for (const viewport of [
    { label: "mobile", ua: MOBILE_UA },
    { label: "desktop", ua: DESKTOP_UA },
  ]) {
    let productsHtml;
    let categoriesHtml;
    let homeHtml;
    try {
      [productsHtml, categoriesHtml, homeHtml] = await Promise.all([
        fetchHtml(base, "/products", viewport.ua),
        fetchHtml(base, "/categories", viewport.ua),
        fetchHtml(base, "/", viewport.ua),
      ]);
    } catch (err) {
      fail(`${viewport.label} fetch listings`, err.message);
      continue;
    }

    const cardCountProducts = countProductCards(productsHtml);
    const cardCountCategories = countProductCards(categoriesHtml);
    const homeCards = countProductCards(homeHtml);

    if (cardCountProducts === catalog.length) {
      pass(`${viewport.label} /products cards`, String(cardCountProducts));
    } else {
      fail(
        `${viewport.label} /products cards`,
        `expected ${catalog.length}, got ${cardCountProducts}`,
      );
    }

    if (cardCountCategories === catalog.length) {
      pass(`${viewport.label} /categories cards`, String(cardCountCategories));
    } else {
      fail(
        `${viewport.label} /categories cards`,
        `expected ${catalog.length}, got ${cardCountCategories}`,
      );
    }

    if (homeCards > 0) {
      pass(`${viewport.label} home product cards`, String(homeCards));
    } else {
      fail(`${viewport.label} home product cards`, "none rendered");
    }

    const links = extractProductLinks(productsHtml);
    const missingOnProducts = catalog.filter((p) => !links.has(p.slug));
    if (missingOnProducts.length === 0) {
      pass(`${viewport.label} product slugs in HTML`, "all linked");
    } else {
      fail(
        `${viewport.label} product slugs in HTML`,
        `missing: ${missingOnProducts.map((p) => p.slug).join(", ")}`,
      );
    }
  }

  // Detail pages (sample all if <= 20, else all)
  let detailFails = 0;
  for (const p of catalog) {
    const path = `/products/${encodeURIComponent(p.slug)}`;
    try {
      const [mRes, dRes] = await Promise.all([
        fetch(base + path, { headers: { "User-Agent": MOBILE_UA }, signal: AbortSignal.timeout(90000) }),
        fetch(base + path, { headers: { "User-Agent": DESKTOP_UA }, signal: AbortSignal.timeout(90000) }),
      ]);
      if (!mRes.ok || !dRes.ok) {
        detailFails++;
        fail(`PDP ${p.slug}`, `mobile ${mRes.status} desktop ${dRes.status}`);
      }
    } catch (err) {
      detailFails++;
      fail(`PDP ${p.slug}`, err.message);
    }
  }
  if (detailFails === 0) {
    pass("all product detail pages", `${catalog.length} OK mobile+desktop`);
  }

  // Category pages
  const { data: cats } = await db.from("categories").select("slug, name").eq("is_active", true);
  for (const cat of cats || []) {
    try {
      const html = await fetchHtml(base, `/categories/${cat.slug}`, MOBILE_UA);
      const expected = catalog.filter((p) => p.category === cat.slug).length;
      const cards = countProductCards(html);
      if (expected === cards) {
        pass(`category ${cat.slug}`, `${cards} products`);
      } else if (expected === 0 && cards === 0) {
        pass(`category ${cat.slug}`, "empty (OK)");
      } else {
        fail(`category ${cat.slug}`, `expected ${expected}, got ${cards}`);
      }
    } catch (err) {
      fail(`category ${cat.slug}`, err.message);
    }
  }

  const uncategorized = catalog.filter((p) => !p.category);
  if (uncategorized.length) {
    pass(
      "uncategorized products",
      `${uncategorized.length} only on /products (not in home category rows)`,
    );
  }

  summarize();
}

function summarize() {
  const failed = results.filter((r) => !r.ok);
  console.log("\n=== Summary ===");
  console.log(`Passed: ${results.filter((r) => r.ok).length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

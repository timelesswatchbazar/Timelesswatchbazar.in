import { unstable_cache } from "next/cache";
import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import {
  mapProductRow,
  type BannerRow,
  type ProductRow,
  type ProductVariantRow,
  type StoreProduct,
} from "@/lib/database.types";
import { categorySlugMatches } from "@/lib/slug";
import type { Category } from "@/lib/types";

const PRODUCT_SELECT_BASE = `
  id,
  slug,
  name,
  description,
  image_url,
  gallery,
  actual_price,
  sale_price,
  stock,
  is_new_arrival,
  is_best_seller,
  is_active,
  has_variants,
  sort_order,
  created_at,
  updated_at,
  category_id,
  categories ( id, name, slug )
`;

const PRODUCT_SELECT = `${PRODUCT_SELECT_BASE},
  product_variants (
    id, product_id, color_name, color_hex, image_url, gallery,
    stock, sale_price, actual_price, is_default, is_active, sort_order
  )`;

/** Fallback before supabase/15_variant_gallery.sql is applied */
const PRODUCT_SELECT_LEGACY = `${PRODUCT_SELECT_BASE},
  product_variants (
    id, product_id, color_name, color_hex, image_url,
    stock, sale_price, actual_price, is_default, is_active, sort_order
  )`;

function isMissingGalleryColumn(message?: string) {
  return Boolean(message && /gallery/i.test(message) && /does not exist|column/i.test(message));
}

async function selectProductsQuery(supabase: ReturnType<typeof createPublicClient>) {
  const primary = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!primary.error || !isMissingGalleryColumn(primary.error.message)) {
    return primary;
  }

  return supabase
    .from("products")
    .select(PRODUCT_SELECT_LEGACY)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
}

async function selectProductBySlugQuery(
  supabase: ReturnType<typeof createPublicClient>,
  slug: string,
) {
  const primary = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (!primary.error || !isMissingGalleryColumn(primary.error.message)) {
    return primary;
  }

  return supabase
    .from("products")
    .select(PRODUCT_SELECT_LEGACY)
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
}

function mapRows(rows: unknown): StoreProduct[] {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((raw) => {
    const row = raw as Partial<ProductRow> & {
      categories?: ProductRow["categories"] | ProductRow["categories"][] | null;
      product_variants?: ProductVariantRow[] | null;
    };

    const categories = Array.isArray(row.categories)
      ? row.categories[0] || null
      : row.categories || null;

    return mapProductRow({
      id: String(row.id || ""),
      category_id: row.category_id ?? null,
      name: String(row.name || ""),
      slug: String(row.slug || ""),
      description: String(row.description || ""),
      image_url: String(row.image_url || ""),
      gallery: Array.isArray(row.gallery) ? row.gallery : [],
      actual_price: Number(row.actual_price) || 0,
      sale_price: Number(row.sale_price) || 0,
      stock: Number(row.stock) || 0,
      is_new_arrival: Boolean(row.is_new_arrival),
      is_best_seller: Boolean(row.is_best_seller),
      is_active: row.is_active !== false,
      has_variants: Boolean(row.has_variants),
      sort_order: Number(row.sort_order) || 0,
      created_at: String(row.created_at || ""),
      updated_at: String(row.updated_at || ""),
      categories,
      product_variants: (row.product_variants || []).filter((v) => v.is_active),
    });
  });
}

const loadProductsFromSupabase = unstable_cache(
  async (): Promise<StoreProduct[]> => {
    const supabase = createPublicClient();
    const { data, error } = await selectProductsQuery(supabase);

    if (error || !data) {
      if (error) console.error("fetchStoreProducts:", error.message);
      return [];
    }

    return mapRows(data);
  },
  ["store-products-v7"],
  { revalidate: 60, tags: ["store-products", "store-catalog"] },
);

async function loadProductBySlugFromSupabase(slug: string): Promise<StoreProduct | null> {
  const supabase = createPublicClient();

  const { data, error } = await selectProductBySlugQuery(supabase, slug);

  if (error) {
    console.error("fetchStoreProduct:", error.message);
  }

  if (data) {
    return mapRows([data])[0] || null;
  }

  const all = await loadProductsFromSupabase();
  return (
    all.find(
      (p) =>
        p.slug === slug ||
        p.slug.toLowerCase() === slug.toLowerCase() ||
        p.id === slug,
    ) || null
  );
}

const loadCategoriesFromSupabase = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug, description")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) {
      if (error) console.error("fetchCategories:", error.message);
      return [];
    }
    return (data as Array<{ name: string; slug: string; description?: string }>).map(
      (row) => ({
        name: row.name,
        slug: row.slug,
        description: row.description || "",
      }),
    );
  },
  ["store-categories-v3"],
  { revalidate: 60, tags: ["store-categories", "store-catalog"] },
);

const loadBannersFromSupabase = unstable_cache(
  async (): Promise<BannerRow[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) {
      if (error) console.error("fetchBanners:", error.message);
      return [];
    }
    return data as BannerRow[];
  },
  ["store-banners-v1"],
  { revalidate: 60, tags: ["store-banners", "store-catalog"] },
);

/** Storefront catalog — Supabase only (no local mock data). */
export const fetchStoreProducts = cache(async (): Promise<StoreProduct[]> => {
  if (!hasSupabaseEnv()) {
    console.warn("fetchStoreProducts: Supabase env missing");
    return [];
  }
  try {
    return await loadProductsFromSupabase();
  } catch (err) {
    console.error("fetchStoreProducts:", err);
    return [];
  }
});

export const fetchStoreProduct = cache(async (slug: string): Promise<StoreProduct | null> => {
  let normalized = slug;
  try {
    normalized = decodeURIComponent(slug).trim();
  } catch {
    normalized = slug.trim();
  }
  if (!normalized) return null;

  if (!hasSupabaseEnv()) return null;

  try {
    return await loadProductBySlugFromSupabase(normalized);
  } catch (err) {
    console.error("fetchStoreProduct:", err);
    return null;
  }
});

export async function fetchNewArrivals(): Promise<StoreProduct[]> {
  const all = await fetchStoreProducts();
  return all.filter((p) => p.isNew);
}

export async function fetchBestSellers(): Promise<StoreProduct[]> {
  const all = await fetchStoreProducts();
  return all.filter((p) => p.isBestSeller);
}

export async function fetchByCategory(slug: string): Promise<StoreProduct[]> {
  const all = await fetchStoreProducts();
  return all.filter((p) => categorySlugMatches(p.category, slug));
}

export const fetchCategories = cache(async (): Promise<Category[]> => {
  if (!hasSupabaseEnv()) return [];
  try {
    return await loadCategoriesFromSupabase();
  } catch (err) {
    console.error("fetchCategories:", err);
    return [];
  }
});

export const fetchBanners = cache(async (): Promise<BannerRow[]> => {
  if (!hasSupabaseEnv()) return [];
  try {
    return await loadBannersFromSupabase();
  } catch (err) {
    console.error("fetchBanners:", err);
    return [];
  }
});

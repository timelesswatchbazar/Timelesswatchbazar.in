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
import {
  categories as localCategories,
  getNewArrivals as localNewArrivals,
  getProductBySlug as localGetProduct,
  getProductsByCategory as localByCategory,
  products as localProducts,
} from "@/lib/products";
import type { Category } from "@/lib/types";

function toLocalProduct(
  p: (typeof localProducts)[number],
  extras?: Partial<StoreProduct>,
): StoreProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    image: p.image,
    category: p.category,
    actualPrice: p.price,
    price: p.price,
    stock: 10,
    isNew: p.isNew,
    isBestSeller: false,
    variants: [],
    ...extras,
  };
}

const loadProductsFromSupabase = unstable_cache(
  async (): Promise<StoreProduct[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories ( id, name, slug )")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      if (error) console.error("fetchStoreProducts:", error.message);
      return [];
    }

    const rows = data as ProductRow[];
    const ids = rows.map((r) => r.id);
    let variantsByProduct = new Map<string, ProductVariantRow[]>();

    if (ids.length) {
      const { data: variants, error: variantError } = await supabase
        .from("product_variants")
        .select("*")
        .in("product_id", ids)
        .eq("is_active", true)
        .order("sort_order");

      if (!variantError && variants) {
        variantsByProduct = new Map();
        for (const variant of variants as ProductVariantRow[]) {
          const list = variantsByProduct.get(variant.product_id) || [];
          list.push(variant);
          variantsByProduct.set(variant.product_id, list);
        }
      }
    }

    return rows.map((row) =>
      mapProductRow({
        ...row,
        product_variants: variantsByProduct.get(row.id) || [],
      }),
    );
  },
  ["store-products-v1"],
  { revalidate: 60, tags: ["store-products", "store-catalog"] },
);

const loadCategoriesFromSupabase = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug, description")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return localCategories;
    return data as Category[];
  },
  ["store-categories-v1"],
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

    if (error || !data) return [];
    return data as BannerRow[];
  },
  ["store-banners-v1"],
  { revalidate: 60, tags: ["store-banners", "store-catalog"] },
);

/** Request + ISR cache for storefront catalog */
export const fetchStoreProducts = cache(async (): Promise<StoreProduct[]> => {
  if (!hasSupabaseEnv()) {
    return localProducts.map((p) => toLocalProduct(p));
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

  if (!hasSupabaseEnv()) {
    const p = localGetProduct(normalized) || localGetProduct(normalized.toLowerCase());
    return p ? toLocalProduct(p) : null;
  }

  const all = await fetchStoreProducts();
  return (
    all.find(
      (p) =>
        p.slug === normalized ||
        p.slug.toLowerCase() === normalized.toLowerCase() ||
        p.id === normalized,
    ) || null
  );
});

export async function fetchNewArrivals(): Promise<StoreProduct[]> {
  if (!hasSupabaseEnv()) {
    return localNewArrivals().map((p) => toLocalProduct(p, { isNew: true }));
  }
  const all = await fetchStoreProducts();
  return all.filter((p) => p.isNew);
}

export async function fetchBestSellers(): Promise<StoreProduct[]> {
  if (!hasSupabaseEnv()) return [];
  const all = await fetchStoreProducts();
  return all.filter((p) => p.isBestSeller);
}

export async function fetchByCategory(slug: string): Promise<StoreProduct[]> {
  if (!hasSupabaseEnv()) {
    return localByCategory(slug).map((p) => toLocalProduct(p));
  }
  const all = await fetchStoreProducts();
  return all.filter((p) => p.category === slug);
}

export const fetchCategories = cache(async (): Promise<Category[]> => {
  if (!hasSupabaseEnv()) return localCategories;
  try {
    return await loadCategoriesFromSupabase();
  } catch {
    return localCategories;
  }
});

export const fetchBanners = cache(async (): Promise<BannerRow[]> => {
  if (!hasSupabaseEnv()) return [];
  try {
    return await loadBannersFromSupabase();
  } catch {
    return [];
  }
});

import { cache } from "react";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mapProductRow, type BannerRow, type ProductRow, type StoreProduct } from "@/lib/database.types";
import {
  categories as localCategories,
  getNewArrivals as localNewArrivals,
  getProductBySlug as localGetProduct,
  getProductsByCategory as localByCategory,
  products as localProducts,
} from "@/lib/products";
import type { Category } from "@/lib/types";

const productSelect = "*, categories ( id, name, slug )";

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
    ...extras,
  };
}

/** Cached per request — avoids duplicate Supabase calls across layout + pages */
export const fetchStoreProducts = cache(async (): Promise<StoreProduct[]> => {
  if (!hasSupabaseEnv()) {
    return localProducts.map((p) => toLocalProduct(p));
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchStoreProducts:", error.message);
      return [];
    }
    return ((data || []) as ProductRow[]).map(mapProductRow);
  } catch (err) {
    console.error("fetchStoreProducts:", err);
    return [];
  }
});

export const fetchStoreProduct = cache(async (slug: string): Promise<StoreProduct | null> => {
  if (!hasSupabaseEnv()) {
    const p = localGetProduct(slug);
    return p ? toLocalProduct(p) : null;
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return mapProductRow(data as ProductRow);
  } catch {
    return null;
  }
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
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug, description")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return localCategories;
    return data as Category[];
  } catch {
    return localCategories;
  }
});

export const fetchBanners = cache(async (): Promise<BannerRow[]> => {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return [];
    return data as BannerRow[];
  } catch {
    return [];
  }
});

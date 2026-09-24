import type { MetadataRoute } from "next";
import { fetchCategories, fetchStoreProducts } from "@/lib/catalog";
import { categoryHref } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/shipping-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/return-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms-and-conditions`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const [categories, products] = await Promise.all([
      fetchCategories(),
      fetchStoreProducts(),
    ]);

    categoryRoutes = categories.map((category) => ({
      url: `${SITE_URL}${categoryHref(category)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    productRoutes = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    categoryRoutes = [
      "mens-watches",
      "womens-watches",
      "smart-watches",
      "luxury-collection",
      "sports-dive",
      "accessories",
    ].map((slug) => ({
      url: `${SITE_URL}/categories/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

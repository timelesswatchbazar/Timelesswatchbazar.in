import type { Category } from "@/lib/types";

export function decodeRouteSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeSlugKey(value: string): string {
  return slugify(decodeRouteSlug(value));
}

export function findCategoryBySlug(
  categories: Category[],
  routeSlug: string,
): Category | undefined {
  const key = normalizeSlugKey(routeSlug);
  return categories.find(
    (c) =>
      normalizeSlugKey(c.slug) === key ||
      (c.name ? normalizeSlugKey(c.name) === key : false),
  );
}

/** Canonical storefront URL for a category (hyphenated, encoded). */
export function categoryHref(category: Pick<Category, "slug">): string {
  const canonical = slugify(category.slug) || category.slug;
  return `/categories/${encodeURIComponent(canonical)}`;
}

export function categorySlugMatches(productCategory: string, categorySlug: string): boolean {
  if (!productCategory || !categorySlug) return false;
  if (productCategory === categorySlug) return true;
  return normalizeSlugKey(productCategory) === normalizeSlugKey(categorySlug);
}

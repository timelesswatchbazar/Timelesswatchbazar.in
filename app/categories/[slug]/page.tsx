import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { fetchByCategory, fetchCategories } from "@/lib/catalog";
import {
  categoryHref,
  decodeRouteSlug,
  findCategoryBySlug,
  slugify,
} from "@/lib/slug";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchCategories();
  const category = findCategoryBySlug(categories, slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  return {
    title: category.name,
    description:
      category.description ||
      `Shop ${category.name} at Timeless Watch Bazar in India.`,
    alternates: { canonical: categoryHref(category) },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const categories = await fetchCategories();
  const category = findCategoryBySlug(categories, rawSlug);
  if (!category) notFound();

  const canonical = categoryHref(category);
  const decoded = decodeRouteSlug(rawSlug);
  const canonicalSlug = slugify(category.slug) || category.slug;
  if (decoded !== canonicalSlug && slugify(decoded) === slugify(category.slug)) {
    redirect(canonical);
  }

  const items = await fetchByCategory(category.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="section-eyebrow">Category</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        {category.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:mt-3 sm:text-base">
        {category.description}
      </p>
      <div className="product-grid mt-6 sm:mt-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-8 text-[var(--muted)]">No products in this category yet.</p>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import {
  categories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
        Category
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        {category.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:mt-3 sm:text-base">
        {category.description}
      </p>
      <div className="product-grid mt-6 sm:mt-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-8 text-zinc-600">No products in this category yet.</p>
      )}
    </div>
  );
}

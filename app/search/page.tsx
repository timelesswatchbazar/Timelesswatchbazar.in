import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { fetchStoreProducts } from "@/lib/catalog";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = {
  title: "Search Watches",
  description: "Search men's, women's, smart, and luxury watches at Timeless Watch Bazar.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const all = await fetchStoreProducts();
  const needle = q.trim().toLowerCase();
  const results = needle
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      )
    : all;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] sm:text-sm">
        Search
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        {q ? `Results for “${q}”` : "Search products"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)] sm:mt-3 sm:text-base">
        {results.length} product{results.length === 1 ? "" : "s"} found
      </p>
      <div className="product-grid mt-6 sm:mt-8">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="mt-8 text-[var(--muted)]">
          No watches matched your search. Try a different keyword.
        </p>
      )}
    </div>
  );
}

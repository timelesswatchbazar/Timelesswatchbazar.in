import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { searchProducts } from "@/lib/products";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = searchProducts(q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm">
        Search
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        {q ? `Results for “${q}”` : "Search products"}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 sm:mt-3 sm:text-base">
        {results.length} product{results.length === 1 ? "" : "s"} found
      </p>
      <div className="product-grid mt-6 sm:mt-8">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="mt-8 text-zinc-600">
          No watches matched your search. Try a different keyword.
        </p>
      )}
    </div>
  );
}

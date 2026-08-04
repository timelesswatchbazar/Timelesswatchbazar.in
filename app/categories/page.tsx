import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { fetchStoreProducts } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all watch categories at Timeless Watch Bazar — men's, women's, smart, luxury, sports, and accessories.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const products = await fetchStoreProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="section-eyebrow">All categories</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        All products
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:mt-3 sm:text-base">
        Browse every product across all categories in one place.
      </p>

      <div className="product-grid mt-6 sm:mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

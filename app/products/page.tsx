import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { fetchStoreProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All Products",
  description: "Explore our full catalog of watches and accessories.",
};

export default async function ProductsPage() {
  const products = await fetchStoreProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="section-eyebrow">Shop</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        All Products
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:mt-3 sm:text-base">
        Explore our full catalog, including new arrivals and latest additions.
      </p>
      <div className="product-grid mt-6 sm:mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length && (
        <p className="mt-8 text-[var(--muted)]">No products available yet.</p>
      )}
    </div>
  );
}

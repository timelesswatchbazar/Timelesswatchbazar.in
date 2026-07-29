import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import {
  formatPrice,
  getCategoryBySlug,
  getProductBySlug,
  getProductsByCategory,
  products,
} from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.category);
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav className="mb-4 flex items-center gap-1 overflow-hidden text-xs text-zinc-500 sm:mb-6 sm:text-sm">
        <Link href="/" className="shrink-0 hover:text-zinc-900">
          Home
        </Link>
        <span className="shrink-0">/</span>
        {category && (
          <>
            <Link
              href={`/categories/${category.slug}`}
              className="shrink-0 hover:text-zinc-900"
            >
              {category.name}
            </Link>
            <span className="shrink-0">/</span>
          </>
        )}
        <span className="truncate text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="content-reveal pb-20 sm:pb-0">
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:text-sm"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-extrabold text-zinc-950 sm:mt-4 sm:text-3xl">
            {formatPrice(product.price)}
          </p>
          <p className="mt-4 text-sm leading-7 text-zinc-600 sm:mt-6 sm:text-base">
            {product.description}
          </p>
          <div className="mobile-sticky-bar">
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <span className="text-sm font-semibold text-zinc-700">Total</span>
              <span className="text-lg font-extrabold text-zinc-950">
                {formatPrice(product.price)}
              </span>
            </div>
            <AddToCartButton product={product} />
          </div>
          <ul className="mt-6 space-y-2 text-sm text-zinc-600 sm:mt-8">
            <li>✓ Authentic timepieces</li>
            <li>✓ Secure checkout</li>
            <li>✓ Fast processing across UAE</li>
            <li>✓ Easy returns within policy window</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            Related Products
          </h2>
          <div className="product-grid mt-5 sm:mt-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

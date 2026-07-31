import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import {
  fetchByCategory,
  fetchCategories,
  fetchStoreProduct,
  fetchStoreProducts,
} from "@/lib/catalog";
import { discountPercent } from "@/lib/database.types";
import { formatMoney } from "@/lib/money";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  if (!product) notFound();

  const categories = await fetchCategories();
  const category = categories.find((c) => c.slug === product.category);
  const related = (await fetchByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Ensure related has fallback if category empty
  const relatedProducts =
    related.length > 0
      ? related
      : (await fetchStoreProducts()).filter((p) => p.id !== product.id).slice(0, 4);

  const actual = product.actualPrice ?? product.price;
  const off = discountPercent(actual, product.price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav className="mb-4 flex items-center gap-1 overflow-hidden text-xs text-[var(--muted)] sm:mb-6 sm:text-sm">
        <Link href="/" className="shrink-0 hover:text-[var(--midnight)]">
          Home
        </Link>
        <span className="shrink-0">/</span>
        {category && (
          <>
            <Link
              href={`/categories/${category.slug}`}
              className="shrink-0 hover:text-[var(--midnight)]"
            >
              {category.name}
            </Link>
            <span className="shrink-0">/</span>
          </>
        )}
        <span className="truncate text-[var(--midnight)]">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-md border border-[var(--silver)] bg-[var(--surface)]">
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
            <Link href={`/categories/${category.slug}`} className="section-eyebrow">
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-3 sm:mt-4">
            <p className="text-2xl font-extrabold text-[var(--navy)] sm:text-3xl">
              {formatMoney(product.price)}
            </p>
            {off > 0 && (
              <>
                <p className="text-lg text-[var(--muted)] line-through">
                  {formatMoney(actual)}
                </p>
                <span className="rounded bg-[var(--gold)]/20 px-2 py-0.5 text-sm font-bold text-[var(--midnight)]">
                  {off}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:mt-6 sm:text-base">
            {product.description}
          </p>
          <div className="mobile-sticky-bar">
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <span className="text-sm font-semibold text-[var(--navy)]">Total</span>
              <span className="text-lg font-extrabold text-[var(--midnight)]">
                {formatMoney(product.price)}
              </span>
            </div>
            <AddToCartButton product={product} />
          </div>
          <ul className="mt-6 space-y-2 text-sm text-[var(--muted)] sm:mt-8">
            <li>✓ Authentic timepieces</li>
            <li>✓ Secure checkout</li>
            <li>✓ Fast processing from Ujjain, India</li>
            <li>✓ Easy returns within policy window</li>
          </ul>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <h2 className="text-xl font-bold tracking-tight text-[var(--midnight)] sm:text-2xl">
            Related Products
          </h2>
          <div className="product-grid mt-5 sm:mt-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

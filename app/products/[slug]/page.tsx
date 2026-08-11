import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import {
  fetchByCategory,
  fetchCategories,
  fetchStoreProduct,
  fetchStoreProducts,
} from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description =
    product.description?.slice(0, 155) ||
    `Buy ${product.name} online at ${SITE_NAME}, India.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      type: "website",
      images: product.image
        ? [{ url: product.image, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  if (!product) notFound();

  const categories = await fetchCategories();
  const category =
    categories.find((c) => c.slug === product.category) ||
    (product.categoryName
      ? { slug: product.category, name: product.categoryName, description: "" }
      : undefined);

  const related = product.category
    ? (await fetchByCategory(product.category))
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const relatedProducts =
    related.length > 0
      ? related
      : (await fetchStoreProducts()).filter((p) => p.id !== product.id).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <JsonLd data={productJsonLd} />
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1 overflow-hidden text-xs text-[var(--muted)] sm:mb-6 sm:text-sm"
      >
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
        {category && (
          <div className="lg:col-span-2">
            <Link href={`/categories/${category.slug}`} className="section-eyebrow">
              {category.name}
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
              {product.name}
            </h1>
          </div>
        )}
        {!category && (
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
              {product.name}
            </h1>
          </div>
        )}
        <ProductPurchasePanel product={product} />
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

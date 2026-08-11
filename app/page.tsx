import type { Metadata } from "next";
import { BannerCarousel } from "@/components/banner-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import {
  fetchBanners,
  fetchCategories,
  fetchStoreProducts,
} from "@/lib/catalog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | Buy Watches Online in India`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | Buy Watches Online in India`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
};

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    fetchBanners(),
    fetchCategories(),
    fetchStoreProducts(),
  ]);

  const newArrivals = products.filter((p) => p.isNew);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const categorySections = categories
    .map((category) => ({
      category,
      products: products.filter((p) => p.category === category.slug),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="sr-only">
        Timeless Watch Bazar — Buy men&apos;s, women&apos;s, smart, and luxury watches online
        in India
      </h1>
      <BannerCarousel banners={banners} />
      <ProductCarousel
        title="New Arrivals"
        products={newArrivals}
        href="/products"
        linkLabel="View All Products"
      />
      {bestSellers.length > 0 && (
        <ProductCarousel
          title="Best Sellers"
          products={bestSellers}
          href="/products"
          linkLabel="View All Products"
        />
      )}
      {categorySections.map(({ category, products: items }) => (
        <ProductCarousel
          key={category.slug}
          title={category.name}
          products={items}
          href={`/categories/${category.slug}`}
          linkLabel="View Category"
        />
      ))}
    </div>
  );
}

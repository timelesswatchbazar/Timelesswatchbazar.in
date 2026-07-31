import { BannerCarousel } from "@/components/banner-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import {
  fetchBanners,
  fetchBestSellers,
  fetchByCategory,
  fetchCategories,
  fetchNewArrivals,
} from "@/lib/catalog";

export default async function HomePage() {
  const [banners, newArrivals, bestSellers, categories] = await Promise.all([
    fetchBanners(),
    fetchNewArrivals(),
    fetchBestSellers(),
    fetchCategories(),
  ]);

  const categorySections = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: await fetchByCategory(category.slug),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
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
      {categorySections.map(({ category, products }) => (
        <ProductCarousel
          key={category.slug}
          title={category.name}
          products={products}
          href={`/categories/${category.slug}`}
          linkLabel="View Category"
        />
      ))}
    </div>
  );
}

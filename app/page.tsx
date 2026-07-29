import { BannerCarousel } from "@/components/banner-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import {
  categories,
  getNewArrivals,
  getProductsByCategory,
} from "@/lib/products";

export default function HomePage() {
  const newArrivals = getNewArrivals();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <BannerCarousel />
      <ProductCarousel
        title="New Arrivals"
        products={newArrivals}
        href="/products"
        linkLabel="View All Products"
      />
      {categories.map((category) => (
        <ProductCarousel
          key={category.slug}
          title={category.name}
          products={getProductsByCategory(category.slug)}
          href={`/categories/${category.slug}`}
          linkLabel="View Category"
        />
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card flex h-full flex-col overflow-hidden rounded-md border border-[var(--silver)] bg-white">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[var(--surface)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col space-y-2 p-2.5 sm:space-y-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug text-[var(--midnight)] transition hover:text-[var(--navy)] sm:min-h-0 sm:text-sm">
            {product.name}
          </h3>
        </Link>
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-bold text-[var(--navy)] sm:text-base"
        >
          {formatPrice(product.price)}
        </Link>
        <div className="mt-auto pt-1">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}

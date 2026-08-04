import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatMoney } from "@/lib/money";
import { discountPercent } from "@/lib/database.types";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const actual = product.actualPrice ?? product.price;
  const off = discountPercent(actual, product.price);
  const href = `/products/${encodeURIComponent(product.slug || product.id)}`;
  const imageSrc =
    product.image && product.image.trim()
      ? product.image
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

  return (
    <article className="product-card flex h-full flex-col overflow-hidden rounded-md border border-[var(--silver)] bg-white">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-[var(--surface)]">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {(product.isNew || product.isBestSeller || off > 0) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.isNew && (
                <span className="rounded bg-[var(--midnight)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  New
                </span>
              )}
              {product.isBestSeller && (
                <span className="rounded bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--midnight)]">
                  Best
                </span>
              )}
              {off > 0 && (
                <span className="rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-[var(--navy)]">
                  -{off}%
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col space-y-2 p-2.5 sm:space-y-3 sm:p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug text-[var(--midnight)] transition hover:text-[var(--navy)] sm:min-h-0 sm:text-sm">
            {product.name}
          </h3>
        </Link>
        <div>
          <Link
            href={href}
            className="block text-sm font-bold text-[var(--navy)] sm:text-base"
          >
            {formatMoney(product.price)}
          </Link>
          {off > 0 && (
            <p className="text-xs text-[var(--muted)] line-through">{formatMoney(actual)}</p>
          )}
        </div>
        <div className="mt-auto pt-1">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  discountPercent,
  resolveVariantPricing,
  type StoreProduct,
  type StoreVariant,
} from "@/lib/database.types";
import { formatMoney } from "@/lib/money";

export function ProductPurchasePanel({ product }: { product: StoreProduct }) {
  const variants = product.variants || [];
  const initial = variants.find((v) => v.isDefault) || variants[0] || null;
  const [selected, setSelected] = useState<StoreVariant | null>(initial);

  const pricing = useMemo(
    () => resolveVariantPricing(product, selected),
    [product, selected],
  );
  const off = discountPercent(pricing.actualPrice, pricing.price);
  const imageSrc =
    (selected?.image || product.image || "").trim() ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";
  const stock = selected ? selected.stock : product.stock;

  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: pricing.price,
    actualPrice: pricing.actualPrice,
    category: product.category,
    image: imageSrc,
    description: product.description,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    variantId: selected?.id,
    colorName: selected?.colorName,
  };

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-md border border-[var(--silver)] bg-[var(--surface)]">
        <Image
          src={imageSrc}
          alt={
            selected ? `${product.name} — ${selected.colorName}` : product.name
          }
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={imageSrc.includes("supabase.co")}
        />
      </div>

      <div className="content-reveal pb-20 sm:pb-0">
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <p className="text-2xl font-extrabold text-[var(--navy)] sm:text-3xl">
            {formatMoney(pricing.price)}
          </p>
          {off > 0 && (
            <>
              <p className="text-lg text-[var(--muted)] line-through">
                {formatMoney(pricing.actualPrice)}
              </p>
              <span className="rounded bg-[var(--gold)]/20 px-2 py-0.5 text-sm font-bold text-[var(--midnight)]">
                {off}% off
              </span>
            </>
          )}
        </div>

        {variants.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-[var(--midnight)]">
              Color:{" "}
              <span className="font-bold text-[var(--navy)]">
                {selected?.colorName || "Select"}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {variants.map((variant) => {
                const active = selected?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    title={variant.colorName}
                    aria-label={variant.colorName}
                    aria-pressed={active}
                    onClick={() => setSelected(variant)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                      active
                        ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/40"
                        : "border-[var(--silver)] hover:border-[var(--navy)]"
                    }`}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-black/10"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
          </div>
        )}

        <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:mt-6 sm:text-base">
          {product.description}
        </p>

        <div className="mobile-sticky-bar">
          <div className="mb-2 flex items-center justify-between sm:hidden">
            <span className="text-sm font-semibold text-[var(--navy)]">Total</span>
            <span className="text-lg font-extrabold text-[var(--midnight)]">
              {formatMoney(pricing.price)}
            </span>
          </div>
          <AddToCartButton
            product={cartProduct}
            label={stock > 0 ? "Add to Cart" : "Out of stock"}
            className={`btn-soft ${stock <= 0 ? "pointer-events-none opacity-50" : ""}`}
          />
        </div>

        <ul className="mt-6 space-y-2 text-sm text-[var(--muted)] sm:mt-8">
          <li>✓ Authentic timepieces</li>
          <li>✓ Secure checkout</li>
          <li>✓ Fast processing from Ujjain, India</li>
          <li>✓ Easy returns within policy window</li>
        </ul>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  discountPercent,
  resolveVariantPricing,
  type StoreProduct,
  type StoreVariant,
} from "@/lib/database.types";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

function uniqueImages(urls: Array<string | undefined | null>) {
  const out: string[] = [];
  for (const raw of urls) {
    const url = (raw || "").trim();
    if (url && !out.includes(url)) out.push(url);
  }
  return out;
}

export function ProductPurchasePanel({ product }: { product: StoreProduct }) {
  const variants = product.hasVariants ? product.variants || [] : [];
  const needsVariant = variants.length > 0;
  const [selectedId, setSelectedId] = useState<string>(
    () => (variants.find((v) => v.isDefault) || variants[0])?.id || "",
  );

  const selected: StoreVariant | null = useMemo(
    () => variants.find((v) => v.id === selectedId) || null,
    [variants, selectedId],
  );

  const gallery = useMemo(
    () =>
      uniqueImages([
        selected?.image,
        product.image,
        ...(product.gallery || []),
      ]),
    [product, selected],
  );

  const [activeImage, setActiveImage] = useState(
    () => gallery[0] || FALLBACK_IMAGE,
  );

  useEffect(() => {
    setActiveImage(gallery[0] || FALLBACK_IMAGE);
  }, [selectedId, gallery]);

  const pricing = useMemo(
    () => resolveVariantPricing(product, selected),
    [product, selected],
  );
  const off = discountPercent(pricing.actualPrice, pricing.price);
  const stock = selected ? selected.stock : product.stock;
  const imageSrc = (activeImage || "").trim() || FALLBACK_IMAGE;
  const variantLabel = (selected?.colorName || "").trim();
  const canAdd = !needsVariant || Boolean(selected);
  const outOfStock = canAdd && stock <= 0;

  const cartImage =
    (selected?.image || "").trim() ||
    (imageSrc !== FALLBACK_IMAGE ? imageSrc : "") ||
    (product.image || "").trim() ||
    FALLBACK_IMAGE;

  const cartProduct: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: pricing.price,
    actualPrice: pricing.actualPrice,
    category: product.category,
    image: cartImage,
    description: product.description,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    variantId: selected?.id,
    variantLabel: variantLabel || undefined,
    colorName: variantLabel || undefined,
  };

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-md border border-[var(--silver)] bg-[var(--surface)]">
          <Image
            key={imageSrc}
            src={imageSrc}
            alt={
              variantLabel ? `${product.name} — ${variantLabel}` : product.name
            }
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={imageSrc.includes("supabase.co")}
          />
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((url) => {
              const active = url === imageSrc;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  aria-label="View product photo"
                  aria-pressed={active}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-20 sm:w-20 ${
                    active
                      ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/30"
                      : "border-[var(--silver)] hover:border-[var(--navy)]"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={url.includes("supabase.co")}
                  />
                </button>
              );
            })}
          </div>
        )}
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

        {needsVariant && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-[var(--midnight)]">
              Select option
              {variantLabel ? (
                <>
                  :{" "}
                  <span className="font-bold text-[var(--navy)]">{variantLabel}</span>
                </>
              ) : null}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const active = selectedId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedId(variant.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[var(--midnight)] bg-[var(--midnight)] text-white"
                        : "border-[var(--silver)] bg-white text-[var(--navy)] hover:border-[var(--navy)]"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{ backgroundColor: variant.colorHex || "#C7A252" }}
                    />
                    {variant.colorName}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {selected
                ? stock > 0
                  ? `${stock} in stock`
                  : "Out of stock"
                : "Please select a variant"}
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
            disabled={!canAdd || outOfStock}
            label={
              !canAdd
                ? "Select a variant"
                : outOfStock
                  ? "Out of stock"
                  : variantLabel
                    ? `Add to Cart — ${variantLabel}`
                    : "Add to Cart"
            }
            className={`btn-soft ${!canAdd || outOfStock ? "pointer-events-none opacity-50" : ""}`}
          />
        </div>

        <ul className="mt-6 space-y-2 text-sm text-[var(--muted)] sm:mt-8">
          <li>✓ Authentic timepieces</li>
          <li>✓ Secure checkout</li>
          <li>✓ Fast processing across India</li>
          <li>✓ Cash on delivery available</li>
        </ul>
      </div>
    </>
  );
}

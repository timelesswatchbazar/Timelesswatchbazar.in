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

export function ProductPurchasePanel({ product }: { product: StoreProduct }) {
  const variants = product.hasVariants ? product.variants || [] : [];
  const needsVariant = variants.length > 0;

  const [selectedVariationId, setSelectedVariationId] = useState<string>(
    () => (variants.find((v) => v.isDefault) || variants[0])?.id || "",
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const selected: StoreVariant | null = useMemo(
    () => variants.find((v) => v.id === selectedVariationId) || null,
    [variants, selectedVariationId],
  );

  const galleryImages = useMemo(() => {
    if (selected?.images?.length) return selected.images;
    if (selected?.image) return [selected.image];
    const legacy = [product.image, ...(product.gallery || [])].filter(Boolean);
    return legacy.length ? legacy : [FALLBACK_IMAGE];
  }, [selected, product.image, product.gallery]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariationId]);

  useEffect(() => {
    if (selectedImageIndex >= galleryImages.length) {
      setSelectedImageIndex(0);
    }
  }, [galleryImages.length, selectedImageIndex]);

  const pricing = useMemo(
    () => resolveVariantPricing(product, selected),
    [product, selected],
  );
  const off = discountPercent(pricing.actualPrice, pricing.price);
  const stock = selected ? selected.stock : product.stock;
  const variantLabel = (selected?.colorName || "").trim();

  const imageSrc =
    galleryImages[selectedImageIndex] ||
    galleryImages[0] ||
    FALLBACK_IMAGE;

  const cartPrimaryImage =
    (selected?.image || "").trim() ||
    (product.image || "").trim() ||
    imageSrc;

  const canAdd = !needsVariant || Boolean(selected);
  const outOfStock = canAdd && stock <= 0;

  const cartProduct: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: pricing.price,
    actualPrice: pricing.actualPrice,
    category: product.category,
    image: cartPrimaryImage,
    description: product.description,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    variantId: selected?.id,
    variantLabel: variantLabel || undefined,
    colorName: variantLabel || undefined,
  };

  function selectVariation(id: string) {
    setSelectedVariationId(id);
    setSelectedImageIndex(0);
  }

  return (
    <>
      <div className="space-y-3">
        {/* Smaller, balanced main image — contain so the watch isn't cropped */}
        <div className="relative mx-auto flex aspect-square max-h-[min(52vh,420px)] w-full max-w-md items-center justify-center overflow-hidden rounded-md border border-[var(--silver)] bg-[var(--surface)] sm:max-h-[min(56vh,460px)] lg:max-h-[480px] lg:max-w-none">
          <Image
            key={imageSrc}
            src={imageSrc}
            alt={
              variantLabel ? `${product.name} — ${variantLabel}` : product.name
            }
            fill
            priority
            className="object-contain p-3 sm:p-4"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
            unoptimized={imageSrc.includes("supabase.co")}
          />
        </div>

        {/* A. Gallery thumbnails — images of the selected variation only */}
        {galleryImages.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="listbox"
            aria-label="Product photos"
          >
            {galleryImages.map((url, index) => {
              const active = index === selectedImageIndex;
              return (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-label={`View photo ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-[var(--surface)] transition sm:h-16 sm:w-16 ${
                    active
                      ? "border-[var(--navy)] ring-2 ring-[var(--navy)]/20"
                      : "border-[var(--silver)] hover:border-[var(--midnight)]"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                    unoptimized={url.includes("supabase.co")}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* B. Variation selector — primary image of each variation */}
        {needsVariant && variants.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Available options
            </p>
            <div
              className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="listbox"
              aria-label="Product variations"
            >
              {variants.map((variant) => {
                const active = selectedVariationId === variant.id;
                const thumb =
                  (variant.image || "").trim() ||
                  (product.image || "").trim() ||
                  FALLBACK_IMAGE;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    aria-label={variant.colorName || "Variation"}
                    onClick={() => selectVariation(variant.id)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-[var(--surface)] transition sm:h-[4.25rem] sm:w-[4.25rem] ${
                      active
                        ? "border-[var(--navy)] ring-2 ring-[var(--navy)]/25"
                        : "border-[var(--silver)] hover:border-[var(--midnight)]"
                    }`}
                  >
                    <Image
                      src={thumb}
                      alt={variant.colorName || "Variation"}
                      fill
                      className="object-contain p-1"
                      sizes="68px"
                      unoptimized={thumb.includes("supabase.co")}
                    />
                  </button>
                );
              })}
            </div>
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
            label={outOfStock ? "Unavailable" : "Add to Cart"}
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

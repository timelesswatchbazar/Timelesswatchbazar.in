"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  className = "btn-soft",
  label = "Add to Cart",
  disabled = false,
}: {
  product: Product;
  className?: string;
  label?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        const variantLabel = (
          product.variantLabel ||
          product.colorName ||
          ""
        ).trim();

        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          actualPrice: product.actualPrice,
          category: product.category,
          image: product.image,
          description: product.description,
          isNew: product.isNew,
          isBestSeller: product.isBestSeller,
          variantId: product.variantId,
          variantLabel: variantLabel || undefined,
          colorName: variantLabel || undefined,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added
        ? product.variantLabel || product.colorName
          ? `Added (${product.variantLabel || product.colorName})!`
          : "Added!"
        : label}
    </button>
  );
}

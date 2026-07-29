"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  className = "btn-soft",
  label = "Add to Cart",
}: {
  product: Product;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added!" : label}
    </button>
  );
}

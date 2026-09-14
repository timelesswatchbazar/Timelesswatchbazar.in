"use client";

import type { Product } from "@/lib/types";
import { productWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppInquireButton({
  product,
  className = "btn-soft",
  label = "Inquire on WhatsApp",
  disabled = false,
}: {
  product: Product;
  className?: string;
  label?: string;
  disabled?: boolean;
}) {
  const href = productWhatsAppUrl({
    name: product.name,
    slug: product.slug,
    id: product.id,
    price: product.price,
    variantLabel: product.variantLabel || product.colorName,
  });

  if (disabled) {
    return (
      <button type="button" className={className} disabled>
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
}

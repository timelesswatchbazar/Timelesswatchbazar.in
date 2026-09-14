import { SITE_NAME, SITE_PHONE_E164, SITE_URL } from "@/lib/site";
import { formatMoney } from "@/lib/money";

/** Digits only for wa.me links */
export function whatsappNumber() {
  return SITE_PHONE_E164.replace(/\D/g, "");
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppProductInquiry = {
  name: string;
  slug?: string;
  price?: number;
  variantLabel?: string;
  id?: string;
};

export function productInquiryMessage(product: WhatsAppProductInquiry) {
  const lines = [
    `Hello ${SITE_NAME}!`,
    "",
    "I want to inquire about this product:",
    `*${product.name}*`,
  ];

  if (product.variantLabel?.trim()) {
    lines.push(`Option: ${product.variantLabel.trim()}`);
  }
  if (product.price != null && Number.isFinite(product.price)) {
    lines.push(`Price: ${formatMoney(product.price)}`);
  }

  const path = product.slug
    ? `/products/${encodeURIComponent(product.slug)}`
    : product.id
      ? `/products/${encodeURIComponent(product.id)}`
      : "";
  if (path) {
    lines.push(`Link: ${SITE_URL}${path}`);
  }

  lines.push("", "Please share availability and how I can place the order.");
  return lines.join("\n");
}

export function generalInquiryMessage() {
  return `Hello ${SITE_NAME}!\n\nI would like to inquire about your watches.`;
}

export function productWhatsAppUrl(product: WhatsAppProductInquiry) {
  return buildWhatsAppUrl(productInquiryMessage(product));
}

export function generalWhatsAppUrl() {
  return buildWhatsAppUrl(generalInquiryMessage());
}

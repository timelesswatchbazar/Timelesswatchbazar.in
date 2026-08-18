export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  /** Extra images for this variation (ordered). Primary is image_url. */
  gallery?: string[] | null;
  stock: number;
  actual_price: number | null;
  sale_price: number | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  gallery: string[];
  actual_price: number;
  sale_price: number;
  stock: number;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  has_variants?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  product_variants?: ProductVariantRow[];
};

export type BannerRow = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "cod";

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  country: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  variant_id?: string | null;
  variant_label?: string;
  created_at: string;
};

/** Storefront color option */
export type StoreVariant = {
  id: string;
  colorName: string;
  colorHex: string;
  /** Primary image (cart / variation selector) */
  image: string;
  /** All images for this variation (primary first) */
  images: string[];
  stock: number;
  actualPrice: number | null;
  price: number | null;
  isDefault: boolean;
};

/** Storefront-friendly product shape */
export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  category: string;
  categoryName?: string;
  actualPrice: number;
  price: number;
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  hasVariants?: boolean;
  variants?: StoreVariant[];
};

function uniqueUrls(urls: Array<string | undefined | null>) {
  const out: string[] = [];
  for (const raw of urls) {
    const url = (raw || "").trim();
    if (url && !out.includes(url)) out.push(url);
  }
  return out;
}

export function mapVariantRow(row: ProductVariantRow): StoreVariant {
  const primary = (row.image_url || "").trim();
  const extras = Array.isArray(row.gallery)
    ? row.gallery.map((g) => String(g || "").trim()).filter(Boolean)
    : [];
  const images = uniqueUrls([primary, ...extras]);

  return {
    id: row.id,
    colorName: row.color_name,
    colorHex: row.color_hex || "#C7A252",
    image: images[0] || "",
    images,
    stock: row.stock,
    actualPrice: row.actual_price == null ? null : Number(row.actual_price),
    price: row.sale_price == null ? null : Number(row.sale_price),
    isDefault: row.is_default,
  };
}

export function mapProductRow(row: ProductRow): StoreProduct {
  const allVariants = (row.product_variants || [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.color_name.localeCompare(b.color_name))
    .map(mapVariantRow);

  // Prefer explicit flag; still show legacy rows if flag was never set.
  const hasVariants = Boolean(row.has_variants) || allVariants.length > 0;
  const variants = hasVariants ? allVariants : [];

  const defaultVariant =
    variants.find((v) => v.isDefault) || variants[0] || null;

  const gallery = Array.isArray(row.gallery)
    ? row.gallery.map((g) => String(g || "").trim()).filter(Boolean)
    : [];

  const variantStockTotal = variants.reduce((sum, v) => sum + v.stock, 0);
  const basePricing = {
    actualPrice: Number(row.actual_price),
    price: Number(row.sale_price),
  };
  const listingPricing = resolveVariantPricing(basePricing, defaultVariant);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image:
      (defaultVariant?.image || "").trim() ||
      (row.image_url || "").trim() ||
      "",
    gallery,
    category: row.categories?.slug ?? "",
    categoryName: row.categories?.name,
    actualPrice: listingPricing.actualPrice,
    price: listingPricing.price,
    stock: variants.length > 0 ? variantStockTotal : row.stock,
    isNew: row.is_new_arrival,
    isBestSeller: row.is_best_seller,
    hasVariants,
    variants,
  };
}

export function discountPercent(actual: number, sale: number) {
  if (!actual || sale >= actual) return 0;
  return Math.round(((actual - sale) / actual) * 100);
}

export function resolveVariantPricing(
  product: Pick<StoreProduct, "actualPrice" | "price">,
  variant?: StoreVariant | null,
) {
  if (!variant) {
    return { actualPrice: product.actualPrice, price: product.price };
  }

  // Selected variant always drives price: sale → actual → parent product.
  const price =
    variant.price != null
      ? Number(variant.price)
      : variant.actualPrice != null
        ? Number(variant.actualPrice)
        : product.price;

  const actual =
    variant.actualPrice != null
      ? Number(variant.actualPrice)
      : Math.max(price, product.actualPrice);

  return { actualPrice: actual, price };
}

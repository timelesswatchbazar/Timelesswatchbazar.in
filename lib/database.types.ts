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
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: Pick<CategoryRow, "id" | "name" | "slug"> | null;
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
  created_at: string;
};

/** Storefront-friendly product shape */
export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  category: string;
  categoryName?: string;
  actualPrice: number;
  price: number;
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
};

export function mapProductRow(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image_url,
    category: row.categories?.slug ?? "",
    categoryName: row.categories?.name,
    actualPrice: Number(row.actual_price),
    price: Number(row.sale_price),
    stock: row.stock,
    isNew: row.is_new_arrival,
    isBestSeller: row.is_best_seller,
  };
}

export function discountPercent(actual: number, sale: number) {
  if (!actual || sale >= actual) return 0;
  return Math.round(((actual - sale) / actual) * 100);
}

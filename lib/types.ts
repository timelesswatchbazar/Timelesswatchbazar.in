export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type ProductVariant = {
  id: string;
  colorName: string;
  colorHex: string;
  image: string;
  stock: number;
  actualPrice?: number | null;
  price?: number | null;
  isDefault?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  actualPrice?: number;
  category: string;
  image: string;
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  variants?: ProductVariant[];
  /** Selected when adding to cart */
  variantId?: string;
  colorName?: string;
};

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "timeless-watch-bazar-cart-v5";
const LEGACY_KEYS = [
  "timeless-watch-bazar-cart-v4",
  "timeless-watch-bazar-cart-v3",
  "timeless-watch-bazar-cart-v2",
];

function cartKey(productId: string, variantId?: string | null) {
  return `${productId}::${variantId || "default"}`;
}

function itemKey(item: CartItem) {
  return cartKey(item.product.id, item.product.variantId);
}

function normalizeProduct(product: Product): Product {
  const variantLabel = (
    product.variantLabel ||
    product.colorName ||
    ""
  ).trim();
  return {
    ...product,
    variantLabel: variantLabel || undefined,
    colorName: variantLabel || undefined,
  };
}

function normalizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is CartItem =>
        Boolean(item) &&
        typeof item === "object" &&
        Boolean((item as CartItem).product?.id),
    )
    .map((item) => ({
      quantity: Math.max(1, Number(item.quantity) || 1),
      product: normalizeProduct(item.product),
    }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const key of LEGACY_KEYS) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      if (raw) setItems(normalizeItems(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const snapshot = normalizeProduct(product);
    setItems((prev) => {
      const key = cartKey(snapshot.id, snapshot.variantId);
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key
            ? { product: snapshot, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product: snapshot, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = cartKey(productId, variantId);
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      const key = cartKey(productId, variantId);
      setItems((prev) =>
        prev
          .map((i) =>
            itemKey(i) === key ? { ...i, quantity: Math.max(0, quantity) } : i,
          )
          .filter((i) => i.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    );
    return {
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Helper for UI */
export function getCartVariantLabel(product: Product) {
  return (product.variantLabel || product.colorName || "").trim();
}

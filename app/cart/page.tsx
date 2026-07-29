"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-md border border-zinc-200 bg-white p-6 text-center sm:mt-10 sm:p-8">
          <p className="text-zinc-600">Your cart is empty.</p>
          <Link
            href="/products"
            className="btn-soft mt-6 inline-flex max-w-xs"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="space-y-3 sm:space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 rounded-md border border-zinc-200 bg-white p-3 sm:gap-4 sm:p-4"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-50 sm:h-28 sm:w-28"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-zinc-950 hover:text-zinc-600 sm:text-base"
                    >
                      {product.name}
                    </Link>
                    <p className="shrink-0 text-sm font-extrabold text-zinc-950 sm:text-base">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-600">
                    {formatPrice(product.price)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        readOnly
                        value={quantity}
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-zinc-600 hover:text-zinc-950"
                      onClick={() => removeItem(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-800"
            >
              Clear cart
            </button>
          </div>

          <aside className="h-fit rounded-md border border-zinc-200 bg-white p-5 sm:sticky sm:top-24 sm:p-6">
            <h2 className="text-lg font-bold text-zinc-950">Order Summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-bold text-zinc-950">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">Shipping</span>
              <span className="text-right font-medium text-zinc-700">
                Calculated at checkout
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="font-semibold text-zinc-950">Total</span>
              <span className="text-xl font-extrabold text-zinc-950">
                {formatPrice(subtotal)}
              </span>
            </div>
            <button type="button" className="checkout-submit mt-6">
              Proceed to Checkout
            </button>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm font-semibold text-zinc-950"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

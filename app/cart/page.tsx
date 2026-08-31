"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { getCartVariantLabel, useCart } from "@/components/cart-context";
import { formatMoney } from "@/lib/money";
import { placeOrder } from "@/lib/checkout";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);

  async function onCheckout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await placeOrder({
      customerName: String(form.get("customerName") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      shippingAddress: String(form.get("shippingAddress") || ""),
      city: String(form.get("city") || ""),
      notes: String(form.get("notes") || ""),
      items: items.map(({ product, quantity }) => {
        const variantLabel = getCartVariantLabel(product);
        return {
          productId: product.id,
          quantity,
          variantId: product.variantId,
          colorName: variantLabel,
          imageUrl: product.image,
          unitPrice: product.price,
        };
      }),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clearCart();
    setSuccess({ orderNumber: result.orderNumber });
    setCheckoutOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-4xl">
        Your Cart
      </h1>

      {success && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-bold text-emerald-900">Order placed successfully</p>
          <p className="mt-1 text-sm text-emerald-800">
            Your order number is <strong>{success.orderNumber}</strong>. A confirmation email
            with order details has been sent to you.
          </p>
          <Link href="/products" className="btn-soft mt-4 inline-flex max-w-xs">
            Continue Shopping
          </Link>
        </div>
      )}

      {!success && items.length === 0 ? (
        <div className="mt-8 rounded-md border border-[var(--silver)] bg-white p-6 text-center sm:mt-10 sm:p-8">
          <p className="text-[var(--muted)]">Your cart is empty.</p>
          <Link href="/products" className="btn-soft mt-6 inline-flex max-w-xs">
            Continue Shopping
          </Link>
        </div>
      ) : !success ? (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_360px] lg:gap-8">
          <div className="space-y-3 sm:space-y-4">
            {items.map(({ product, quantity }) => {
              const variantLabel = getCartVariantLabel(product);
              return (
                <div
                  key={`${product.id}::${product.variantId || "default"}`}
                  className="flex gap-3 rounded-md border border-[var(--silver)] bg-white p-3 sm:gap-4 sm:p-4"
                >
                  <Link
                    href={`/products/${encodeURIComponent(product.slug)}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--surface)] sm:h-28 sm:w-28"
                  >
                    <Image
                      src={
                        product.image?.trim() ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={
                        variantLabel
                          ? `${product.name} — ${variantLabel}`
                          : product.name
                      }
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized={Boolean(product.image?.includes("supabase.co"))}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${encodeURIComponent(product.slug)}`}
                          className="line-clamp-2 text-sm font-semibold text-[var(--midnight)] hover:text-[var(--navy)] sm:text-base"
                        >
                          {product.name}
                        </Link>
                        {variantLabel ? (
                          <p className="mt-1.5 text-sm font-semibold text-[var(--navy)]">
                            Color: {variantLabel}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-[var(--midnight)] sm:text-base">
                        {formatMoney(product.price * quantity)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                      Price: {formatMoney(product.price)}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Quantity: {quantity}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1, product.variantId)
                          }
                        >
                          −
                        </button>
                        <input readOnly value={quantity} aria-label="Quantity" />
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1, product.variantId)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--midnight)]"
                        onClick={() => removeItem(product.id, product.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--midnight)]"
            >
              Clear cart
            </button>
          </div>

          <aside className="h-fit space-y-4">
            <div className="rounded-md border border-[var(--silver)] bg-white p-5 sm:sticky sm:top-24 sm:p-6">
              <h2 className="text-lg font-bold text-[var(--midnight)]">Order Summary</h2>
              <ul className="mt-4 space-y-2 border-b border-[var(--silver)] pb-4">
                {items.map(({ product, quantity }) => {
                  const variantLabel = getCartVariantLabel(product);
                  return (
                    <li
                      key={`summary-${product.id}::${product.variantId || "default"}`}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-[var(--navy)]">
                        <span className="font-medium">{product.name}</span>
                        {variantLabel ? (
                          <span className="mt-0.5 block text-xs font-semibold text-[var(--midnight)]">
                            Color: {variantLabel}
                          </span>
                        ) : null}
                        <span className="text-xs text-[var(--muted)]"> × {quantity}</span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatMoney(product.price * quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Subtotal</span>
                <span className="font-bold">{formatMoney(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">Shipping</span>
                <span className="text-right font-medium text-[var(--navy)]">Cash on delivery</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--silver)] pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-extrabold">{formatMoney(subtotal)}</span>
              </div>
              <button
                type="button"
                className="checkout-submit mt-6"
                onClick={() => setCheckoutOpen((v) => !v)}
              >
                {checkoutOpen ? "Hide checkout" : "Proceed to Checkout"}
              </button>
              <Link
                href="/products"
                className="mt-3 block text-center text-sm font-semibold text-[var(--midnight)]"
              >
                Continue Shopping
              </Link>
            </div>

            {checkoutOpen && (
              <form
                onSubmit={onCheckout}
                className="rounded-md border border-[var(--silver)] bg-white p-5 space-y-3"
              >
                <h3 className="text-base font-bold">Customer details</h3>
                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <input
                  name="customerName"
                  required
                  placeholder="Full name"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <input
                  name="customerEmail"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <input
                  name="customerPhone"
                  required
                  placeholder="Phone"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <input
                  name="city"
                  required
                  placeholder="City"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <textarea
                  name="shippingAddress"
                  required
                  rows={3}
                  placeholder="Shipping address"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Order notes (optional)"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
                <button type="submit" className="checkout-submit" disabled={submitting}>
                  {submitting ? "Placing order…" : "Place order (COD)"}
                </button>
              </form>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

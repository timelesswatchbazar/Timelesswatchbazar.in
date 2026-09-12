"use client";

import { FormEvent, useState } from "react";
import { formatMoney } from "@/lib/money";
import { trackOrder, type TrackedOrder } from "@/lib/track-order";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setOrder(null);

    const form = new FormData(e.currentTarget);
    const result = await trackOrder({
      orderNumber: String(form.get("order") || ""),
      email: String(form.get("email") || ""),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOrder(result.order);
  };

  const fieldClass =
    "w-full rounded-md border border-[var(--silver)] px-3 py-2.5 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--gold)_30%,transparent)]";

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-3xl">
        Track Order
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Enter your order number and email to check the latest status.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-md border border-[var(--silver)] bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="order">
            Order number
          </label>
          <input
            id="order"
            name="order"
            required
            placeholder="TWB-XXXXXX-XXXXXX"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--midnight)]" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
        <button type="submit" className="checkout-submit" disabled={submitting}>
          {submitting ? "Checking…" : "Track Order"}
        </button>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
      </form>

      {order ? (
        <div className="mt-6 space-y-4 rounded-md border border-[var(--silver)] bg-white p-4 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Order number
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--midnight)]">{order.orderNumber}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Status
              </p>
              <p className="mt-1 font-semibold text-[var(--navy)]">
                {STATUS_LABEL[order.status] || order.status}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Payment
              </p>
              <p className="mt-1 font-semibold uppercase text-[var(--navy)]">
                {order.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Total
              </p>
              <p className="mt-1 font-semibold text-[var(--navy)]">{formatMoney(order.total)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                City
              </p>
              <p className="mt-1 font-semibold text-[var(--navy)]">{order.city}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Items
            </p>
            <ul className="mt-2 divide-y divide-[var(--silver)]">
              {order.items.map((item, idx) => (
                <li key={`${item.name}-${idx}`} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="text-[var(--midnight)]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-[var(--navy)]">
                    {formatMoney(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

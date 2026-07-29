"use client";

import { FormEvent, useState } from "react";

export default function TrackOrderPage() {
  const [checked, setChecked] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setChecked(true);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Track Order</h1>
      <p className="mt-3 text-zinc-600">
        Enter your order number and email to check the latest status.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-md border border-zinc-200 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="order">
            Order number
          </label>
          <input
            id="order"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/20"
          />
        </div>
        <button type="submit" className="checkout-submit">
          Track Order
        </button>
        {checked && (
          <p className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-800">
            No matching order found yet. Please verify your details or contact support.
          </p>
        )}
      </form>
    </div>
  );
}

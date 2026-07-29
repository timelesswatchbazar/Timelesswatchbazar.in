import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950">My Profile</h1>
      <div className="mt-8 rounded-md border border-zinc-200 bg-white p-8 text-center">
        <p className="text-zinc-600">
          Sign in to view your orders, saved addresses, and account details.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="checkout-submit max-w-xs">
            Sign In
          </button>
          <Link
            href="/products"
            className="primary-action inline-flex max-w-xs border border-zinc-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  customerSignIn,
  customerSignOut,
  customerSignUp,
  updateCustomerProfile,
} from "@/lib/customer/actions";
import { formatMoney } from "@/lib/money";
import type { CustomerRow, OrderRow } from "@/lib/database.types";

type Props = {
  mode: "signin" | "signup";
  editing?: boolean;
  error?: string;
  success?: string;
  userEmail?: string | null;
  customer?: CustomerRow | null;
  orders?: OrderRow[];
};

export function ProfilePanel({
  mode,
  editing = false,
  error,
  success,
  userEmail,
  customer,
  orders = [],
}: Props) {
  if (userEmail) {
    const name = customer?.full_name || "Customer";
    const phone = customer?.phone || "—";
    const city = customer?.city || "—";
    const address = customer?.address || "—";

    return (
      <div className="space-y-6">
        {success && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {decodeURIComponent(success)}
          </p>
        )}
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <section className="overflow-hidden rounded-md border border-[var(--silver)] bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--silver)] bg-[var(--surface)] px-5 py-4 sm:px-6">
            <div>
              <p className="section-eyebrow">Customer profile</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--midnight)]">{name}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{userEmail}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!editing ? (
                <Link
                  href="/profile?edit=1"
                  className="rounded-md border border-[var(--gold)] px-3 py-1.5 text-sm font-semibold text-[var(--midnight)]"
                >
                  Edit details
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="rounded-md border border-[var(--silver)] px-3 py-1.5 text-sm font-semibold text-[var(--navy)]"
                >
                  Cancel
                </Link>
              )}
              <form action={customerSignOut}>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--silver)] px-3 py-1.5 text-sm font-semibold text-[var(--navy)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {!editing ? (
            <dl className="grid gap-0 sm:grid-cols-2">
              <InfoRow label="Full name" value={name} />
              <InfoRow label="Email" value={userEmail} />
              <InfoRow label="Phone" value={phone} />
              <InfoRow label="City" value={city} />
              <InfoRow label="Address" value={address} wide />
            </dl>
          ) : (
            <form action={updateCustomerProfile} className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              <Field
                label="Full name"
                name="fullName"
                defaultValue={customer?.full_name || ""}
                required
              />
              <Field label="Phone" name="phone" defaultValue={customer?.phone || ""} required />
              <Field label="City" name="city" defaultValue={customer?.city || ""} required />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  defaultValue={customer?.address || ""}
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-soft max-w-xs">
                  Save profile
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-md border border-[var(--silver)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--midnight)]">My orders</h2>
            <Link href="/track-order" className="text-sm font-semibold text-[var(--gold)]">
              Track order
            </Link>
          </div>

          {!orders.length ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              No orders yet.{" "}
              <Link href="/products" className="font-semibold text-[var(--navy)]">
                Start shopping
              </Link>
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--silver)] text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Order</th>
                    <th className="py-2 pr-3 font-semibold">Total</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--silver)]/60">
                      <td className="py-3 pr-3 font-semibold">{order.order_number}</td>
                      <td className="py-3 pr-3">{formatMoney(Number(order.total))}</td>
                      <td className="py-3 pr-3 capitalize">{order.status}</td>
                      <td className="py-3 text-[var(--muted)]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--silver)] bg-white p-5 sm:p-8">
      <div className="flex gap-2 rounded-md bg-[var(--surface)] p-1">
        <Link
          href="/profile?mode=signin"
          className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-bold ${
            mode === "signin" ? "bg-[var(--midnight)] text-white" : "text-[var(--navy)]"
          }`}
        >
          Sign In
        </Link>
        <Link
          href="/profile?mode=signup"
          className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-bold ${
            mode === "signup" ? "bg-[var(--midnight)] text-white" : "text-[var(--navy)]"
          }`}
        >
          Create Account
        </Link>
      </div>

      <p className="mt-5 text-sm text-[var(--muted)]">
        {mode === "signin"
          ? "Sign in to view your saved customer details and orders."
          : "Create an account with your contact and address details."}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {decodeURIComponent(success)}
        </p>
      )}

      {mode === "signin" ? (
        <form action={customerSignIn} className="mt-6 space-y-3">
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <button type="submit" className="checkout-submit">
            Sign In
          </button>
        </form>
      ) : (
        <form action={customerSignUp} className="mt-6 space-y-3">
          <Field label="Full name" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" required />
          <Field label="City" name="city" required />
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="signup-address">
              Address
            </label>
            <textarea
              id="signup-address"
              name="address"
              rows={3}
              required
              placeholder="House / street / area"
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
            />
          </div>
          <Field label="Password" name="password" type="password" required />
          <button type="submit" className="checkout-submit">
            Create Account
          </button>
        </form>
      )}

      <Link
        href="/products"
        className="mt-4 block text-center text-sm font-semibold text-[var(--midnight)]"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

function InfoRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`border-b border-[var(--silver)] px-5 py-4 sm:px-6 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--midnight)] sm:text-base">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-[var(--silver)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
      />
    </div>
  );
}

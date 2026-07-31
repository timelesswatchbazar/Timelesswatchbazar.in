import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/actions";
import type { CustomerRow } from "@/lib/database.types";

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orderCounts } = await supabase
    .from("orders")
    .select("customer_id, customer_email");

  const countByEmail = new Map<string, number>();
  for (const order of orderCounts || []) {
    const key = String(order.customer_email || "").toLowerCase();
    if (!key) continue;
    countByEmail.set(key, (countByEmail.get(key) || 0) + 1);
  }

  return (
    <AdminShell title="Customers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {(customers || []).length} customer{(customers || []).length === 1 ? "" : "s"}
        </p>
        <a
          href="/admin/customers/export"
          className="rounded-md border border-[var(--gold)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--midnight)]"
        >
          Download CSV
        </a>
      </div>

      <section className="overflow-hidden rounded-lg border border-[var(--silver)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {((customers as CustomerRow[]) || []).map((customer) => (
                <tr key={customer.id} className="border-t border-[var(--silver)]">
                  <td className="px-4 py-3 font-semibold">{customer.full_name}</td>
                  <td className="px-4 py-3">
                    <p>{customer.email}</p>
                    <p className="text-xs text-[var(--muted)]">{customer.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{customer.city || "—"}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-1">
                      {customer.address || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                      className="font-semibold text-[var(--gold)]"
                    >
                      {countByEmail.get(customer.email.toLowerCase()) || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!customers?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-[var(--muted)]">
                    No customers yet. They appear when orders are placed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

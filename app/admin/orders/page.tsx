import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import type { OrderRow } from "@/lib/database.types";

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, q } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("customer_email", `%${q}%`);

  const { data: orders } = await query;

  const filters = [
    "",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <AdminShell title="Orders">
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((value) => (
          <Link
            key={value || "all"}
            href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${
              (status || "") === value
                ? "bg-[var(--midnight)] text-white"
                : "bg-white text-[var(--navy)] border border-[var(--silver)]"
            }`}
          >
            {value || "All"}
          </Link>
        ))}
        <a
          href="/admin/orders/export"
          className="ml-auto rounded-md border border-[var(--gold)] px-3 py-1.5 text-sm font-semibold text-[var(--midnight)]"
        >
          Download CSV
        </a>
      </div>

      <section className="overflow-hidden rounded-lg border border-[var(--silver)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {((orders as OrderRow[]) || []).map((order) => (
                <tr key={order.id} className="border-t border-[var(--silver)]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-[var(--navy)] hover:text-[var(--gold)]"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-[var(--muted)]">{order.customer_email}</p>
                    <p className="text-xs text-[var(--muted)]">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {formatMoney(Number(order.total))}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {order.status}
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">
                      {String(order.payment_status).toLowerCase() === "cod"
                        ? "unpaid"
                        : order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!orders?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-[var(--muted)]">
                    No orders found.
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

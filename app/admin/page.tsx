import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: productCount },
    { count: orderCount },
    { count: customerCount },
    { count: bannerCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("banners").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stats = [
    { label: "Products", value: productCount ?? 0, href: "/admin/products" },
    { label: "Orders", value: orderCount ?? 0, href: "/admin/orders" },
    { label: "Customers", value: customerCount ?? 0, href: "/admin/customers" },
    { label: "Banners", value: bannerCount ?? 0, href: "/admin/banners" },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm transition hover:border-[var(--gold)]"
          >
            <p className="text-sm font-semibold text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--midnight)]">{stat.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--midnight)]">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-[var(--gold)]">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--silver)] text-[var(--muted)]">
              <tr>
                <th className="py-2 pr-4 font-semibold">Order</th>
                <th className="py-2 pr-4 font-semibold">Customer</th>
                <th className="py-2 pr-4 font-semibold">Total</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders || []).map((order) => (
                <tr key={order.id} className="border-b border-[var(--silver)]/60">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-[var(--navy)] hover:text-[var(--gold)]"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{order.customer_name}</td>
                  <td className="py-3 pr-4">{formatMoney(Number(order.total))}</td>
                  <td className="py-3 pr-4 capitalize">{order.status}</td>
                </tr>
              ))}
              {!recentOrders?.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-[var(--muted)]">
                    No orders yet.
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

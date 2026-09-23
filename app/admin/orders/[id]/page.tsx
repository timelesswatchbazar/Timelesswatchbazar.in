import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin, updateOrderStatus } from "@/lib/admin/actions";
import { formatMoney } from "@/lib/money";
import type { OrderItemRow, OrderRow } from "@/lib/database.types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items (*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const row = order as OrderRow & { order_items: OrderItemRow[] };
  const paymentStatus =
    String(row.payment_status).toLowerCase() === "cod" ? "unpaid" : row.payment_status;

  return (
    <AdminShell title={`Order ${row.order_number}`}>
      <Link href="/admin/orders" className="mb-4 inline-block text-sm font-semibold text-[var(--navy)]">
        ← Back to orders
      </Link>

      {(error || success) && (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {error ? decodeURIComponent(error) : "Order updated."}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Customer information</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="font-semibold">{row.customer_name}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="font-semibold">{row.customer_email}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Phone</dt>
                <dd className="font-semibold">{row.customer_phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">City</dt>
                <dd className="font-semibold">{row.city || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted)]">Shipping address</dt>
                <dd className="font-semibold">{row.shipping_address || "—"}</dd>
              </div>
              {row.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-[var(--muted)]">Notes</dt>
                  <dd className="font-semibold">{row.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Items</h2>
            <div className="mt-4 space-y-3">
              {(row.order_items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--silver)]/50 pb-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url || "/vercel.svg"}
                      alt=""
                      className="h-12 w-12 rounded object-cover bg-[var(--surface)]"
                    />
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      {item.variant_label ? (
                        <p className="text-xs font-medium text-[var(--gold)]">
                          Color: {item.variant_label}
                        </p>
                      ) : null}
                      <p className="text-[var(--muted)]">
                        {formatMoney(Number(item.unit_price))} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">{formatMoney(Number(item.line_total))}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(Number(row.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{formatMoney(Number(row.discount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatMoney(Number(row.shipping_fee))}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--silver)] pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatMoney(Number(row.total))}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Update status</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Placed {new Date(row.created_at).toLocaleString()}
          </p>
          <form action={updateOrderStatus} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={row.id} />
            <div>
              <label className="mb-1 block text-sm font-semibold">Order status</label>
              <select
                name="status"
                defaultValue={row.status}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              >
                {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Payment</label>
              <select
                name="payment_status"
                defaultValue={paymentStatus}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              >
                {["unpaid", "paid", "refunded"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-soft">
              Save changes
            </button>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}

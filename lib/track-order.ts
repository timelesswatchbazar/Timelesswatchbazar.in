"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { OrderItemRow, OrderStatus } from "@/lib/database.types";

export type TrackOrderResult =
  | {
      ok: true;
      order: {
        orderNumber: string;
        status: OrderStatus;
        paymentStatus: string;
        total: number;
        customerName: string;
        city: string;
        createdAt: string;
        items: Array<{
          name: string;
          quantity: number;
          unitPrice: number;
          lineTotal: number;
        }>;
      };
    }
  | { ok: false; error: string };

export async function trackOrder(input: {
  orderNumber: string;
  email: string;
}): Promise<TrackOrderResult> {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Order tracking is not configured yet." };
  }

  const orderNumber = input.orderNumber.trim().toUpperCase();
  const email = input.email.trim().toLowerCase();

  if (!orderNumber || !email) {
    return { ok: false, error: "Enter both order number and email." };
  }

  const db = createServiceClient();

  const { data: order, error } = await db
    .from("orders")
    .select(
      "id, order_number, status, payment_status, total, customer_name, customer_email, city, created_at",
    )
    .eq("order_number", orderNumber)
    .ilike("customer_email", email)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Could not look up this order. Please try again." };
  }

  if (!order) {
    return {
      ok: false,
      error: "No matching order found. Please verify your order number and email.",
    };
  }

  const { data: items } = await db
    .from("order_items")
    .select("product_name, quantity, unit_price, line_total")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return {
    ok: true,
    order: {
      orderNumber: order.order_number,
      status: order.status as OrderStatus,
      paymentStatus: String(order.payment_status).toLowerCase() === "cod"
        ? "unpaid"
        : order.payment_status,
      total: Number(order.total),
      customerName: order.customer_name,
      city: order.city,
      createdAt: order.created_at,
      items: ((items as Pick<OrderItemRow, "product_name" | "quantity" | "unit_price" | "line_total">[]) || []).map(
        (item) => ({
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          lineTotal: Number(item.line_total),
        }),
      ),
    },
  };
}

/** Kept for typing convenience in UI */
export type TrackedOrder = Extract<TrackOrderResult, { ok: true }>["order"];

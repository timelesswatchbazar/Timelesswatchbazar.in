"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  variantId?: string;
  colorName?: string;
  /** Snapshot from cart (selected variant image) */
  imageUrl?: string;
};

export async function placeOrder(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: CheckoutItem[];
}) {
  if (!hasSupabaseEnv()) {
    return { ok: false as const, error: "Supabase is not configured yet." };
  }

  const supabase = await createClient();

  if (!input.items.length) {
    return { ok: false as const, error: "Cart is empty." };
  }

  const ids = [...new Set(input.items.map((i) => i.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, image_url, sale_price, actual_price, stock, is_active")
    .in("id", ids);

  if (productsError || !products?.length) {
    return { ok: false as const, error: "Could not load products." };
  }

  const variantIds = input.items
    .map((i) => i.variantId)
    .filter((id): id is string => Boolean(id));

  const { data: variants } = variantIds.length
    ? await supabase
        .from("product_variants")
        .select(
          "id, product_id, color_name, image_url, stock, sale_price, actual_price, is_active",
        )
        .in("id", variantIds)
    : { data: [] as Array<Record<string, unknown>> };

  try {
    const lines = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.is_active) {
        throw new Error("One or more products are unavailable.");
      }

      const variant = item.variantId
        ? (variants || []).find((v) => v.id === item.variantId)
        : null;

      if (item.variantId && (!variant || !variant.is_active)) {
        throw new Error("One or more color options are unavailable.");
      }

      if (variant && Number(variant.stock) < item.quantity) {
        throw new Error(`${product.name} (${variant.color_name}) is out of stock.`);
      }

      const unit =
        variant?.sale_price != null
          ? Number(variant.sale_price)
          : Number(product.sale_price);
      const qty = Math.max(1, item.quantity);
      const colorName =
        (variant?.color_name as string | undefined) || item.colorName || "";
      const lineImage =
        (item.imageUrl || "").trim() ||
        ((variant?.image_url as string | undefined) || "").trim() ||
        product.image_url;

      return {
        product_id: product.id,
        product_name: colorName ? `${product.name} — ${colorName}` : product.name,
        product_slug: product.slug,
        image_url: lineImage,
        unit_price: unit,
        quantity: qty,
        line_total: unit * qty,
        variant_id: variant?.id || null,
        variant_label: colorName,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);

    const email = input.customerEmail.trim().toLowerCase();
    let customerId: string | null = null;

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
      await supabase
        .from("customers")
        .update({
          full_name: input.customerName,
          phone: input.customerPhone,
          address: input.shippingAddress,
          city: input.city,
        })
        .eq("id", existing.id);
    } else {
      const { data: created, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: input.customerName,
          email,
          phone: input.customerPhone,
          address: input.shippingAddress,
          city: input.city,
        })
        .select("id")
        .single();

      if (customerError) {
        return { ok: false as const, error: customerError.message };
      }
      customerId = created.id;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        customer_name: input.customerName,
        customer_email: email,
        customer_phone: input.customerPhone,
        shipping_address: input.shippingAddress,
        city: input.city,
        status: "pending",
        payment_status: "cod",
        subtotal,
        discount: 0,
        shipping_fee: 0,
        total: subtotal,
        notes: input.notes || "",
        order_number: "",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return { ok: false as const, error: orderError?.message || "Order failed." };
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((line) => ({ ...line, order_id: order.id })),
    );

    if (itemsError) {
      return { ok: false as const, error: itemsError.message };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");

    return {
      ok: true as const,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Order failed.",
    };
  }
}

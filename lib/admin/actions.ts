"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!admin) redirect("/admin/login?error=unauthorized");

  return { supabase, user };
}

export async function adminLogin(formData: FormData) {
  const usernameOrEmail = String(
    formData.get("username") || formData.get("email") || "",
  ).trim();
  const password = String(formData.get("password") || "");

  const email = resolveAdminEmail(usernameOrEmail);
  if (!email || !password) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Invalid username or password")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Invalid username or password")}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login?error=login_failed");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}

/** Map admin username → Auth email (Supabase Auth still uses email under the hood). */
function resolveAdminEmail(input: string) {
  if (input.includes("@")) return input.toLowerCase();

  const key = input.toLowerCase().replace(/\s+/g, " ").trim();
  const usernames: Record<string, string> = {
    "hussain nalwala": "hussainnalwala@timelesswatchbazar.com",
    "hussain nal wala": "hussainnalwala@timelesswatchbazar.com",
  };

  return usernames[key] || null;
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  const imageUrl = String(formData.get("image_url") || "").trim();
  const actualPrice = Number(formData.get("actual_price") || 0);
  const salePrice = Number(formData.get("sale_price") || 0);
  const stock = Number(formData.get("stock") || 0);
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isNewArrival = formData.get("is_new_arrival") === "on";
  const isBestSeller = formData.get("is_best_seller") === "on";
  const isActive = formData.get("is_active") === "on";

  if (!name || actualPrice < 0 || salePrice < 0 || salePrice > actualPrice) {
    redirect("/admin/products?error=invalid_product");
  }

  const payload = {
    name,
    slug: slugInput || slugify(name),
    description,
    category_id: categoryId,
    image_url: imageUrl,
    actual_price: actualPrice,
    sale_price: salePrice,
    stock,
    sort_order: sortOrder,
    is_new_arrival: isNewArrival,
    is_best_seller: isBestSeller,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?success=1");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/products");

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}

export async function toggleProductFlag(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const field = String(formData.get("field") || "");
  const value = formData.get("value") === "true";

  if (!id || !["is_new_arrival", "is_best_seller", "is_active"].includes(field)) {
    redirect("/admin/products");
  }

  const { error } = await supabase
    .from("products")
    .update({ [field]: value })
    .eq("id", id);

  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function saveBanner(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim();
  const linkUrl = String(formData.get("link_url") || "/").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!imageUrl) redirect("/admin/banners?error=image_required");

  const payload = {
    title,
    subtitle,
    image_url: imageUrl,
    link_url: linkUrl || "/",
    sort_order: sortOrder,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase.from("banners").update(payload).eq("id", id);
    if (error) redirect(`/admin/banners?error=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from("banners").insert(payload);
    if (error) redirect(`/admin/banners?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?success=1");
}

export async function deleteBanner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/banners");

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) redirect(`/admin/banners?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?deleted=1");
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const paymentStatus = String(formData.get("payment_status") || "");

  if (!id) redirect("/admin/orders");

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
    })
    .eq("id", id);

  if (error) redirect(`/admin/orders/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?success=1`);
}

export async function saveCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!name) redirect("/admin/categories?error=name_required");

  const payload = {
    name,
    slug: slugInput || slugify(name),
    description,
    sort_order: sortOrder,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?success=1");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/categories");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?deleted=1");
}

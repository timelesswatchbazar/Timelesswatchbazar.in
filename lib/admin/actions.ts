"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/safe-auth";
import { slugify as slugifyText } from "@/lib/slug";

function revalidateStorefront(extraPaths: string[] = []) {
  revalidateTag("store-catalog", "max");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/sitemap.xml");
  for (const path of extraPaths) revalidatePath(path);
}

export async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const { user } = await getAuthUser(supabase);

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

  const { user } = await getAuthUser(supabase);

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
  return slugifyText(value);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("category_id") || "") || null;
  let imageUrl = String(formData.get("image_url") || "").trim();
  let actualPrice = Number(formData.get("actual_price") || 0);
  let salePrice = Number(formData.get("sale_price") || 0);
  let stock = Number(formData.get("stock") || 0);
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isNewArrival = formData.get("is_new_arrival") === "on";
  const isBestSeller = formData.get("is_best_seller") === "on";
  const isActive = formData.get("is_active") === "on";
  const hasVariants = formData.get("has_variants") === "yes";

  type IncomingVariant = {
    id?: string | null;
    color_name: string;
    color_hex: string;
    actual_price: string | number;
    sale_price: string | number;
    image_url: string;
    gallery?: string[];
    stock: number;
    sort_order: number;
    is_default: boolean;
    is_active: boolean;
  };

  let incomingVariants: IncomingVariant[] = [];
  if (hasVariants) {
    try {
      const raw = String(formData.get("variants_json") || "[]");
      const parsed = JSON.parse(raw) as IncomingVariant[];
      if (!Array.isArray(parsed)) throw new Error("invalid");
      incomingVariants = parsed;
    } catch {
      redirect(
        `/admin/products?error=${encodeURIComponent("Invalid variations data. Please try again.")}`,
      );
    }

    if (!incomingVariants.length) {
      redirect(
        `/admin/products?error=${encodeURIComponent("Add at least one color variation.")}`,
      );
    }

    const seen = new Set<string>();
    for (const v of incomingVariants) {
      const colorName = String(v.color_name || "").trim();
      if (!colorName) {
        redirect(
          `/admin/products?error=${encodeURIComponent("Each variation needs a color name.")}`,
        );
      }
      const key = colorName.toLowerCase();
      if (seen.has(key)) {
        redirect(
          `/admin/products?error=${encodeURIComponent(
            `A variation with the color "${colorName}" already exists.`,
          )}`,
        );
      }
      seen.add(key);

      if (!String(v.image_url || "").trim()) {
        redirect(
          `/admin/products?error=${encodeURIComponent(
            `Image is required for color "${colorName}".`,
          )}`,
        );
      }

      const vActual = Number(v.actual_price);
      const vSale = Number(v.sale_price);
      if (!Number.isFinite(vActual) || vActual < 0 || !Number.isFinite(vSale) || vSale < 0) {
        redirect(
          `/admin/products?error=${encodeURIComponent(
            `Enter valid prices for color "${colorName}".`,
          )}`,
        );
      }
      if (vSale > vActual) {
        redirect(
          `/admin/products?error=${encodeURIComponent(
            `Sale price cannot be higher than actual price for "${colorName}".`,
          )}`,
        );
      }
    }

    if (!incomingVariants.some((v) => v.is_default)) {
      incomingVariants[0].is_default = true;
    }

    const defaultVariant =
      incomingVariants.find((v) => v.is_default) || incomingVariants[0];
    actualPrice = Number(defaultVariant.actual_price);
    salePrice = Number(defaultVariant.sale_price);
    imageUrl = String(defaultVariant.image_url || "").trim();
    stock = incomingVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  if (!name) {
    redirect("/admin/products?error=" + encodeURIComponent("Product name is required."));
  }
  if (!Number.isFinite(actualPrice) || !Number.isFinite(salePrice) || actualPrice < 0 || salePrice < 0) {
    redirect(
      "/admin/products?error=" +
        encodeURIComponent("Enter valid actual and sale prices (numbers only)."),
    );
  }
  if (salePrice > actualPrice) {
    redirect(
      "/admin/products?error=" +
        encodeURIComponent("Sale price cannot be higher than actual price."),
    );
  }

  let slug = slugify(slugInput || name);
  if (!slug) {
    redirect("/admin/products?error=invalid_slug");
  }

  // Avoid unique-slug collisions when adding a similar product (same name).
  {
    let query = supabase.from("products").select("id").eq("slug", slug).limit(1);
    if (id) query = query.neq("id", id);
    const { data: existing } = await query.maybeSingle();
    if (existing) {
      let suffix = 2;
      while (suffix < 50) {
        const candidate = `${slug}-${suffix}`;
        let check = supabase.from("products").select("id").eq("slug", candidate).limit(1);
        if (id) check = check.neq("id", id);
        const { data: taken } = await check.maybeSingle();
        if (!taken) {
          slug = candidate;
          break;
        }
        suffix += 1;
      }
    }
  }

  const payload = {
    name,
    slug,
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
    has_variants: hasVariants,
  };

  let productId = id;

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) redirect(`/admin/products?edit=${id}&error=${encodeURIComponent(error.message)}`);
  } else {
    const { data: created, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
    productId = created.id;
  }

  // Sync color variations in the same save.
  if (hasVariants) {
    const { data: existingRows } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);
    const existingIds = new Set((existingRows || []).map((r) => r.id as string));
    const keepIds = new Set(
      incomingVariants.map((v) => v.id).filter((v): v is string => Boolean(v)),
    );

    // Clear defaults first so we can set exactly one.
    await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", productId);

    for (const [index, v] of incomingVariants.entries()) {
      const colorName = String(v.color_name).trim();
      const primary = String(v.image_url || "").trim();
      const gallery = Array.isArray(v.gallery)
        ? v.gallery.map((g) => String(g || "").trim()).filter((g) => g && g !== primary)
        : [];
      const row = {
        product_id: productId,
        color_name: colorName,
        color_hex: String(v.color_hex || "#C7A252").trim() || "#C7A252",
        image_url: primary,
        gallery,
        stock: Number(v.stock) || 0,
        sort_order: Number(v.sort_order) || index,
        actual_price: Number(v.actual_price),
        sale_price: Number(v.sale_price),
        is_default: Boolean(v.is_default),
        is_active: v.is_active !== false,
      };

      if (v.id && existingIds.has(v.id)) {
        const { error } = await supabase
          .from("product_variants")
          .update(row)
          .eq("id", v.id)
          .eq("product_id", productId);
        if (error) {
          redirect(
            `/admin/products?edit=${productId}&error=${encodeURIComponent(error.message)}`,
          );
        }
      } else {
        const { error } = await supabase.from("product_variants").insert(row);
        if (error) {
          redirect(
            `/admin/products?edit=${productId}&error=${encodeURIComponent(error.message)}`,
          );
        }
      }
    }

    const toDelete = [...existingIds].filter((vid) => !keepIds.has(vid));
    if (toDelete.length) {
      await supabase.from("product_variants").delete().in("id", toDelete);
    }
  } else if (id) {
    // Switching to No removes old variation rows so storefront stays clean.
    await supabase.from("product_variants").delete().eq("product_id", productId);
  }

  revalidateStorefront(["/admin/products"]);
  redirect(
    `/admin/products?edit=${productId}&success=${id ? "updated" : "added"}`,
  );
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/products");

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  revalidateStorefront(["/admin/products"]);
  redirect("/admin/products?deleted=1");
}

export async function toggleProductFlag(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
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

  revalidateStorefront(["/admin/products"]);
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

  revalidateStorefront(["/admin/banners"]);
  redirect("/admin/banners?success=1");
}

export async function deleteBanner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/banners");

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) redirect(`/admin/banners?error=${encodeURIComponent(error.message)}`);

  revalidateStorefront(["/admin/banners"]);
  redirect("/admin/banners?deleted=1");
}

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  let paymentStatus = String(formData.get("payment_status") || "").toLowerCase();
  if (paymentStatus === "cod") paymentStatus = "unpaid";
  if (!["unpaid", "paid", "refunded"].includes(paymentStatus)) {
    paymentStatus = "unpaid";
  }

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
    slug: slugify(slugInput || name),
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

  revalidateStorefront(["/admin/categories"]);
  redirect("/admin/categories?success=1");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/categories");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);

  revalidateStorefront(["/admin/categories"]);
  redirect("/admin/categories?deleted=1");
}

export async function saveProductVariant(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const id = String(formData.get("id") || "");
  const productId = String(formData.get("product_id") || "");
  const colorName = String(formData.get("color_name") || "").trim();
  const colorHex = String(formData.get("color_hex") || "#C7A252").trim() || "#C7A252";
  const imageUrl = String(formData.get("image_url") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isDefault = formData.get("is_default") === "on";
  const isActive = formData.get("is_active") === "on";

  const actualRaw = String(formData.get("actual_price") || "").trim();
  const saleRaw = String(formData.get("sale_price") || "").trim();
  let actualPrice = actualRaw === "" ? null : Number(actualRaw);
  let salePrice = saleRaw === "" ? null : Number(saleRaw);

  if (!productId || !colorName) {
    redirect(`/admin/products?edit=${productId}&error=variant_name_required`);
  }

  // Never allow a missing/deleted parent — variants must attach to an existing product.
  const { data: parent, error: parentError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (parentError || !parent) {
    redirect(
      `/admin/products?error=${encodeURIComponent("Product not found. Variant was not saved.")}`,
    );
  }

  // Each variant should have its own price (sale and/or actual).
  if (salePrice == null && actualPrice == null) {
    redirect(`/admin/products?edit=${productId}&error=variant_price_required`);
  }
  if (salePrice == null && actualPrice != null) salePrice = actualPrice;
  if (actualPrice == null && salePrice != null) actualPrice = salePrice;

  if (
    actualPrice == null ||
    salePrice == null ||
    actualPrice < 0 ||
    salePrice < 0 ||
    salePrice > actualPrice
  ) {
    redirect(`/admin/products?edit=${productId}&error=invalid_variant_price`);
  }

  if (isDefault) {
    await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", productId);
  }

  const payload = {
    product_id: productId,
    color_name: colorName,
    color_hex: colorHex,
    image_url: imageUrl,
    stock,
    sort_order: sortOrder,
    is_default: isDefault,
    is_active: isActive,
    actual_price: actualPrice,
    sale_price: salePrice,
  };

  if (id) {
    // Only update this variant row — never touch the parent product.
    const { error } = await supabase
      .from("product_variants")
      .update(payload)
      .eq("id", id)
      .eq("product_id", productId);
    if (error) {
      redirect(`/admin/products?edit=${productId}&error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("product_variants").insert(payload);
    if (error) {
      redirect(`/admin/products?edit=${productId}&error=${encodeURIComponent(error.message)}`);
    }
  }

  // Keep parent flag in sync so storefront shows variant picker.
  await supabase.from("products").update({ has_variants: true }).eq("id", productId);

  revalidateStorefront(["/admin/products"]);
  redirect(`/admin/products?edit=${productId}&success=variant`);
}

export async function deleteProductVariant(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const productId = String(formData.get("product_id") || "");
  if (!id) redirect("/admin/products");

  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) {
    redirect(
      `/admin/products?edit=${productId}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidateStorefront(["/admin/products"]);
  redirect(`/admin/products?edit=${productId}&success=variant_deleted`);
}

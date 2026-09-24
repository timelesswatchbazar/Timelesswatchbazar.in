"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/safe-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function profileError(message: string): never {
  redirect("/profile?mode=signup&error=" + encodeURIComponent(message));
}

async function ensureCustomerRow(
  email: string,
  fullName: string,
  phone: string,
  address = "",
  city = "",
) {
  try {
    const service = createServiceClient();
    const { data: existing } = await service
      .from("customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    const payload = {
      full_name: fullName,
      phone,
      address,
      city,
    };

    if (existing?.id) {
      await service.from("customers").update(payload).eq("id", existing.id);
    } else {
      await service.from("customers").insert({
        ...payload,
        email,
      });
    }
  } catch {
    // Table grants may still be pending — auth can still succeed
  }
}

export async function customerSignIn(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?error=" + encodeURIComponent("Store auth is not configured."));
  }

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/profile?error=" + encodeURIComponent("Enter email and password."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/profile?mode=signin&error=" + encodeURIComponent("Invalid email or password."));
  }

  revalidatePath("/profile");
  redirect("/profile?success=" + encodeURIComponent("Signed in successfully."));
}

export async function customerSignUp(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?error=" + encodeURIComponent("Store auth is not configured."));
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    profileError("Missing service role key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.");
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || !password) {
    profileError("Name, email, and password are required.");
  }

  if (!phone || !city || !address) {
    profileError("Phone, city, and address are required.");
  }

  if (password.length < 6) {
    profileError("Password must be at least 6 characters.");
  }

  const service = createServiceClient();

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, city, address },
  });

  if (createError) {
    const alreadyExists =
      /already|registered|exists/i.test(createError.message) ||
      createError.message.toLowerCase().includes("email");

    if (alreadyExists) {
      const supabase = await createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        redirect(
          "/profile?mode=signin&error=" +
            encodeURIComponent("An account with this email already exists. Please sign in."),
        );
      }

      await ensureCustomerRow(email, fullName, phone, address, city);
      revalidatePath("/profile");
      redirect("/profile?success=" + encodeURIComponent("Welcome back! Signed in."));
    }

    profileError(createError.message);
  }

  if (!created.user) {
    profileError("Could not create account. Please try again.");
  }

  await ensureCustomerRow(email, fullName, phone, address, city);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(
      "/profile?mode=signin&success=" +
        encodeURIComponent("Account created. Please sign in."),
    );
  }

  revalidatePath("/profile");
  redirect("/profile?success=" + encodeURIComponent("Welcome! Your account is ready."));
}

export async function customerSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/profile");
  redirect("/profile");
}

export async function updateCustomerProfile(formData: FormData) {
  const supabase = await createClient();
  const { user } = await getAuthUser(supabase);

  if (!user?.email) redirect("/profile?error=unauthorized");

  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();

  await ensureCustomerRow(user.email, fullName || user.email, phone, address, city);

  await supabase.auth.updateUser({
    data: { full_name: fullName, phone, city, address },
  });

  revalidatePath("/profile");
  redirect("/profile?success=" + encodeURIComponent("Profile updated."));
}

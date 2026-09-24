import type { Metadata } from "next";
import { ProfilePanel } from "@/components/profile-panel";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/safe-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { CustomerRow, OrderRow } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Profile",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    mode?: string;
    edit?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const editing = params.edit === "1";

  let userEmail: string | null = null;
  let customer: CustomerRow | null = null;
  let orders: OrderRow[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { user } = await getAuthUser(supabase);

      if (user?.email) {
        userEmail = user.email;

        const [{ data: customerRow }, { data: orderRows }] = await Promise.all([
          supabase
            .from("customers")
            .select("*")
            .ilike("email", user.email)
            .maybeSingle(),
          supabase
            .from("orders")
            .select("*")
            .ilike("customer_email", user.email)
            .order("created_at", { ascending: false }),
        ]);

        customer = (customerRow as CustomerRow | null) || null;
        orders = (orderRows as OrderRow[]) || [];
      }
    } catch {
      /* show signed-out UI */
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <p className="section-eyebrow">Account</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--midnight)] sm:text-3xl">
        My Profile
      </h1>
      <div className="mt-6">
        <ProfilePanel
          mode={mode}
          editing={editing}
          error={params.error}
          success={params.success}
          userEmail={userEmail}
          customer={customer}
          orders={orders}
        />
      </div>
    </div>
  );
}

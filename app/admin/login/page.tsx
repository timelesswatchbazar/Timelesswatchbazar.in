import { adminLogin } from "@/lib/admin/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const configured = hasSupabaseEnv();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--silver)] bg-white p-6 shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Admin Panel
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--midnight)]">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage products, banners, orders, and customers.
        </p>

        {!configured && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Add Supabase keys to <code>.env.local</code> first. See{" "}
            <code>supabase/</code> SQL files.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "unauthorized"
              ? "This account is not an active admin."
              : decodeURIComponent(error)}
          </p>
        )}

        <form action={adminLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="Hussain Nalwala"
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2.5 outline-none focus:border-[var(--gold)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2.5 outline-none focus:border-[var(--gold)]"
            />
          </div>
          <button type="submit" className="checkout-submit" disabled={!configured}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

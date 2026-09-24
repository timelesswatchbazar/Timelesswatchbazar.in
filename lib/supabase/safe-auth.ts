import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

export function isStaleRefreshToken(error: AuthError | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "refresh_token_not_found") return true;
  if (error.status === 400 && /refresh token/i.test(error.message)) return true;
  return false;
}

/** getUser with silent cleanup when browser cookies reference a revoked/expired refresh token. */
export async function getAuthUser(
  supabase: SupabaseClient,
): Promise<{ user: User | null; clearedStaleSession: boolean }> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (isStaleRefreshToken(error)) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    return { user: null, clearedStaleSession: true };
  }

  if (error) {
    return { user: null, clearedStaleSession: false };
  }

  return { user: user ?? null, clearedStaleSession: false };
}

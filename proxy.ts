import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/supabase/safe-auth";

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes("-auth-token") || c.name.startsWith("sb-"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isProfileRoute = pathname === "/profile" || pathname.startsWith("/profile/");

  if (!isAdminRoute && !isProfileRoute) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (isAdminRoute && !hasSupabaseAuthCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const { supabase, response } = createMiddlewareClient(request);
  const { user } = await getAuthUser(supabase);

  if (isProfileRoute) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/profile", "/profile/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE, verifyToken } from "@/lib/auth/jwt";

// Optimistic gate only; pages and API routes re-verify against the database.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const payload = await verifyToken(request.cookies.get(ADMIN_COOKIE)?.value);
    const isAdmin = payload?.role === "ADMIN";
    const isLogin = pathname === "/admin/login";
    if (!isAdmin && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (isAdmin && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  const payload = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (payload?.role !== "CUSTOMER") {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cart/:path*", "/wishlist/:path*", "/checkout/:path*", "/orders/:path*"],
};

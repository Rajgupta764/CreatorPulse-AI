import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookie";

/**
 * Account-only areas. The AI tool pages are intentionally NOT here: guests
 * get 3 free analyses per day per IP (playbook 2.2), so they must be reachable
 * without a session.
 */
const PROTECTED_ROUTES = ["/dashboard", "/history", "/billing", "/admin"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !request.cookies.get(AUTH_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/history",
    "/billing/:path*",
    "/admin/:path*",
  ],
};

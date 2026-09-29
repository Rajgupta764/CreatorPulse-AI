import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookie";

const PROTECTED_ROUTES = [
  "/generate",
  "/battle",
  "/hook",
  "/validate",
  "/readiness",
  "/comments",
  "/content-gap",
  "/repurpose",
  "/dashboard",
  "/history",
  "/billing",
];

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
    "/generate",
    "/battle",
    "/hook",
    "/validate",
    "/readiness",
    "/comments",
    "/content-gap",
    "/repurpose",
    "/dashboard",
    "/history",
    "/billing/:path*",
  ],
};

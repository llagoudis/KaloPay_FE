import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_ROUTES = [
  "/admin/login",
  "/admin/signup",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/verify-email",
  "/admin/2fa",
];

const AUTH_COOKIE = "admin-auth";
const LOGIN_URL = "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (
      token &&
      (pathname === LOGIN_URL || pathname.startsWith(LOGIN_URL + "/"))
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL(LOGIN_URL, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

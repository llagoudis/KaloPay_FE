import { NextRequest, NextResponse } from "next/server";

// Public routes that do NOT require authentication (per role)
const PUBLIC_ROUTES: Record<string, string[]> = {
  admin: [
    "/admin/login",
    "/admin/signup",
    "/admin/forgot-password",
    "/admin/reset-password",
    "/admin/verify-email",
    "/admin/2fa",
  ],
  user: [
    "/user/login",
    "/user/signup",
    "/user/forgot-password",
    "/user/reset-password",
    "/user/verify-email",
    "/user/2fa",
  ],
  employee: [
    "/employee/login",
    "/employee/signup",
    "/employee/forgot-password",
    "/employee/reset-password",
    "/employee/verify-email",
    "/employee/2fa",
  ],
};

const AUTH_COOKIE: Record<string, string> = {
  admin: "admin-auth",
  user: "employer-auth",
  employee: "employee-auth",
};

const LOGIN_URL: Record<string, string> = {
  admin: "/admin/login",
  user: "/user/login",
  employee: "/employee/login",
};

const ROLE_PREFIX: Record<string, string> = {
  admin: "/admin",
  user: "/user",
  employee: "/employee",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const role of ["admin", "user", "employee"]) {
    if (!pathname.startsWith(ROLE_PREFIX[role])) continue;

    const isPublic = PUBLIC_ROUTES[role].some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isPublic) {
      // If already authenticated, redirect away from login pages
      const token = request.cookies.get(AUTH_COOKIE[role])?.value;
      if (
        token &&
        (pathname === LOGIN_URL[role] || pathname.startsWith(LOGIN_URL[role] + "/"))
      ) {
        return NextResponse.redirect(
          new URL(`${ROLE_PREFIX[role]}/dashboard`, request.url)
        );
      }
      return NextResponse.next();
    }

    // Protected route — require auth cookie
    const token = request.cookies.get(AUTH_COOKIE[role])?.value;
    if (!token) {
      const loginUrl = new URL(LOGIN_URL[role], request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    break;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/employee/:path*"],
};

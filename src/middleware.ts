import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "./lib/utils/permission";

export default withAuth(
  function middleware(req) {
    const { pathname, origin } = req.nextUrl;

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/auth/")) {
      if (req.nextauth.token) {
        const redirectUrl = new URL("/", origin);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.next();
    }

    // Protect specific routes
    if (pathname.startsWith("/profile") || pathname.startsWith("/api/user/")) {
      if (!req.nextauth.token) {
        const loginUrl = new URL("/auth", origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Admin route protection
    if (pathname.startsWith("/admin")) {
      if (!req.nextauth.token) {
        const loginUrl = new URL("/auth/login", origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (req.nextauth.token?.user?.role !== UserRole.BROKER) {
        return NextResponse.redirect(new URL("/unauthorized", origin));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages for unauthenticated users
        if (pathname.startsWith("/auth/")) {
          return true;
        }

        if (pathname.startsWith("/admin")) {
          return token?.user?.role === UserRole.BROKER;
        }

        // Protected routes require authentication
        if (
          pathname.startsWith("/profile") ||
          pathname.startsWith("/api/user/")
        ) {
          return !!token;
        }

        // Public routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/auth/:path*", "/profile/:path*", "/api/user/:path*"],
};

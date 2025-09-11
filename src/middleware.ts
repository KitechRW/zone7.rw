import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, origin } = req.nextUrl;

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
        // Preserve intended destination for post-login redirect
        const loginUrl = new URL("/auth/login", origin);
        loginUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/auth/") || pathname === "/") {
          return true;
        }

        if (
          pathname.startsWith("/profile") ||
          pathname.startsWith("/api/user/")
        ) {
          return !!token;
        }

        // Allow access to all other routes by default
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/profile/:path*", "/api/user/:path*", "/auth/:path*"],
};

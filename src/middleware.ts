import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminToken(sessionCookie);

  // 1. Protection for Admin Web Portal (/admin/*)
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    // If accessing /admin/login while already authenticated -> redirect to dashboard
    if (isLoginPage && isAuthenticated) {
      const fromUrl = request.nextUrl.searchParams.get("from");
      const target = fromUrl && fromUrl.startsWith("/admin") ? fromUrl : "/admin";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // If accessing any protected /admin route without valid auth -> redirect to login
    if (!isLoginPage && !isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      const destination = pathname + (search || "");
      loginUrl.searchParams.set("from", destination);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Protection for Sensitive Admin APIs
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Valid admin session required to access admin APIs.",
        },
        { status: 401 }
      );
    }
  }

  // 3. Protection for Sensitive API Mutations
  // Block unauthorized POST/DELETE on /api/puzzles and DELETE on /api/scores
  const method = request.method.toUpperCase();

  const isPuzzlesMutation =
    pathname === "/api/puzzles" && (method === "POST" || method === "PUT" || method === "DELETE");
  const isScoresMutation =
    pathname === "/api/scores" && method === "DELETE";

  if (isPuzzlesMutation || isScoresMutation) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Valid admin session required to perform this action.",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/puzzles",
    "/api/scores",
  ],
};

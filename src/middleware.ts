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

  // 4. Edge Geo-IP Extraction (Vercel & Cloudflare headers - Zero GPS friction)
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const vercelCity = request.headers.get("x-vercel-ip-city");
  const vercelRegion = request.headers.get("x-vercel-ip-country-region");
  const cfCountry = request.headers.get("cf-ipcountry");
  const geoObj = (request as unknown as { geo?: { country?: string; city?: string; region?: string } }).geo;

  const country = (vercelCountry || cfCountry || geoObj?.country || "US").toUpperCase();
  const rawCity = vercelCity || geoObj?.city || "San Jose";
  let city = rawCity;
  try {
    city = decodeURIComponent(rawCity);
  } catch {
    city = rawCity;
  }
  const region = (vercelRegion || geoObj?.region || "CA").toUpperCase();

  // Inject Geo context into Request Headers for Server Components & Route Handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cun-country", country);
  requestHeaders.set("x-cun-city", encodeURIComponent(city));
  requestHeaders.set("x-cun-region", region);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Inject Geo Cookies for client-side instant access without GPS prompts
  const currentCookieCountry = request.cookies.get("cun_country")?.value;
  if (currentCookieCountry !== country) {
    response.cookies.set("cun_country", country, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  const encodedCity = encodeURIComponent(city);
  const currentCookieCity = request.cookies.get("cun_city")?.value;
  if (currentCookieCity !== encodedCity) {
    response.cookies.set("cun_city", encodedCity, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  // 5. Automatic Edge Language Onboarding (Auto-detect & localize for international visitors)
  const currentCookieLang = request.cookies.get("cun_lang")?.value;
  if (!currentCookieLang) {
    let defaultLang = "en";
    if (country === "VN") defaultLang = "vi";
    else if (country === "JP") defaultLang = "ja";
    else if (country === "FR") defaultLang = "fr";
    else if (country === "DE" || country === "AT" || country === "CH") defaultLang = "de";
    else if (["ES", "MX", "AR", "CO", "CL", "PE"].includes(country)) defaultLang = "es";
    else if (["CN", "TW", "HK"].includes(country)) defaultLang = "zh";

    response.cookies.set("cun_lang", defaultLang, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico and standard media/icon files
     * - public sw.js / manifest.json
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|txt)$).*)",
  ],
};

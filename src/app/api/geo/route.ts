import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const country =
    request.headers.get("x-cun-country") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.cookies.get("cun_country")?.value ||
    "US";

  const rawCity =
    request.headers.get("x-cun-city") ||
    request.headers.get("x-vercel-ip-city") ||
    request.cookies.get("cun_city")?.value ||
    "San Jose";

  let city = rawCity;
  try {
    city = decodeURIComponent(rawCity);
  } catch {
    city = rawCity;
  }

  const region =
    request.headers.get("x-cun-region") ||
    request.headers.get("x-vercel-ip-country-region") ||
    "CA";

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  return NextResponse.json({
    success: true,
    data: {
      country: country.toUpperCase(),
      city: city,
      region: region.toUpperCase(),
      clientIp: clientIp,
    },
  });
}

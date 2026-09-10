import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth/admin-session";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({
    success: true,
    message: "Admin session cleared successfully.",
  });

  // Expire the admin session cookie immediately
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

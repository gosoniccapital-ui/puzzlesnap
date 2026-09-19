import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  getAdminMasterPassword
} from "@/lib/auth/admin-session";
import { getAnalyticsSummary } from "@/lib/analytics/click-tracker";

export async function GET(request: NextRequest) {
  try {
    // Check cookie token
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    let isAuthorized = false;

    if (token) {
      isAuthorized = await verifyAdminToken(token);
    }

    // Fallback: Check header passcode or Bearer token
    if (!isAuthorized) {
      const authHeader = request.headers.get("authorization");
      const passcodeHeader = request.headers.get("x-admin-passcode");
      const masterPass = getAdminMasterPassword();

      if (passcodeHeader && passcodeHeader === masterPass) {
        isAuthorized = true;
      } else if (authHeader?.startsWith("Bearer ")) {
        const bearerToken = authHeader.replace("Bearer ", "").trim();
        isAuthorized = await verifyAdminToken(bearerToken);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const summary = getAnalyticsSummary();

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error("Failed to fetch admin analytics:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

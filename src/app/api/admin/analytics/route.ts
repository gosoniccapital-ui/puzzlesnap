import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  getAdminMasterPassword
} from "@/lib/auth/admin-session";
import {
  getAnalyticsSummary,
  getAllClickRecords,
  generateClickCsvString
} from "@/lib/analytics/click-tracker";

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

    const format = request.nextUrl.searchParams.get("format") || request.nextUrl.searchParams.get("export");
    if (format === "csv" || format === "clicks_csv") {
      const records = getAllClickRecords();
      const csv = generateClickCsvString(records);
      const dateStr = new Date().toISOString().slice(0, 10);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cunfashion-affiliate-clicks-${dateStr}.csv"`
        }
      });
    }

    if (format === "conversions_csv" || format === "orders_csv") {
      const { getAllConversionRecords, generateConversionCsvString } = await import("@/lib/analytics/click-tracker");
      const records = getAllConversionRecords();
      const csv = generateConversionCsvString(records);
      const dateStr = new Date().toISOString().slice(0, 10);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cunfashion-affiliate-conversions-${dateStr}.csv"`
        }
      });
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

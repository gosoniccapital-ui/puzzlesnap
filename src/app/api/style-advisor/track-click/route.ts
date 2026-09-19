import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { recordClick } from "@/lib/analytics/click-tracker";

// In-memory sliding window rate limiter: max 60 click logs / min per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
}

function sanitizeString(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>?/gm, "").trim().slice(0, 500);
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const productId = sanitizeString(body.productId);
    const productName = sanitizeString(body.productName);
    const platform = sanitizeString(body.platform || "Amazon");
    const affiliateUrl = sanitizeString(body.affiliateUrl);
    const keyword = sanitizeString(body.keyword || "");
    const deviceType = sanitizeString(body.deviceType || "Desktop");

    if (!productId && !affiliateUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required click metadata" },
        { status: 400 }
      );
    }

    const clickPayload = {
      product_id: productId,
      product_name: productName,
      platform,
      affiliate_url: affiliateUrl,
      keyword: keyword || undefined,
      device_type: deviceType || undefined,
      created_at: new Date().toISOString()
    };

    // Store in memory ring buffer for instant analytics
    recordClick(clickPayload);

    // If Supabase table exists, try persisting
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("affiliate_clicks").insert([clickPayload]);
      } catch (err) {
        // Table might not exist yet, log silently without failing user request
        console.warn("Supabase click logging skipped:", err);
      }
    }

    return NextResponse.json({
      success: true,
      logged: true,
      data: {
        productId,
        platform,
        timestamp: clickPayload.created_at
      }
    });
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log affiliate click" },
      { status: 500 }
    );
  }
}

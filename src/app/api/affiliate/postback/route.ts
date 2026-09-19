import { NextRequest, NextResponse } from "next/server";
import { recordConversion } from "@/lib/analytics/click-tracker";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// In-memory sliding-window rate limiter for postback webhook (max 120 calls / min per IP)
const postbackRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 120, windowMs = 60_000): boolean {
  const now = Date.now();
  if (postbackRateLimitMap.size > 500) {
    for (const [key, val] of postbackRateLimitMap.entries()) {
      if (now > val.resetTime) {
        postbackRateLimitMap.delete(key);
      }
    }
  }

  const entry = postbackRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    postbackRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
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
  return val.replace(/<[^>]*>?/gm, "").trim().slice(0, 300);
}

function sanitizeNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
}

function verifyPostbackSecret(request: NextRequest): boolean {
  const secretEnv = process.env.AFFILIATE_POSTBACK_SECRET;
  if (!secretEnv) {
    // If no secret configured in environment, allow open postbacks with rate-limiting
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("secret");

  if (querySecret && querySecret === secretEnv) return true;
  if (authHeader && authHeader === `Bearer ${secretEnv}`) return true;

  return false;
}

/**
 * Handle Affiliate Postback (GET / POST)
 * Works with networks that fire HTTP GET query params (HasOffers, Involve Asia, Ecomobi)
 * and webhook JSON payloads (Rakuten, TikTok Shop, Shopee Open API).
 */
export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded for postback" },
        { status: 429 }
      );
    }

    if (!verifyPostbackSecret(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized postback token" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const clickId = sanitizeString(
      searchParams.get("click_id") ||
      searchParams.get("sub_id") ||
      searchParams.get("sub1") ||
      searchParams.get("aff_sub")
    );
    const orderId = sanitizeString(
      searchParams.get("order_id") ||
      searchParams.get("transaction_id") ||
      searchParams.get("ord") ||
      `ORD-${Date.now()}`
    );
    const platform = sanitizeString(
      searchParams.get("platform") ||
      searchParams.get("network") ||
      "Affiliate Network"
    );
    const productId = sanitizeString(searchParams.get("product_id"));
    const productName = sanitizeString(searchParams.get("product_name"));
    const amount = sanitizeNumber(searchParams.get("amount") || searchParams.get("sale_amount"), 0);
    const commission = sanitizeNumber(
      searchParams.get("commission") || searchParams.get("payout"),
      amount * 0.05
    );
    const currency = sanitizeString(searchParams.get("currency") || "USD").toUpperCase();
    const rawStatus = sanitizeString(searchParams.get("status") || "approved").toLowerCase();

    const status: "pending" | "approved" | "rejected" =
      rawStatus.includes("reject") || rawStatus.includes("cancel")
        ? "rejected"
        : rawStatus.includes("pend")
        ? "pending"
        : "approved";

    const conversion = recordConversion({
      click_id: clickId || undefined,
      order_id: orderId,
      platform,
      product_id: productId || undefined,
      product_name: productName || undefined,
      amount: Number(amount.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      currency,
      status
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("affiliate_conversions").insert([conversion]);
      } catch (err) {
        console.warn("Supabase conversion sync skipped:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Postback conversion recorded successfully",
      data: conversion
    });
  } catch (error) {
    console.error("Postback GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal postback handler error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded for postback" },
        { status: 429 }
      );
    }

    if (!verifyPostbackSecret(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized postback token" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const clickId = sanitizeString(
      body.clickId || body.click_id || body.sub_id || body.aff_sub
    );
    const orderId = sanitizeString(
      body.orderId || body.order_id || body.transactionId || body.transaction_id || `ORD-${Date.now()}`
    );
    const platform = sanitizeString(
      body.platform || body.network || "Affiliate Network"
    );
    const productId = sanitizeString(body.productId || body.product_id);
    const productName = sanitizeString(body.productName || body.product_name);
    const amount = sanitizeNumber(body.amount || body.sale_amount || body.revenue, 0);
    const commission = sanitizeNumber(
      body.commission || body.payout,
      amount * 0.05
    );
    const currency = sanitizeString(body.currency || "USD").toUpperCase();
    const rawStatus = sanitizeString(body.status || "approved").toLowerCase();

    const status: "pending" | "approved" | "rejected" =
      rawStatus.includes("reject") || rawStatus.includes("cancel")
        ? "rejected"
        : rawStatus.includes("pend")
        ? "pending"
        : "approved";

    const conversion = recordConversion({
      click_id: clickId || undefined,
      order_id: orderId,
      platform,
      product_id: productId || undefined,
      product_name: productName || undefined,
      amount: Number(amount.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      currency,
      status
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("affiliate_conversions").insert([conversion]);
      } catch (err) {
        console.warn("Supabase conversion sync skipped:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Postback conversion recorded successfully",
      data: conversion
    });
  } catch (error) {
    console.error("Postback POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal postback handler error" },
      { status: 500 }
    );
  }
}

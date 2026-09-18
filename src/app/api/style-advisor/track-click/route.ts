import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

function sanitizeString(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>?/gm, "").trim().slice(0, 500);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = sanitizeString(body.productId);
    const productName = sanitizeString(body.productName);
    const platform = sanitizeString(body.platform || "Amazon");
    const affiliateUrl = sanitizeString(body.affiliateUrl);

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
      created_at: new Date().toISOString()
    };

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

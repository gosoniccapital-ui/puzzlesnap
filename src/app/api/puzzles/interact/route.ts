import { NextRequest, NextResponse } from "next/server";
import { incrementLikes, incrementPlays, getPuzzleBySlug } from "@/lib/data/puzzles-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// Rate limiting map for interactions (max 60 interactions per minute per IP)
const interactionRateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = interactionRateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    interactionRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
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
    const { slug, action } = body;

    if (!slug || typeof slug !== "string" || !["like", "play"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. 'slug' and action ('like' | 'play') required." },
        { status: 400 }
      );
    }

    let updatedValue: number | null = null;
    if (action === "like") {
      updatedValue = incrementLikes(slug);
    } else {
      updatedValue = incrementPlays(slug);
    }

    // If Supabase is configured, sync to puzzles table
    if (isSupabaseConfigured && supabase) {
      try {
        const column = action === "like" ? "likes_count" : "plays_count";
        // Fetch current count or increment
        const { data: currentPuzzle } = await supabase
          .from("puzzles")
          .select("id, likes_count, plays_count")
          .eq("slug", slug)
          .maybeSingle();

        if (currentPuzzle) {
          const currentCount = (currentPuzzle as any)[column] || 0;
          await supabase
            .from("puzzles")
            .update({ [column]: currentCount + 1 })
            .eq("slug", slug);
        }
      } catch (dbErr) {
        console.warn("[puzzles/interact] Supabase sync warning:", dbErr);
      }
    }

    const puzzle = getPuzzleBySlug(slug);

    return NextResponse.json({
      success: true,
      action,
      slug,
      currentCount: updatedValue ?? 0,
      totalLikes: puzzle?.likes ?? 0,
      totalPlays: puzzle?.plays ?? 0,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

// In-memory fallback cache for user wardrobes
interface StoredWardrobe {
  items: any[];
  updatedAt: string;
}

const memoryWardrobes = new Map<string, StoredWardrobe>();

// Rate limiter: Max 30 sync requests per minute per IP
const syncRateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();

  if (syncRateLimit.size > 500) {
    for (const [key, val] of syncRateLimit.entries()) {
      if (now > val.resetTime) {
        syncRateLimit.delete(key);
      }
    }
  }

  const entry = syncRateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    syncRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
}

function isValidPlayerId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  // Alphanumeric with hyphens/underscores/dots, length 2 to 64
  return /^[a-zA-Z0-9_.-]{2,64}$/.test(trimmed);
}

/**
 * POST /api/wardrobe/sync
 * Syncs player wardrobe items to Cloud (Supabase) and local memory cache.
 */
export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many sync requests. Please slow down." },
        { status: 429 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 512 * 1024) {
      return NextResponse.json(
        { success: false, error: "Payload too large. Max 512KB allowed." },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { playerId, items } = body;

    if (!isValidPlayerId(playerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid playerId. Must be 2-64 alphanumeric characters." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items. Must be an array." },
        { status: 400 }
      );
    }

    if (items.length > 200) {
      return NextResponse.json(
        { success: false, error: "Too many wardrobe items. Max 200 items allowed." },
        { status: 400 }
      );
    }

    // Sanitize item objects
    const sanitizedItems = items.map((item) => ({
      id: String(item?.id || "").slice(0, 100),
      name: String(item?.name || "Fashion Piece").slice(0, 200),
      price: String(item?.price || "").slice(0, 50),
      originalPrice: item?.originalPrice ? String(item.originalPrice).slice(0, 50) : undefined,
      discount: item?.discount ? String(item.discount).slice(0, 50) : undefined,
      img: String(item?.img || "").slice(0, 500),
      link: String(item?.link || "").slice(0, 1000),
      platform: String(item?.platform || "cunfashion").slice(0, 50),
      category: item?.category ? String(item.category).slice(0, 100) : undefined,
      closetCategory: item?.closetCategory ? String(item.closetCategory).slice(0, 50) : undefined,
      savedAt: item?.savedAt ? String(item.savedAt).slice(0, 50) : new Date().toISOString(),
    }));

    const nowIso = new Date().toISOString();

    // 1. Update in-memory cache
    memoryWardrobes.set(playerId, {
      items: sanitizedItems,
      updatedAt: nowIso,
    });

    // 2. Persist to Supabase if configured
    let cloudSynced = false;
    const dbClient = supabaseAdmin || supabase;
    if (isSupabaseConfigured && dbClient) {
      try {
        const { error } = await dbClient.from("user_wardrobes").upsert(
          {
            player_id: playerId,
            items: sanitizedItems,
            updated_at: nowIso,
          },
          { onConflict: "player_id" }
        );

        if (!error) {
          cloudSynced = true;
        } else {
          console.warn("[Wardrobe Sync] Supabase upsert error:", error.message);
        }
      } catch (dbErr) {
        console.warn("[Wardrobe Sync] Cloud persistence error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      playerId,
      count: sanitizedItems.length,
      cloudSynced,
      syncedAt: nowIso,
    });
  } catch (err: any) {
    console.error("[Wardrobe Sync Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wardrobe/sync?playerId=...
 * Retrieves cloud synced wardrobe items for a given playerId.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    if (!isValidPlayerId(playerId)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid playerId parameter." },
        { status: 400 }
      );
    }

    // 1. Try Supabase first if configured
    const dbClient = supabaseAdmin || supabase;
    if (isSupabaseConfigured && dbClient) {
      try {
        const { data, error } = await dbClient
          .from("user_wardrobes")
          .select("items, updated_at")
          .eq("player_id", playerId)
          .maybeSingle();

        if (!error && data && Array.isArray(data.items)) {
          // Update memory cache
          memoryWardrobes.set(playerId, {
            items: data.items,
            updatedAt: data.updated_at || new Date().toISOString(),
          });

          return NextResponse.json({
            success: true,
            playerId,
            items: data.items,
            count: data.items.length,
            updatedAt: data.updated_at,
            source: "supabase",
          });
        }
      } catch (dbErr) {
        console.warn("[Wardrobe Sync] Supabase fetch fallback to memory:", dbErr);
      }
    }

    // 2. Fallback to in-memory cache
    const cached = memoryWardrobes.get(playerId);
    if (cached) {
      return NextResponse.json({
        success: true,
        playerId,
        items: cached.items,
        count: cached.items.length,
        updatedAt: cached.updatedAt,
        source: "memory",
      });
    }

    return NextResponse.json({
      success: true,
      playerId,
      items: [],
      count: 0,
      updatedAt: null,
      source: "empty",
    });
  } catch (err: any) {
    console.error("[Wardrobe Sync GET Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

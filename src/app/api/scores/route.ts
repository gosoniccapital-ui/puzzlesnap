import { NextRequest, NextResponse } from "next/server";
import {
  getScoresForPuzzle,
  getAllScores,
  addScoreRecord,
  deleteScoreRecord,
} from "@/lib/data/scores-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/admin-session";

// Simple in-memory rate limiter for score submissions (sliding 1-minute window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
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

/**
 * Strips HTML tags, script entities, control characters, and clamps length to 25 chars.
 */
function sanitizePlayerName(raw: string): string {
  if (!raw || typeof raw !== "string") return "Anonymous";
  return raw
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[&<>"'/`]/g, "") // Strip characters frequently leveraged in XSS vectors
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip control characters
    .trim()
    .substring(0, 25) || "Anonymous";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const pieceCount = searchParams.get("pieceCount");
  const all = searchParams.get("all");

  if (all === "true") {
    const scores = getAllScores();
    return NextResponse.json({ success: true, count: scores.length, data: scores });
  }

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "Missing 'slug' query parameter" },
      { status: 400 }
    );
  }

  // If Supabase is active, optionally fetch from puzzle_scores table
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("puzzle_scores")
        .select("*")
        .eq("puzzle_slug", slug)
        .order("elapsed_seconds", { ascending: true })
        .limit(10);

      if (pieceCount) {
        query = query.eq("piece_count", parseInt(pieceCount, 10));
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const normalizedData = data.map((s: any) => ({
          id: s.id,
          puzzleSlug: s.puzzle_slug || s.puzzleSlug,
          playerName: s.player_name || s.playerName || "Anonymous",
          pieceCount: s.piece_count || s.pieceCount,
          elapsedSeconds: s.elapsed_seconds || s.elapsedSeconds,
          moves: s.moves || 0,
          createdAt: s.created_at || s.createdAt || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, source: "supabase", data: normalizedData });
      }
    } catch {
      // Fallback
    }
  }

  const scores = getScoresForPuzzle(
    slug,
    pieceCount ? parseInt(pieceCount, 10) : undefined
  ).slice(0, 10);

  return NextResponse.json({
    success: true,
    count: scores.length,
    data: scores,
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. In-Memory Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    if (isRateLimited(clientIp, 20, 60_000)) {
      return NextResponse.json(
        { success: false, error: "Too many score submissions. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { puzzleSlug, playerName, pieceCount, elapsedSeconds, moves } = body;

    // 2. Strict Input Validation
    if (!puzzleSlug || typeof puzzleSlug !== "string" || !playerName || typeof elapsedSeconds !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid required score fields" },
        { status: 400 }
      );
    }

    const parsedPieces = Number(pieceCount) || 16;
    const validPieceCounts = [9, 16, 30, 40, 50];
    if (!validPieceCounts.includes(parsedPieces)) {
      return NextResponse.json(
        { success: false, error: `Invalid pieceCount. Must be one of: ${validPieceCounts.join(", ")}` },
        { status: 400 }
      );
    }

    const parsedElapsed = Math.round(elapsedSeconds);
    if (parsedElapsed < 1 || parsedElapsed > 86400) {
      return NextResponse.json(
        { success: false, error: "elapsedSeconds must be between 1 and 86400" },
        { status: 400 }
      );
    }

    const parsedMoves = Math.max(0, Math.min(10000, Number(moves) || 0));

    // 3. XSS Sanitization
    const safePlayerName = sanitizePlayerName(playerName);

    const newRecord = addScoreRecord({
      puzzleSlug,
      playerName: safePlayerName,
      pieceCount: parsedPieces,
      elapsedSeconds: parsedElapsed,
      moves: parsedMoves,
    });

    // If Supabase is active, also persist
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("puzzle_scores").insert({
          puzzle_slug: puzzleSlug,
          player_name: safePlayerName,
          piece_count: parsedPieces,
          elapsed_seconds: parsedElapsed,
          moves: parsedMoves,
        });
      } catch {
        // Local already recorded
      }
    }

    return NextResponse.json({
      success: true,
      message: "Score submitted successfully",
      data: newRecord,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminToken(sessionCookie);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin session required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing score id" }, { status: 400 });
  }

  const deleted = deleteScoreRecord(id);
  if (deleted) {
    return NextResponse.json({ success: true, message: "Score deleted successfully" });
  }

  return NextResponse.json({ success: false, error: "Score record not found" }, { status: 404 });
}

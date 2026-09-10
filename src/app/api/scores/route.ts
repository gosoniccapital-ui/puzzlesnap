import { NextRequest, NextResponse } from "next/server";
import {
  getScoresForPuzzle,
  getAllScores,
  addScoreRecord,
  deleteScoreRecord,
} from "@/lib/data/scores-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
        return NextResponse.json({ success: true, source: "supabase", data });
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
    const body = await request.json();
    const { puzzleSlug, playerName, pieceCount, elapsedSeconds, moves } = body;

    if (!puzzleSlug || !playerName || typeof elapsedSeconds !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required score fields" },
        { status: 400 }
      );
    }

    // Sanitize playerName
    const safePlayerName = (playerName || "Anonymous").trim().substring(0, 30);

    const newRecord = addScoreRecord({
      puzzleSlug,
      playerName: safePlayerName,
      pieceCount: Number(pieceCount) || 16,
      elapsedSeconds: Math.max(1, Math.round(elapsedSeconds)),
      moves: Number(moves) || 0,
    });

    // If Supabase is active, also persist
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("puzzle_scores").insert({
          puzzle_slug: puzzleSlug,
          player_name: safePlayerName,
          piece_count: Number(pieceCount) || 16,
          elapsed_seconds: Math.max(1, Math.round(elapsedSeconds)),
          moves: Number(moves) || 0,
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

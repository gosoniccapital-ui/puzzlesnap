import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface CustomPuzzleRecord {
  id: string;
  title: string;
  image: string;
  difficulty: string;
  createdAt: number;
}

const customPuzzlesStore = new Map<string, CustomPuzzleRecord>();

function sanitizeText(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>?/gm, "").trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing puzzle id" }, { status: 400 });
  }

  const memoryRecord = customPuzzlesStore.get(id);
  if (memoryRecord) {
    return NextResponse.json({
      success: true,
      data: memoryRecord,
    });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("puzzles")
        .select("*")
        .eq("slug", id)
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            id: data.slug,
            title: data.title,
            image: data.image_url,
            difficulty: data.difficulty || "medium",
            createdAt: new Date(data.created_at).getTime(),
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({ success: false, error: "Puzzle not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image, difficulty } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
    }

    const cleanTitle = sanitizeText(title) || "Shared Custom Puzzle";
    const cleanDifficulty = ["easy", "medium", "hard", "very-hard", "supreme"].includes(difficulty)
      ? difficulty
      : "medium";

    const id = "pz-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);

    const record: CustomPuzzleRecord = {
      id,
      title: cleanTitle,
      image,
      difficulty: cleanDifficulty,
      createdAt: Date.now(),
    };

    customPuzzlesStore.set(id, record);

    if (isSupabaseConfigured && supabase && !image.startsWith("data:")) {
      try {
        await supabase.from("puzzles").insert({
          slug: id,
          title: cleanTitle,
          image_url: image,
          difficulty: cleanDifficulty,
          is_custom: true,
        });
      } catch (err) {
        console.warn("Could not sync custom puzzle to Supabase DB:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 500 });
  }
}

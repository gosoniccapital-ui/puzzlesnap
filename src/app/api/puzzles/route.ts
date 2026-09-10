import { NextRequest, NextResponse } from "next/server";
import {
  PUZZLES_DATA,
  getPuzzlesByCategory,
  searchPuzzles,
  addPuzzleItem,
  deletePuzzleItem,
  updatePuzzleItem,
} from "@/lib/data/puzzles-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const limit = searchParams.get("limit");

  // If Supabase is connected, we can query live DB, else use in-memory store
  if (isSupabaseConfigured && supabase) {
    try {
      let dbQuery = supabase.from("puzzles").select("*");
      if (category) {
        dbQuery = dbQuery.eq("category_slug", category);
      }
      if (limit) {
        dbQuery = dbQuery.limit(parseInt(limit, 10));
      }
      const { data, error } = await dbQuery;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, source: "supabase", data });
      }
    } catch {
      // Fallback to local data
    }
  }

  let result = PUZZLES_DATA;
  if (query) {
    result = searchPuzzles(query);
  } else if (category) {
    result = getPuzzlesByCategory(category);
  }

  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }

  return NextResponse.json({
    success: true,
    total: result.length,
    data: result,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, categorySlug, image, difficulty, description } = body;

    if (!title || !category || !image) {
      return NextResponse.json(
        { success: false, error: "Title, category, and image URL are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newPuzzle = addPuzzleItem({
      title,
      slug,
      category,
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, "-"),
      image,
      difficulty: difficulty || "medium",
      description: description || `A lovely jigsaw puzzle: ${title}`,
    });

    return NextResponse.json({
      success: true,
      message: "Puzzle created successfully",
      data: newPuzzle,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing puzzle id" }, { status: 400 });
  }

  const deleted = deletePuzzleItem(id);
  if (deleted) {
    return NextResponse.json({ success: true, message: "Puzzle removed successfully" });
  }

  return NextResponse.json({ success: false, error: "Puzzle not found" }, { status: 404 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, category, categorySlug, image, difficulty, description } = body;

    if (!id || !title || !category || !image) {
      return NextResponse.json(
        { success: false, error: "ID, Title, Category, and Image URL are required" },
        { status: 400 }
      );
    }

    const updated = updatePuzzleItem(id, {
      title,
      category,
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, "-"),
      image,
      difficulty: difficulty || "medium",
      description: description || `A lovely jigsaw puzzle: ${title}`,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Puzzle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Puzzle updated successfully",
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 500 }
    );
  }
}


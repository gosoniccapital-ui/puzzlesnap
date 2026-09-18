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
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth/admin-session";

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
      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (limit) {
        dbQuery = dbQuery.limit(parseInt(limit, 10));
      }
      const { data, error } = await dbQuery;
      if (!error && data && data.length > 0) {
        const normalizedData = data.map((p: any) => ({
          ...p,
          slug: p.slug || (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : p.id),
          categorySlug: p.category_slug || p.categorySlug || "general",
          imageSrc: p.image_url || p.imageSrc,
        }));
        return NextResponse.json({ success: true, source: "supabase", data: normalizedData });
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

function sanitizeText(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>?/gm, "").trim();
}

function sanitizeUrl(val: unknown): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  // Block javascript:, vbscript:, data: protocols
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return "";
  }
  return trimmed;
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminToken(sessionCookie);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin session required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      category,
      categorySlug,
      image,
      difficulty,
      description,
      voucherCode,
      discountPercent,
      productUrl,
      productPriceOriginal,
      productPriceSale,
    } = body;

    if (!title || !category || !image) {
      return NextResponse.json(
        { success: false, error: "Title, category, and image URL are required" },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeText(title);
    const slug = cleanTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const cleanVoucher = sanitizeText(voucherCode);
    const cleanProductUrl = sanitizeUrl(productUrl);
    const parsedDiscount = typeof discountPercent === "number" && discountPercent >= 0 && discountPercent <= 100
      ? discountPercent
      : undefined;

    const newPuzzle = addPuzzleItem({
      title: cleanTitle,
      slug,
      category: sanitizeText(category),
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, "-"),
      image: sanitizeUrl(image),
      difficulty: difficulty || "medium",
      description: sanitizeText(description) || `A lovely jigsaw puzzle: ${cleanTitle}`,
      ...(cleanVoucher && { voucherCode: cleanVoucher }),
      ...(parsedDiscount !== undefined && { discountPercent: parsedDiscount }),
      ...(cleanProductUrl && { productUrl: cleanProductUrl }),
      ...(productPriceOriginal && { productPriceOriginal: sanitizeText(productPriceOriginal) }),
      ...(productPriceSale && { productPriceSale: sanitizeText(productPriceSale) }),
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
    return NextResponse.json({ success: false, error: "Missing puzzle id" }, { status: 400 });
  }

  const deleted = deletePuzzleItem(id);
  if (deleted) {
    return NextResponse.json({ success: true, message: "Puzzle removed successfully" });
  }

  return NextResponse.json({ success: false, error: "Puzzle not found" }, { status: 404 });
}

export async function PUT(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminToken(sessionCookie);
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin session required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      category,
      categorySlug,
      image,
      difficulty,
      description,
      voucherCode,
      discountPercent,
      productUrl,
      productPriceOriginal,
      productPriceSale,
    } = body;

    if (!id || !title || !category || !image) {
      return NextResponse.json(
        { success: false, error: "ID, Title, Category, and Image URL are required" },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeText(title);
    const cleanVoucher = sanitizeText(voucherCode);
    const cleanProductUrl = sanitizeUrl(productUrl);
    const parsedDiscount = typeof discountPercent === "number" && discountPercent >= 0 && discountPercent <= 100
      ? discountPercent
      : undefined;

    const updated = updatePuzzleItem(id, {
      title: cleanTitle,
      category: sanitizeText(category),
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, "-"),
      image: sanitizeUrl(image),
      difficulty: difficulty || "medium",
      description: sanitizeText(description) || `A lovely jigsaw puzzle: ${cleanTitle}`,
      voucherCode: cleanVoucher || undefined,
      discountPercent: parsedDiscount,
      productUrl: cleanProductUrl || undefined,
      productPriceOriginal: productPriceOriginal ? sanitizeText(productPriceOriginal) : undefined,
      productPriceSale: productPriceSale ? sanitizeText(productPriceSale) : undefined,
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


import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface CustomPuzzleRecord {
  id: string;
  title: string;
  image: string;
  difficulty: string;
  createdAt: number;
}

// In-memory sliding window rate limiter for custom puzzle submissions
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_CUSTOM_PUZZLES_IN_MEMORY = 200;
const MAX_IMAGE_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB

function isRateLimited(identifier: string, limit = 15, windowMs = 60_000): boolean {
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
    // 1. IP-based Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    if (isRateLimited(clientIp, 15, 60_000)) {
      return NextResponse.json(
        { success: false, error: "Too many custom puzzle creations. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, image, difficulty } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ success: false, error: "Valid image is required" }, { status: 400 });
    }

    // 2. Payload size protection (max 5MB)
    if (image.length > MAX_IMAGE_PAYLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image payload exceeds maximum allowed size (5MB)" },
        { status: 413 }
      );
    }

    // 3. Image URL / URI scheme validation & SSRF/Private IP host guard
    const isValidScheme =
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:image/");
    if (!isValidScheme) {
      return NextResponse.json(
        { success: false, error: "Image must be a valid HTTP(S) URL or image data URI" },
        { status: 400 }
      );
    }

    const isForbiddenHost =
      image.includes("localhost") ||
      image.includes("127.0.0.1") ||
      image.includes("169.254.") ||
      image.includes("0.0.0.0") ||
      image.includes("::1");
    if (isForbiddenHost) {
      return NextResponse.json(
        { success: false, error: "Private or loopback IP addresses are not permitted" },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeText(title).substring(0, 80) || "Shared Custom Puzzle";
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

    // 4. Memory Cap (FIFO Eviction if > MAX_CUSTOM_PUZZLES_IN_MEMORY)
    if (customPuzzlesStore.size >= MAX_CUSTOM_PUZZLES_IN_MEMORY) {
      const oldestKey = customPuzzlesStore.keys().next().value;
      if (oldestKey) customPuzzlesStore.delete(oldestKey);
    }

    customPuzzlesStore.set(id, record);

    let finalImageUrl = image;

    if (isSupabaseConfigured && supabase) {
      try {
        if (image.startsWith("data:")) {
          const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            const ext = contentType.split("/")[1] || "jpg";
            const filePath = `custom-puzzles/${id}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("puzzle-images")
              .upload(filePath, buffer, { contentType, upsert: true });

            if (!uploadError) {
              const { data: publicData } = supabase.storage
                .from("puzzle-images")
                .getPublicUrl(filePath);
              if (publicData?.publicUrl) {
                finalImageUrl = publicData.publicUrl;
              }
            }
          }
        }

        await supabase.from("puzzles").insert({
          slug: id,
          title: cleanTitle,
          image_url: finalImageUrl,
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

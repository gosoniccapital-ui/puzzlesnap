import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

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

  // Auto-prune stale entries if map gets large to prevent memory leak
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

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

export const maxDuration = 60;

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

  const client = supabaseAdmin || supabase;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from("puzzles")
        .select("*")
        .eq("description", id)
        .maybeSingle();

      if (!error && data) {
        const diffMap: Record<number, string> = { 9: "easy", 16: "medium", 25: "hard", 30: "hard", 36: "very-hard", 40: "very-hard", 50: "supreme" };
        const diff = typeof data.difficulty === "number" ? (diffMap[data.difficulty] || "medium") : (data.difficulty || "medium");
        const record: CustomPuzzleRecord = {
          id: data.description || id,
          title: data.title,
          image: data.image_url,
          difficulty: diff,
          createdAt: new Date(data.created_at).getTime(),
        };
        customPuzzlesStore.set(id, record);
        return NextResponse.json({
          success: true,
          data: record,
        });
      }

      // Storage Fallback: If not found in DB table, inspect Supabase Storage bucket puzzle-images
      const { data: listFiles } = await client.storage
        .from("puzzle-images")
        .list("custom-puzzles", { search: id, limit: 5 });

      const matchedFile = listFiles?.find((f) => f.name.startsWith(id));
      if (matchedFile) {
        const { data: publicData } = client.storage
          .from("puzzle-images")
          .getPublicUrl(`custom-puzzles/${matchedFile.name}`);

        if (publicData?.publicUrl) {
          const fallbackUrl = publicData.publicUrl;
          // Auto-heal by inserting into DB table
          await client.from("puzzles").insert({
            title: "Custom Puzzle",
            description: id,
            image_url: fallbackUrl,
            source: "user",
            width: 800,
            height: 600,
            difficulty: 16,
            is_public: true,
          });

          const restoredRecord: CustomPuzzleRecord = {
            id,
            title: "Custom Puzzle",
            image: fallbackUrl,
            difficulty: "medium",
            createdAt: matchedFile.created_at ? new Date(matchedFile.created_at).getTime() : Date.now(),
          };
          customPuzzlesStore.set(id, restoredRecord);
          return NextResponse.json({
            success: true,
            data: restoredRecord,
          });
        }
      }
    } catch (err) {
      console.warn("Storage fallback check failed:", err);
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

    if (image.startsWith("http://") || image.startsWith("https://")) {
      try {
        const parsed = new URL(image);
        const hostname = parsed.hostname.toLowerCase();
        const isForbiddenHost =
          ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname) ||
          hostname.endsWith(".local") ||
          hostname.endsWith(".internal") ||
          hostname.endsWith(".lan") ||
          /^(?:10|127|169\.254|192\.168)\./.test(hostname) ||
          /^172\.(?:1[6-9]|2\d|3[0-1])\./.test(hostname);

        if (isForbiddenHost) {
          return NextResponse.json(
            { success: false, error: "Private or loopback IP addresses are not permitted" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid image URL format" },
          { status: 400 }
        );
      }
    }

    const cleanTitle = sanitizeText(title).substring(0, 80) || "Shared Custom Puzzle";
    const cleanDifficulty = ["easy", "medium", "hard", "very-hard", "supreme"].includes(difficulty)
      ? difficulty
      : "medium";

    const id = "pz-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);

    let finalImageUrl = image;

    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      try {
        if (image.startsWith("data:")) {
          const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            const ext = contentType.split("/")[1] || "jpg";
            const filePath = `custom-puzzles/${id}.${ext}`;
            const { error: uploadError } = await client.storage
              .from("puzzle-images")
              .upload(filePath, buffer, { contentType, upsert: true });

            if (!uploadError) {
              const { data: publicData } = client.storage
                .from("puzzle-images")
                .getPublicUrl(filePath);
              if (publicData?.publicUrl) {
                finalImageUrl = publicData.publicUrl;
              }
            }
          }
        }

        const diffNumMap: Record<string, number> = {
          easy: 9,
          medium: 16,
          hard: 25,
          "very-hard": 36,
          supreme: 50,
        };

        const targetDiff = diffNumMap[cleanDifficulty] || 16;
        const { error: insertErr } = await client.from("puzzles").insert({
          title: cleanTitle,
          description: id,
          image_url: finalImageUrl,
          source: "user",
          width: 800,
          height: 600,
          difficulty: targetDiff,
          is_public: true,
        });

        if (insertErr) {
          console.warn("Primary insert failed with diff", targetDiff, insertErr.message);
          // Fallback with safe baseline difficulty 16
          await client.from("puzzles").insert({
            title: cleanTitle,
            description: id,
            image_url: finalImageUrl,
            source: "user",
            width: 800,
            height: 600,
            difficulty: 16,
            is_public: true,
          });
        }
      } catch (err) {
        console.warn("Could not sync custom puzzle to Supabase DB:", err);
      }
    }

    const record: CustomPuzzleRecord = {
      id,
      title: cleanTitle,
      image: finalImageUrl,
      difficulty: cleanDifficulty,
      createdAt: Date.now(),
    };

    // 4. Memory Cap (FIFO Eviction if > MAX_CUSTOM_PUZZLES_IN_MEMORY)
    if (customPuzzlesStore.size >= MAX_CUSTOM_PUZZLES_IN_MEMORY) {
      const oldestKey = customPuzzlesStore.keys().next().value;
      if (oldestKey) customPuzzlesStore.delete(oldestKey);
    }

    customPuzzlesStore.set(id, record);

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 500 });
  }
}

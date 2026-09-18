import { NextRequest, NextResponse } from "next/server";
import {
  AMAZON_STYLE_CATALOG,
  VN_STYLE_CATALOG,
  buildAmazonSearchUrl,
  generateStylistAdvice,
  AdviceResult,
  DetectedOutfitItem,
  StyleProduct
} from "@/lib/data/style-advisor-data";

// In-memory sliding window rate limiter: max 20 requests / min per IP with auto-pruning
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit = 20, windowMs = 60_000): boolean {
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

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Please wait a moment before analyzing again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      image,
      occasion = "casual",
      style = "minimal",
      budget = "low",
      color = "",
      market = "US"
    } = body;

    // Security guard: protect against giant base64 payloads (> 4MB)
    if (typeof image === "string" && image.length > 5_500_000) {
      return NextResponse.json(
        { success: false, error: "Image payload exceeds max allowed size (4MB)." },
        { status: 413 }
      );
    }

    const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, "").trim() : "";

    // Check if Gemini Vision can be invoked
    if (apiKey && typeof image === "string") {
      try {
        let mimeType = "image/jpeg";
        let base64Data = "";

        if (image.startsWith("data:image/")) {
          const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            base64Data = matches[2];
          }
        } else if (image.startsWith("http://") || image.startsWith("https://")) {
          try {
            const imgRes = await fetch(image, { signal: AbortSignal.timeout(6000) });
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              base64Data = Buffer.from(arrayBuffer).toString("base64");
              mimeType = imgRes.headers.get("content-type") || "image/jpeg";
            }
          } catch (fetchErr) {
            console.warn("Could not fetch remote image for vision analysis:", fetchErr);
          }
        }

        if (base64Data) {
          const isVN = market === "VN";
          const prompt = isVN
            ? `Bạn là chuyên gia tư vấn thời trang cao cấp của CunFashion, am hiểu phong cách giới trẻ & công sở Việt Nam.
Hãy phân tích bức ảnh trang phục này cùng tiêu chí của người dùng:
- Dịp sử dụng: ${occasion}
- Phong cách: ${style}
- Gam màu ưa thích: ${color || "phối màu tự nhiên"}

Trả về DUY NHẤT một JSON object hợp lệ (không markdown, không backticks) theo cấu trúc chính xác:
{
  "headline": "Tiêu đề set đồ ngắn gọn, cuốn hút",
  "overallStyle": "Tên phong cách, ví dụ: Công sở thanh lịch / Streetwear cá tính",
  "adviceText": "2-3 câu tư vấn chuyên môn về phom dáng, tỷ lệ phối đồ và cách kết hợp",
  "palette": [
    {"name": "Tên màu 1", "hex": "#HEX"},
    {"name": "Tên màu 2", "hex": "#HEX"},
    {"name": "Tên màu 3", "hex": "#HEX"},
    {"name": "Tên màu 4", "hex": "#HEX"}
  ],
  "detectedItems": [
    {
      "name": "Tên món đồ (ví dụ: Áo Blazer dáng suông)",
      "category": "outerwear",
      "color": "Màu sắc",
      "style": "Chi tiết form dáng",
      "searchQuery": "Từ khóa tìm mua trên Shopee / TikTok Shop (ví dụ: áo blazer dáng suông nữ)"
    }
  ],
  "styleTips": [
    "Mẹo 1 về phối lớp / layering",
    "Mẹo 2 về phụ kiện / giày dép",
    "Mẹo 3 về cân đối vóc dáng"
  ]
}`
            : `You are an elite personal fashion stylist and personal shopper for CunFashion, specializing in US/Global chic styles.
Analyze this outfit image and the user's styling preferences:
- Occasion: ${occasion}
- Desired Style: ${style}
- Preferred Color / Tone: ${color || "natural match"}

Return ONLY a valid, raw JSON object (no markdown, no backticks, no markdown code fence) with the following exact structure:
{
  "headline": "A short, catchy outfit title highlighting key pieces",
  "overallStyle": "Short aesthetic name, e.g. Fall Chic / Casual Minimalist",
  "adviceText": "2-3 sentences of expert stylist advice on silhouettes, proportions, and layering",
  "palette": [
    {"name": "Color 1 Name", "hex": "#HEX"},
    {"name": "Color 2 Name", "hex": "#HEX"},
    {"name": "Color 3 Name", "hex": "#HEX"},
    {"name": "Color 4 Name", "hex": "#HEX"}
  ],
  "detectedItems": [
    {
      "name": "Specific item name (e.g. Cropped Trench Coat)",
      "category": "outerwear",
      "color": "Item color",
      "style": "Item cut or detail",
      "searchQuery": "Amazon US shopping search keyword (e.g. womens cropped trench coat khaki)"
    }
  ],
  "styleTips": [
    "Tip 1 on styling / layering",
    "Tip 2 on accessories / footwear",
    "Tip 3 on proportion balance"
  ]
}`;

          const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"];
          let parsed: any = null;

          for (const modelName of candidateModels) {
            try {
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [
                      {
                        parts: [
                          { text: prompt },
                          {
                            inlineData: {
                              mimeType: mimeType,
                              data: base64Data
                            }
                          }
                        ]
                      }
                    ],
                    generationConfig: {
                      responseMimeType: "application/json",
                      temperature: 0.3
                    }
                  })
                }
              );

              if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
                  parsed = JSON.parse(cleanedText);
                  break;
                }
              }
            } catch (modelErr) {
              console.warn(`Model ${modelName} call failed, trying next:`, modelErr);
            }
          }

          if (parsed) {
            const detectedItems: DetectedOutfitItem[] = (parsed.detectedItems || []).map(
              (item: any, idx: number) => ({
                id: `ai-item-${idx + 1}`,
                name: item.name || "Fashion Piece",
                category: item.category || "top",
                color: item.color || "Neutral",
                style: item.style || "",
                searchQuery: item.searchQuery || `${item.name} for women`,
                amazonUrl: buildAmazonSearchUrl(item.searchQuery || `${item.name} for women`)
              })
            );

            const catalogPool = market === "US" ? AMAZON_STYLE_CATALOG : VN_STYLE_CATALOG;

            // Category fallback images
            const categoryImages: Record<string, string> = {
              outerwear: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
              top: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
              bottom: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
              dress: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
              shoes: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop&q=80",
              accessory: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
            };

            // Build curated product cards directly from Gemini detected items
            const isUS = market === "US";
            const detectedProductCards: StyleProduct[] = detectedItems.map((item, idx) => {
              const cat = item.category || "top";
              const searchLink = isUS
                ? buildAmazonSearchUrl(item.searchQuery || `${item.name} for women`)
                : `https://shopee.vn/search?keyword=${encodeURIComponent(item.searchQuery || item.name)}`;

              const matchedCatalogItem = catalogPool.find((p) => p.category === cat);
              const cardImg = (idx === 0 && image && !image.startsWith("data:"))
                ? image
                : matchedCatalogItem?.img || categoryImages[cat] || categoryImages.top;

              return {
                id: `gemini-curated-${idx + 1}`,
                name: item.name,
                category: cat,
                price: isUS ? "Check on Amazon" : "Xem trên Shopee",
                originalPrice: isUS ? "Best Price" : "Giá tốt nhất",
                rating: 4.8,
                reviewCount: 320 + idx * 85,
                img: cardImg,
                link: searchLink,
                platform: isUS ? ("Amazon" as const) : ("Shopee" as const),
                tag: idx === 0 ? "Featured Look Match" : "AI Recommended",
                occasions: [occasion],
                styles: [style],
                budgetTier: (budget as any) || "mid",
                colorTags: [item.color],
                market: isUS ? "US" : "VN"
              };
            });

            // Combine with catalogPool to ensure we always present 4-6 rich products
            const combinedProducts = [...detectedProductCards];
            for (const catItem of catalogPool) {
              if (combinedProducts.length >= 6) break;
              if (!combinedProducts.some((p) => p.category === catItem.category)) {
                combinedProducts.push(catItem);
              }
            }

            const result: AdviceResult = {
              headline: parsed.headline || `Curated Look: ${occasion} • ${style}`,
              adviceText: parsed.adviceText || "Tailored outfit recommendations curated by CunFashion AI.",
              overallStyle: parsed.overallStyle || style,
              palette: parsed.palette || [
                { name: "Primary", hex: "#27272A" },
                { name: "Accent", hex: "#D4D4D8" }
              ],
              styleTips: parsed.styleTips || [],
              detectedItems,
              suggestedProducts: combinedProducts.slice(0, 6),
              market: isUS ? "US" : "VN",
              source: "gemini-vision"
            };

            return NextResponse.json({ success: true, data: result });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini Vision processing error, falling back to smart heuristic:", geminiError);
      }
    }

    // Fallback: Smart heuristic styling based on curated catalog & options
    const fallbackAdvice = generateStylistAdvice({
      occasion,
      style,
      budget,
      color,
      hasCustomImage: Boolean(image),
      market: market === "US" ? "US" : "VN"
    });

    return NextResponse.json({
      success: true,
      data: fallbackAdvice
    });
  } catch (error) {
    console.error("Style Advisor analyze error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process style analysis" },
      { status: 500 }
    );
  }
}
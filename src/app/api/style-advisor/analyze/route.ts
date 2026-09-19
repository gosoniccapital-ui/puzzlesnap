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
import { searchRakutenProducts } from "@/lib/affiliate/rakuten-client";
import { fetchFourthwallProducts } from "@/lib/fourthwall/client";

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
      keyword = "",
      occasion = "casual",
      style = "minimal",
      budget = "low",
      color = "",
      market = "US"
    } = body;

    const cleanKeyword = typeof keyword === "string" ? keyword.trim() : "";

    // Security guard: protect against giant base64 payloads (> 4MB)
    if (typeof image === "string" && image.length > 5_500_000) {
      return NextResponse.json(
        { success: false, error: "Image payload exceeds max allowed size (4MB)." },
        { status: 413 }
      );
    }

    const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, "").trim() : "";

    // Check if Gemini Vision or Text AI can be invoked
    if (apiKey && (typeof image === "string" || cleanKeyword)) {
      try {
        let mimeType = "image/jpeg";
        let base64Data = "";

        if (typeof image === "string") {
          if (image.startsWith("data:image/")) {
            const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              mimeType = matches[1];
              base64Data = matches[2];
            }
          } else if (image.startsWith("http://") || image.startsWith("https://")) {
            const isForbiddenHost =
              image.includes("localhost") ||
              image.includes("127.0.0.1") ||
              image.includes("169.254.") ||
              image.includes("0.0.0.0") ||
              image.includes("::1");

            if (!isForbiddenHost) {
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
          }
        }

        if (base64Data || cleanKeyword) {
          const isVN = market === "VN";
          const prompt = isVN
            ? `Bạn là chuyên gia tư vấn thời trang cao cấp của CunFashion, am hiểu phong cách giới trẻ & công sở Việt Nam.
${base64Data ? "Hãy phân tích bức ảnh trang phục này cùng tiêu chí của người dùng:" : `Người dùng đang tìm kiếm và muốn phối set đồ chuẩn đẹp với món đồ/từ khóa: "${cleanKeyword}".\nTiêu chí phối đồ:`}
- Dịp sử dụng: ${occasion}
- Phong cách: ${style}
- Gam màu ưa thích: ${color || "phối màu tự nhiên"}${cleanKeyword ? `\n- Món đồ / Từ khóa người dùng muốn tìm kiếm hoặc ưu tiên phối cùng: "${cleanKeyword}"` : ""}
${cleanKeyword ? `\nLưu ý đặc biệt: Hãy ưu tiên xây dựng set đồ xoay quanh hoặc phối hợp hoàn hảo với "${cleanKeyword}".` : ""}

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
${base64Data ? "Analyze this outfit image and the user's styling preferences:" : `The user is looking for a curated outfit matching the query: "${cleanKeyword}".\nStyling preferences:`}
- Occasion: ${occasion}
- Desired Style: ${style}
- Preferred Color / Tone: ${color || "natural match"}${cleanKeyword ? `\n- User's specific target item / search focus: "${cleanKeyword}"` : ""}
${cleanKeyword ? `Special Instruction: Prioritize recommendations, layering, and styling advice centered on "${cleanKeyword}".` : ""}

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

          const geminiParts = base64Data
            ? [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            : [{ text: prompt }];

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
                        parts: geminiParts
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

            const isUS = market === "US";
            const isRakuten = market === "RAKUTEN";
            const isFourthwall = market === "FOURTHWALL";

            let multiSourceProducts: StyleProduct[] = [];

            if (isFourthwall) {
              const fwItems = await fetchFourthwallProducts(6, cleanKeyword || detectedItems[0]?.searchQuery);
              if (fwItems.length > 0) {
                multiSourceProducts = fwItems;
              }
            } else if (isRakuten) {
              const rakutenKeyword = cleanKeyword || detectedItems[0]?.searchQuery || `${style} ${occasion} clothing`;
              const rakutenItems = await searchRakutenProducts(rakutenKeyword, 6);
              if (rakutenItems.length > 0) {
                multiSourceProducts = rakutenItems;
              } else {
                // Graceful fallback to Fourthwall store if Rakuten merchants are not yet accepted
                const fwFallback = await fetchFourthwallProducts(4, cleanKeyword);
                multiSourceProducts = fwFallback.length > 0 ? fwFallback : AMAZON_STYLE_CATALOG.slice(0, 4);
              }
            }

            // If not RAKUTEN or FOURTHWALL, build standard detected product cards
            if (multiSourceProducts.length === 0) {
              const catalogPool = (isUS || isRakuten || isFourthwall) ? AMAZON_STYLE_CATALOG : VN_STYLE_CATALOG;

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

              multiSourceProducts = [...detectedProductCards];
              for (const catItem of catalogPool) {
                if (multiSourceProducts.length >= 6) break;
                if (!multiSourceProducts.some((p) => p.category === catItem.category)) {
                  multiSourceProducts.push(catItem);
                }
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
              suggestedProducts: multiSourceProducts.slice(0, 6),
              market: market as any,
              source: isFourthwall ? "fourthwall-api" : isRakuten ? "rakuten-api" : base64Data ? "gemini-vision" : "gemini-text"
            };

            return NextResponse.json({ success: true, data: result });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini Vision processing error, falling back to smart heuristic:", geminiError);
      }
    }

    // Fallback: Smart heuristic styling based on curated catalog & options
    let fallbackProducts: StyleProduct[] = [];
    if (market === "FOURTHWALL") {
      fallbackProducts = await fetchFourthwallProducts(6, cleanKeyword);
    } else if (market === "RAKUTEN") {
      const rakutenSearchKey = cleanKeyword || `${style} ${occasion}`;
      fallbackProducts = await searchRakutenProducts(rakutenSearchKey, 6);
      if (fallbackProducts.length === 0) {
        const fw = await fetchFourthwallProducts(4, cleanKeyword);
        fallbackProducts = fw.length > 0 ? fw : AMAZON_STYLE_CATALOG.slice(0, 4);
      }
    }

    const fallbackAdvice = generateStylistAdvice({
      occasion,
      style,
      budget,
      color,
      hasCustomImage: Boolean(image),
      market: market as any,
      keyword: cleanKeyword
    });

    if (fallbackProducts.length > 0) {
      fallbackAdvice.suggestedProducts = fallbackProducts.slice(0, 6);
      fallbackAdvice.source = market === "FOURTHWALL" ? "fourthwall-api" : "rakuten-api";
    }

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
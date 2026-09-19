import { NextRequest, NextResponse } from "next/server";
import {
  AMAZON_STYLE_CATALOG,
  VN_STYLE_CATALOG,
  buildAmazonSearchUrl,
  buildAffiliateSearchLinks,
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
      market = "ALL"
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

            const isAll = market === "ALL" || !market;
            const isUS = market === "US";
            const isVN = market === "VN";
            const isRakuten = market === "RAKUTEN";
            const isFourthwall = market === "FOURTHWALL";

            let multiSourceProducts: StyleProduct[] = [];
            let hasDirectMatch = true;

            const amzCatalogMatches = cleanKeyword
              ? AMAZON_STYLE_CATALOG.filter(p =>
                  p.name.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
                  p.category.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
                  (p.colorTags || []).some(t => t.toLowerCase().includes(cleanKeyword.toLowerCase()))
                )
              : [];

            const vnCatalogMatches = cleanKeyword
              ? VN_STYLE_CATALOG.filter(p =>
                  p.name.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
                  p.category.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
                  (p.colorTags || []).some(t => t.toLowerCase().includes(cleanKeyword.toLowerCase()))
                )
              : [];

            if (isAll) {
              const [fwItems, rkItems] = await Promise.all([
                fetchFourthwallProducts(3, cleanKeyword),
                searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 3)
              ]);

              const directMatches = [
                ...fwItems,
                ...rkItems,
                ...amzCatalogMatches,
                ...vnCatalogMatches
              ];

              if (cleanKeyword) {
                if (directMatches.length > 0) {
                  hasDirectMatch = true;
                  multiSourceProducts = directMatches;
                } else {
                  hasDirectMatch = false;
                  // Zero direct match for query (e.g. "webroot").
                  // Show real trending picks across platforms, NO synthetic cards!
                  const [defaultFw, defaultRk] = await Promise.all([
                    fetchFourthwallProducts(2),
                    searchRakutenProducts("fashion clothing", 2)
                  ]);
                  multiSourceProducts = [
                    ...defaultFw,
                    ...defaultRk,
                    ...AMAZON_STYLE_CATALOG.slice(0, 2),
                    ...VN_STYLE_CATALOG.slice(0, 2)
                  ];
                }
              } else {
                // No keyword (e.g. image upload or default look)
                hasDirectMatch = true;
                multiSourceProducts = [
                  ...fwItems,
                  ...rkItems,
                  ...AMAZON_STYLE_CATALOG.slice(0, 2),
                  ...VN_STYLE_CATALOG.slice(0, 2)
                ];
              }

              // Pad up to 6 from catalog if needed without duplicates
              if (multiSourceProducts.length < 6) {
                const padCatalog = [...AMAZON_STYLE_CATALOG, ...VN_STYLE_CATALOG];
                for (const catItem of padCatalog) {
                  if (multiSourceProducts.length >= 6) break;
                  if (!multiSourceProducts.some((p) => p.id === catItem.id || p.name === catItem.name)) {
                    multiSourceProducts.push(catItem);
                  }
                }
              }
            } else if (isFourthwall) {
              const fwItems = await fetchFourthwallProducts(6, cleanKeyword);
              if (fwItems.length > 0) {
                hasDirectMatch = true;
                multiSourceProducts = fwItems;
              } else {
                if (cleanKeyword) hasDirectMatch = false;
                multiSourceProducts = await fetchFourthwallProducts(6);
              }
            } else if (isRakuten) {
              const rkItems = await searchRakutenProducts(cleanKeyword || `${style} ${occasion} clothing`, 6);
              if (rkItems.length > 0) {
                hasDirectMatch = true;
                multiSourceProducts = rkItems;
              } else {
                if (cleanKeyword) hasDirectMatch = false;
                multiSourceProducts = AMAZON_STYLE_CATALOG.slice(0, 6);
              }
            } else if (isUS) {
              if (amzCatalogMatches.length > 0) {
                hasDirectMatch = true;
                multiSourceProducts = amzCatalogMatches;
              } else {
                if (cleanKeyword) hasDirectMatch = false;
                multiSourceProducts = AMAZON_STYLE_CATALOG.slice(0, 6);
              }
            } else if (isVN) {
              if (vnCatalogMatches.length > 0) {
                hasDirectMatch = true;
                multiSourceProducts = vnCatalogMatches;
              } else {
                if (cleanKeyword) hasDirectMatch = false;
                multiSourceProducts = VN_STYLE_CATALOG.slice(0, 6);
              }
            }

            const searchLinks = cleanKeyword ? buildAffiliateSearchLinks(cleanKeyword, market as any) : undefined;

            const headline = hasDirectMatch
              ? (parsed.headline || `Curated Look: ${occasion} • ${style}`)
              : `Tìm Kiếm Trực Tiếp "${cleanKeyword}" & Gợi Ý Thịnh Hành`;

            const adviceText = hasDirectMatch
              ? (parsed.adviceText || "Tailored outfit recommendations curated by CunFashion AI.")
              : `Không tìm thấy sản phẩm thời trang có sẵn khớp chính xác với từ khóa "${cleanKeyword}". Bạn có thể bấm vào các liên kết tìm kiếm trực tiếp bên dưới trên Amazon US, Shopee hoặc Rakuten để nhận ưu đãi. Dưới đây là các gợi ý thời trang thịnh hành bán chạy nhất:`;

            const result: AdviceResult = {
              headline,
              adviceText,
              overallStyle: parsed.overallStyle || style,
              palette: parsed.palette || [
                { name: "Primary", hex: "#27272A" },
                { name: "Accent", hex: "#D4D4D8" }
              ],
              styleTips: parsed.styleTips || [],
              detectedItems: base64Data ? detectedItems : (hasDirectMatch ? detectedItems : []),
              suggestedProducts: multiSourceProducts.slice(0, 6),
              keyMatchedProducts: cleanKeyword && hasDirectMatch
                ? multiSourceProducts.filter(p => p.name.toLowerCase().includes(cleanKeyword.toLowerCase()) || p.category.toLowerCase().includes(cleanKeyword.toLowerCase())).slice(0, 4)
                : undefined,
              coordinatedProducts: cleanKeyword && hasDirectMatch
                ? multiSourceProducts.filter(p => !p.name.toLowerCase().includes(cleanKeyword.toLowerCase()) && !p.category.toLowerCase().includes(cleanKeyword.toLowerCase())).slice(0, 4)
                : undefined,
              market: market as any,
              source: isFourthwall ? "fourthwall-api" : isRakuten ? "rakuten-api" : base64Data ? "gemini-vision" : "gemini-text",
              keyword: cleanKeyword || undefined,
              hasDirectMatch,
              searchLinks
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
      market: market as any,
      keyword: cleanKeyword
    });

    const isAll = market === "ALL" || !market;
    let fallbackProducts: StyleProduct[] = [];

    if (fallbackAdvice.hasDirectMatch !== false) {
      if (isAll) {
        const [fw, rk] = await Promise.all([
          fetchFourthwallProducts(2, cleanKeyword),
          searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 2)
        ]);
        const amz = AMAZON_STYLE_CATALOG.filter(p => !cleanKeyword || p.name.toLowerCase().includes(cleanKeyword.toLowerCase())).slice(0, 3);
        const vn = VN_STYLE_CATALOG.filter(p => !cleanKeyword || p.name.toLowerCase().includes(cleanKeyword.toLowerCase())).slice(0, 2);
        fallbackProducts = [...fw, ...rk, ...amz, ...vn].filter(Boolean);
      } else if (market === "FOURTHWALL") {
        fallbackProducts = await fetchFourthwallProducts(6, cleanKeyword);
      } else if (market === "RAKUTEN") {
        fallbackProducts = await searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 6);
      }
    } else {
      // Zero matches for keyword: fetch honest trending items across platforms
      const [defaultFw, defaultRk] = await Promise.all([
        fetchFourthwallProducts(2),
        searchRakutenProducts("fashion clothing", 2)
      ]);
      fallbackProducts = [
        ...defaultFw,
        ...defaultRk,
        ...AMAZON_STYLE_CATALOG.slice(0, 2),
        ...VN_STYLE_CATALOG.slice(0, 2)
      ].filter(Boolean);
    }

    if (fallbackProducts.length > 0) {
      fallbackAdvice.suggestedProducts = fallbackProducts.slice(0, 8);
      if (cleanKeyword && fallbackAdvice.hasDirectMatch) {
        const kwLower = cleanKeyword.toLowerCase();
        const matches = fallbackProducts.filter(
          p => p.name.toLowerCase().includes(kwLower) || p.category.toLowerCase().includes(kwLower)
        );
        if (matches.length > 0) {
          fallbackAdvice.keyMatchedProducts = matches.slice(0, 4);
          fallbackAdvice.coordinatedProducts = fallbackProducts.filter(p => !matches.some(m => m.id === p.id)).slice(0, 4);
        }
      }
      if (market === "FOURTHWALL") fallbackAdvice.source = "fourthwall-api";
      else if (market === "RAKUTEN") fallbackAdvice.source = "rakuten-api";
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
import { NextRequest, NextResponse } from "next/server";
import {
  AMAZON_STYLE_CATALOG,
  buildAmazonSearchUrl,
  buildAffiliateSearchLinks,
  generateStylistAdvice,
  AdviceResult,
  DetectedOutfitItem,
  StyleProduct
} from "@/lib/data/style-advisor-data";
import { searchRakutenProducts } from "@/lib/affiliate/rakuten-client";
import { fetchFourthwallProducts } from "@/lib/fourthwall/client";
import { searchAmazonLiveProducts } from "@/lib/affiliate/amazon-live-client";

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
            let isSafeUrl = false;
            try {
              const parsed = new URL(image);
              const hostname = parsed.hostname.toLowerCase();
              const isForbidden =
                ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname) ||
                hostname.endsWith(".local") ||
                hostname.endsWith(".internal") ||
                hostname.endsWith(".lan") ||
                /^(?:10|127|169\.254|192\.168)\./.test(hostname) ||
                /^172\.(?:1[6-9]|2\d|3[0-1])\./.test(hostname);
              isSafeUrl = !isForbidden;
            } catch {
              isSafeUrl = false;
            }

            if (isSafeUrl) {
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
          const prompt = `You are an elite personal fashion stylist and personal shopper for CunFashion, specializing in US & Global haute couture and chic styles.
${base64Data ? "Analyze this outfit image and the user's styling preferences:" : `The user is looking for a curated outfit matching the query: "${cleanKeyword}".\nStyling preferences:`}
- Occasion: ${occasion}
- Desired Style: ${style}${style === "retro" ? " (Soft Retro / Quiet Vintage: Inspired by ModCloth 2025-2026 aesthetics filtered through CunFashion Quiet Luxury: feminine A-line Fit & Flare silhouettes, delicate subtle whimsical botanical prints, Gunne Sax romantic long-sleeve midi dresses in warm neutrals, comfortable inclusive fit, and playful calm accessories like silk scarves or Mary Janes)" : ""}
- Preferred Color / Tone: ${color || "natural match"}${cleanKeyword ? `\n- User's specific target item / search focus: "${cleanKeyword}"` : ""}
${cleanKeyword ? `Special Instruction: Prioritize recommendations, layering, and styling advice centered on "${cleanKeyword}".` : ""}

Return ONLY a valid, raw JSON object (no markdown, no backticks, no markdown code fence) with the following exact structure:
{
  "headline": "A short, catchy outfit title highlighting key pieces",
  "overallStyle": "Short aesthetic name, e.g. Fall Chic / Casual Minimalist / Parisian Tailoring",
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
      "searchQuery": "Amazon US shopping search keyword (e.g. womens cropped trench coat double breasted)"
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
                  }),
                  signal: AbortSignal.timeout(12000)
                }
              );

              if (geminiRes.ok) {
                const geminiJson = await geminiRes.json();
                const textContent = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textContent) {
                  const cleaned = textContent
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();
                  parsed = JSON.parse(cleaned);
                  break;
                }
              }
            } catch (perModelErr) {
              console.warn(`Gemini model ${modelName} failed or timed out:`, perModelErr);
            }
          }

          if (parsed && parsed.headline && parsed.detectedItems) {
            const detectedItems: DetectedOutfitItem[] = parsed.detectedItems.map(
              (item: any, idx: number) => ({
                id: `ai-det-${idx + 1}`,
                name: item.name,
                category: item.category || "top",
                color: item.color || "Neutral",
                style: item.style || "",
                searchQuery: item.searchQuery || item.name,
                amazonUrl: buildAmazonSearchUrl(item.searchQuery || item.name)
              })
            );

            const isAll = market === "ALL" || !market;
            const isUS = market === "US";
            const isRakuten = market === "RAKUTEN";
            const isFourthwall = market === "FOURTHWALL";

            let multiSourceProducts: StyleProduct[] = [];
            let hasDirectMatch = true;

            const liveQuery = cleanKeyword || detectedItems[0]?.searchQuery || `${style} ${occasion} outfit`;

            if (isAll) {
              const [fwItems, rkItems, amzLiveItems] = await Promise.all([
                fetchFourthwallProducts(3, cleanKeyword),
                searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 3),
                searchAmazonLiveProducts(liveQuery, 4)
              ]);

              const directMatches = [
                ...amzLiveItems,
                ...fwItems,
                ...rkItems
              ];

              if (cleanKeyword) {
                if (directMatches.length > 0) {
                  hasDirectMatch = true;
                  multiSourceProducts = directMatches;
                } else {
                  hasDirectMatch = false;
                  // Zero direct match: fetch real live trending picks across platforms
                  const [defaultFw, defaultRk, defaultAmz] = await Promise.all([
                    fetchFourthwallProducts(2),
                    searchRakutenProducts("fashion clothing", 2),
                    searchAmazonLiveProducts("trending fashion outfit", 4)
                  ]);
                  multiSourceProducts = [
                    ...defaultAmz,
                    ...defaultFw,
                    ...defaultRk
                  ];
                }
              } else {
                hasDirectMatch = true;
                multiSourceProducts = [
                  ...amzLiveItems,
                  ...fwItems,
                  ...rkItems
                ];
              }

              // Pad up to 6 from live or catalog if needed without duplicates
              if (multiSourceProducts.length < 6) {
                for (const catItem of AMAZON_STYLE_CATALOG) {
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
                // If Rakuten returns empty or has credentials issues, gracefully fallback to real live Amazon data
                const amzLiveFallback = await searchAmazonLiveProducts(cleanKeyword || `${style} ${occasion}`, 6);
                multiSourceProducts = amzLiveFallback.length > 0 ? amzLiveFallback : AMAZON_STYLE_CATALOG.slice(0, 6);
                if (cleanKeyword && amzLiveFallback.length === 0) hasDirectMatch = false;
              }
            } else if (isUS) {
              const liveAmz = await searchAmazonLiveProducts(liveQuery, 6);
              if (liveAmz.length > 0) {
                hasDirectMatch = true;
                multiSourceProducts = liveAmz;
              } else {
                if (cleanKeyword) hasDirectMatch = false;
                multiSourceProducts = AMAZON_STYLE_CATALOG.slice(0, 6);
              }
            }

            const searchLinks = cleanKeyword ? buildAffiliateSearchLinks(cleanKeyword, market as any) : undefined;

            const headline = hasDirectMatch
              ? (parsed.headline || `Curated Ensemble: ${occasion} • ${style}`)
              : `Affiliate Search for "${cleanKeyword}" • Trending Picks`;

            const adviceText = hasDirectMatch
              ? (parsed.adviceText || "Tailored outfit recommendations curated by CunFashion AI.")
              : `We couldn't find an exact fashion match for "${cleanKeyword}" in our boutique catalog. You can search directly on Amazon US (StoreID: cuncute-20) or Rakuten using the quick links below. Meanwhile, explore our trending essentials:`;

            const result: AdviceResult = {
              headline,
              adviceText,
              overallStyle: parsed.overallStyle || style,
              palette: parsed.palette || [
                { name: "Primary Tone", hex: "#FCE7F3" },
                { name: "Contrast Base", hex: "#18181B" },
                { name: "Soft Accent", hex: "#E4D4F4" },
                { name: "Statement Accent", hex: "#DB2777" }
              ],
              styleTips: parsed.styleTips || [
                "Pair high-waisted bottoms with tailored outerwear for clean silhouette proportions.",
                "Accentuate minimalist neutrals with warm gold hardware and contrasting leather accessories.",
                "Balance tailored cuts with relaxed knitwear for an effortless modern finish."
              ],
              suggestedProducts: multiSourceProducts.slice(0, 8),
              detectedItems,
              market: market || "US",
              source: base64Data ? "gemini-vision" : "gemini-text",
              keyword: cleanKeyword || undefined,
              hasDirectMatch,
              searchLinks
            };

            // Differentiate Key Matches vs Coordinated Pieces
            if (cleanKeyword && hasDirectMatch) {
              const kwLower = cleanKeyword.toLowerCase();
              const keyMatches = multiSourceProducts.filter(
                (p) =>
                  p.name.toLowerCase().includes(kwLower) ||
                  p.category.toLowerCase().includes(kwLower)
              );
              const remaining = multiSourceProducts.filter((p) => !keyMatches.some((m) => m.id === p.id));
              if (keyMatches.length > 0) {
                result.keyMatchedProducts = keyMatches.slice(0, 4);
                result.coordinatedProducts = remaining.slice(0, 4);
              }
            }

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
        const [fw, rk, liveAmz] = await Promise.all([
          fetchFourthwallProducts(2, cleanKeyword),
          searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 2),
          searchAmazonLiveProducts(cleanKeyword || `${style} ${occasion}`, 4)
        ]);
        fallbackProducts = [...liveAmz, ...fw, ...rk].filter(Boolean);
      } else if (market === "FOURTHWALL") {
        fallbackProducts = await fetchFourthwallProducts(6, cleanKeyword);
      } else if (market === "RAKUTEN") {
        const rk = await searchRakutenProducts(cleanKeyword || `${style} ${occasion}`, 6);
        if (rk.length > 0) {
          fallbackProducts = rk;
        } else {
          fallbackProducts = await searchAmazonLiveProducts(cleanKeyword || `${style} ${occasion}`, 6);
        }
      } else if (market === "US") {
        fallbackProducts = await searchAmazonLiveProducts(cleanKeyword || `${style} ${occasion}`, 6);
      }
    } else {
      // Zero matches for keyword: fetch honest trending items across platforms
      const [defaultFw, defaultRk, defaultAmz] = await Promise.all([
        fetchFourthwallProducts(2),
        searchRakutenProducts("fashion clothing", 2),
        searchAmazonLiveProducts("trending fashion outfit", 4)
      ]);
      fallbackProducts = [
        ...defaultAmz,
        ...defaultFw,
        ...defaultRk
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
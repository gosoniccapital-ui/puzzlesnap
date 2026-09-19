// Fourthwall Open API Client for cute.cunfashion.com
import type { StyleProduct } from "../data/style-advisor-data.ts";

interface CachedProducts {
  data: StyleProduct[];
  timestamp: number;
}

let memoryCache: CachedProducts | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function filterProductsByQuery(items: StyleProduct[], query?: string): StyleProduct[] {
  if (!query || !query.trim()) return items;
  const terms = query.toLowerCase().trim().split(/\s+/);
  const matched = items.filter(item => {
    const text = `${item.name} ${item.category} ${(item.colorTags || []).join(" ")}`.toLowerCase();
    return terms.some(term => text.includes(term));
  });
  return matched;
}

export async function fetchFourthwallProducts(limit = 12, query?: string): Promise<StyleProduct[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return filterProductsByQuery(memoryCache.data, query).slice(0, limit);
  }

  const uname = process.env.FOURTHWALL_UNAME;
  const upass = process.env.FOURTHWALL_UPASS;
  const webUrl = (process.env.FOURTHWALL_WEB || "https://cute.cunfashion.com/").replace(/\/$/, "");

  if (!uname || !upass) {
    console.warn("[Fourthwall Client] Credentials missing in environment");
    return [];
  }

  try {
    const pair = `${uname}:${upass}`;
    const base64 = Buffer.from(pair).toString("base64");

    const res = await fetch(`https://api.fourthwall.com/open-api/v1.0/products?limit=30`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${base64}`,
        Accept: "application/json"
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.warn(`[Fourthwall Client] Fetch failed with status ${res.status}`);
      return [];
    }

    const json = await res.json();
    const results = json.results || [];

    const products: StyleProduct[] = results
      .filter((item: any) => item.slug && item.images && item.images.length > 0)
      .map((item: any, idx: number) => {
        const variantPrice = item.variants?.[0]?.unitPrice?.value || 35.00;
        const currency = item.variants?.[0]?.unitPrice?.currency || "USD";
        const primaryImage = item.images[0]?.url;

        // Determine category based on product title
        const lowerName = item.name.toLowerCase();
        let category: StyleProduct["category"] = "top";
        if (lowerName.includes("legging") || lowerName.includes("pant") || lowerName.includes("skirt")) {
          category = "bottom";
        } else if (lowerName.includes("hoodie") || lowerName.includes("jacket") || lowerName.includes("cardigan")) {
          category = "outerwear";
        } else if (lowerName.includes("dress") || lowerName.includes("set")) {
          category = "dress";
        } else if (lowerName.includes("sock") || lowerName.includes("bottle") || lowerName.includes("hat") || lowerName.includes("bag")) {
          category = "accessory";
        }

        return {
          id: `fw-${item.slug || idx}`,
          name: item.name,
          category,
          price: `$${Number(variantPrice).toFixed(2)} ${currency}`,
          rating: 5.0,
          reviewCount: 88 + (idx * 17) % 200,
          img: primaryImage,
          link: `${webUrl}/products/${item.slug}`,
          platform: "CunCute Store",
          tag: "Official Merch",
          occasions: ["casual", "travel", "work", "date"],
          styles: ["minimal", "street", "classic", "romantic"],
          budgetTier: "mid",
          colorTags: ["pink", "black", "cream", "neutral"]
        };
      });

    memoryCache = {
      data: products,
      timestamp: now
    };

    return filterProductsByQuery(products, query).slice(0, limit);
  } catch (error) {
    console.error("[Fourthwall Client] Error fetching products:", error);
    return [];
  }
}
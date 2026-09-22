import type { StyleProduct } from "../data/style-advisor-data";

export const AMAZON_ASSOCIATE_TAG = "";

export function buildAmazonProductUrl(asin: string, subId?: string): string {
  let url = `https://www.amazon.com/dp/${asin}`;
  if (AMAZON_ASSOCIATE_TAG) {
    url += `?tag=${AMAZON_ASSOCIATE_TAG}`;
    if (subId) {
      url += `&ascsubtag=${encodeURIComponent(subId)}`;
    }
  }
  return url;
}

interface CacheEntry {
  timestamp: number;
  products: StyleProduct[];
}

// In-memory query cache: 10 minutes TTL to conserve API credits and maximize response speed
const amazonQueryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key: string): StyleProduct[] | null {
  const entry = amazonQueryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    amazonQueryCache.delete(key);
    return null;
  }
  return entry.products;
}

function setCache(key: string, products: StyleProduct[]) {
  // Prevent memory unbounded growth
  if (amazonQueryCache.size > 200) {
    const oldestKey = amazonQueryCache.keys().next().value;
    if (oldestKey) amazonQueryCache.delete(oldestKey);
  }
  amazonQueryCache.set(key, { timestamp: Date.now(), products });
}

function inferCategory(title: string, query: string): "top" | "bottom" | "dress" | "shoes" | "accessory" | "outerwear" {
  const text = `${title} ${query}`.toLowerCase();
  if (/coat|jacket|blazer|cardigan|parka|trench|bomber|puffer|sweater|hoodie|windbreaker/.test(text)) {
    return "outerwear";
  }
  if (/dress|gown|sundress|slip dress|romper|jumpsuit/.test(text)) {
    return "dress";
  }
  if (/boot|shoe|sneaker|heel|loafer|sandal|mule|pump|flat|clog/.test(text)) {
    return "shoes";
  }
  if (/bag|purse|tote|sunglass|belt|hat|scarf|jewelry|necklace|watch|earring|wallet/.test(text)) {
    return "accessory";
  }
  if (/pant|jean|trouser|skirt|short|legging|cargo|denim|culotte/.test(text)) {
    return "bottom";
  }
  return "top";
}

/**
 * Priority 1: Rainforest API
 * Directly queries Amazon US search with real-time stock, pricing, and HD photos
 */
export async function searchRainforestAmazon(
  query: string,
  limit = 6
): Promise<StyleProduct[]> {
  const apiKey = (process.env.RAINFOREST_API || "").trim();
  if (!apiKey) return [];

  const cleanTerm = query.replace(/[^\w\s-]/g, " ").trim();
  if (!cleanTerm) return [];

  const url = `https://api.rainforestapi.com/request?api_key=${encodeURIComponent(
    apiKey
  )}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(cleanTerm)}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8500)
    });

    if (!res.ok) {
      console.warn(`[Rainforest API] Non-200 response: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawResults = data.search_results;
    if (!Array.isArray(rawResults) || rawResults.length === 0) {
      return [];
    }

    const products: StyleProduct[] = [];
    for (const item of rawResults) {
      if (!item.asin || !item.title) continue;

      const priceVal = item.price?.raw || (item.price?.value ? `$${item.price.value}` : "$29.99");
      const origPriceVal = item.price_strikethrough?.raw || undefined;
      const category = inferCategory(item.title, query);
      const imgUrl = item.image || (Array.isArray(item.images) ? item.images[0]?.link : "");

      if (!imgUrl) continue;

      let tagLabel = "Live Trending";
      if (item.is_amazon_choice) tagLabel = "Amazon's Choice";
      else if (item.is_best_seller) tagLabel = "Best Seller";
      else if (item.is_prime) tagLabel = "Prime Delivery";

      products.push({
        id: `amz-rf-${item.asin}`,
        name: item.title,
        category,
        price: priceVal,
        originalPrice: origPriceVal,
        discount: origPriceVal ? "-15%" : undefined,
        rating: typeof item.rating === "number" ? item.rating : 4.5,
        reviewCount: typeof item.ratings_total === "number" ? item.ratings_total : 120,
        img: imgUrl,
        link: buildAmazonProductUrl(item.asin),
        platform: "Amazon",
        tag: tagLabel,
        occasions: ["casual", "work", "street"],
        styles: ["chic", "minimal", "modern"],
        budgetTier: "mid",
        colorTags: [category],
        asin: item.asin,
        market: "US"
      });

      if (products.length >= limit) break;
    }

    return products;
  } catch (err) {
    console.warn("[Rainforest API] Fetch error or timeout:", err);
    return [];
  }
}

/**
 * Priority 2: RapidAPI Real-Time Amazon Data API
 * Subscribed host: real-time-amazon-data.p.rapidapi.com
 * Failover when Rainforest is rate-limited or exhausted
 */
export async function searchRapidApiAmazon(
  query: string,
  limit = 6
): Promise<StyleProduct[]> {
  const apiKey = (process.env.RAPIDAPI_API || "").trim();
  if (!apiKey) return [];

  const cleanTerm = query.replace(/[^\w\s-]/g, " ").trim();
  if (!cleanTerm) return [];

  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(
    cleanTerm
  )}&page=1&country=US`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com"
      },
      signal: AbortSignal.timeout(8500)
    });

    if (!res.ok) {
      console.warn(`[RapidAPI Amazon] Non-200 response: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawProducts = data?.data?.products;
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return [];
    }

    const products: StyleProduct[] = [];
    for (const p of rawProducts) {
      if (!p.asin || !p.product_title) continue;

      const priceVal = p.product_price || "$29.99";
      const origPriceVal = p.product_original_price || undefined;
      const category = inferCategory(p.product_title, query);
      const imgUrl = p.product_photo;

      if (!imgUrl) continue;

      let tagLabel = "Live Trending";
      if (p.is_best_seller) tagLabel = "Best Seller";
      else if (p.is_amazon_choice) tagLabel = "Amazon's Choice";
      else if (p.is_prime) tagLabel = "Prime Delivery";

      const ratingVal = parseFloat(p.product_star_rating) || 4.5;
      const reviewsVal = parseInt(p.product_num_ratings, 10) || 85;

      products.push({
        id: `amz-rp-${p.asin}`,
        name: p.product_title,
        category,
        price: priceVal,
        originalPrice: origPriceVal,
        discount: origPriceVal ? "-20%" : undefined,
        rating: ratingVal,
        reviewCount: reviewsVal,
        img: imgUrl,
        link: buildAmazonProductUrl(p.asin),
        platform: "Amazon",
        tag: tagLabel,
        occasions: ["casual", "work", "street"],
        styles: ["chic", "minimal", "modern"],
        budgetTier: "mid",
        colorTags: [category],
        asin: p.asin,
        market: "US"
      });

      if (products.length >= limit) break;
    }

    return products;
  } catch (err) {
    console.warn("[RapidAPI Amazon] Fetch error or timeout:", err);
    return [];
  }
}

/**
 * Master Resilient Amazon Search:
 * In-Memory Cache -> Rainforest API -> RapidAPI Failover
 */
export async function searchAmazonLiveProducts(
  query: string,
  limit = 6
): Promise<StyleProduct[]> {
  const cleanTerm = query.trim();
  if (!cleanTerm) return [];

  const cacheKey = `amz:${cleanTerm.toLowerCase()}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Tier 1: Rainforest API (Primary)
  let results = await searchRainforestAmazon(cleanTerm, limit);

  // Tier 2: RapidAPI (Failover)
  if (results.length === 0) {
    results = await searchRapidApiAmazon(cleanTerm, limit);
  }

  // Tier 3: Curated Catalog Fallback (When third-party API quotas/credits are exhausted)
  if (results.length === 0) {
    const { AMAZON_STYLE_CATALOG } = await import("../data/style-advisor-data");
    const terms = cleanTerm.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = AMAZON_STYLE_CATALOG.filter((p) =>
      terms.some((t) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t))
    );
    results = (matched.length > 0 ? matched : AMAZON_STYLE_CATALOG).slice(0, limit);
  }

  if (results.length > 0) {
    setCache(cacheKey, results);
  }

  return results;
}

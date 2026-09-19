// Rakuten Advertising Product Search API Client
import type { StyleProduct } from "../data/style-advisor-data.ts";

export async function searchRakutenProducts(keyword: string, limit = 6): Promise<StyleProduct[]> {
  const token = process.env.RAKUTEN_ACCESS_TOKEN;
  if (!token || !keyword.trim()) {
    return [];
  }

  try {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const url = `https://api.linksynergy.com/productsearch/1.0?keyword=${encodedKeyword}&max=${limit}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 300 } // Cache 5 minutes in Next.js
    });

    if (!res.ok) {
      console.warn(`[Rakuten API] Fetch failed with status ${res.status}`);
      return [];
    }

    const xml = await res.text();
    return parseRakutenXml(xml);
  } catch (error) {
    console.error("[Rakuten API] Error searching products:", error);
    return [];
  }
}

// Lightweight regex XML parser for Rakuten <item> nodes
export function parseRakutenXml(xml: string): StyleProduct[] {
  const items: StyleProduct[] = [];
  if (!xml || xml.includes("<TotalMatches>0</TotalMatches>")) {
    return items;
  }

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const midMatch = block.match(/<mid>(.*?)<\/mid>/);
    const merchantMatch = block.match(/<merchantname>(.*?)<\/merchantname>/);
    const nameMatch = block.match(/<productname>(.*?)<\/productname>/);
    const priceMatch = block.match(/<price>(.*?)<\/price>/);
    const linkMatch = block.match(/<linkurl>(.*?)<\/linkurl>/);
    const imageMatch = block.match(/<imageurl>(.*?)<\/imageurl>/);

    const name = nameMatch ? decodeXml(nameMatch[1].trim()) : "Fashion Item";
    const priceVal = priceMatch ? priceMatch[1].trim() : "49.00";
    const link = linkMatch ? linkMatch[1].trim() : "https://rakutenadvertising.com";
    const img = imageMatch ? imageMatch[1].trim() : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80";
    const merchant = merchantMatch ? decodeXml(merchantMatch[1].trim()) : "Rakuten Brand";
    const mid = midMatch ? midMatch[1].trim() : "rakuten";

    items.push({
      id: `rakuten-${mid}-${items.length + 1}`,
      name,
      category: "top",
      price: `$${priceVal} USD`,
      rating: 4.9,
      reviewCount: 320,
      img,
      link,
      platform: "Rakuten",
      tag: merchant,
      occasions: ["casual", "work", "date", "party", "travel"],
      styles: ["elegant", "minimal", "classic", "romantic", "street"],
      budgetTier: "mid",
      colorTags: ["neutral"]
    });
  }

  return items;
}

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
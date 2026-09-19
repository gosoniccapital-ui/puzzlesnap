export interface CatalogLookupItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  img: string;
  link: string;
  platform: string;
  category?: string;
}

export interface WardrobeShareItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  img: string;
  link: string;
  platform: string;
  category?: string;
  savedAt: string;
}

/**
 * Generate a shareable URL containing wardrobe product IDs.
 */
export function generateWardrobeShareUrl(items: { id: string }[], origin = ""): string {
  if (!items || items.length === 0) {
    return `${origin}/style-advisor`;
  }

  const ids = items.map((i) => encodeURIComponent(i.id)).join(",");
  const base = origin ? origin : "";
  return `${base}/style-advisor?wardrobe=${ids}`;
}

/**
 * Resolve an array of product IDs into full WardrobeItem objects
 * by looking up the provided catalog or falling back gracefully.
 */
export function parseSharedWardrobeParam(
  param: string,
  catalog: CatalogLookupItem[] = []
): WardrobeShareItem[] {
  if (!param || !param.trim()) return [];

  const rawIds = param
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);

  if (rawIds.length === 0) return [];

  const resolvedItems: WardrobeShareItem[] = [];
  const catalogMap = new Map<string, CatalogLookupItem>();

  for (const prod of catalog) {
    catalogMap.set(prod.id, prod);
  }

  for (const id of rawIds) {
    const found = catalogMap.get(id);
    if (found) {
      resolvedItems.push({
        id: found.id,
        name: found.name,
        price: found.price,
        originalPrice: found.originalPrice,
        discount: found.discount,
        img: found.img,
        link: found.link,
        platform: found.platform,
        category: found.category,
        savedAt: new Date().toISOString()
      });
    } else {
      // Fallback for custom or unrecognized ID
      resolvedItems.push({
        id,
        name: `Trang phục thời trang #${id.slice(-4)}`,
        price: "Xem chi tiết",
        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        link: `https://www.amazon.com/s?k=${encodeURIComponent(id)}&tag=cuncute-20`,
        platform: "Amazon",
        savedAt: new Date().toISOString()
      });
    }
  }

  return resolvedItems;
}

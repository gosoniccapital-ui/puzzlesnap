/**
 * In-memory buffer and analytics engine for affiliate conversion tracking.
 * Provides fallback resilience if Supabase table is unreachable.
 */

export interface ClickRecord {
  id: string;
  product_id: string;
  product_name: string;
  platform: string;
  affiliate_url: string;
  keyword?: string;
  device_type?: string;
  created_at: string;
}

export interface ConversionRecord {
  id: string;
  click_id?: string;
  order_id: string;
  product_id?: string;
  product_name?: string;
  platform: string;
  amount: number;
  commission: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: number;
  platforms: Record<string, number>;
  topProducts: {
    productId: string;
    productName: string;
    platform: string;
    count: number;
  }[];
  topKeywords: {
    keyword: string;
    count: number;
  }[];
  recentClicks: ClickRecord[];
  recentConversions: ConversionRecord[];
}

const MAX_BUFFER_SIZE = 500;
const inMemoryClicks: ClickRecord[] = [
  {
    id: "init-clk-1",
    product_id: "amz-01",
    product_name: "PRETTYGARDEN Cropped Trench Coat For Women Double Breasted",
    platform: "Amazon",
    affiliate_url: "https://www.amazon.com/s?k=women+cropped+trench+coat&tag=cuncute-20",
    keyword: "Trench Coat",
    device_type: "Desktop",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "init-clk-2",
    product_id: "amz-02",
    product_name: "Erocalli Women's Fall Suede Mid Calf Slouchy Boots Chunky Heel",
    platform: "Amazon",
    affiliate_url: "https://www.amazon.com/s?k=women+suede+ankle+boots&tag=cuncute-20",
    keyword: "Suede Boots",
    device_type: "Mobile",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "init-clk-3",
    product_id: "rk-01",
    product_name: "MICHAEL KORS Jet Set Large Saffiano Leather Crossbody",
    platform: "Rakuten",
    affiliate_url: "https://click.linksynergy.com/deeplink?id=cunfashion",
    keyword: "Túi xách",
    device_type: "Desktop",
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "init-clk-4",
    product_id: "fw-01",
    product_name: "Cun Cute Signature Angel Wings Hoodie",
    platform: "CunCute Store",
    affiliate_url: "https://cute.cunfashion.com/products/angel-wings-hoodie",
    keyword: "Hoodie",
    device_type: "Mobile",
    created_at: new Date(Date.now() - 900000).toISOString()
  }
];

const inMemoryConversions: ConversionRecord[] = [
  {
    id: "conv-init-1",
    click_id: "init-clk-1",
    order_id: "AMZ-ORD-88219",
    product_id: "amz-01",
    product_name: "PRETTYGARDEN Cropped Trench Coat For Women Double Breasted",
    platform: "Amazon",
    amount: 59.99,
    commission: 4.2,
    currency: "USD",
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: "conv-init-2",
    click_id: "init-clk-4",
    order_id: "FW-CUN-10492",
    product_id: "fw-01",
    product_name: "Cun Cute Signature Angel Wings Hoodie",
    platform: "CunCute Store",
    amount: 48.0,
    commission: 7.2,
    currency: "USD",
    status: "approved",
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];

export function recordClick(click: Omit<ClickRecord, "id">): ClickRecord {
  const newRecord: ClickRecord = {
    ...click,
    id: `clk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  };

  inMemoryClicks.unshift(newRecord);
  if (inMemoryClicks.length > MAX_BUFFER_SIZE) {
    inMemoryClicks.pop();
  }

  return newRecord;
}

export function recordConversion(
  conv: Omit<ConversionRecord, "id" | "created_at"> & { created_at?: string }
): ConversionRecord {
  // If click_id is provided, try to match product name and id from inMemoryClicks
  let prodId = conv.product_id;
  let prodName = conv.product_name;

  if (conv.click_id && (!prodId || !prodName)) {
    const matchedClick = inMemoryClicks.find((c) => c.id === conv.click_id);
    if (matchedClick) {
      if (!prodId) prodId = matchedClick.product_id;
      if (!prodName) prodName = matchedClick.product_name;
    }
  }

  const newRecord: ConversionRecord = {
    ...conv,
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product_id: prodId,
    product_name: prodName,
    created_at: conv.created_at || new Date().toISOString()
  };

  inMemoryConversions.unshift(newRecord);
  if (inMemoryConversions.length > MAX_BUFFER_SIZE) {
    inMemoryConversions.pop();
  }

  return newRecord;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const platforms: Record<string, number> = {
    Amazon: 0,
    Rakuten: 0,
    "CunCute Store": 0,
    Shopee: 0,
    "TikTok Shop": 0,
    Other: 0
  };

  const productCountMap = new Map<string, { name: string; platform: string; count: number }>();
  const keywordCountMap = new Map<string, number>();

  for (const c of inMemoryClicks) {
    // Platform breakdown
    const normPlat = c.platform || "Other";
    if (platforms[normPlat] !== undefined) {
      platforms[normPlat] += 1;
    } else {
      platforms["Other"] = (platforms["Other"] || 0) + 1;
    }

    // Product counts
    if (c.product_id) {
      const existing = productCountMap.get(c.product_id);
      if (existing) {
        existing.count += 1;
      } else {
        productCountMap.set(c.product_id, {
          name: c.product_name || c.product_id,
          platform: normPlat,
          count: 1
        });
      }
    }

    // Keyword counts
    if (c.keyword && c.keyword.trim()) {
      const kw = c.keyword.trim();
      keywordCountMap.set(kw, (keywordCountMap.get(kw) || 0) + 1);
    }
  }

  const topProducts = Array.from(productCountMap.entries())
    .map(([productId, info]) => ({
      productId,
      productName: info.name,
      platform: info.platform,
      count: info.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topKeywords = Array.from(keywordCountMap.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let totalRevenue = 0;
  let totalCommission = 0;
  for (const conv of inMemoryConversions) {
    if (conv.status !== "rejected") {
      totalRevenue += conv.amount;
      totalCommission += conv.commission;
    }
  }

  const totalClicks = inMemoryClicks.length;
  const totalConversions = inMemoryConversions.length;
  const conversionRate =
    totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0;

  return {
    totalClicks,
    totalConversions,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCommission: Number(totalCommission.toFixed(2)),
    conversionRate,
    platforms,
    topProducts,
    topKeywords,
    recentClicks: inMemoryClicks.slice(0, 30),
    recentConversions: inMemoryConversions.slice(0, 30)
  };
}

export function getAllClickRecords(): ClickRecord[] {
  return [...inMemoryClicks];
}

export function getAllConversionRecords(): ConversionRecord[] {
  return [...inMemoryConversions];
}

export function generateClickCsvString(records: ClickRecord[]): string {
  const headers = [
    "Mã Click (ID)",
    "Thời Gian",
    "Sàn Mua Sắm",
    "Mã Sản Phẩm",
    "Tên Sản Phẩm",
    "Từ Khóa Tìm Kiếm",
    "Thiết Bị",
    "Link Affiliate Đích"
  ];

  const escapeCell = (str?: string | number) => {
    if (str === undefined || str === null || str === "") return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = records.map((r) =>
    [
      escapeCell(r.id),
      escapeCell(r.created_at),
      escapeCell(r.platform),
      escapeCell(r.product_id),
      escapeCell(r.product_name),
      escapeCell(r.keyword || ""),
      escapeCell(r.device_type || "Desktop"),
      escapeCell(r.affiliate_url)
    ].join(",")
  );

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for seamless Microsoft Excel rendering
  return "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
}

export function generateConversionCsvString(records: ConversionRecord[]): string {
  const headers = [
    "Mã Chuyển Đổi (ID)",
    "Mã Click Gốc (Click ID)",
    "Mã Đơn Hàng (Order ID)",
    "Thời Gian",
    "Sàn Mua Sắm",
    "Mã Sản Phẩm",
    "Tên Sản Phẩm",
    "Giá Trị Đơn Hàng",
    "Hoa Hồng Nhận Được",
    "Tiền Tệ",
    "Trạng Thái"
  ];

  const escapeCell = (str?: string | number) => {
    if (str === undefined || str === null || str === "") return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = records.map((r) =>
    [
      escapeCell(r.id),
      escapeCell(r.click_id || ""),
      escapeCell(r.order_id),
      escapeCell(r.created_at),
      escapeCell(r.platform),
      escapeCell(r.product_id || ""),
      escapeCell(r.product_name || ""),
      escapeCell(r.amount),
      escapeCell(r.commission),
      escapeCell(r.currency),
      escapeCell(r.status)
    ].join(",")
  );

  return "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
}


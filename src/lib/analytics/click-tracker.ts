import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

/**
 * Global Analytics & Conversion Engine with Dual-Layer Persistence:
 * 1. Low-latency In-memory ring buffer (RAM) for 0ms dashboard reads.
 * 2. Supabase PostgreSQL tables (affiliate_clicks, affiliate_conversions) for permanent persistence.
 */

export interface ClickRecord {
  id: string;
  product_id: string;
  product_name: string;
  platform: string;
  affiliate_url: string;
  keyword?: string;
  device_type?: string;
  country?: string;
  city?: string;
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
    product_name: "PRETTYGARDEN Cropped Trench Coat Double Breasted Outerwear",
    platform: "Amazon",
    affiliate_url: "https://www.amazon.com/s?k=women+cropped+trench+coat&tag=cuncute-20",
    keyword: "Trench Coat",
    device_type: "Desktop",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "init-clk-2",
    product_id: "amz-17",
    product_name: "Erocalli Women's Suede Mid Calf Slouchy Fall Boots Chunky Heel",
    platform: "Amazon",
    affiliate_url: "https://www.amazon.com/s?k=women+suede+mid+calf+slouchy+boots&tag=cuncute-20",
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
    keyword: "Designer Bag",
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
    product_name: "PRETTYGARDEN Cropped Trench Coat Double Breasted Outerwear",
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

  // Dual-layer: Persist asynchronously to Supabase cloud table if configured
  if (supabaseAdmin) {
    Promise.resolve(
      supabaseAdmin.from("affiliate_clicks").insert({
        id: newRecord.id,
        product_id: newRecord.product_id,
        product_name: newRecord.product_name,
        platform: newRecord.platform,
        price: "",
        target_url: newRecord.affiliate_url,
        referrer: newRecord.keyword || "",
        timestamp: newRecord.created_at
      })
    ).catch((err) => {
      console.warn("Could not persist affiliate click to Supabase:", err);
    });
  }

  return newRecord;
}

export function recordConversion(
  conv: Omit<ConversionRecord, "id" | "created_at"> & { created_at?: string }
): ConversionRecord {
  // If click_id is provided, match product name and id from inMemoryClicks
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

  // Dual-layer: Persist asynchronously to Supabase cloud table if configured
  if (supabaseAdmin) {
    Promise.resolve(
      supabaseAdmin.from("affiliate_conversions").insert({
        id: newRecord.id,
        click_id: newRecord.click_id || null,
        order_id: newRecord.order_id,
        platform: newRecord.platform,
        product_id: newRecord.product_id || null,
        product_name: newRecord.product_name || null,
        amount: newRecord.amount,
        commission: newRecord.commission,
        currency: newRecord.currency || "USD",
        status: newRecord.status,
        created_at: newRecord.created_at
      })
    ).catch((err) => {
      console.warn("Could not persist affiliate conversion to Supabase:", err);
    });
  }

  return newRecord;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const platforms: Record<string, number> = {
    Amazon: 0,
    Rakuten: 0,
    "CunCute Store": 0,
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
    "Giá Trị Đơn Hàng ($)",
    "Hoa Hồng Nhận Được ($)",
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
      escapeCell(r.currency || "USD"),
      escapeCell(r.status)
    ].join(",")
  );

  return "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
}

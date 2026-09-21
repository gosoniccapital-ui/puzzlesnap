export interface AdminPuzzle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  plays: number;
  likes: number;
  difficulty: string;
  description: string;
  // E-Commerce Extensions (Sprint 6.2)
  voucherCode?: string;
  discountPercent?: number;
  productUrl?: string;
  productPriceOriginal?: string;
  productPriceSale?: string;
}

export interface AdminScore {
  id: string;
  puzzleSlug: string;
  playerName: string;
  pieceCount: number;
  elapsedSeconds: number;
  moves: number;
  createdAt: string;
}

export interface AdminClickRecord {
  id: string;
  product_id: string;
  product_name: string;
  platform: string;
  affiliate_url: string;
  keyword?: string;
  device_type?: string;
  created_at: string;
}

export interface AdminConversionRecord {
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

export interface AdminAnalyticsData {
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
  recentClicks: AdminClickRecord[];
  recentConversions: AdminConversionRecord[];
}

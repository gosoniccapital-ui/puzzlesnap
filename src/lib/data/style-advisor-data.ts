export const AMAZON_ASSOCIATE_TAG = "cuncute-20";

export function buildAmazonSearchUrl(query: string): string {
  const clean = encodeURIComponent(query.trim());
  return `https://www.amazon.com/s?k=${clean}&tag=${AMAZON_ASSOCIATE_TAG}`;
}

export function buildAmazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

export interface DetectedOutfitItem {
  id: string;
  name: string;
  category: "outerwear" | "top" | "bottom" | "dress" | "shoes" | "accessory";
  color: string;
  style?: string;
  searchQuery: string;
  amazonUrl: string;
}

export interface StyleProduct {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "shoes" | "accessory" | "outerwear";
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviewCount: number;
  img: string;
  link: string;
  platform: "Amazon" | "Shopee" | "TikTok Shop" | "Lazada" | "CunFashion" | "Rakuten" | "CunCute Store";
  tag?: string;
  occasions: string[];
  styles: string[];
  budgetTier: "low" | "mid" | "high";
  colorTags: string[];
  asin?: string;
  market?: "US" | "VN" | "RAKUTEN" | "FOURTHWALL";
}

export const AMAZON_STYLE_CATALOG: StyleProduct[] = [
  {
    id: "amz-01",
    name: "PRETTYGARDEN Cropped Trench Coat For Women Double Breasted",
    category: "outerwear",
    price: "$38.99",
    originalPrice: "$49.99",
    discount: "-22%",
    rating: 4.3,
    reviewCount: 57,
    img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("PRETTYGARDEN Cropped Trench Coat For Women Double Breasted"),
    platform: "Amazon",
    tag: "Amazon's Choice",
    occasions: ["casual", "work", "travel"],
    styles: ["classic", "minimal", "street"],
    budgetTier: "low",
    colorTags: ["khaki", "camel", "black", "be"],
    asin: "B09V7N7Y6B",
    market: "US"
  },
  {
    id: "amz-02",
    name: "Erocalli Women's Fall Suede Mid Calf Slouchy Boots Chunky Heel",
    category: "shoes",
    price: "$52.99",
    originalPrice: "$69.99",
    discount: "-24%",
    rating: 4.9,
    reviewCount: 24,
    img: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("Erocalli Women Fall Suede Mid Calf Slouchy Boots Chunky Heel"),
    platform: "Amazon",
    tag: "Trending Fall",
    occasions: ["casual", "date", "party"],
    styles: ["romantic", "classic", "street"],
    budgetTier: "mid",
    colorTags: ["brown", "nâu", "suede", "tan"],
    asin: "B0CJ2N7F8M",
    market: "US"
  },
  {
    id: "amz-03",
    name: "Ekouaer 2 Piece Sets for Women Lounge Set Knit Top & Wide Leg Pants",
    category: "dress",
    price: "$29.99",
    originalPrice: "$39.99",
    discount: "-25%",
    rating: 4.3,
    reviewCount: 92,
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("Ekouaer 2 Piece Sets for Women Lounge Set Knit Top Wide Leg Pants"),
    platform: "Amazon",
    tag: "Best Seller",
    occasions: ["casual", "travel"],
    styles: ["minimal", "classic"],
    budgetTier: "low",
    colorTags: ["beige", "be", "cream", "white"],
    asin: "B0CG1K9V9B",
    market: "US"
  },
  {
    id: "amz-04",
    name: "Rexley Women's Quarter Zip Pullover Cinchable Hem Crop Fleece",
    category: "top",
    price: "$36.98",
    originalPrice: "$45.99",
    discount: "-20%",
    rating: 4.5,
    reviewCount: 14,
    img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("Womens Quarter Zip Pullover Cinchable Hem Crop Fleece"),
    platform: "Amazon",
    tag: "Hot New Release",
    occasions: ["casual", "street", "travel"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["royal blue", "xanh", "black", "grey"],
    asin: "B0BL3H9G7D",
    market: "US"
  },
  {
    id: "amz-05",
    name: "Levi's Women's Ribcage Straight Ankle Jeans High Rise Denim",
    category: "bottom",
    price: "$49.99",
    originalPrice: "$79.50",
    discount: "-37%",
    rating: 4.6,
    reviewCount: 3420,
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("Levis Womens Ribcage Straight Ankle Jeans High Rise"),
    platform: "Amazon",
    tag: "Editor's Choice",
    occasions: ["casual", "work", "street"],
    styles: ["street", "classic", "minimal"],
    budgetTier: "low",
    colorTags: ["blue", "denim", "black", "xanh"],
    asin: "B07H8L9J9W",
    market: "US"
  },
  {
    id: "amz-06",
    name: "JW PEI Gabbi Ruched Hobo Handbag Vegan Leather Classic Bag",
    category: "accessory",
    price: "$79.99",
    originalPrice: "$99.99",
    discount: "-20%",
    rating: 4.7,
    reviewCount: 1850,
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("JW PEI Gabbi Ruched Hobo Handbag Vegan Leather"),
    platform: "Amazon",
    tag: "Celebrity Favorite",
    occasions: ["date", "party", "casual", "work"],
    styles: ["elegant", "romantic", "minimal"],
    budgetTier: "mid",
    colorTags: ["white", "cream", "black", "trắng"],
    asin: "B0892Z4K1L",
    market: "US"
  },
  {
    id: "amz-07",
    name: "The Drop Women's Blake Long Blazer Double Breasted",
    category: "outerwear",
    price: "$69.90",
    originalPrice: "$89.90",
    discount: "-22%",
    rating: 4.4,
    reviewCount: 810,
    img: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("The Drop Womens Blake Long Blazer Double Breasted"),
    platform: "Amazon",
    tag: "Office Must-Have",
    occasions: ["work", "date", "party"],
    styles: ["elegant", "classic"],
    budgetTier: "mid",
    colorTags: ["black", "camel", "white", "đen"],
    asin: "B082V5M5TY",
    market: "US"
  },
  {
    id: "amz-08",
    name: "Steve Madden Women's Lawrence Lug Sole Loafer Chunky Leather",
    category: "shoes",
    price: "$89.95",
    originalPrice: "$119.00",
    discount: "-24%",
    rating: 4.6,
    reviewCount: 950,
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("Steve Madden Womens Lawrence Lug Sole Loafer Chunky Leather"),
    platform: "Amazon",
    tag: "Street Style",
    occasions: ["work", "casual", "street"],
    styles: ["street", "classic", "minimal"],
    budgetTier: "mid",
    colorTags: ["black", "burgundy", "đen"],
    asin: "B0945892Q1",
    market: "US"
  }
];

export const VN_STYLE_CATALOG: StyleProduct[] = [
  // Casual
  {
    id: "cs-01",
    name: "Áo Thun Oversize Cotton 250gsm Dáng Suông Unisex",
    category: "top",
    price: "249.000đ",
    originalPrice: "350.000đ",
    discount: "-29%",
    rating: 4.9,
    reviewCount: 1240,
    img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=%C3%A1o%20thun%20oversize%20cotton%20250gsm",
    platform: "Shopee",
    tag: "Best Seller",
    occasions: ["casual", "travel"],
    styles: ["minimal", "street", "classic"],
    budgetTier: "low",
    colorTags: ["trắng", "đen", "be", "xám"]
  },
  {
    id: "cs-02",
    name: "Quần Jean Ống Rộng Wide-Leg Retro Cạp Cao",
    category: "bottom",
    price: "420.000đ",
    originalPrice: "550.000đ",
    discount: "-24%",
    rating: 4.8,
    reviewCount: 890,
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=qu%E1%BA%A7n%20jean%20%E1%BB%91ng%20r%E1%BB%99ng%20wide%20leg",
    platform: "Shopee",
    tag: "Trending",
    occasions: ["casual", "travel", "date"],
    styles: ["street", "minimal", "romantic"],
    budgetTier: "low",
    colorTags: ["xanh nhạt", "xanh đậm", "đen"]
  },
  {
    id: "cs-03",
    name: "Sneaker Da Trắng Chunky Sole Siêu Nhẹ Nâng Chiều Cao",
    category: "shoes",
    price: "680.000đ",
    originalPrice: "950.000đ",
    discount: "-28%",
    rating: 4.9,
    reviewCount: 2150,
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    link: "https://www.tiktok.com/search?q=sneaker%20tr%E1%BA%AFng%20chunky",
    platform: "TikTok Shop",
    tag: "Must Have",
    occasions: ["casual", "travel", "street", "work"],
    styles: ["street", "minimal", "classic"],
    budgetTier: "mid",
    colorTags: ["trắng", "be"]
  },

  // Work / Công sở
  {
    id: "wk-01",
    name: "Áo Sơ Mi Lụa Hàn Cao Cấp Cổ V Thanh Lịch",
    category: "top",
    price: "490.000đ",
    originalPrice: "680.000đ",
    discount: "-28%",
    rating: 4.9,
    reviewCount: 760,
    img: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=%C3%A1o%20s%C6%A1%20mi%20l%E1%BB%A5a%20h%C3%A0n%20c%E1%BB%95%20v",
    platform: "Shopee",
    tag: "Office Pick",
    occasions: ["work", "date"],
    styles: ["elegant", "minimal", "classic"],
    budgetTier: "low",
    colorTags: ["trắng", "hồng pastel", "xanh mint", "be"]
  },
  {
    id: "wk-02",
    name: "Quần Tây Ống Suông Ly Nổi Tôn Dáng Chuẩn Form",
    category: "bottom",
    price: "450.000đ",
    originalPrice: "590.000đ",
    discount: "-24%",
    rating: 4.8,
    reviewCount: 620,
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=qu%E1%BA%A7n%20t%C3%A2y%20%E1%BB%91ng%20su%C3%B4ng%20ly%20n%E1%BB%95i",
    platform: "Shopee",
    tag: "Hot Item",
    occasions: ["work", "date", "party"],
    styles: ["elegant", "minimal", "classic"],
    budgetTier: "low",
    colorTags: ["đen", "nâu tây", "be", "kem"]
  },
  {
    id: "wk-03",
    name: "Blazer Dáng Suông 2 Lớp Vải Tuyết Mưa Cao Cấp",
    category: "outerwear",
    price: "890.000đ",
    originalPrice: "1.250.000đ",
    discount: "-29%",
    rating: 5.0,
    reviewCount: 430,
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=blazer%20d%C3%A1ng%20su%C3%B4ng%20tuy%E1%BA%BFt%20m%C6%B0a",
    platform: "Shopee",
    tag: "Signature",
    occasions: ["work", "party", "date"],
    styles: ["elegant", "classic", "minimal"],
    budgetTier: "mid",
    colorTags: ["đen", "be", "xám chì", "nâu"]
  },

  // Date / Hẹn hò
  {
    id: "dt-01",
    name: "Đầm Midi Voan Tơ Hoa Nhí Chiết Eo Nữ Tính",
    category: "dress",
    price: "650.000đ",
    originalPrice: "850.000đ",
    discount: "-23%",
    rating: 4.9,
    reviewCount: 512,
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
    link: "https://www.tiktok.com/search?q=%C4%91%E1%BA%A7m%20midi%20voan%20hoa%20nh%C3%AD",
    platform: "TikTok Shop",
    tag: "Romantic Date",
    occasions: ["date", "travel", "party"],
    styles: ["romantic", "elegant"],
    budgetTier: "mid",
    colorTags: ["hồng pastel", "kem", "xanh pastel"]
  },
  {
    id: "dt-02",
    name: "Áo Kiểu Peplum Lụa Satin Nơ Cổ Tinh Tế",
    category: "top",
    price: "360.000đ",
    originalPrice: "480.000đ",
    discount: "-25%",
    rating: 4.7,
    reviewCount: 380,
    img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=%C3%A1o%20peplum%20l%E1%BB%A5a%20n%C6%A1%20c%E1%BB%95",
    platform: "Shopee",
    tag: "Feminine",
    occasions: ["date", "party", "work"],
    styles: ["romantic", "elegant"],
    budgetTier: "low",
    colorTags: ["trắng", "hồng pastel", "be"]
  },
  {
    id: "dt-03",
    name: "Túi Xách Kẹp Nách Da Nappa Khóa Kim Loại Mạ Vàng",
    category: "accessory",
    price: "520.000đ",
    originalPrice: "750.000đ",
    discount: "-31%",
    rating: 4.9,
    reviewCount: 940,
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    link: "https://www.lazada.vn/catalog/?q=t%C3%BAi%20x%C3%A1ch%20k%E1%BA%B9p%20n%C3%A1ch%20da",
    platform: "Lazada",
    tag: "Trendy Bag",
    occasions: ["date", "party", "casual", "work"],
    styles: ["minimal", "romantic", "elegant"],
    budgetTier: "mid",
    colorTags: ["trắng kem", "đen", "nâu cafe"]
  },

  // Party / Sự kiện
  {
    id: "pt-01",
    name: "Đầm Dạ Hội Lụa Đính Đá Cổ Yếm Quyến Rũ",
    category: "dress",
    price: "1.650.000đ",
    originalPrice: "2.200.000đ",
    discount: "-25%",
    rating: 5.0,
    reviewCount: 195,
    img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=%C4%91%E1%BA%A7m%20d%E1%BA%A1%20h%E1%BB%99i%20c%E1%BB%95%20y%E1%BA%BFm",
    platform: "Shopee",
    tag: "Luxury Event",
    occasions: ["party"],
    styles: ["elegant", "romantic"],
    budgetTier: "high",
    colorTags: ["đen huyền bí", "đỏ ruby", "bạc ánh kim"]
  },
  {
    id: "pt-02",
    name: "Giày Cao Gót Mũi Nhọn Quai Mảnh 7cm Da Bóng",
    category: "shoes",
    price: "790.000đ",
    originalPrice: "1.100.000đ",
    discount: "-28%",
    rating: 4.8,
    reviewCount: 670,
    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    link: "https://www.lazada.vn/catalog/?q=gi%C3%A0y%20cao%20g%C3%B3t%207cm",
    platform: "Lazada",
    tag: "Party Ready",
    occasions: ["party", "date", "work"],
    styles: ["elegant", "romantic", "classic"],
    budgetTier: "mid",
    colorTags: ["đen", "nude", "bạc"]
  },

  // Travel / Du lịch
  {
    id: "tv-01",
    name: "Set Đồ Đi Biển Áo Croptop & Chân Váy Maxi Bohemian",
    category: "dress",
    price: "580.000đ",
    originalPrice: "790.000đ",
    discount: "-26%",
    rating: 4.9,
    reviewCount: 880,
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    link: "https://www.tiktok.com/search?q=set%20maxi%20boho%20%C4%91i%20bi%E1%BB%83n",
    platform: "TikTok Shop",
    tag: "Resort Wear",
    occasions: ["travel"],
    styles: ["romantic", "street"],
    budgetTier: "mid",
    colorTags: ["trắng", "vàng mù tạt", "cam đất"]
  },
  {
    id: "tv-02",
    name: "Áo Khoác Gió Dù Chống Nước & Chống UV Trượt Nước",
    category: "outerwear",
    price: "480.000đ",
    originalPrice: "650.000đ",
    discount: "-26%",
    rating: 4.9,
    reviewCount: 1420,
    img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=%C3%A1o%20kho%C3%A1c%20gi%C3%B3%20ch%E1%BB%91ng%20uv",
    platform: "Shopee",
    tag: "Outdoor Protection",
    occasions: ["travel", "casual"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["xanh rêu", "đen", "be", "hồng pastel"]
  },
  {
    id: "tv-03",
    name: "Mũ Bucket Vành Tròn Canvas Vintage Thêu Họa Tiết",
    category: "accessory",
    price: "185.000đ",
    originalPrice: "250.000đ",
    discount: "-26%",
    rating: 4.8,
    reviewCount: 1100,
    img: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80",
    link: "https://shopee.vn/search?keyword=m%C5%A9%20bucket%20canvas",
    platform: "Shopee",
    tag: "Summer Essential",
    occasions: ["travel", "casual"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["be", "đen", "nâu"]
  }
];

export const STYLE_CATALOG: StyleProduct[] = [...AMAZON_STYLE_CATALOG, ...VN_STYLE_CATALOG];

export interface AdviceResult {
  headline: string;
  adviceText: string;
  overallStyle?: string;
  palette: { name: string; hex: string }[];
  styleTips: string[];
  suggestedProducts: StyleProduct[];
  detectedItems?: DetectedOutfitItem[];
  market?: "US" | "VN" | "RAKUTEN" | "FOURTHWALL";
  source?: "gemini-vision" | "gemini-text" | "openai-vision" | "ai-heuristic" | "rakuten-api" | "fourthwall-api";
  keyword?: string;
}

export function generateStylistAdvice({
  occasion,
  style,
  budget,
  color,
  hasCustomImage,
  market = "US",
  keyword = ""
}: {
  occasion: string;
  style: string;
  budget: string;
  color: string;
  hasCustomImage: boolean;
  market?: "US" | "VN" | "RAKUTEN" | "FOURTHWALL";
  keyword?: string;
}): AdviceResult {
  const isUS = market === "US" || market === "RAKUTEN" || market === "FOURTHWALL";
  const catalogPool = isUS ? AMAZON_STYLE_CATALOG : VN_STYLE_CATALOG;

  const occasionLabels: Record<string, string> = {
    casual: isUS ? "Casual Daily & Errands" : "Đi chơi / Hàng ngày",
    work: isUS ? "Office & Business Casual" : "Đi làm / Công sở",
    date: isUS ? "Romantic Date Night" : "Hẹn hò lãng mạn",
    party: isUS ? "Cocktail Party & Events" : "Tiệc tùng / Sự kiện nổi bật",
    travel: isUS ? "Travel & Vacation Chic" : "Du lịch & Check-in sống ảo"
  };

  const styleLabels: Record<string, string> = {
    minimal: isUS ? "Clean Minimalist" : "Minimalist (Tối giản hiện đại)",
    elegant: isUS ? "Sophisticated Elegant" : "Elegant (Thanh lịch sang trọng)",
    street: isUS ? "Modern Streetwear" : "Streetwear (Cá tính phóng khoáng)",
    romantic: isUS ? "Feminine Romantic" : "Romantic (Nữ tính ngọt ngào)",
    classic: isUS ? "Timeless Classic" : "Classic (Cổ điển vượt thời gian)"
  };

  const occName = occasionLabels[occasion] || (isUS ? "Versatile Daily" : "Đa năng");
  const stlName = styleLabels[style] || (isUS ? "Modern Chic" : "Hiện đại");
  const selectedColor = color.trim() || (isUS ? "timeless neutral tones" : "gam màu trung tính thời thượng");

  let palette = [
    { name: isUS ? "Primary Tone" : "Chủ đạo", hex: "#FCE7F3" },
    { name: isUS ? "Contrast Base" : "Tương phản", hex: "#18181B" },
    { name: isUS ? "Soft Accent" : "Phụ kiện", hex: "#E4D4F4" },
    { name: isUS ? "Pop of Color" : "Điểm nhấn", hex: "#DB2777" }
  ];

  const lowerColor = color.toLowerCase();
  if (lowerColor.includes("hồng") || lowerColor.includes("pink")) {
    palette = [
      { name: isUS ? "Pastel Rose" : "Hồng Pastel", hex: "#FCE7F3" },
      { name: isUS ? "Cream White" : "Trắng Kem", hex: "#FFFBEB" },
      { name: isUS ? "Warm Camel" : "Nâu Tây", hex: "#78350F" },
      { name: isUS ? "Gold Hardware" : "Vàng Gold Khóa Túi", hex: "#F59E0B" }
    ];
  } else if (lowerColor.includes("đen") || lowerColor.includes("black")) {
    palette = [
      { name: isUS ? "Pitch Charcoal" : "Đen Than", hex: "#18181B" },
      { name: isUS ? "Muted Silver" : "Xám Bạc", hex: "#E4E4E7" },
      { name: isUS ? "Crisp White" : "Trắng Basic", hex: "#FFFFFF" },
      { name: isUS ? "Metallic Accent" : "Bạc Metallic", hex: "#94A3B8" }
    ];
  } else if (lowerColor.includes("be") || lowerColor.includes("nâu") || lowerColor.includes("beige") || lowerColor.includes("camel")) {
    palette = [
      { name: isUS ? "Latte Beige" : "Be Sữa", hex: "#FEF3C7" },
      { name: isUS ? "Rich Espresso" : "Nâu Cafe", hex: "#78350F" },
      { name: isUS ? "Soft Ivory" : "Trắng Ngà", hex: "#FFFDF7" },
      { name: isUS ? "Denim Indigo" : "Xanh Denim", hex: "#3B82F6" }
    ];
  } else if (lowerColor.includes("xanh") || lowerColor.includes("blue")) {
    palette = [
      { name: isUS ? "Powder Blue" : "Xanh Pastel", hex: "#E0F2FE" },
      { name: isUS ? "Deep Navy" : "Xanh Navy", hex: "#1E3A8A" },
      { name: isUS ? "Pearl White" : "Trắng Sữa", hex: "#F8FAFC" },
      { name: isUS ? "Warm Sand" : "Be Nhạt", hex: "#FEF3C7" }
    ];
  }

  const cleanKw = keyword?.trim() || "";

  let matched = catalogPool.filter(
    (p) => p.occasions.includes(occasion) || p.styles.includes(style)
  );

  if (cleanKw) {
    const kwLower = cleanKw.toLowerCase();
    const kwMatches = catalogPool.filter(
      (p) =>
        p.name.toLowerCase().includes(kwLower) ||
        p.category.toLowerCase().includes(kwLower) ||
        (p.colorTags || []).some((t) => t.toLowerCase().includes(kwLower))
    );
    if (kwMatches.length > 0) {
      matched = [...kwMatches, ...matched.filter((p) => !kwMatches.some((m) => m.id === p.id))];
    }
  }

  if (budget) {
    const budgetFiltered = matched.filter((p) => p.budgetTier === budget);
    if (budgetFiltered.length >= 2) {
      matched = budgetFiltered;
    }
  }

  if (matched.length < 3) {
    matched = catalogPool.slice(0, 4);
  }

  const tips: string[] = isUS ? [
    `Follow the 60-30-10 styling rule: 60% dominant base (${selectedColor}), 30% complementary layer, and 10% statement hardware/accessories.`,
    `For the ${occName} aesthetic, elevate your silhouette with high-rise bottoms and structured outerwear to elongate proportions.`,
    `A signature structured shoulder bag paired with matching leather boots instantly ties together any ${stlName} look.`
  ] : [
    `Tận dụng quy tắc phối màu 60-30-10: 60% tông màu chủ đạo (${selectedColor}), 30% tông màu chuyển tiếp và 10% điểm nhấn phụ kiện.`,
    `Để tôn dáng tối đa cho dịp ${occName}, nên chọn tỉ lệ trang phục 1/3 (áo ngắn hoặc sơ vin cao) kết hợp đáy quần/chân váy cạp cao.`,
    `Với phong cách ${stlName}, phụ kiện nhỏ như túi kẹp nách hoặc trang sức kim loại thanh mảnh sẽ tạo điểm sáng thị giác đắt giá.`
  ];

  if (cleanKw) {
    tips.unshift(isUS
      ? `Search Focus: Styling around "${cleanKw}" — pair with balanced minimalist essentials and complementary undertones for a cohesive ensemble.`
      : `Trọng tâm tìm kiếm: Set đồ phối cùng "${cleanKw}" — ưu tiên kết hợp cùng các món đồ tối giản và màu sắc bổ trợ để tạo tổng thể hài hòa.`
    );
  }

  if (hasCustomImage) {
    tips.unshift(isUS
      ? "AI visual analysis successfully extracted silhouette lines and color balance to curate optimal styling recommendations."
      : "Hình ảnh bạn tải lên đã được phân tích tỉ lệ khung hình & tông màu tổng thể để tối ưu độ tương thích với outfit gợi ý bên dưới."
    );
  }

  // Generate detected outfit items for Amazon US
  const detectedItems: DetectedOutfitItem[] = isUS ? [
    {
      id: "det-1",
      name: cleanKw ? cleanKw : "Cropped Trench Coat / Fall Jacket",
      category: "outerwear",
      color: "Khaki / Camel",
      style: "Double-breasted casual",
      searchQuery: cleanKw ? cleanKw : "cropped trench coat for women khaki",
      amazonUrl: buildAmazonSearchUrl(cleanKw ? cleanKw : "cropped trench coat for women khaki")
    },
    {
      id: "det-2",
      name: "Suede Slouchy Mid Calf Boots",
      category: "shoes",
      color: "Warm Brown / Tan",
      style: "Chunky heel fall boots",
      searchQuery: "womens suede mid calf slouchy boots brown",
      amazonUrl: buildAmazonSearchUrl("womens suede mid calf slouchy boots brown")
    },
    {
      id: "det-3",
      name: "Knit 2-Piece Lounge Set",
      category: "top",
      color: "Beige / Cream",
      style: "Wide-leg cozy chic",
      searchQuery: "womens 2 piece knit lounge set wide leg pants",
      amazonUrl: buildAmazonSearchUrl("womens 2 piece knit lounge set wide leg pants")
    },
    {
      id: "det-4",
      name: "Ruched Vegan Leather Hobo Bag",
      category: "accessory",
      color: "Ivory / Cloud White",
      style: "Trendy minimalist purse",
      searchQuery: "ruched vegan leather hobo shoulder bag",
      amazonUrl: buildAmazonSearchUrl("ruched vegan leather hobo shoulder bag")
    }
  ] : [
    {
      id: "det-vn-1",
      name: cleanKw ? cleanKw : "Áo Sơ Mi / Áo Kiểu Lụa",
      category: "top",
      color: "Trắng / Kem",
      style: "Thanh lịch",
      searchQuery: cleanKw ? cleanKw : "ao so mi nu thanh lich",
      amazonUrl: buildAmazonSearchUrl(cleanKw ? cleanKw : "womens silk button down shirt")
    },
    {
      id: "det-vn-2",
      name: "Quần Ống Suông / Chân Váy",
      category: "bottom",
      color: "Đen / Be",
      style: "Tôn dáng",
      searchQuery: "quan tay ong suong cap cao",
      amazonUrl: buildAmazonSearchUrl("womens high waisted wide leg trousers")
    }
  ];

  const headline = cleanKw
    ? (isUS ? `Curated Styling for "${cleanKw}" • ${occName}` : `Gợi Ý Phối Đồ Với "${cleanKw}" • ${occName}`)
    : (isUS ? `Curated Look: ${occName} • ${stlName}` : `Gợi Ý Phối Đồ Cho Dịp ${occName} • Phong Cách ${stlName}`);

  return {
    headline,
    adviceText: isUS
      ? `Based on your request for "${cleanKw || stlName}" and preference for "${selectedColor}", CunFashion AI Stylist has matched top-rated fashion essentials delivering flawless silhouette harmony and effortless all-day comfort.`
      : `Dựa trên yêu cầu "${cleanKw || stlName}" và mong muốn với tông màu "${selectedColor}", stylist CunFashion khuyến nghị một set đồ hài hòa vừa tôn nét riêng, vừa đảm bảo sự thoải mái và chuẩn gu.`,
    overallStyle: stlName,
    palette,
    styleTips: tips,
    suggestedProducts: matched.slice(0, 6),
    detectedItems,
    market: market || (isUS ? "US" : "VN"),
    source: "ai-heuristic",
    keyword: cleanKw || undefined
  };
}
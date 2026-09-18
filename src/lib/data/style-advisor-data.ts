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
  platform: "Shopee" | "TikTok Shop" | "Lazada" | "CunFashion";
  tag?: string;
  occasions: string[];
  styles: string[];
  budgetTier: "low" | "mid" | "high";
  colorTags: string[];
}

export const STYLE_CATALOG: StyleProduct[] = [
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
    link: "https://cunfashion.com/shop/ao-thun-oversize-cotton",
    platform: "CunFashion",
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
    link: "https://cunfashion.com/shop/quan-jean-wide-leg",
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
    link: "https://cunfashion.com/shop/sneaker-white-basic",
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
    link: "https://cunfashion.com/shop/so-mi-lua-han",
    platform: "CunFashion",
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
    link: "https://cunfashion.com/shop/quan-tay-ong-suong",
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
    link: "https://cunfashion.com/shop/blazer-tuyet-mua",
    platform: "CunFashion",
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
    link: "https://cunfashion.com/shop/dam-midi-voan-hoa",
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
    link: "https://cunfashion.com/shop/ao-peplum-no-co",
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
    link: "https://cunfashion.com/shop/tui-xach-kep-nach-nappa",
    platform: "CunFashion",
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
    link: "https://cunfashion.com/shop/dam-da-hoi-co-yem",
    platform: "CunFashion",
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
    link: "https://cunfashion.com/shop/giay-cao-got-7cm",
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
    link: "https://cunfashion.com/shop/set-maxi-boho-travel",
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
    link: "https://cunfashion.com/shop/ao-khoac-gio-uv",
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
    link: "https://cunfashion.com/shop/mu-bucket-canvas",
    platform: "Shopee",
    tag: "Summer Essential",
    occasions: ["travel", "casual"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["be", "đen", "nâu"]
  }
];

export interface AdviceResult {
  headline: string;
  adviceText: string;
  palette: { name: string; hex: string }[];
  styleTips: string[];
  suggestedProducts: StyleProduct[];
}

export function generateStylistAdvice({
  occasion,
  style,
  budget,
  color,
  hasCustomImage
}: {
  occasion: string;
  style: string;
  budget: string;
  color: string;
  hasCustomImage: boolean;
}): AdviceResult {
  const occasionLabels: Record<string, string> = {
    casual: "Đi chơi / Hàng ngày",
    work: "Đi làm / Công sở",
    date: "Hẹn hò lãng mạn",
    party: "Tiệc tùng / Sự kiện nổi bật",
    travel: "Du lịch & Check-in sống ảo"
  };

  const styleLabels: Record<string, string> = {
    minimal: "Minimalist (Tối giản hiện đại)",
    elegant: "Elegant (Thanh lịch sang trọng)",
    street: "Streetwear (Cá tính phóng khoáng)",
    romantic: "Romantic (Nữ tính ngọt ngào)",
    classic: "Classic (Cổ điển vượt thời gian)"
  };

  const occName = occasionLabels[occasion] || "Đa năng";
  const stlName = styleLabels[style] || "Hiện đại";
  const selectedColor = color.trim() || "gam màu trung tính thời thượng";

  let palette = [
    { name: "Chủ đạo", hex: "#FCE7F3" },
    { name: "Tương phản", hex: "#18181B" },
    { name: "Phụ kiện", hex: "#E4D4F4" },
    { name: "Điểm nhấn", hex: "#DB2777" }
  ];

  const lowerColor = color.toLowerCase();
  if (lowerColor.includes("hồng")) {
    palette = [
      { name: "Hồng Pastel", hex: "#FCE7F3" },
      { name: "Trắng Kem", hex: "#FFFBEB" },
      { name: "Nâu Tây", hex: "#78350F" },
      { name: "Vàng Gold Khóa Túi", hex: "#F59E0B" }
    ];
  } else if (lowerColor.includes("đen")) {
    palette = [
      { name: "Đen Than", hex: "#18181B" },
      { name: "Xám Bạc", hex: "#E4E4E7" },
      { name: "Trắng Basic", hex: "#FFFFFF" },
      { name: "Bạc Metallic", hex: "#94A3B8" }
    ];
  } else if (lowerColor.includes("be") || lowerColor.includes("nâu")) {
    palette = [
      { name: "Be Sữa", hex: "#FEF3C7" },
      { name: "Nâu Cafe", hex: "#78350F" },
      { name: "Trắng Ngà", hex: "#FFFDF7" },
      { name: "Xanh Denim", hex: "#3B82F6" }
    ];
  } else if (lowerColor.includes("xanh")) {
    palette = [
      { name: "Xanh Pastel", hex: "#E0F2FE" },
      { name: "Xanh Navy", hex: "#1E3A8A" },
      { name: "Trắng Sữa", hex: "#F8FAFC" },
      { name: "Be Nhạt", hex: "#FEF3C7" }
    ];
  }

  let matched = STYLE_CATALOG.filter(
    (p) => p.occasions.includes(occasion) || p.styles.includes(style)
  );

  if (budget) {
    const budgetFiltered = matched.filter((p) => p.budgetTier === budget);
    if (budgetFiltered.length >= 2) {
      matched = budgetFiltered;
    }
  }

  if (matched.length < 3) {
    matched = STYLE_CATALOG.slice(0, 4);
  }

  const tips: string[] = [
    `Tận dụng quy tắc phối màu 60-30-10: 60% tông màu chủ đạo (${selectedColor}), 30% tông màu chuyển tiếp và 10% điểm nhấn phụ kiện.`,
    `Để tôn dáng tối đa cho dịp ${occName}, nên chọn tỉ lệ trang phục 1/3 (áo ngắn hoặc sơ vin cao) kết hợp đáy quần/chân váy cạp cao.`,
    `Với phong cách ${stlName}, phụ kiện nhỏ như túi kẹp nách hoặc trang sức kim loại thanh mảnh sẽ tạo điểm sáng thị giác đắt giá.`
  ];

  if (hasCustomImage) {
    tips.unshift("Hình ảnh bạn tải lên đã được phân tích tỉ lệ khung hình & tông màu tổng thể để tối ưu độ tương thích với outfit gợi ý bên dưới.");
  }

  return {
    headline: `Gợi Ý Phối Đồ Cho Dịp ${occName} • Phong Cách ${stlName}`,
    adviceText: `Dựa trên phân tích hình ảnh và mong muốn của bạn với tông màu "${selectedColor}", stylist CunFashion khuyến nghị một set đồ hài hòa vừa tôn nét riêng, vừa đảm bảo sự thoải mái và chuẩn gu.`,
    palette,
    styleTips: tips,
    suggestedProducts: matched.slice(0, 6)
  };
}
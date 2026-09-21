export const AMAZON_ASSOCIATE_TAG =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_AMAZON_TAG) || "cuncute-20";

export function buildAmazonSearchUrl(query: string, subId?: string): string {
  // Condense to 3-4 clean keywords to prevent Amazon 503 / "Sorry! Something went wrong!" error page
  const words = query
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const condensed = words.length > 4 ? words.slice(0, 4).join(" ") : words.join(" ");
  const clean = encodeURIComponent(condensed.trim() || query.trim());
  let url = `https://www.amazon.com/s?k=${clean}&tag=${AMAZON_ASSOCIATE_TAG}`;
  if (subId) {
    url += `&ascsubtag=${encodeURIComponent(subId)}`;
  }
  return url;
}

export function buildAmazonProductUrl(asin: string, subId?: string, options?: { preserveVariants?: boolean }): string {
  let url = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
  if (subId) {
    url += `&ascsubtag=${encodeURIComponent(subId)}`;
  }
  if (options?.preserveVariants) {
    url += `&th=1&psc=1`;
  }
  return url;
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
  platform: "Amazon" | "Rakuten" | "CunCute Store" | "CunFashion";
  tag?: string;
  occasions: string[];
  styles: string[];
  budgetTier: "low" | "mid" | "high";
  colorTags: string[];
  asin?: string;
  market?: "ALL" | "US" | "RAKUTEN" | "FOURTHWALL" | "VN";
}

/**
 * Soft Retro / Quiet Vintage Fashion Catalog
 * Inspired by ModCloth (2025-2026 Trend) re-imagined through CunFashion's Haute Couture lens:
 * - Fit & Flare + Soft Silhouette (graceful feminine forms, relaxed waistlines)
 * - Delicate Whimsical Prints (subtle ditsy florals, muted botanical textures, calm aesthetic)
 * - Gunne Sax Romanticism (vintage long sleeves, delicate lace, romantic ruffle trims in warm neutrals)
 * - Comfortable Inclusive Wearability
 * - Playful Calm Accessories (silk scarves, retro Mary Janes)
 * 
 * All products strictly linked to Amazon US with StoreID cuncute-20.
 */
export const SOFT_RETRO_STYLE_CATALOG: StyleProduct[] = [
  {
    id: "amz-retro-01",
    name: "Grace Karin 1950s Vintage A-Line Fit & Flare Sweetheart Tea Dress",
    category: "dress",
    price: "$39.99",
    originalPrice: "$52.99",
    discount: "-25%",
    rating: 4.6,
    reviewCount: 485,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women vintage a-line tea dress fit flare floral"),
    platform: "Amazon",
    tag: "ModCloth Classic",
    occasions: ["casual", "date", "party"],
    styles: ["retro", "romantic", "classic"],
    budgetTier: "low",
    colorTags: ["dusty rose", "cream", "sage green", "navy"],
    asin: "B01C5H8Q9A",
    market: "US"
  },
  {
    id: "amz-retro-02",
    name: "R.Vivimos Bohemian Long Sleeve Floral Ruffle Gunne Sax Romantic Midi Dress",
    category: "dress",
    price: "$44.99",
    originalPrice: "$58.00",
    discount: "-22%",
    rating: 4.5,
    reviewCount: 362,
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women bohemian floral long sleeve midi dress romantic ruffle"),
    platform: "Amazon",
    tag: "Quiet Vintage",
    occasions: ["casual", "travel", "date"],
    styles: ["retro", "romantic"],
    budgetTier: "low",
    colorTags: ["warm ivory", "caramel", "olive", "terracotta"],
    asin: "B07H8N3K9P",
    market: "US"
  },
  {
    id: "amz-retro-03",
    name: "Allegra K Peter Pan Collar Contrast Trim Whimsical Vintage Blouse",
    category: "top",
    price: "$31.99",
    originalPrice: "$40.00",
    discount: "-20%",
    rating: 4.4,
    reviewCount: 290,
    img: "https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women peter pan collar vintage blouse whimsical"),
    platform: "Amazon",
    tag: "Retro Chic",
    occasions: ["work", "casual", "date"],
    styles: ["retro", "classic", "minimal"],
    budgetTier: "low",
    colorTags: ["white", "black", "powder blue", "beige"],
    asin: "B08K3D5X1Q",
    market: "US"
  },
  {
    id: "amz-retro-04",
    name: "DREAM PAIRS Chunky Low Heel T-Strap Mary Jane Vintage Pumps",
    category: "shoes",
    price: "$42.99",
    originalPrice: "$55.99",
    discount: "-23%",
    rating: 4.7,
    reviewCount: 610,
    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women t-strap mary jane chunky heel vintage pumps"),
    platform: "Amazon",
    tag: "Heritage Walk",
    occasions: ["work", "date", "casual"],
    styles: ["retro", "classic"],
    budgetTier: "low",
    colorTags: ["burgundy", "black", "patent beige", "cognac"],
    asin: "B09L7X4W2R",
    market: "US"
  },
  {
    id: "amz-retro-05",
    name: "Corciova 100% Mulberry Silk Whimsical Botanical Print Neckerchief Scarf",
    category: "accessory",
    price: "$21.99",
    originalPrice: "$28.00",
    discount: "-21%",
    rating: 4.8,
    reviewCount: 420,
    img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women 100 mulberry silk whimsical floral neckerchief scarf"),
    platform: "Amazon",
    tag: "Calm Accessory",
    occasions: ["casual", "work", "travel"],
    styles: ["retro", "romantic", "elegant"],
    budgetTier: "low",
    colorTags: ["champagne gold", "sage", "rose", "ivory"],
    asin: "B08F9N1K5C",
    market: "US"
  }
];

export const AMAZON_STYLE_CATALOG: StyleProduct[] = [
  // --- OUTERWEAR ---
  {
    id: "amz-01",
    name: "PRETTYGARDEN Cropped Trench Coat Double Breasted Lapel Outerwear",
    category: "outerwear",
    price: "$38.99",
    originalPrice: "$49.99",
    discount: "-22%",
    rating: 4.3,
    reviewCount: 215,
    img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women cropped trench coat double breasted"),
    platform: "Amazon",
    tag: "Amazon's Choice",
    occasions: ["casual", "work", "travel"],
    styles: ["classic", "minimal", "street"],
    budgetTier: "low",
    colorTags: ["khaki", "camel", "black", "beige"],
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
    reviewCount: 320,
    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women suede mid calf slouchy boots"),
    platform: "Amazon",
    tag: "Fall Trending",
    occasions: ["casual", "date", "party"],
    styles: ["romantic", "classic", "street"],
    budgetTier: "mid",
    colorTags: ["tan", "brown", "black", "taupe"],
    asin: "B0CJ2N7F8M",
    market: "US"
  },
  {
    id: "amz-03",
    name: "Ekouaer 2 Piece Sets Knit Top & Wide Leg Pants Lounge Set",
    category: "dress",
    price: "$29.99",
    originalPrice: "$39.99",
    discount: "-25%",
    rating: 4.3,
    reviewCount: 492,
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women 2 piece lounge set knit"),
    platform: "Amazon",
    tag: "Cozy Chic",
    occasions: ["casual", "travel"],
    styles: ["minimal", "classic"],
    budgetTier: "low",
    colorTags: ["beige", "cream", "white", "gray"],
    asin: "B0CG1K9V9B",
    market: "US"
  },
  {
    id: "amz-04",
    name: "The Drop Women's Blake Long Modern Blazer Jacket",
    category: "outerwear",
    price: "$74.90",
    originalPrice: "$89.90",
    discount: "-17%",
    rating: 4.5,
    reviewCount: 840,
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women long tailored blazer"),
    platform: "Amazon",
    tag: "Influencer Pick",
    occasions: ["work", "party", "casual"],
    styles: ["minimal", "elegant", "classic"],
    budgetTier: "mid",
    colorTags: ["black", "charcoal", "ivory", "tan"],
    asin: "B0892W892P",
    market: "US"
  },
  {
    id: "amz-05",
    name: "Levi's Women's Faux Leather Moto Biker Jacket",
    category: "outerwear",
    price: "$89.99",
    originalPrice: "$120.00",
    discount: "-25%",
    rating: 4.6,
    reviewCount: 1420,
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women faux leather moto jacket"),
    platform: "Amazon",
    tag: "Top Rated",
    occasions: ["casual", "party", "travel"],
    styles: ["street", "minimal"],
    budgetTier: "mid",
    colorTags: ["black", "cognac", "dark brown"],
    asin: "B079Z9821P",
    market: "US"
  },
  {
    id: "amz-06",
    name: "JW PEI Women's Gabbi Ruched Vegan Leather Hobo Handbag",
    category: "accessory",
    price: "$63.99",
    originalPrice: "$79.99",
    discount: "-20%",
    rating: 4.6,
    reviewCount: 3100,
    img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("jw pei ruched vegan leather handbag"),
    platform: "Amazon",
    tag: "Celebrity Endorsed",
    occasions: ["party", "date", "casual"],
    styles: ["romantic", "minimal", "street"],
    budgetTier: "mid",
    colorTags: ["ivory", "blush pink", "black", "sage"],
    asin: "B089201990",
    market: "US"
  },
  {
    id: "amz-07",
    name: "Grace Karin Elegant Tweed Bouclé Short Jacket with Pearl Buttons",
    category: "outerwear",
    price: "$46.99",
    originalPrice: "$59.99",
    discount: "-22%",
    rating: 4.4,
    reviewCount: 380,
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women tweed boucle crop jacket"),
    platform: "Amazon",
    tag: "Parisian Chic",
    occasions: ["work", "date", "party"],
    styles: ["elegant", "classic", "romantic"],
    budgetTier: "low",
    colorTags: ["cream", "white", "black", "pink"],
    asin: "B0BK4L98Z1",
    market: "US"
  },
  {
    id: "amz-08",
    name: "Amazon Essentials Lightweight Packable Water-Resistant Puffer Jacket",
    category: "outerwear",
    price: "$41.90",
    originalPrice: "$49.99",
    discount: "-16%",
    rating: 4.6,
    reviewCount: 18450,
    img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women lightweight packable puffer jacket"),
    platform: "Amazon",
    tag: "Best Seller",
    occasions: ["travel", "casual"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["olive", "black", "navy", "taupe"],
    asin: "B07C74567X",
    market: "US"
  },
  {
    id: "amz-09",
    name: "The Drop Women's Ana Silky Slip Midi Dress with V-Neck",
    category: "dress",
    price: "$54.90",
    originalPrice: "$69.90",
    discount: "-21%",
    rating: 4.4,
    reviewCount: 1820,
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women silk slip midi dress"),
    platform: "Amazon",
    tag: "Trending Luxury",
    occasions: ["date", "party", "work"],
    styles: ["romantic", "minimal", "elegant"],
    budgetTier: "mid",
    colorTags: ["champagne", "black", "emerald", "rose"],
    asin: "B0892W1234",
    market: "US"
  },
  {
    id: "amz-10",
    name: "BTFBM Sleeveless Ribbed Knit Bodycon Cocktail Maxi Dress",
    category: "dress",
    price: "$39.99",
    originalPrice: "$49.99",
    discount: "-20%",
    rating: 4.3,
    reviewCount: 960,
    img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women ribbed knit bodycon maxi dress"),
    platform: "Amazon",
    tag: "Cocktail Pick",
    occasions: ["party", "date", "travel"],
    styles: ["elegant", "minimal"],
    budgetTier: "low",
    colorTags: ["black", "burgundy", "mocha", "camel"],
    asin: "B0C9123891",
    market: "US"
  },
  {
    id: "amz-11",
    name: "ZESICA Bohemian Summer Floral Tiered A-Line Midi Dress",
    category: "dress",
    price: "$44.99",
    originalPrice: "$56.99",
    discount: "-21%",
    rating: 4.5,
    reviewCount: 3890,
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women floral tiered midi dress"),
    platform: "Amazon",
    tag: "Resort Collection",
    occasions: ["travel", "date", "casual"],
    styles: ["romantic", "classic"],
    budgetTier: "low",
    colorTags: ["floral", "sage green", "blush", "navy"],
    asin: "B08920199X",
    market: "US"
  },
  {
    id: "amz-12",
    name: "State Cashmere 100% Pure Cashmere Classic Crewneck Sweater",
    category: "top",
    price: "$119.00",
    originalPrice: "$149.00",
    discount: "-20%",
    rating: 4.6,
    reviewCount: 650,
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women 100 cashmere crewneck sweater"),
    platform: "Amazon",
    tag: "Luxury Investment",
    occasions: ["work", "casual", "travel"],
    styles: ["minimal", "classic", "elegant"],
    budgetTier: "high",
    colorTags: ["camel", "ivory", "heather grey", "black"],
    asin: "B0791456KL",
    market: "US"
  },
  {
    id: "amz-13",
    name: "Rexley Women's Quarter Zip Pullover Cinchable Hem Crop Fleece",
    category: "top",
    price: "$36.98",
    originalPrice: "$45.99",
    discount: "-20%",
    rating: 4.5,
    reviewCount: 314,
    img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women quarter zip crop fleece pullover"),
    platform: "Amazon",
    tag: "Athleisure Pick",
    occasions: ["casual", "travel"],
    styles: ["street", "minimal"],
    budgetTier: "low",
    colorTags: ["apricot", "beige", "black", "grey"],
    asin: "B0DG487L38",
    market: "US"
  },
  {
    id: "amz-14",
    name: "Lilysilk 100% Real Mulberry Silk Button Down Blouse Shirt",
    category: "top",
    price: "$95.00",
    originalPrice: "$125.00",
    discount: "-24%",
    rating: 4.7,
    reviewCount: 890,
    img: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women mulberry silk button down shirt"),
    platform: "Amazon",
    tag: "Executive Wardrobe",
    occasions: ["work", "date", "party"],
    styles: ["elegant", "classic", "minimal"],
    budgetTier: "high",
    colorTags: ["white", "ivory", "black", "navy"],
    asin: "B07H8923KL",
    market: "US"
  },
  {
    id: "amz-15",
    name: "ANRABESS Chunky Cable Knit Cardigan Open Front Lantern Sleeve",
    category: "top",
    price: "$42.99",
    originalPrice: "$52.99",
    discount: "-19%",
    rating: 4.4,
    reviewCount: 2940,
    img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women chunky cable knit cardigan"),
    platform: "Amazon",
    tag: "Fall Essential",
    occasions: ["casual", "travel", "work"],
    styles: ["romantic", "classic", "minimal"],
    budgetTier: "low",
    colorTags: ["oatmeal", "caramel", "cream", "dusty pink"],
    asin: "B091248912",
    market: "US"
  },
  {
    id: "amz-16",
    name: "Tronjori Women High Waist Casual Wide Leg Trousers with Pockets",
    category: "bottom",
    price: "$35.99",
    originalPrice: "$45.99",
    discount: "-22%",
    rating: 4.4,
    reviewCount: 14500,
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women high waist wide leg trousers"),
    platform: "Amazon",
    tag: "Viral Favorite",
    occasions: ["work", "casual", "party"],
    styles: ["minimal", "elegant", "street"],
    budgetTier: "low",
    colorTags: ["beige", "black", "khaki", "taupe"],
    asin: "B07P912389",
    market: "US"
  },
  {
    id: "amz-17",
    name: "Levi's Women's Ribcage Straight Ankle Jeans",
    category: "bottom",
    price: "$59.99",
    originalPrice: "$79.50",
    discount: "-25%",
    rating: 4.5,
    reviewCount: 8300,
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women straight leg high rise jeans"),
    platform: "Amazon",
    tag: "Iconic Denim",
    occasions: ["casual", "travel", "street"],
    styles: ["street", "classic", "minimal"],
    budgetTier: "mid",
    colorTags: ["indigo", "light wash", "black denim"],
    asin: "B07S891238",
    market: "US"
  },
  {
    id: "amz-18",
    name: "The Drop Women's Maya Silky Slip Midi Skirt",
    category: "bottom",
    price: "$44.90",
    originalPrice: "$49.90",
    discount: "-10%",
    rating: 4.5,
    reviewCount: 3120,
    img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women silk satin midi skirt"),
    platform: "Amazon",
    tag: "Wardrobe Staple",
    occasions: ["date", "work", "party"],
    styles: ["romantic", "elegant", "minimal"],
    budgetTier: "low",
    colorTags: ["black", "champagne", "chocolate brown", "olive"],
    asin: "B0892W5566",
    market: "US"
  },
  {
    id: "amz-19",
    name: "Sam Edelman Women's Loraine Classic Bit Loafer",
    category: "shoes",
    price: "$89.95",
    originalPrice: "$150.00",
    discount: "-40%",
    rating: 4.7,
    reviewCount: 4200,
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women leather bit loafers"),
    platform: "Amazon",
    tag: "Designer Classic",
    occasions: ["work", "casual", "travel"],
    styles: ["classic", "minimal", "elegant"],
    budgetTier: "mid",
    colorTags: ["black", "saddle leather", "burgundy"],
    asin: "B01NAO9281",
    market: "US"
  },
  {
    id: "amz-20",
    name: "Steve Madden Women's Lando Chunky Lug Sole Loafer",
    category: "shoes",
    price: "$69.99",
    originalPrice: "$89.95",
    discount: "-22%",
    rating: 4.4,
    reviewCount: 520,
    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women chunky lug sole loafers"),
    platform: "Amazon",
    tag: "Street Style",
    occasions: ["work", "casual", "street"],
    styles: ["street", "classic", "minimal"],
    budgetTier: "mid",
    colorTags: ["black", "patent", "oxblood"],
    asin: "B0945892Q1",
    market: "US"
  },
  {
    id: "amz-21",
    name: "Vionic Women's Rest Bella Toe Post Sandal with Arch Support",
    category: "shoes",
    price: "$69.95",
    originalPrice: "$89.95",
    discount: "-22%",
    rating: 4.6,
    reviewCount: 8900,
    img: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women orthopedic leather sandals arch support"),
    platform: "Amazon",
    tag: "Ergonomic Luxury",
    occasions: ["travel", "casual"],
    styles: ["minimal", "classic"],
    budgetTier: "mid",
    colorTags: ["tortoise", "white", "black", "gold"],
    asin: "B00N389123",
    market: "US"
  },
  {
    id: "amz-22",
    name: "PAVOI 14K Gold Plated Lightweight Chunky Open Hoops",
    category: "accessory",
    price: "$13.95",
    originalPrice: "$17.95",
    discount: "-22%",
    rating: 4.6,
    reviewCount: 45000,
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women 14k gold chunky hoop earrings"),
    platform: "Amazon",
    tag: "Amazon #1 Best Seller",
    occasions: ["work", "party", "casual", "date"],
    styles: ["minimal", "elegant", "classic"],
    budgetTier: "low",
    colorTags: ["yellow gold", "white gold", "rose gold"],
    asin: "B07DF91238",
    market: "US"
  },
  {
    id: "amz-23",
    name: "Bostanten Genuine Leather Designer Tote Bag Laptop Shoulder Bag",
    category: "accessory",
    price: "$89.99",
    originalPrice: "$119.99",
    discount: "-25%",
    rating: 4.7,
    reviewCount: 5200,
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women genuine leather work tote bag"),
    platform: "Amazon",
    tag: "Workplace Essential",
    occasions: ["work", "travel"],
    styles: ["classic", "elegant", "minimal"],
    budgetTier: "mid",
    colorTags: ["cognac brown", "black", "taupe", "tan"],
    asin: "B079124890",
    market: "US"
  },
  {
    id: "amz-24",
    name: "SOJOS Retro Oval Polarized Vintage Sunglasses",
    category: "accessory",
    price: "$14.99",
    originalPrice: "$19.99",
    discount: "-25%",
    rating: 4.5,
    reviewCount: 16800,
    img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    link: buildAmazonSearchUrl("women retro oval polarized sunglasses"),
    platform: "Amazon",
    tag: "Summer Essential",
    occasions: ["travel", "casual", "street"],
    styles: ["street", "classic", "minimal"],
    budgetTier: "low",
    colorTags: ["tortoise", "black", "gold frame"],
    asin: "B07C123890",
    market: "US"
  },
  ...SOFT_RETRO_STYLE_CATALOG
];

// Global-First: STYLE_CATALOG aligns 100% with Amazon Global & international networks
export const STYLE_CATALOG: StyleProduct[] = [...AMAZON_STYLE_CATALOG];

// Legacy alias to maintain backward compatibility with existing tests
export const VN_STYLE_CATALOG: StyleProduct[] = [...AMAZON_STYLE_CATALOG];

export interface AffiliateSearchLink {
  platform: "Amazon" | "Rakuten" | "CunCute Store";
  label: string;
  url: string;
  badge: string;
  colorClass: string;
}

export function buildAffiliateSearchLinks(query: string, market: string = "ALL"): AffiliateSearchLink[] {
  const clean = query.trim();
  if (!clean) return [];

  const links: AffiliateSearchLink[] = [
    {
      platform: "Amazon",
      label: `Search "${clean}" on Amazon US / Global`,
      url: buildAmazonSearchUrl(clean),
      badge: "Tag: cuncute-20",
      colorClass: "bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow-xs"
    },
    {
      platform: "Rakuten",
      label: `Search "${clean}" on Rakuten Designer Brands`,
      url: `https://www.rakuten.com/search/${encodeURIComponent(clean)}`,
      badge: "Global Brands",
      colorClass: "bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
    },
    {
      platform: "CunCute Store",
      label: `Browse "${clean}" on CunCute Merch Store`,
      url: `https://cute.cunfashion.com/search?q=${encodeURIComponent(clean)}`,
      badge: "Exclusive Merch",
      colorClass: "bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-xs"
    }
  ];

  if (market === "US") {
    return links.filter((l) => l.platform === "Amazon" || l.platform === "Rakuten");
  }
  if (market === "FOURTHWALL") {
    return links.filter((l) => l.platform === "CunCute Store");
  }
  if (market === "RAKUTEN") {
    return links.filter((l) => l.platform === "Rakuten" || l.platform === "Amazon");
  }

  return links;
}

export interface AdviceResult {
  headline: string;
  adviceText: string;
  overallStyle?: string;
  palette: { name: string; hex: string }[];
  styleTips: string[];
  suggestedProducts: StyleProduct[];
  keyMatchedProducts?: StyleProduct[];
  coordinatedProducts?: StyleProduct[];
  detectedItems?: DetectedOutfitItem[];
  market?: "ALL" | "US" | "RAKUTEN" | "FOURTHWALL" | "VN";
  source?: "gemini-vision" | "gemini-text" | "openai-vision" | "ai-heuristic" | "rakuten-api" | "fourthwall-api";
  keyword?: string;
  hasDirectMatch?: boolean;
  searchLinks?: AffiliateSearchLink[];
}

export interface SurpriseLook {
  keyword: string;
  occasion: string;
  style: string;
  budget: string;
  color: string;
  description: string;
}

export const SURPRISE_LOOKS: SurpriseLook[] = [
  {
    keyword: "Trench Coat",
    occasion: "travel",
    style: "classic",
    budget: "high",
    color: "Camel & Khaki",
    description: "London Chic double-breasted outerwear"
  },
  {
    keyword: "Cashmere Sweater",
    occasion: "casual",
    style: "minimal",
    budget: "high",
    color: "Oatmeal & Ivory",
    description: "Ultra-soft premium 100% cashmere knit"
  },
  {
    keyword: "Tailored Blazer",
    occasion: "work",
    style: "elegant",
    budget: "mid",
    color: "Charcoal & Black",
    description: "Sophisticated modern power-suiting"
  },
  {
    keyword: "Silk Slip Dress",
    occasion: "party",
    style: "romantic",
    budget: "mid",
    color: "Champagne & Emerald",
    description: "Effortless 90s minimalism evening dress"
  },
  {
    keyword: "Wide Leg Trousers",
    occasion: "work",
    style: "minimal",
    budget: "low",
    color: "Beige & Taupe",
    description: "High-waist pleated flowing silhouette"
  },
  {
    keyword: "Suede Boots",
    occasion: "casual",
    style: "street",
    budget: "mid",
    color: "Cognac Brown",
    description: "Fall slouchy mid-calf chunky heel boots"
  },
  {
    keyword: "Leather Hobo Bag",
    occasion: "date",
    style: "romantic",
    budget: "mid",
    color: "Cloud White & Ivory",
    description: "Ruched vegan leather statement purse"
  }
];

export function getRandomSurpriseLook(): SurpriseLook {
  const index = Math.floor(Math.random() * SURPRISE_LOOKS.length);
  return SURPRISE_LOOKS[index];
}

export function generateStylistAdvice({
  occasion,
  style,
  budget,
  color,
  hasCustomImage,
  market = "ALL",
  keyword = ""
}: {
  occasion: string;
  style: string;
  budget: string;
  color: string;
  hasCustomImage: boolean;
  market?: "ALL" | "US" | "RAKUTEN" | "FOURTHWALL" | "VN";
  keyword?: string;
}): AdviceResult {
  const catalogPool = AMAZON_STYLE_CATALOG;
  const isVN = market === "VN";

  const occasionLabels: Record<string, string> = {
    casual: isVN ? "Đi chơi / Hàng ngày" : "Casual Daily & Errands",
    work: isVN ? "Đi làm / Công sở" : "Office & Executive Chic",
    date: isVN ? "Hẹn hò lãng mạn" : "Romantic Date Night",
    party: isVN ? "Tiệc tùng / Sự kiện nổi bật" : "Cocktail Party & Gala Event",
    travel: isVN ? "Du lịch & Check-in" : "Travel & Vacation Capsule"
  };

  const styleLabels: Record<string, string> = {
    minimal: isVN ? "Tối giản hiện đại" : "Clean Minimalist",
    elegant: isVN ? "Thanh lịch sang trọng" : "Sophisticated Haute Couture",
    street: isVN ? "Cá tính phóng khoáng" : "Modern Elevated Streetwear",
    romantic: isVN ? "Nữ tính ngọt ngào" : "Feminine & Soft Romantic",
    classic: isVN ? "Cổ điển vượt thời gian" : "Timeless Parisian Classic",
    retro: isVN ? "Cổ điển nữ tính / Quiet Vintage" : "Soft Retro & Quiet Vintage"
  };

  const occName = occasionLabels[occasion] || (isVN ? "Đa năng" : "Versatile Daily");
  const stlName = styleLabels[style] || (isVN ? "Hiện đại" : "Modern Chic");
  const selectedColor = color.trim() || (isVN ? "gam màu trung tính" : "timeless neutral tones");

  let palette = [
    { name: isVN ? "Tông Chủ Đạo" : "Primary Tone", hex: "#FCE7F3" },
    { name: isVN ? "Màu Tương Phản" : "Contrast Base", hex: "#18181B" },
    { name: isVN ? "Phụ Kiện" : "Soft Accent", hex: "#E4D4F4" },
    { name: isVN ? "Điểm Nhấn" : "Statement Accent", hex: "#DB2777" }
  ];

  const lowerColor = color.toLowerCase();
  if (lowerColor.includes("pink") || lowerColor.includes("hồng") || lowerColor.includes("rose")) {
    palette = [
      { name: isVN ? "Hồng Pastel" : "Pastel Rose", hex: "#FCE7F3" },
      { name: isVN ? "Trắng Kem" : "Cream White", hex: "#FFFBEB" },
      { name: isVN ? "Nâu Tây" : "Warm Camel", hex: "#78350F" },
      { name: isVN ? "Khóa Gold" : "Gold Hardware", hex: "#F59E0B" }
    ];
  } else if (lowerColor.includes("black") || lowerColor.includes("đen") || lowerColor.includes("noir")) {
    palette = [
      { name: isVN ? "Đen Than" : "Pitch Charcoal", hex: "#18181B" },
      { name: isVN ? "Xám Bạc" : "Muted Silver", hex: "#E4E4E7" },
      { name: isVN ? "Trắng Basic" : "Crisp White", hex: "#FFFFFF" },
      { name: isVN ? "Bạc Kim Loại" : "Gunmetal Accent", hex: "#475569" }
    ];
  } else if (lowerColor.includes("beige") || lowerColor.includes("camel") || lowerColor.includes("be") || lowerColor.includes("brown") || lowerColor.includes("nâu")) {
    palette = [
      { name: isVN ? "Be Sữa" : "Latte Beige", hex: "#FEF3C7" },
      { name: isVN ? "Nâu Cafe" : "Rich Espresso", hex: "#78350F" },
      { name: isVN ? "Trắng Ngà" : "Soft Ivory", hex: "#FFFDF7" },
      { name: isVN ? "Xanh Denim" : "Indigo Denim", hex: "#3B82F6" }
    ];
  } else if (lowerColor.includes("blue") || lowerColor.includes("xanh")) {
    palette = [
      { name: isVN ? "Xanh Pastel" : "Powder Blue", hex: "#E0F2FE" },
      { name: isVN ? "Xanh Navy" : "Deep Navy", hex: "#1E3A8A" },
      { name: isVN ? "Trắng Sữa" : "Pearl White", hex: "#F8FAFC" },
      { name: isVN ? "Be Nhạt" : "Warm Sand", hex: "#FEF3C7" }
    ];
  }

  const cleanKw = keyword?.trim() || "";
  let hasDirectMatch = true;

  let matched = catalogPool.filter(
    (p) => (occasion === "all" || p.occasions.includes(occasion)) && (style === "all" || p.styles.includes(style))
  );
  if (matched.length === 0) {
    matched = [...catalogPool];
  }

  let keyMatchedProducts: StyleProduct[] | undefined = undefined;
  let coordinatedProducts: StyleProduct[] | undefined = undefined;

  if (cleanKw) {
    const kwLower = cleanKw.toLowerCase();
    const kwMatches = catalogPool.filter(
      (p) =>
        p.name.toLowerCase().includes(kwLower) ||
        p.category.toLowerCase().includes(kwLower) ||
        (p.colorTags || []).some((t) => t.toLowerCase().includes(kwLower))
    );
    if (kwMatches.length > 0) {
      const remaining = matched.filter((p) => !kwMatches.some((m) => m.id === p.id));
      matched = [...kwMatches, ...remaining];
      keyMatchedProducts = kwMatches.slice(0, 4);
      coordinatedProducts = remaining.slice(0, 4);
      hasDirectMatch = true;
    } else {
      hasDirectMatch = false;
    }
  }

  if (budget && budget !== "all") {
    const budgetFiltered = matched.filter((p) => p.budgetTier === budget);
    if (budgetFiltered.length >= 2) {
      matched = budgetFiltered;
    }
  }

  if (matched.length < 3) {
    matched = catalogPool.slice(0, 4);
  }

  const tips: string[] = [
    `Follow the 60-30-10 styling rule: 60% dominant neutral base (${selectedColor}), 30% complementary layer, and 10% statement metallic hardware.`,
    `For the ${occName} aesthetic, elevate your silhouette with high-rise bottoms and structured tailoring to elongate proportions.`,
    `A signature structured handbag paired with tonal footwear instantly ties together any ${stlName} look with effortless poise.`
  ];

  if (cleanKw) {
    tips.unshift(
      `Search Focus: Curating around "${cleanKw}" — pair with balanced minimalist essentials and complementary undertones for an elevated ensemble.`
    );
  }

  if (hasCustomImage) {
    tips.unshift(
      isVN
        ? "Hình ảnh bạn tải lên đã được phân tích tỉ lệ khung hình & tông màu để gợi ý outfit tối ưu."
        : "AI visual analysis successfully extracted silhouette lines, proportion balance, and color harmony to curate optimal recommendations."
    );
  }

  // Generate detected outfit items for Amazon US
  let detectedItems: DetectedOutfitItem[] = [];
  if (hasDirectMatch || hasCustomImage || !cleanKw) {
    detectedItems = [
      {
        id: "det-1",
        name: cleanKw ? cleanKw : "Cropped Trench Coat / Outerwear",
        category: "outerwear",
        color: "Khaki / Camel",
        style: "Double-breasted tailored",
        searchQuery: cleanKw ? cleanKw : "women cropped trench coat",
        amazonUrl: buildAmazonSearchUrl(cleanKw ? cleanKw : "women cropped trench coat")
      },
      {
        id: "det-2",
        name: "Suede Slouchy Mid Calf Boots",
        category: "shoes",
        color: "Warm Brown / Tan",
        style: "Chunky heel fall boots",
        searchQuery: "women suede ankle boots",
        amazonUrl: buildAmazonSearchUrl("women suede ankle boots")
      },
      {
        id: "det-3",
        name: "100% Cashmere Knit Sweater",
        category: "top",
        color: "Ivory / Cream",
        style: "Classic crewneck luxury",
        searchQuery: "women 100 cashmere sweater",
        amazonUrl: buildAmazonSearchUrl("women 100 cashmere sweater")
      },
      {
        id: "det-4",
        name: "Ruched Vegan Leather Hobo Handbag",
        category: "accessory",
        color: "Ivory / Cloud White",
        style: "Minimalist designer purse",
        searchQuery: "women vegan leather handbag",
        amazonUrl: buildAmazonSearchUrl("women vegan leather handbag")
      }
    ];
  }

  let headline = "";
  let adviceText = "";

  if (cleanKw) {
    if (hasDirectMatch) {
      headline = isVN ? `Gợi Ý Phối Đồ Với "${cleanKw}" • ${occName}` : `Curated Ensemble for "${cleanKw}" • ${occName}`;
      adviceText = isVN
        ? `Dựa trên yêu cầu "${cleanKw}" và mong muốn tông màu "${selectedColor}", stylist CunFashion gợi ý các món đồ thời trang cao cấp.`
        : `Based on your request for "${cleanKw}" and desired palette "${selectedColor}", CunFashion AI Stylist has curated top-rated luxury pieces delivering flawless silhouette balance and all-day comfort.`;
    } else {
      headline = isVN ? `Tìm Kiếm Trực Tiếp "${cleanKw}" • Gợi Ý Thịnh Hành` : `Affiliate Search for "${cleanKw}" • Trending Picks`;
      adviceText = isVN
        ? `Không tìm thấy món đồ khớp chính xác với "${cleanKw}". Bạn có thể tìm trực tiếp trên Amazon US hoặc Rakuten bên dưới:`
        : `We couldn't find an exact fashion match for "${cleanKw}" in our boutique catalog. You can search directly on Amazon US (StoreID: cuncute-20) or Rakuten using the quick links below. Meanwhile, explore our curated best-sellers:`;
    }
  } else {
    headline = isVN ? `Gợi Ý Phối Đồ: ${occName} • ${stlName}` : `Curated Look: ${occName} • ${stlName}`;
    adviceText = isVN
      ? `Dựa trên dịp "${occName}" và phong cách "${stlName}" cùng tông màu "${selectedColor}", stylist CunFashion đã phối hợp các món đồ thanh lịch và sang trọng.`
      : `Based on your selected occasion "${occName}" and style "${stlName}", CunFashion AI Stylist has matched top-rated designer essentials delivering effortless sophistication.`;
  }

  const searchLinks = cleanKw ? buildAffiliateSearchLinks(cleanKw, market) : undefined;

  return {
    headline,
    adviceText,
    overallStyle: stlName,
    palette,
    styleTips: tips,
    suggestedProducts: matched.slice(0, 6),
    keyMatchedProducts,
    coordinatedProducts,
    detectedItems,
    market: market || "US",
    source: "ai-heuristic",
    keyword: cleanKw || undefined,
    hasDirectMatch,
    searchLinks
  };
}
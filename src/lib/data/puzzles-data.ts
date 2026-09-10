export interface PuzzleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  plays: number;
  likes: number;
  isDaily?: boolean;
  difficulty: "easy" | "medium" | "hard" | "very-hard" | "supreme";
  description: string;
}

export const CATEGORIES_LIST = [
  { name: "Fashion & Lookbook", slug: "fashion-lookbook" },
  { name: "Animals", slug: "animals" },
  { name: "Art", slug: "art" },
  { name: "Cars and Transportation", slug: "cars-and-transportation" },
  { name: "Food", slug: "food" },
  { name: "Holidays", slug: "holidays" },
  { name: "Kids", slug: "kids" },
  { name: "Nature", slug: "nature" },
  { name: "Other", slug: "other" },
  { name: "People", slug: "people" },
  { name: "Photo Art", slug: "photo-art" },
  { name: "Places", slug: "places" },
  { name: "Space", slug: "space" },
  { name: "Sports", slug: "sports" },
  { name: "Structures", slug: "structures" },
];

export const PUZZLES_DATA: PuzzleItem[] = [
  {
    id: "f1",
    slug: "cunfashion-autumn-haute-couture",
    title: "CunFashion Autumn Haute Couture",
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    plays: 1240,
    likes: 98,
    difficulty: "medium",
    description: "Luxurious haute couture designer collection showcasing modern elegance and warmth.",
  },
  {
    id: "f2",
    slug: "urban-streetwear-lookbook",
    title: "Urban Streetwear & Cyberpunk Lookbook",
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    plays: 890,
    likes: 76,
    difficulty: "easy",
    description: "Bold contemporary streetwear outfit with neon metropolitan accents.",
  },
  {
    id: "f3",
    slug: "vintage-denim-chic",
    title: "Vintage Denim & Retro Chic",
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop",
    plays: 670,
    likes: 52,
    difficulty: "medium",
    description: "Timeless classic denim styling paired with confident editorial photography.",
  },
  {
    id: "f4",
    slug: "runway-evening-gown",
    title: "Runway Elegance Silk Evening Gown",
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=800&auto=format&fit=crop",
    plays: 1020,
    likes: 88,
    difficulty: "hard",
    description: "Exquisite silk evening gown flowing gracefully down the high-fashion runway.",
  },
  {
    id: "f5",
    slug: "minimalist-contemporary-lookbook",
    title: "Minimalist Modern Lookbook 2026",
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
    plays: 915,
    likes: 64,
    difficulty: "supreme",
    description: "Clean monochromatic lines and premium textiles celebrating modern sartorial taste.",
  },
  {
    id: "p1",
    slug: "colorful-fireworks-jigsaw-puzzle",
    title: "Colorful Fireworks Celebration",
    category: "Holidays",
    categorySlug: "holidays",
    image: "/images/sample-puzzle.jpg",
    plays: 950,
    likes: 42,
    isDaily: true,
    difficulty: "medium",
    description: "Vibrant multi-colored fireworks bursting across a scenic night sky.",
  },
  {
    id: "p2",
    slug: "lone-house-alpine-valley",
    title: "Lone House in Alpine Valley",
    category: "Structures",
    categorySlug: "structures",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    plays: 598,
    likes: 31,
    difficulty: "hard",
    description: "A peaceful solitary wooden cottage nestled beneath majestic granite peaks.",
  },
  {
    id: "p3",
    slug: "lavender-basket-sunrise",
    title: "Lavender Basket at Sunrise",
    category: "Nature",
    categorySlug: "nature",
    image: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=800&auto=format&fit=crop",
    plays: 508,
    likes: 27,
    difficulty: "easy",
    description: "Fragrant purple lavender fields glowing in golden morning sunlight.",
  },
  {
    id: "p4",
    slug: "majestic-mountain-lion",
    title: "Majestic Wild Mountain Lion",
    category: "Animals",
    categorySlug: "animals",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=800&auto=format&fit=crop",
    plays: 838,
    likes: 54,
    difficulty: "medium",
    description: "A fierce and graceful wild cat surveying the rocky canyon horizon.",
  },
  {
    id: "p5",
    slug: "deep-galaxy-nebula",
    title: "Cosmic Nebula & Starlight",
    category: "Space",
    categorySlug: "space",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
    plays: 720,
    likes: 68,
    difficulty: "supreme",
    description: "Breathtaking interstellar gas clouds and shimmering distant star clusters.",
  },
  {
    id: "p6",
    slug: "vintage-red-sports-car",
    title: "Classic Red Vintage Cruiser",
    category: "Cars and Transportation",
    categorySlug: "cars-and-transportation",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    plays: 490,
    likes: 19,
    difficulty: "medium",
    description: "A polished cherry red classic sports car parked on a scenic coastal highway.",
  },
  {
    id: "p7",
    slug: "artisan-fresh-pastries",
    title: "Artisan Bakery Morning Spread",
    category: "Food",
    categorySlug: "food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    plays: 412,
    likes: 15,
    difficulty: "easy",
    description: "Golden flaky croissants and freshly baked rustic sourdough loaves.",
  },
  {
    id: "p8",
    slug: "tokyo-neon-streets",
    title: "Tokyo Shinjuku Neon Lights",
    category: "Places",
    categorySlug: "places",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
    plays: 689,
    likes: 47,
    difficulty: "hard",
    description: "Lively urban night scene reflecting colorful neon signs on rainy asphalt.",
  },
];

export function getDailyPuzzle(): PuzzleItem {
  return PUZZLES_DATA.find((p) => p.isDaily) || PUZZLES_DATA[0];
}

export function getPuzzleBySlug(slug: string): PuzzleItem | undefined {
  return PUZZLES_DATA.find((p) => p.slug === slug);
}

export function getPuzzlesByCategory(categorySlug: string): PuzzleItem[] {
  return PUZZLES_DATA.filter((p) => p.categorySlug === categorySlug);
}

export function searchPuzzles(query: string): PuzzleItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return PUZZLES_DATA;
  return PUZZLES_DATA.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function addPuzzleItem(item: Omit<PuzzleItem, "id" | "plays" | "likes">): PuzzleItem {
  const newItem: PuzzleItem = {
    ...item,
    id: "p" + (PUZZLES_DATA.length + 1) + "-" + Date.now().toString(36),
    plays: 0,
    likes: 0,
  };
  PUZZLES_DATA.unshift(newItem);
  return newItem;
}

export function deletePuzzleItem(id: string): boolean {
  const index = PUZZLES_DATA.findIndex((p) => p.id === id);
  if (index !== -1) {
    PUZZLES_DATA.splice(index, 1);
    return true;
  }
  return false;
}


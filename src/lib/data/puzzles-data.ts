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


import React from "react";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";

export const metadata = {
  title: "Browse All Puzzle Categories | PuzzleSnap",
  description: "Browse thousands of free online jigsaw puzzles by category: Nature, Animals, Art, Space, and Architecture.",
};

const SAMPLE_GALLERY = [
  {
    slug: "colorful-fireworks-jigsaw-puzzle",
    title: "Colorful Fireworks",
    category: "Holidays",
    image: "/images/sample-puzzle.jpg",
    plays: "950",
  },
  {
    slug: "lone-house-mountain",
    title: "Lone House in Alpine Mountains",
    category: "Architecture",
    image: "/images/sample-puzzle.jpg",
    plays: "598",
  },
  {
    slug: "lavender-basket-garden",
    title: "Lavender Basket at Sunrise",
    category: "Nature",
    image: "/images/sample-puzzle.jpg",
    plays: "508",
  },
  {
    slug: "wild-puma-rocks",
    title: "Majestic Wild Puma",
    category: "Animals",
    image: "/images/sample-puzzle.jpg",
    plays: "838",
  },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Puzzle Library
        </div>
        <h1 className="text-3xl font-black text-stone-100 tracking-tight">
          Browse by <span className="text-amber-400">Category</span>
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Pick any high-definition puzzle from our curated collections and play instantly in your browser.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SAMPLE_GALLERY.map((puzzle) => (
          <Link
            key={puzzle.slug}
            href={`/puzzle/${puzzle.slug}`}
            className="group bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-950">
              <img
                src={puzzle.image}
                alt={puzzle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Now
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90">
                  {puzzle.category}
                </span>
                <h3 className="text-sm font-bold text-stone-200 group-hover:text-amber-300 transition line-clamp-1 mt-0.5">
                  {puzzle.title}
                </h3>
              </div>
              <div className="text-[11px] text-stone-500 mt-3 flex items-center justify-between">
                <span>Free to play</span>
                <span>{puzzle.plays} plays</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

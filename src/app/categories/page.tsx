import React from "react";
import Link from "next/link";
import { Play, Sparkles, Folder } from "lucide-react";
import { CATEGORIES_LIST, PUZZLES_DATA, getPuzzlesByCategory } from "@/lib/data/puzzles-data";

export const metadata = {
  title: "Browse All Puzzle Categories & Fashion Lookbook | CunFashion",
  description: "Browse thousands of free online jigsaw puzzles across CunFashion Lookbooks, Nature, Animals, Art, and more on CunFashion.",
};

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60 text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
          Categories Library
        </div>
        <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
          Browse by <span className="gold-gradient-text">Category</span>
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Pick your favorite theme and explore hand-curated, high-definition jigsaw puzzles.
        </p>
      </div>

      {/* 14 Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {CATEGORIES_LIST.map((cat) => {
          const count = getPuzzlesByCategory(cat.slug).length;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group p-4 rounded-2xl bg-white dark:bg-[#161822] border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md hover:border-[#dfba73] transition-all flex flex-col items-center text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 group-hover:bg-[#dfba73] text-[#dfba73] group-hover:text-stone-950 flex items-center justify-center transition-colors">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 group-hover:text-[#dfba73] transition line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-semibold">
                  {count} {count === 1 ? "puzzle" : "puzzles"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* All Available Puzzles Catalog */}
      <div className="space-y-6 pt-4 border-t border-stone-200/80 dark:border-stone-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
            Featured Puzzles Across All Categories
          </h2>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold">
            {PUZZLES_DATA.length} puzzles available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PUZZLES_DATA.map((puzzle) => (
            <Link
              key={puzzle.id}
              href={`/puzzle/${puzzle.slug}`}
              className="group bg-white dark:bg-[#161822] rounded-2xl overflow-hidden border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md hover:border-[#dfba73] transition-all flex flex-col"
            >
              <div className="relative aspect-4/3 bg-stone-100 dark:bg-stone-950 overflow-hidden">
                <img
                  src={puzzle.image}
                  alt={puzzle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-[#dfba73] text-stone-950 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-950/70 text-[#dfba73] border border-[#dfba73]/30 backdrop-blur-xs">
                  {puzzle.difficulty}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#dfba73]">
                    {puzzle.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-[#dfba73] transition line-clamp-1 mt-0.5">
                    {puzzle.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                    {puzzle.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span>{puzzle.plays.toLocaleString()} plays</span>
                  <span className="text-[#dfba73] font-bold">★ {puzzle.likes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

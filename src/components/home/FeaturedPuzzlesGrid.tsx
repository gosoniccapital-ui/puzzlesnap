import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import type { PuzzleItem } from "@/lib/data/puzzles-data";

interface FeaturedPuzzlesGridProps {
  puzzles: PuzzleItem[];
  title: string;
  viewAllLabel: string;
}

export function FeaturedPuzzlesGrid({
  puzzles,
  title,
  viewAllLabel,
}: FeaturedPuzzlesGridProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
          {title}
        </h2>
        <Link
          href="/categories"
          className="touch-target inline-flex items-center text-xs font-bold text-[#dfba73] hover:text-amber-500 dark:hover:text-amber-300 transition"
        >
          <span>{viewAllLabel}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {puzzles.map((puzzle) => (
          <Link
            key={puzzle.slug}
            href={`/puzzle/${puzzle.slug}`}
            className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#161822] border border-stone-200/90 dark:border-stone-800 hover:border-[#dfba73] hover:shadow-[0_10px_25px_rgba(223,186,115,0.2)] transition-all duration-300 flex flex-col backdrop-blur-md shadow-xs"
          >
            <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-950">
              <img
                src={puzzle.image}
                alt={puzzle.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 brightness-95 group-hover:brightness-105"
              />
              <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-20 group-hover:opacity-40 transition" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-200">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-[#dfba73] text-stone-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-stone-200 border border-white/10">
                <Play className="w-2.5 h-2.5 fill-current text-[#dfba73]" />
                <span>{puzzle.plays}</span>
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-200 line-clamp-1 group-hover:text-[#dfba73] transition">
                {puzzle.title}
              </h4>
              <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                {puzzle.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

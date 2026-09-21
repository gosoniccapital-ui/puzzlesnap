import React from "react";
import Link from "next/link";
import { Play, Heart, Sparkles } from "lucide-react";
import type { PuzzleItem } from "@/lib/data/puzzles-data";

interface DailyPuzzleCardProps {
  daily: PuzzleItem;
  dailyBadgeLabel: string;
  playsLabel: string;
  likesLabel: string;
}

export function DailyPuzzleCard({
  daily,
  dailyBadgeLabel,
  playsLabel,
  likesLabel,
}: DailyPuzzleCardProps) {
  return (
    <Link
      href={`/puzzle/${daily.slug}`}
      className="group block relative rounded-2xl overflow-hidden border border-amber-400/50 dark:border-[#dfba73]/40 hover:border-[#dfba73] shadow-[0_10px_40px_rgba(0,0,0,0.1),0_0_30px_rgba(223,186,115,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(223,186,115,0.15)] hover:shadow-[0_15px_50px_rgba(223,186,115,0.35)] transition-all duration-300 bg-white dark:bg-stone-950"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-950">
        <img
          src={daily.image}
          alt={daily.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
        />
        <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-20 group-hover:opacity-30 transition" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        <span className="absolute top-3.5 left-3.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 font-black text-xs rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          {dailyBadgeLabel}
        </span>

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-[#dfba73] text-stone-950 flex items-center justify-center shadow-[0_0_25px_rgba(223,186,115,0.5)] transform group-hover:scale-110 transition duration-300">
            <Play className="w-8 h-8 fill-current ml-1 text-stone-950" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-white/95 dark:bg-[#161822]/95 backdrop-blur-xl flex items-center justify-between border-t border-stone-200/80 dark:border-stone-800">
        <div>
          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base sm:text-lg group-hover:text-[#dfba73] transition font-cinzel">
            {daily.title}
          </h3>
          <span className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-semibold mt-0.5 block">
            {daily.category}
          </span>
        </div>
        <div className="flex items-center gap-3.5 text-xs font-bold text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-[#dfba73] fill-current" />
            <span>{daily.plays} {playsLabel}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{daily.likes} {likesLabel}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

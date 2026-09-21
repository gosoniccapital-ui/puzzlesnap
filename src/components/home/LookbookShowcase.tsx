import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { PuzzleItem } from "@/lib/data/puzzles-data";

interface LookbookShowcaseProps {
  items: PuzzleItem[];
  badgeLabel: string;
  title: string;
  exploreLabel: string;
  playsLabel: string;
}

export function LookbookShowcase({
  items,
  badgeLabel,
  title,
  exploreLabel,
  playsLabel,
}: LookbookShowcaseProps) {
  return (
    <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#161822] dark:via-[#11121a] dark:to-[#0c0d12] border border-amber-500/20 dark:border-stone-800/90 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/90 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#dfba73]">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {badgeLabel}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-1 font-cinzel">
            {title}
          </h2>
        </div>
        <Link
          href="/categories/fashion-lookbook"
          className="touch-target self-start sm:self-auto inline-flex items-center gap-2 text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 px-5 py-2.5 rounded-full transition shadow-md hover:shadow-[0_0_20px_rgba(223,186,115,0.4)]"
        >
          <span>{exploreLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/puzzle/${item.slug}`}
            className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#161822] border border-stone-200/90 dark:border-stone-800 hover:border-[#dfba73] hover:shadow-[0_0_25px_rgba(223,186,115,0.25)] transition-all duration-300 shadow-xs"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-950">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-95 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/80 text-[#dfba73] border border-[#dfba73]/30 backdrop-blur-md">
                {item.difficulty}
              </span>
              <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#dfba73] transition">
                  {item.title}
                </h4>
                <span className="text-[10px] text-stone-300 font-medium block">
                  {item.plays.toLocaleString()} {playsLabel}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

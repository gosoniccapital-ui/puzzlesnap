import React from "react";
import Link from "next/link";
import { Play, Sparkles, Upload } from "lucide-react";
import type { PuzzleItem } from "@/lib/data/puzzles-data";
import { DailyPuzzleCard } from "./DailyPuzzleCard";
import { trackUserAction } from "@/lib/analytics/event-dispatcher";

interface HomeHeroSectionProps {
  daily: PuzzleItem;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  playTodayLabel: string;
  makeYourOwnLabel: string;
  dailyBadgeLabel: string;
  playsLabel: string;
  likesLabel: string;
}

export function HomeHeroSection({
  daily,
  heroTitle,
  heroSubtitle,
  heroDescription,
  playTodayLabel,
  makeYourOwnLabel,
  dailyBadgeLabel,
  playsLabel,
  likesLabel,
}: HomeHeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 dark:border-stone-800/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white/90 dark:from-[#161822] dark:via-[#11121a] dark:to-[#0c0d12] p-6 sm:p-12 shadow-xl backdrop-blur-xl">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#dfba73]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-800/80 border border-amber-500/30 dark:border-stone-700/60 text-[#dfba73] text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#dfba73]" />
            <span>Haute Couture Collection</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-cinzel">
              <span className="gold-gradient-text block">{heroTitle}</span>
              <span className="block text-xl sm:text-2xl lg:text-3xl font-normal text-stone-600 dark:text-stone-400 mt-2 font-playfair italic">
                {heroSubtitle}
              </span>
            </h1>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              {heroDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/puzzle/${daily.slug}`}
              onClick={() => trackUserAction("daily_puzzle_click", { source: "hero_play_button", slug: daily.slug })}
              className="touch-target inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-sm shadow-[0_0_25px_rgba(223,186,115,0.35)] hover:shadow-[0_0_35px_rgba(223,186,115,0.55)] transition-all transform hover:-translate-y-0.5 duration-200"
            >
              <span>{playTodayLabel}</span>
              <Play className="w-4 h-4 fill-current" />
            </Link>

            <Link
              href="/make-puzzle"
              onClick={() => trackUserAction("create_puzzle_click", { source: "hero_make_button" })}
              className="touch-target inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white dark:bg-stone-900/90 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white font-bold text-sm border border-stone-300 dark:border-stone-700 hover:border-[#dfba73]/60 transition-all duration-200 backdrop-blur-md shadow-sm"
            >
              <Upload className="w-4 h-4 text-[#dfba73]" />
              <span>{makeYourOwnLabel}</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <DailyPuzzleCard
            daily={daily}
            dailyBadgeLabel={dailyBadgeLabel}
            playsLabel={playsLabel}
            likesLabel={likesLabel}
          />
        </div>
      </div>
    </section>
  );
}

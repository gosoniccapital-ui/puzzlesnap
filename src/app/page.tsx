"use client";

import React from "react";
import Link from "next/link";
import { Play, Heart, Sparkles, Upload, ArrowRight } from "lucide-react";
import { PUZZLES_DATA, getDailyPuzzle, CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { useTranslation } from "@/lib/i18n";

export default function Home() {
  const { t } = useTranslation();
  const daily = getDailyPuzzle();
  const featuredList = PUZZLES_DATA.slice(1, 7);
  const lookbookList = PUZZLES_DATA.filter((p) => p.categorySlug === "fashion-lookbook");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 transition-colors duration-300">
      {/* 1. Haute Couture Hero Section (Asymmetric Variance 8) */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 dark:border-stone-800/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white/90 dark:from-[#161822] dark:via-[#11121a] dark:to-[#0c0d12] p-6 sm:p-12 shadow-xl backdrop-blur-xl">
        {/* Ambient Gold Halo Glow in Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#dfba73]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Editorial Copy & Action Bar */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-800/80 border border-amber-500/30 dark:border-stone-700/60 text-[#dfba73] text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 fill-[#dfba73]" />
              <span>Haute Couture Collection</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-cinzel">
                <span className="gold-gradient-text block">
                  {t.home.heroTitle}
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl font-normal text-stone-600 dark:text-stone-400 mt-2 font-playfair italic">
                  {t.home.heroSubtitle}
                </span>
              </h1>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                {t.home.heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/puzzle/${daily.slug}`}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-sm shadow-[0_0_25px_rgba(223,186,115,0.35)] hover:shadow-[0_0_35px_rgba(223,186,115,0.55)] transition-all transform hover:-translate-y-0.5 duration-200"
              >
                <span>{t.home.playToday}</span>
                <Play className="w-4 h-4 fill-current" />
              </Link>

              <Link
                href="/make-puzzle"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white dark:bg-stone-900/90 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white font-bold text-sm border border-stone-300 dark:border-stone-700 hover:border-[#dfba73]/60 transition-all duration-200 backdrop-blur-md shadow-sm"
              >
                <Upload className="w-4 h-4 text-[#dfba73]" />
                <span>{t.home.makeYourOwn}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Daily Puzzle Showcase with Gold Bezel Frame */}
          <div className="lg:col-span-6">
            <Link
              href={`/puzzle/${daily.slug}`}
              className="group block relative rounded-2xl overflow-hidden border border-amber-400/50 dark:border-[#dfba73]/40 hover:border-[#dfba73] shadow-[0_10px_40px_rgba(0,0,0,0.1),0_0_30px_rgba(223,186,115,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(223,186,115,0.15)] hover:shadow-[0_15px_50px_rgba(223,186,115,0.35)] transition-all duration-300 bg-white dark:bg-stone-950"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-950">
                <img
                  src={daily.image}
                  alt={daily.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                />
                {/* Jigsaw overlay grid */}
                <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-20 group-hover:opacity-30 transition" />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Daily Badge in Champagne Gold */}
                <span className="absolute top-3.5 left-3.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 font-black text-xs rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  {t.home.dailyBadge}
                </span>

                {/* Hover Play Button Glow */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-[#dfba73] text-stone-950 flex items-center justify-center shadow-[0_0_25px_rgba(223,186,115,0.5)] transform group-hover:scale-110 transition duration-300">
                    <Play className="w-8 h-8 fill-current ml-1 text-stone-950" />
                  </div>
                </div>
              </div>

              {/* Meta bar */}
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
                    <span>{daily.plays} {t.home.plays}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{daily.likes} {t.home.likes}</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Puzzles Grid (Glassmorphic Luxury Cards) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
              {t.home.featuredTitle}
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-[#dfba73] hover:text-amber-500 dark:hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>{t.home.viewAll}</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {featuredList.map((puzzle) => (
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

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-200">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-[#dfba73] text-stone-950 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Stats Pill in Corner */}
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

      {/* 3. CunFashion Exclusive Lookbook Showcase */}
      <section className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#161822] dark:via-[#11121a] dark:to-[#0c0d12] border border-amber-500/20 dark:border-stone-800/90 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/90 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#dfba73]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {t.home.originalsBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-1 font-cinzel">
              {t.home.lookbookTitle}
            </h2>
          </div>
          <Link
            href="/categories/fashion-lookbook"
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 px-5 py-2.5 rounded-full transition shadow-md hover:shadow-[0_0_20px_rgba(223,186,115,0.4)]"
          >
            <span>{t.home.exploreLookbooks}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {lookbookList.map((item) => (
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
                    {item.plays.toLocaleString()} {t.home.plays}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Curated Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
            {t.home.categoriesTitle}
          </h2>
          <Link
            href="/categories"
            className="text-xs font-bold text-[#dfba73] hover:text-amber-500 dark:hover:text-amber-300 transition"
          >
            {t.home.seeAllCategories}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORIES_LIST.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/90 dark:border-stone-800 hover:border-[#dfba73] text-center font-bold text-xs text-stone-700 dark:text-stone-300 hover:text-[#dfba73] dark:hover:text-[#dfba73] transition-all duration-200 shadow-2xs hover:shadow-[0_0_15px_rgba(223,186,115,0.15)] backdrop-blur-md"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

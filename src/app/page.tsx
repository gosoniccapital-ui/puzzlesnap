"use client";

import React from "react";
import Link from "next/link";
import { Play, Heart, Sparkles, Upload } from "lucide-react";
import { PUZZLES_DATA, getDailyPuzzle, CATEGORIES_LIST } from "@/lib/data/puzzles-data";

export default function Home() {
  const daily = getDailyPuzzle();
  const featuredList = PUZZLES_DATA.slice(1, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Home Hero Section (2 Columns) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
        {/* Left Column: Hero Copy & CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-[1.15]">
              Free Online Jigsaw Puzzles
              <span className="block text-xl sm:text-2xl font-bold text-stone-500 mt-2">
                From Our Library or Your Own Photos
              </span>
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg">
              Play thousands of picture puzzles for free — or turn any photo into your own custom jigsaw puzzle in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/puzzle/${daily.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-extrabold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 duration-150"
            >
              <span>Play Today&apos;s Puzzle</span>
              <Play className="w-4 h-4 fill-current" />
            </Link>

            <Link
              href="/make-puzzle"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border-2 border-stone-300 hover:border-stone-400 transition"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Make Your Own</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Daily Puzzle Feature Card */}
        <div className="lg:col-span-6">
          <Link
            href={`/puzzle/${daily.slug}`}
            className="group block relative rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-amber-500 shadow-md hover:shadow-xl transition duration-300 bg-stone-950"
          >
            {/* Image Container with Jigsaw Pattern */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={daily.image}
                alt={daily.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              {/* Jigsaw grid overlay texture */}
              <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-40 group-hover:opacity-60 transition" />

              {/* Badge */}
              <span className="absolute top-3 left-3 px-3 py-1 bg-[#ffb703] text-stone-950 font-black text-xs rounded-full shadow-md uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Daily Puzzle
              </span>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
                <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition duration-200">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Meta bar */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-base group-hover:text-amber-600 transition">
                {daily.title}
              </h3>
              <div className="flex items-center gap-3 text-xs font-bold text-stone-500">
                <span className="flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 text-stone-400 fill-current" />
                  {daily.plays}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  {daily.likes}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. Featured Puzzles Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Featured Puzzles</h2>
          <Link href="/categories" className="text-xs font-bold text-amber-600 hover:text-amber-700">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {featuredList.map((puzzle) => (
            <Link
              key={puzzle.slug}
              href={`/puzzle/${puzzle.slug}`}
              className="group block rounded-xl overflow-hidden bg-white border border-stone-200 hover:border-amber-500 hover:shadow-lg transition duration-200 flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <img
                  src={puzzle.image}
                  alt={puzzle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-30 group-hover:opacity-50 transition" />

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/25 transition">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Stats Pill in Corner */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full text-[10px] font-bold text-white">
                  <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
                  <span>{puzzle.plays}</span>
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-amber-600 transition">
                  {puzzle.title}
                </h4>
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mt-1">
                  {puzzle.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CunFashion Exclusive Lookbook Showcase */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white border border-stone-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#ffb703]">
              <Sparkles className="w-3.5 h-3.5" />
              CunFashion Originals
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
              Haute Couture & Lookbook Collection
            </h2>
          </div>
          <Link
            href="/categories/fashion-lookbook"
            className="self-start sm:self-auto text-xs font-black text-stone-950 bg-[#ffb703] hover:bg-[#e0a102] px-4 py-2 rounded-full transition shadow-md"
          >
            Explore Lookbooks →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PUZZLES_DATA.filter((p) => p.categorySlug === "fashion-lookbook").map((item) => (
            <Link
              key={item.id}
              href={`/puzzle/${item.slug}`}
              className="group block rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 hover:border-amber-400 transition duration-300"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-stone-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-950/80 text-amber-400 border border-stone-700">
                  {item.difficulty}
                </span>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 font-semibold">
                    {item.plays.toLocaleString()} plays
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Browse Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Popular Categories</h2>
          <Link href="/categories" className="text-xs font-bold text-amber-600 hover:text-amber-700">
            See all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES_LIST.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="p-3.5 rounded-2xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-400 text-center font-bold text-xs text-stone-700 hover:text-amber-700 transition shadow-sm hover:shadow"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

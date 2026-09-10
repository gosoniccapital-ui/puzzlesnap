"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Play, Search, ArrowLeft } from "lucide-react";
import { searchPuzzles } from "@/lib/data/puzzles-data";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const results = searchPuzzles(query);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Search Results for &ldquo;<span className="text-amber-600">{query}</span>&rdquo;
          </h1>
          <p className="text-stone-500 text-xs mt-1">Found {results.length} puzzles</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">No puzzles found</h3>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            Try searching for words like &quot;fireworks&quot;, &quot;mountain&quot;, &quot;puma&quot;, or browse our categories.
          </p>
          <Link
            href="/categories"
            className="inline-block px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition"
          >
            Browse All Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((puzzle) => (
            <Link
              key={puzzle.slug}
              href={`/puzzle/${puzzle.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-stone-200 hover:border-amber-500 hover:shadow-xl transition flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={puzzle.image}
                  alt={puzzle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 jigsaw-overlay pointer-events-none opacity-30 group-hover:opacity-50 transition" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    {puzzle.category}
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-600 transition line-clamp-1 mt-0.5">
                    {puzzle.title}
                  </h3>
                </div>
                <div className="text-[11px] text-stone-500 mt-3 flex items-center justify-between">
                  <span>{puzzle.difficulty}</span>
                  <span>{puzzle.plays} plays</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

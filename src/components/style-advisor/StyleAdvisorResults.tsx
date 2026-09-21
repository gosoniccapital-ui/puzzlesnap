import React from "react";
import { Sparkles, AlertCircle, RotateCcw, Lightbulb, ShoppingBag } from "lucide-react";
import type { AdviceResult, StyleProduct } from "@/lib/data/style-advisor-data";
import { StyleProductCard } from "./StyleProductCard";

interface StyleAdvisorResultsProps {
  status: "loading" | "error" | "empty" | "ready";
  analysisStatus: string;
  result: AdviceResult | null;
  errorMessage: string | null;
  onRetry: () => void;
  isSavedInWardrobe: (id: string) => boolean;
  onToggleWardrobe: (p: StyleProduct) => void;
  onTrackClick: (id: string, name: string, platform: string, link: string) => void;
  shopOnAmazonLabel: string;
}

export function StyleAdvisorResults({
  status,
  analysisStatus,
  result,
  errorMessage,
  onRetry,
  isSavedInWardrobe,
  onToggleWardrobe,
  onTrackClick,
  shopOnAmazonLabel,
}: StyleAdvisorResultsProps) {
  if (status === "loading") {
    return (
      <div className="py-16 text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-[#dfba73]/30 animate-ping" />
          <div className="w-full h-full rounded-full border-2 border-t-[#dfba73] border-stone-200 dark:border-stone-800 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#dfba73]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-lg font-cinzel">
            Analyzing Fashion Silhouette & Trends
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {analysisStatus || "Querying global catalogs across Amazon US, Rakuten & CunCute..."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="my-10 p-8 rounded-3xl bg-white dark:bg-[#161822] border border-rose-500/20 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
            Outfit Recommendation Stalled
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            {errorMessage || "Unable to retrieve fashion advice at this moment. Please check your network and retry."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="touch-target inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-xs sm:text-sm shadow-md cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Search</span>
        </button>
      </div>
    );
  }

  if (status === "empty" || !result) {
    return (
      <div className="my-10 p-8 rounded-3xl bg-white dark:bg-[#161822] border border-amber-500/20 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-[#dfba73] flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
          No Matching Outfits Found
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Try expanding your search query, adjusting occasion/mood filters, or click Surprise Me to discover trending looks!
        </p>
      </div>
    );
  }

  const keyMatches =
    result.keyMatchedProducts && result.keyMatchedProducts.length > 0
      ? result.keyMatchedProducts
      : result.suggestedProducts.slice(0, 4);

  const coordinated =
    result.coordinatedProducts && result.coordinatedProducts.length > 0
      ? result.coordinatedProducts
      : result.suggestedProducts.slice(4);

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Editorial Advice Blueprint */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-[#161822] dark:via-[#11121a] dark:to-[#0c0d12] border border-amber-500/20 dark:border-stone-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfba73]">
          <Lightbulb className="w-4 h-4 fill-current" />
          <span>Haute Couture Stylist Blueprint</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900 dark:text-stone-100">
          {result.headline}
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-200 font-medium">
          {result.adviceText}
        </p>
        {result.palette && result.palette.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Palette:</span>
            {result.palette.map((col, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                <span>{col.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 1. Key Matches */}
      {keyMatches.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-stone-200/80 dark:border-stone-800/80 pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
              🎯 Key Product Matches
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Direct garment matches discovered across supported affiliate platforms
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {keyMatches.map((p) => (
              <StyleProductCard
                key={p.id}
                product={p}
                isSaved={isSavedInWardrobe(p.id)}
                onToggleWardrobe={onToggleWardrobe}
                onTrackClick={onTrackClick}
                shopOnAmazonLabel={shopOnAmazonLabel}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Coordinated Look */}
      {coordinated.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-stone-200/80 dark:border-stone-800/80 pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
              ✨ Complete The Look
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Coordinated accessories, footwear and complementary couture pieces
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {coordinated.map((p) => (
              <StyleProductCard
                key={p.id}
                product={p}
                isSaved={isSavedInWardrobe(p.id)}
                onToggleWardrobe={onToggleWardrobe}
                onTrackClick={onTrackClick}
                shopOnAmazonLabel={shopOnAmazonLabel}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Chrome, ShoppingBag } from "lucide-react";
import { useWardrobe, WardrobeItem } from "@/lib/hooks/useWardrobe";
import WardrobeDrawer from "@/components/wardrobe/WardrobeDrawer";
import SharedWardrobeBanner from "@/components/wardrobe/SharedWardrobeBanner";
import { parseSharedWardrobeParam } from "@/lib/wardrobe/sharing";
import { AMAZON_STYLE_CATALOG } from "@/lib/data/style-advisor-data";
import { useTranslation } from "@/lib/i18n";

import { StyleAdvisorSearchBar } from "@/components/style-advisor/StyleAdvisorSearchBar";
import { StyleAdvisorFilters } from "@/components/style-advisor/StyleAdvisorFilters";
import { StyleAdvisorResults } from "@/components/style-advisor/StyleAdvisorResults";
import { StyleExtensionModal } from "@/components/style-advisor/StyleExtensionModal";
import { useStyleAdvisor } from "@/components/style-advisor/useStyleAdvisor";

const QUICK_KEYWORDS = [
  "Trench Coat",
  "Soft Retro",
  "Tailored Blazer",
  "Cashmere Knit",
  "Silk Slip Dress",
  "Wide Leg Trousers",
  "Suede Boots",
  "Leather Bag",
  "Evening Gown",
];

export default function StyleAdvisorPage() {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [sharedWardrobeItems, setSharedWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isSharedBannerDismissed, setIsSharedBannerDismissed] = useState(false);

  const {
    count: wardrobeCount,
    isSaved: isSavedInWardrobe,
    toggleItem: toggleWardrobeItem,
  } = useWardrobe();

  const {
    market,
    setMarket,
    selectedImage,
    imageName,
    handleImageFile,
    handleClearImage,
    occasion,
    setOccasion,
    style,
    setStyle,
    keyword,
    setKeyword,
    budget,
    setBudget,
    color,
    setColor,
    status,
    analysisStatus,
    errorMessage,
    result,
    analyze,
    handleSurpriseMe,
    trackAffiliateClick,
  } = useStyleAdvisor();

  // Detect shared wardrobe query param (?wardrobe=id1,id2) and deep-linked keyword (?keyword=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const wardrobeParam = params.get("wardrobe");
      if (wardrobeParam) {
        const items = parseSharedWardrobeParam(wardrobeParam, AMAZON_STYLE_CATALOG);
        if (items.length > 0) {
          setSharedWardrobeItems(items);
        }
      }

      const keywordParam = params.get("keyword");
      if (keywordParam) {
        setKeyword(keywordParam);
      }
    } catch (e) {
      console.error("Failed to parse query params:", e);
    }
  }, []);

  const handleDismissSharedBanner = () => {
    setIsSharedBannerDismissed(true);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("wardrobe");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      } catch (e) {
        console.error("Failed to update URL:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Shared Wardrobe Banner */}
      {!isSharedBannerDismissed && sharedWardrobeItems.length > 0 && (
        <SharedWardrobeBanner
          sharedItems={sharedWardrobeItems}
          onDismiss={handleDismissSharedBanner}
          onOpenDrawer={() => setIsWardrobeOpen(true)}
        />
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header & Extension Prompt Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#dfba73] border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>AI Fashion Stylist & Discovery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-cinzel">
              <span className="gold-gradient-text">Cun Style</span> Advisor
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl">
              Upload any outfit photo or type a fashion trend to discover perfectly matched luxury pieces across Amazon US, Rakuten & CunCute.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWardrobeOpen(true)}
              title="Tủ Đồ / Personal Wardrobe"
              className="touch-target px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#dfba73] text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#dfba73]" />
              <span>Wardrobe / Tủ Đồ ({wardrobeCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExtensionModal(true)}
              className="touch-target px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#dfba73] font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Chrome className="w-4 h-4" />
              <span className="hidden sm:inline">Extension</span>
            </button>
          </div>
        </div>

        {/* Omni Search & Filters Panel */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161822] border border-stone-200/90 dark:border-stone-800/80 shadow-lg space-y-6 backdrop-blur-md">
          <StyleAdvisorSearchBar
            keyword={keyword}
            onKeywordChange={setKeyword}
            selectedImage={selectedImage}
            imageName={imageName}
            onClearImage={handleClearImage}
            onImageFile={handleImageFile}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onSurpriseMe={handleSurpriseMe}
            onAnalyze={analyze}
            isAnalyzing={status === "loading"}
            quickKeywords={QUICK_KEYWORDS}
          />

          <StyleAdvisorFilters
            show={showFilters}
            market={market}
            onMarketChange={setMarket}
            occasion={occasion}
            onOccasionChange={setOccasion}
            style={style}
            onStyleChange={setStyle}
            budget={budget}
            onBudgetChange={setBudget}
            color={color}
            onColorChange={setColor}
          />
        </section>

        {/* Results Stream (Loading, Error, Empty, Ready) */}
        <StyleAdvisorResults
          status={status}
          analysisStatus={analysisStatus}
          result={result}
          errorMessage={errorMessage}
          onRetry={analyze}
          isSavedInWardrobe={isSavedInWardrobe}
          onToggleWardrobe={toggleWardrobeItem}
          onTrackClick={trackAffiliateClick}
          shopOnAmazonLabel={t.styleAdvisor.shopOnAmazon}
        />
      </div>

      {/* Wardrobe Slide-Over Drawer */}
      <WardrobeDrawer
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
      />

      {/* Chrome Extension Modal */}
      <StyleExtensionModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
      />
    </div>
  );
}
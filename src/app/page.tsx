"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { useHomeData } from "@/components/home/useHomeData";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import { HomeEmptyState } from "@/components/home/HomeEmptyState";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { FeaturedPuzzlesGrid } from "@/components/home/FeaturedPuzzlesGrid";
import { LookbookShowcase } from "@/components/home/LookbookShowcase";
import { CategoryPillList } from "@/components/home/CategoryPillList";

export default function Home() {
  const { t } = useTranslation();
  const {
    status,
    daily,
    featuredList,
    lookbookList,
    categoriesList,
    errorMessage,
    retry,
  } = useHomeData();

  if (status === "loading") {
    return <HomeSkeleton />;
  }

  if (status === "error") {
    return <HomeErrorState message={errorMessage || undefined} onRetry={retry} />;
  }

  if (status === "empty" || !daily) {
    return <HomeEmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 transition-colors duration-300">
      {/* 1. Haute Couture Hero Section (Asymmetric Variance 8) */}
      <HomeHeroSection
        daily={daily}
        heroTitle={t.home.heroTitle}
        heroSubtitle={t.home.heroSubtitle}
        heroDescription={t.home.heroDescription}
        playTodayLabel={t.home.playToday}
        makeYourOwnLabel={t.home.makeYourOwn}
        dailyBadgeLabel={t.home.dailyBadge}
        playsLabel={t.home.plays}
        likesLabel={t.home.likes}
      />

      {/* 2. Featured Puzzles Grid (Glassmorphic Luxury Cards) */}
      <FeaturedPuzzlesGrid
        puzzles={featuredList}
        title={t.home.featuredTitle}
        viewAllLabel={t.home.viewAll}
      />

      {/* 3. CunFashion Exclusive Lookbook Showcase */}
      <LookbookShowcase
        items={lookbookList}
        badgeLabel={t.home.originalsBadge}
        title={t.home.lookbookTitle}
        exploreLabel={t.home.exploreLookbooks}
        playsLabel={t.home.plays}
      />

      {/* 4. Curated Categories Grid */}
      <CategoryPillList
        categories={categoriesList}
        title={t.home.categoriesTitle}
        seeAllLabel={t.home.seeAllCategories}
      />
    </div>
  );
}

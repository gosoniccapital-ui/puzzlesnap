"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { Search, ChevronDown, Sparkles, Users, Globe } from "lucide-react";
import PlayerProfileModal from "@/components/puzzle/PlayerProfileModal";
import { useTranslation } from "@/lib/i18n";

export default function Navbar() {
  const { t, lang, changeLanguage, isEnglish } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [playerName, setPlayerName] = useState("Player");
  const [playerColor, setPlayerColor] = useState("#f59e0b");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = () => {
      if (typeof window !== "undefined") {
        const name = localStorage.getItem("cunfashion_player_name") || localStorage.getItem("puzzlesnap_player_name");
        const color = localStorage.getItem("cunfashion_player_color");
        if (name) setPlayerName(name);
        if (color) setPlayerColor(color);
      }
    };
    loadProfile();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; color: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.name) setPlayerName(customEvent.detail.name);
        if (customEvent.detail.color) setPlayerColor(customEvent.detail.color);
      }
    };
    window.addEventListener("player_profile_updated", handleUpdate);
    return () => window.removeEventListener("player_profile_updated", handleUpdate);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-2">
        {/* Left: Brand Logo */}
        <Logo className="h-11" showTagline={true} />

        {/* Center-Left: Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-stone-700">
          <Link
            href="/puzzle/colorful-fireworks-jigsaw-puzzle"
            className="hover:text-amber-600 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            {t.navbar.dailyPuzzle}
          </Link>

          <Link
            href="/categories/fashion-lookbook"
            className="hover:text-amber-600 transition flex items-center gap-1.5 text-amber-600 font-extrabold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t.navbar.lookbook}
          </Link>

          <Link
            href="/style-advisor"
            className="hover:text-pink-600 transition flex items-center gap-1.5 text-pink-600 font-extrabold"
          >
            <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />
            {t.navbar.styleAdvisor}
          </Link>

          {/* Categories Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoriesMenu(true)}
            onMouseLeave={() => setShowCategoriesMenu(false)}
          >
            <button
              onClick={() => setShowCategoriesMenu((prev) => !prev)}
              className="hover:text-amber-600 transition flex items-center gap-1 py-2 font-bold"
            >
              <span>{t.navbar.categories}</span>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </button>

            {showCategoriesMenu && (
              <div className="absolute top-full left-0 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 pb-2 text-[11px] uppercase font-bold tracking-wider text-stone-400 border-b border-stone-100">
                  {t.navbar.selectCategory}
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {CATEGORIES_LIST.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setShowCategoriesMenu(false)}
                      className="block px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-2 px-3 border-t border-stone-100">
                  <Link
                    href="/categories"
                    onClick={() => setShowCategoriesMenu(false)}
                    className="block text-center text-xs font-bold text-amber-600 hover:text-amber-700 py-1"
                  >
                    {t.navbar.seeAllCategories}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/make-puzzle" className="hover:text-amber-600 transition">
            {t.navbar.makePuzzles}
          </Link>
        </nav>

        {/* Center-Right: Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xs relative items-center">
          <input
            type="search"
            id="navbar-search-input"
            name="q"
            aria-label="Search puzzles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.navbar.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-stone-100/90 text-stone-800 placeholder-stone-400 rounded-full border border-stone-200 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
        </form>

        {/* Right: Language Switcher / Player Profile / CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => changeLanguage(isEnglish ? "vi" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black text-stone-700 hover:text-amber-800 bg-stone-100/90 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-full transition cursor-pointer shadow-2xs"
            title={isEnglish ? "Chuyển sang Tiếng Việt" : "Switch to English"}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEnglish ? "EN" : "VI"}</span>
          </button>

          {/* Player Profile Pill */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-amber-700 bg-stone-100/90 hover:bg-amber-50 border border-stone-200/90 hover:border-amber-300 rounded-full transition cursor-pointer shadow-xs"
            title={t.navbar.profileTooltip}
          >
            <span
              className="w-3 h-3 rounded-full border border-white shadow-xs shrink-0"
              style={{ backgroundColor: playerColor }}
            />
            <span className="max-w-[100px] truncate">{playerName || t.navbar.playerDefaultName}</span>
            <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </button>

          <Link
            href="/make-puzzle"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 rounded-full shadow-sm hover:shadow transition"
          >
            {t.navbar.makeYourOwn}
          </Link>
        </div>
      </div>

      {isProfileModalOpen && (
        <PlayerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </header>
  );
}

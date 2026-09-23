"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { trackUserAction } from "@/lib/analytics/event-dispatcher";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { Search, ChevronDown, Sparkles, Users, Globe, Check } from "lucide-react";
import PlayerProfileModal from "@/components/puzzle/PlayerProfileModal";
import { useTranslation, type LanguageCode } from "@/lib/i18n";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Navbar() {
  const { t, lang, currentMeta, languages, changeLanguage } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [playerName, setPlayerName] = useState("Player");
  const [playerColor, setPlayerColor] = useState("#dfba73");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
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

    // Close lang menu on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("player_profile_updated", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectLang = (code: LanguageCode) => {
    changeLanguage(code);
    setShowLangMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf9f6]/90 dark:bg-[#0c0d12]/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4 py-2">
        {/* Left: Brand Logo */}
        <Logo className="h-11" showTagline={true} />

        {/* Center-Left: Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-700 dark:text-stone-300">
          <Link
            href="/puzzle/daily"
            onClick={() => trackUserAction("daily_puzzle_click", { source: "navbar" })}
            className="hover:text-amber-600 dark:hover:text-[#dfba73] transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#dfba73] fill-amber-500 dark:fill-[#dfba73]" />
            <span>{t.navbar.dailyPuzzle}</span>
          </Link>

          <Link
            href="/categories/fashion-lookbook"
            className="hover:text-amber-600 dark:hover:text-[#dfba73] transition flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#dfba73] animate-pulse shadow-[0_0_8px_#dfba73]" />
            <span>{t.navbar.lookbook}</span>
          </Link>

          <Link
            href="/style-advisor"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1.5 text-rose-600 dark:text-rose-300 font-bold"
          >
            <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-400 fill-rose-500/20 dark:fill-rose-400/30" />
            <span>{t.navbar.styleAdvisor}</span>
          </Link>

          {/* Categories Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowCategoriesMenu(true)}
            onMouseLeave={() => setShowCategoriesMenu(false)}
          >
            <button
              onClick={() => setShowCategoriesMenu((prev) => !prev)}
              className="hover:text-amber-600 dark:hover:text-[#dfba73] transition flex items-center gap-1 py-2 cursor-pointer font-medium text-stone-700 dark:text-stone-300"
            >
              <span>{t.navbar.categories}</span>
              <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${showCategoriesMenu ? "rotate-180 text-amber-600 dark:text-[#dfba73]" : ""}`} />
            </button>

            {showCategoriesMenu && (
              <div className="absolute top-full left-0 w-64 bg-white/95 dark:bg-[#161822]/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 pb-2 text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                  {t.navbar.selectCategory}
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {CATEGORIES_LIST.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setShowCategoriesMenu(false)}
                      className="block px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/80 hover:text-amber-600 dark:hover:text-[#dfba73] transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-2 px-3 border-t border-stone-100 dark:border-stone-800">
                  <Link
                    href="/categories"
                    onClick={() => setShowCategoriesMenu(false)}
                    className="block text-center text-xs font-bold text-amber-600 dark:text-[#dfba73] hover:text-amber-700 dark:hover:text-amber-300 py-1"
                  >
                    {t.navbar.seeAllCategories}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/make-puzzle"
            onClick={() => trackUserAction("create_puzzle_click", { source: "navbar_link" })}
            className="hover:text-amber-600 dark:hover:text-[#dfba73] transition"
          >
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
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white dark:bg-[#161822] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-full border border-stone-200 dark:border-stone-800 outline-none focus:border-amber-500 dark:focus:border-[#dfba73] focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-[#dfba73]/20 shadow-xs transition"
          />
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 pointer-events-none" />
        </form>

        {/* Right: Theme Toggle / Language Switcher Dropdown / Player Profile / CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Switcher Button */}
          <ThemeToggle />

          {/* 7-Language Switcher Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 min-h-[44px] sm:min-h-[48px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-[#dfba73] bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-[#1f2230] border border-stone-200 dark:border-stone-800 hover:border-amber-400/40 rounded-full transition cursor-pointer shadow-xs"
              title={t.navbar.switchLanguage}
              aria-label="Select language"
              aria-expanded={showLangMenu}
            >
              <span className="text-sm leading-none">{currentMeta.flag}</span>
              <span className="uppercase text-[11px] font-black tracking-wider text-stone-800 dark:text-stone-200">{lang}</span>
              <ChevronDown className={`hidden sm:inline w-3 h-3 text-stone-400 dark:text-stone-500 transition-transform ${showLangMenu ? "rotate-180 text-amber-600 dark:text-[#dfba73]" : ""}`} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-[#161822]/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-amber-500 dark:text-[#dfba73]" />
                    {t.navbar.switchLanguage}
                  </span>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500">Global (6)</span>
                </div>
                <div className="py-1">
                  {languages.map((meta) => {
                    const isSelected = meta.code === lang;
                    return (
                      <button
                        key={meta.code}
                        type="button"
                        onClick={() => handleSelectLang(meta.code)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 text-amber-600 dark:text-[#dfba73] font-bold"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1f2230] hover:text-stone-900 dark:hover:text-stone-100"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{meta.flag}</span>
                          <span>{meta.nativeName}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-[#dfba73]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Player Profile Pill */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-[48px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-[#1f2230] border border-stone-200 dark:border-stone-800 rounded-full transition cursor-pointer shadow-xs"
            title={t.navbar.profileTooltip}
          >
            <span
              className="w-3 h-3 rounded-full border border-stone-300 dark:border-stone-700 shadow-xs shrink-0"
              style={{ backgroundColor: playerColor }}
            />
            <span className="hidden sm:inline max-w-[80px] sm:max-w-[100px] truncate text-xs font-bold text-stone-800 dark:text-stone-200">{playerName || t.navbar.playerDefaultName}</span>
            <Users className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
          </button>

          {/* Make Your Own CTA Button */}
          <Link
            href="/make-puzzle"
            onClick={() => trackUserAction("create_puzzle_click", { source: "navbar_cta" })}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-105 text-stone-950 rounded-full shadow-[0_0_15px_rgba(223,186,115,0.25)] hover:shadow-[0_0_22px_rgba(223,186,115,0.4)] transition duration-200"
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

import React from "react";
import { Palette, SlidersHorizontal } from "lucide-react";
import { trackUserAction } from "@/lib/analytics/event-dispatcher";

interface StyleAdvisorFiltersProps {
  show: boolean;
  market: "ALL" | "FOURTHWALL" | "RAKUTEN" | "US";
  onMarketChange: (m: "ALL" | "FOURTHWALL" | "RAKUTEN" | "US") => void;
  occasion: string;
  onOccasionChange: (o: string) => void;
  style: string;
  onStyleChange: (s: string) => void;
  budget: string;
  onBudgetChange: (b: string) => void;
  color: string;
  onColorChange: (c: string) => void;
}

const QUICK_COLORS = ["Pastel Pink", "Noir Black", "Oatmeal Beige", "Pure White", "Sky Blue", "Cognac Brown"];

export function StyleAdvisorFilters({
  show,
  market,
  onMarketChange,
  occasion,
  onOccasionChange,
  style,
  onStyleChange,
  budget,
  onBudgetChange,
  color,
  onColorChange,
}: StyleAdvisorFiltersProps) {
  if (!show) return null;

  return (
    <div className="pt-5 border-t border-stone-200/80 dark:border-stone-800/80 space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market / Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Destination Market</label>
          <select
            value={market}
            onChange={(e) => onMarketChange(e.target.value as any)}
            className="touch-target w-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:border-[#dfba73]"
          >
            <option value="ALL">🌐 All Platforms (Amazon, Rakuten, CunCute)</option>
            <option value="US">📦 Amazon US & Global</option>
            <option value="RAKUTEN">👗 Rakuten Global Brands</option>
            <option value="FOURTHWALL">🌟 Cun Cute Store Official</option>
          </select>
        </div>

        {/* Occasion */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => onOccasionChange(e.target.value)}
            className="touch-target w-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:border-[#dfba73]"
          >
            <option value="all">All Occasions</option>
            <option value="casual">Casual Daily & Coffee</option>
            <option value="work">Office & Formal Work</option>
            <option value="party">Evening Party & Gala</option>
            <option value="streetwear">Street Chic & Weekend</option>
            <option value="date">Romantic Dinner Date</option>
          </select>
        </div>

        {/* Style Mood */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Style Mood</label>
          <select
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
            className="touch-target w-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:border-[#dfba73]"
          >
            <option value="all">All Styles</option>
            <option value="minimal">Quiet Luxury / Minimalist</option>
            <option value="retro">Soft Retro / Quiet Vintage</option>
            <option value="cute">Cute Pastel / Coquette</option>
            <option value="classic">Classic Tailored French Chic</option>
            <option value="chic">Avant-Garde High Fashion</option>
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Budget Range</label>
          <select
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value)}
            className="touch-target w-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:border-[#dfba73]"
          >
            <option value="all">All Price Ranges</option>
            <option value="low">Affordable ($15 - $40)</option>
            <option value="mid">Mid-Tier Luxury ($40 - $120)</option>
            <option value="high">High-End Couture ($120+)</option>
          </select>
        </div>
      </div>

      {/* Color Tones */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#dfba73]" />
          <span>Color Tones:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                const nextColor = color === c ? "" : c;
                onColorChange(nextColor);
                if (nextColor) {
                  trackUserAction("style_tile_click", { tile_type: "color", value: nextColor });
                }
              }}
              className={`touch-target px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                color === c
                  ? "bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 border-[#dfba73] font-bold"
                  : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-[#dfba73]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

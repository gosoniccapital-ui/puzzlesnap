"use client";

import React from "react";
import { Puzzle, Trophy, Database, TrendingUp } from "lucide-react";

export type AdminTab = "puzzles" | "scores" | "health" | "analytics";

interface AdminTabsNavProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  puzzlesCount: number;
  scoresCount: number;
  totalClicks: number;
}

export default function AdminTabsNav({
  activeTab,
  onSelectTab,
  puzzlesCount,
  scoresCount,
  totalClicks,
}: AdminTabsNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
      <button
        onClick={() => onSelectTab("puzzles")}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          activeTab === "puzzles"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <Puzzle className="w-4 h-4" />
        Puzzle Catalog ({puzzlesCount})
      </button>
      <button
        onClick={() => onSelectTab("scores")}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          activeTab === "scores"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <Trophy className="w-4 h-4" />
        Leaderboard Audit ({scoresCount})
      </button>
      <button
        onClick={() => onSelectTab("health")}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          activeTab === "health"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <Database className="w-4 h-4" />
        System & Database Health
      </button>
      <button
        onClick={() => onSelectTab("analytics")}
        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          activeTab === "analytics"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <TrendingUp className="w-4 h-4 text-pink-500" />
        Affiliate Analytics ({totalClicks})
      </button>
    </div>
  );
}

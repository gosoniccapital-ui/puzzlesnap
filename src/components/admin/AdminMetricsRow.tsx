"use client";

import React from "react";
import { Puzzle, TrendingUp, Trophy, ShieldCheck } from "lucide-react";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";

interface AdminMetricsRowProps {
  puzzlesCount: number;
  totalPlays: number;
  scoresCount: number;
}

export default function AdminMetricsRow({
  puzzlesCount,
  totalPlays,
  scoresCount,
}: AdminMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Puzzles</p>
          <p className="text-2xl font-black text-stone-900 mt-1">{puzzlesCount}</p>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Across {CATEGORIES_LIST.length} categories</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Puzzle className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Plays</p>
          <p className="text-2xl font-black text-stone-900 mt-1">{totalPlays.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active player sessions</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Leaderboard Scores</p>
          <p className="text-2xl font-black text-stone-900 mt-1">{scoresCount}</p>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Verified solutions</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Engine Health</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-lg font-black text-stone-900">100% Online</p>
          </div>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Canvas 2D + DSU 60fps</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

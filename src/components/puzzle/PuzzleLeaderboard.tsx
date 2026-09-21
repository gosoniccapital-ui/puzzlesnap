"use client";

import React from "react";
import { Trophy, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface LeaderboardItem {
  id: string;
  puzzleSlug: string;
  playerName: string;
  pieceCount: number;
  elapsedSeconds: number;
  moves: number;
  createdAt: string;
}

export interface PuzzleLeaderboardProps {
  leaderboard: LeaderboardItem[];
  isLoading: boolean;
  totalCount: number;
  formatTime: (secs: number) => string;
}

export default function PuzzleLeaderboard({
  leaderboard,
  isLoading,
  totalCount,
  formatTime,
}: PuzzleLeaderboardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-stone-900">{t.leaderboard.title}</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
            {totalCount} {t.leaderboard.pieces}
          </span>
        </div>
        <span className="text-xs text-stone-400 font-semibold">{t.leaderboard.hint}</span>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-stone-400 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            {t.leaderboard.loading}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs font-medium">
            {t.leaderboard.empty}
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-bold text-stone-400 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">{t.leaderboard.rank}</th>
                <th className="py-2.5 px-3">{t.leaderboard.player}</th>
                <th className="py-2.5 px-3 text-right">{t.leaderboard.time}</th>
                <th className="py-2.5 px-3 text-right">{t.leaderboard.moves}</th>
                <th className="py-2.5 px-3 text-right">{t.leaderboard.score}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
              {leaderboard.map((score, index) => (
                <tr key={score.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 px-3 font-extrabold text-stone-900">
                    {index === 0 ? "🥇 #1" : index === 1 ? "🥈 #2" : index === 2 ? "🥉 #3" : `#${index + 1}`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-stone-800">{score.playerName}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">{formatTime(score.elapsedSeconds)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-500">{score.moves}</td>
                  <td className="py-2.5 px-3 text-right font-black text-amber-600">
                    {score.elapsedSeconds + score.moves}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

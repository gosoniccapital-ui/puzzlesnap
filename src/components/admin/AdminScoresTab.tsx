"use client";

import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { AdminScore } from "./types";

interface AdminScoresTabProps {
  scores: AdminScore[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteScore: (id: string) => void;
}

export default function AdminScoresTab({
  scores,
  loading,
  onRefresh,
  onDeleteScore,
}: AdminScoresTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-stone-900">Global Score Records Audit</h3>
        <button
          onClick={onRefresh}
          className="text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 transition cursor-pointer"
        >
          Refresh Scores
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-stone-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          Loading scores...
        </div>
      ) : scores.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-stone-400">
          No scores recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-[11px] uppercase font-bold text-stone-400 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Score ID</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Puzzle Slug</th>
                <th className="py-3 px-4 text-right">Pieces</th>
                <th className="py-3 px-4 text-right">Time</th>
                <th className="py-3 px-4 text-right">Moves</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
              {scores.map((s) => {
                const mins = Math.floor(s.elapsedSeconds / 60);
                const secs = s.elapsedSeconds % 60;
                const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                return (
                  <tr key={s.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-400">{s.id}</td>
                    <td className="py-2.5 px-4 font-bold text-stone-900">{s.playerName}</td>
                    <td className="py-2.5 px-4 font-mono text-stone-600 text-[11px]">{s.puzzleSlug}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{s.pieceCount}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-stone-600">{timeFormatted}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-stone-500">{s.moves}</td>
                    <td className="py-2.5 px-4 text-right font-black text-amber-600">
                      {s.elapsedSeconds + s.moves}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-stone-400">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteScore(s.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Score"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

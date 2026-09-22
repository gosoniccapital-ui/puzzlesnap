"use client";

import React, { useState, useEffect } from "react";
import { Play, Share2, Trash2, Check, Clock, Sparkles } from "lucide-react";
import {
  SavedCustomPuzzle,
  getMyCustomPuzzles,
  deleteMyCustomPuzzle,
} from "@/lib/puzzle-engine/local-puzzle-history";

interface MakePuzzleHistoryProps {
  onSelectPuzzle: (puzzle: SavedCustomPuzzle) => void;
}

export function MakePuzzleHistory({ onSelectPuzzle }: MakePuzzleHistoryProps) {
  const [puzzles, setPuzzles] = useState<SavedCustomPuzzle[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setPuzzles(getMyCustomPuzzles());
  }, []);

  if (puzzles.length === 0) {
    return null;
  }

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://cunfashion.com";
    const shareUrl = `${origin}/make-puzzle?id=${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMyCustomPuzzle(id);
    setPuzzles(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200/80 dark:border-stone-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#dfba73]" />
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cinzel">
            My Recent Creations ({puzzles.length})
          </h2>
        </div>
        <span className="text-[11px] text-stone-600 dark:text-stone-400">
          Saved locally on your browser
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {puzzles.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPuzzle(p)}
            className="group relative rounded-2xl p-3 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 hover:border-[#dfba73]/80 hover:shadow-md transition-all cursor-pointer flex gap-3 items-center"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-950 shrink-0 border border-stone-200/60 dark:border-stone-800/60 relative">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Play className="w-5 h-5 text-amber-300 drop-shadow-md fill-amber-300" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[#dfba73] transition">
                {p.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-600 dark:text-stone-400">
                <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold capitalize">
                  {p.difficulty === "easy" ? "9 pcs" : p.difficulty === "hard" ? "30 pcs" : "16 pcs"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => handleCopyLink(p.id, e)}
                title="Copy share link"
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer"
              >
                {copiedId === p.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(p.id, e)}
                title="Remove from history"
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

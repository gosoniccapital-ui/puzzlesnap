"use client";

import React from "react";
import { CheckCircle2, RotateCcw, Send, Loader2 } from "lucide-react";

export interface PuzzleVictoryModalProps {
  isOpen: boolean;
  title: string;
  seconds: number;
  moveCount: number;
  formatTime: (secs: number) => string;
  playerName: string;
  onPlayerNameChange: (val: string) => void;
  onSubmitScore: (e: React.FormEvent) => void;
  isSubmittingScore: boolean;
  scoreSubmitted: boolean;
  onPlayAgain: () => void;
}

export default function PuzzleVictoryModal({
  isOpen,
  title,
  seconds,
  moveCount,
  formatTime,
  playerName,
  onPlayerNameChange,
  onSubmitScore,
  isSubmittingScore,
  scoreSubmitted,
  onPlayAgain,
}: PuzzleVictoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-5 z-30 p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-[#ffb703] text-stone-950 flex items-center justify-center shadow-xl">
        <CheckCircle2 className="w-10 h-10 text-stone-950" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-3xl font-black text-white tracking-tight">Congratulations!</h3>
        <p className="text-stone-300 text-xs sm:text-sm">
          You completed <strong className="text-amber-400">{title}</strong> in{" "}
          <strong className="text-amber-400 font-mono">{formatTime(seconds)}</strong> with{" "}
          <strong className="text-amber-400">{moveCount} moves</strong>!
        </p>
      </div>

      {/* Score Submission Form */}
      {!scoreSubmitted ? (
        <form
          onSubmit={onSubmitScore}
          className="flex flex-col sm:flex-row items-center gap-2 bg-stone-900/90 p-2.5 rounded-2xl border border-stone-800 shadow-xl"
        >
          <input
            type="text"
            placeholder="Enter your nickname..."
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            maxLength={25}
            className="px-4 py-2 rounded-xl bg-stone-800 text-stone-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400 border border-stone-700 w-48 sm:w-56"
            required
          />
          <button
            type="submit"
            disabled={isSubmittingScore || !playerName.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {isSubmittingScore ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Save to Leaderboard
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/60 px-4 py-2 rounded-full border border-emerald-700/60 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Your score was recorded on the Leaderboard!
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer border border-stone-700"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Play Again
      </button>
    </div>
  );
}

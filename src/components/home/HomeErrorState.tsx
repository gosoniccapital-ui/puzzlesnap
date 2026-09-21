import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface HomeErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function HomeErrorState({ message, onRetry }: HomeErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-[#161822] border border-rose-500/20 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
          Unable to Load Puzzles
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          {message || "We encountered an issue fetching the latest puzzle collections. Please check your connection and try again."}
        </p>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="touch-target inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-sm shadow-[0_0_20px_rgba(223,186,115,0.35)] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    </div>
  );
}

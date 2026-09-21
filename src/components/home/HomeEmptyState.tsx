import React from "react";
import Link from "next/link";
import { Sparkles, Upload } from "lucide-react";

export function HomeEmptyState() {
  return (
    <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-[#161822] border border-amber-500/20 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-[#dfba73] flex items-center justify-center">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
          No Puzzles Available Yet
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Start the journey by creating and customizing your very first bespoke jigsaw puzzle from any photograph!
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/make-puzzle"
          className="touch-target inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-sm shadow-[0_0_20px_rgba(223,186,115,0.35)] transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Create Your First Puzzle</span>
        </Link>
      </div>
    </div>
  );
}

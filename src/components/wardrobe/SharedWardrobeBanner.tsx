"use client";

import React, { useState } from "react";
import { Sparkles, Download, Eye, X, Check } from "lucide-react";
import { WardrobeItem, useWardrobe } from "@/lib/hooks/useWardrobe";

interface SharedWardrobeBannerProps {
  sharedItems: WardrobeItem[];
  onOpenDrawer: () => void;
  onDismiss: () => void;
}

export default function SharedWardrobeBanner({
  sharedItems,
  onOpenDrawer,
  onDismiss
}: SharedWardrobeBannerProps) {
  const { importItems } = useWardrobe();
  const [saved, setSaved] = useState(false);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  if (!sharedItems || sharedItems.length === 0) return null;

  const handleImport = () => {
    const count = importItems(sharedItems);
    setAddedCount(count);
    setSaved(true);
    setTimeout(() => {
      onOpenDrawer();
    }, 800);
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-pink-500/20 to-purple-500/15 border-y border-pink-500/30 px-4 py-3 text-stone-100 shadow-lg animate-in slide-in-from-top-3 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-white">
                ✨ Shared Outfit Wardrobe ({sharedItems.length} {sharedItems.length === 1 ? "item" : "items"})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-600 text-white">
                Explore Now
              </span>
            </div>
            <p className="text-[11px] text-stone-300 truncate max-w-xl">
              A friend just shared a curated fashion outfit collection with direct shopping links.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleImport}
            disabled={saved}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition disabled:opacity-80 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>
                  {addedCount !== null && addedCount > 0
                    ? `Saved ${addedCount} new ${addedCount === 1 ? "item" : "items"}!`
                    : "Already in Wardrobe!"}
                </span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Save to My Wardrobe</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenDrawer}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>View Details</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800/80 rounded-lg transition cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

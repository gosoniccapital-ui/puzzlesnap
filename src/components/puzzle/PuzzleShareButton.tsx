"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function PuzzleShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
        copied
          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold"
          : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
      }`}
      title={`Share puzzle "${title}"`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
      <span>{copied ? "Link Copied!" : "Share"}</span>
    </button>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

export default function PuzzleShareButton({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    return typeof window !== "undefined" ? window.location.href : "https://cunfashion.com";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Graceful fallback
    }
  };

  const handleToggle = async () => {
    // If mobile Web Share API is available, invoke native share sheet for seamless UX
    if (typeof navigator !== "undefined" && navigator.share && window.innerWidth < 640) {
      try {
        await navigator.share({
          title: `${title} — CunFashion Jigsaw Puzzle`,
          text: `Solving "${title}" jigsaw puzzle on CunFashion! 🧩✨`,
          url: getShareUrl(),
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close dropdown on click outside or Escape key (Behavior invariant)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const shareText = `Solving "${title}" jigsaw puzzle on CunFashion! 🧩✨`;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={handleToggle}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 shadow-xs cursor-pointer select-none ${
          copied
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-extrabold"
            : "bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800"
        }`}
        title={`Share puzzle "${title}"`}
        aria-expanded={isOpen}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
        ) : (
          <Share2 className="w-3.5 h-3.5 text-[#dfba73]" />
        )}
        <span>{copied ? "Link Copied!" : "Share"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800 mb-1">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Share Puzzle
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Share on X */}
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}&via=cunfashion`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span>Share on X</span>
            </a>

            {/* Share on Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span>Share on Facebook</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-[#dfba73] flex items-center justify-center shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#dfba73]" />}
              </div>
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface PuzzleLikeButtonProps {
  slug: string;
  initialLikes?: number;
}

export default function PuzzleLikeButton({ slug, initialLikes = 0 }: PuzzleLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`cun_liked_${slug}`);
      if (stored === "true") {
        setHasLiked(true);
      }
    }
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked) return;

    // Optimistic UI update
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    if (typeof window !== "undefined") {
      localStorage.setItem(`cun_liked_${slug}`, "true");
    }

    try {
      const res = await fetch("/api/puzzles/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "like" }),
      });
      const data = await res.json();
      if (data.success && typeof data.totalLikes === "number") {
        setLikes(data.totalLikes);
      }
    } catch {
      // Non-blocking error
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer select-none ${
        hasLiked
          ? "bg-rose-50 text-rose-600 border-rose-200 font-extrabold cursor-default"
          : "bg-white hover:bg-rose-50/60 text-stone-700 hover:text-rose-600 border-stone-200 active:scale-95"
      }`}
      title={hasLiked ? "Bạn đã thích bức tranh này!" : "Thích bức tranh này"}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          hasLiked ? "fill-rose-500 text-rose-500" : "text-stone-400"
        } ${animating ? "scale-135" : "scale-100"}`}
      />
      <span>{likes > 0 ? likes : "Like"}</span>
    </button>
  );
}

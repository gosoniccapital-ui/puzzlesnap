import React from "react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";
import Link from "next/link";
import { Share2, Code } from "lucide-react";

interface PuzzlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PuzzlePageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} - Jigsaw Puzzle | PuzzleSnap`,
    description: `Play the free online jigsaw puzzle: ${formattedTitle} on PuzzleSnap.`,
  };
}

export default async function PuzzleDetailPage({ params }: PuzzlePageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-stone-400">
          <Link href="/" className="hover:text-amber-400 transition">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-amber-400 transition">Puzzles</Link>
          <span>/</span>
          <span className="text-stone-200 font-semibold">{formattedTitle}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            Embed
          </button>
        </div>
      </div>

      {/* Main Puzzle Board */}
      <PuzzleGameBoard
        imageSrc="/images/sample-puzzle.jpg"
        title={formattedTitle}
        initialDifficulty="medium"
      />
    </div>
  );
}

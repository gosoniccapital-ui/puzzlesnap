import React from "react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";
import PuzzleShareButton from "@/components/puzzle/PuzzleShareButton";
import PuzzleLikeButton from "@/components/puzzle/PuzzleLikeButton";
import Link from "next/link";
import { getPuzzleBySlug } from "@/lib/data/puzzles-data";

interface PuzzlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PuzzlePageProps) {
  const { slug } = await params;
  const puzzle = getPuzzleBySlug(slug);
  const formattedTitle =
    puzzle?.title ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${formattedTitle} - Jigsaw Puzzle | CunFashion`,
    description: puzzle?.description || `Play the free online jigsaw puzzle: ${formattedTitle} on CunFashion.`,
  };
}

export default async function PuzzleDetailPage({ params, searchParams }: PuzzlePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const initialRoomId = typeof query?.room === "string" ? query.room : undefined;

  const puzzle = getPuzzleBySlug(slug);
  const title =
    puzzle?.title ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const imageSrc = puzzle?.image || "/images/sample-puzzle.jpg";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-stone-400">
          <Link href="/" className="hover:text-amber-500 transition">Home</Link>
          <span>/</span>
          <Link href={`/categories/${puzzle?.categorySlug || ""}`} className="hover:text-amber-500 transition">
            {puzzle?.category || "Puzzles"}
          </Link>
          <span>/</span>
          <span className="text-stone-700 font-semibold">{title}</span>
        </nav>

        <div className="flex items-center gap-2">
          <PuzzleLikeButton slug={slug} initialLikes={puzzle?.likes} />
          <PuzzleShareButton title={title} />
        </div>
      </div>

      {/* Main Puzzle Board */}
      <PuzzleGameBoard
        puzzleSlug={slug}
        imageSrc={imageSrc}
        title={title}
        initialDifficulty={puzzle?.difficulty || "medium"}
        voucherCode={puzzle?.voucherCode}
        discountPercent={puzzle?.discountPercent}
        productUrl={puzzle?.productUrl}
        productPriceOriginal={puzzle?.productPriceOriginal}
        productPriceSale={puzzle?.productPriceSale}
        initialRoomId={initialRoomId}
        ctaText={puzzle?.ctaText}
      />
    </div>
  );
}


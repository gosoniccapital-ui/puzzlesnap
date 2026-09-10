import React from "react";
import Link from "next/link";
import { Play, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { getPuzzlesByCategory, CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { notFound } from "next/navigation";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = CATEGORIES_LIST.find((c) => c.slug === slug);
  const title = category?.name || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `${title} Jigsaw Puzzles | PuzzleSnap`,
    description: `Play thousands of free online jigsaw puzzles in the ${title} category on PuzzleSnap.`,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = CATEGORIES_LIST.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const puzzles = getPuzzlesByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-stone-400 mb-3">
          <Link href="/" className="hover:text-amber-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-amber-600 transition">
            Categories
          </Link>
          <span>/</span>
          <span className="text-stone-700 font-bold">{category.name}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Category Collection
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              {category.name} <span className="text-amber-500">Puzzles</span>
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Explore and play {puzzles.length} high-definition jigsaw puzzles in {category.name}.
            </p>
          </div>

          <Link
            href="/categories"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            All Categories
          </Link>
        </div>
      </div>

      {/* Puzzles Grid */}
      {puzzles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <p className="text-stone-500 font-medium text-sm">
            No puzzles added to this category yet.
          </p>
          <Link
            href="/make-puzzle"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black text-xs transition shadow-sm"
          >
            Create the first {category.name} puzzle!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {puzzles.map((puzzle) => (
            <Link
              key={puzzle.id}
              href={`/puzzle/${puzzle.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all flex flex-col"
            >
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={puzzle.image}
                  alt={puzzle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#ffb703] text-stone-950 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-950/70 text-white backdrop-blur-xs">
                  {puzzle.difficulty}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-amber-600 transition line-clamp-1">
                    {puzzle.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {puzzle.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-stone-400 pt-2 border-t border-stone-100">
                  <span>{puzzle.plays.toLocaleString()} plays</span>
                  <span className="text-amber-500 font-bold">★ {puzzle.likes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

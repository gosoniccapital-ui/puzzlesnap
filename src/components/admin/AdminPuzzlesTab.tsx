"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus, Loader2, Tag, ShoppingBag, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { AdminPuzzle } from "./types";

interface AdminPuzzlesTabProps {
  puzzles: AdminPuzzle[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (puzzle: AdminPuzzle) => void;
  onDeletePuzzle: (id: string, title: string) => void;
}

export default function AdminPuzzlesTab({
  puzzles,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeletePuzzle,
}: AdminPuzzlesTabProps) {
  const filteredPuzzles = puzzles.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.categorySlug === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Filter puzzles by title or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES_LIST.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Puzzle
          </button>
        </div>
      </div>

      {/* Puzzles Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-stone-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            Loading puzzle catalog...
          </div>
        ) : filteredPuzzles.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-stone-400">
            No puzzles match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-[11px] uppercase font-bold text-stone-400 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4 text-right">Plays</th>
                  <th className="py-3 px-4 text-right">Likes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                {filteredPuzzles.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-2.5 px-4">
                      <div className="w-12 h-9 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="font-extrabold text-stone-900">{p.title}</p>
                      <p className="text-[11px] font-mono text-stone-400 truncate max-w-xs">{p.slug}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {p.voucherCode && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5 text-amber-600" />
                            {p.voucherCode} ({p.discountPercent || 10}% OFF)
                          </span>
                        )}
                        {p.productUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md">
                            <ShoppingBag className="w-2.5 h-2.5 text-stone-500" />
                            Shop The Look
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="capitalize text-[11px] font-bold text-amber-600">
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-stone-600">{p.plays}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-stone-600">{p.likes}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/puzzle/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-500 hover:text-amber-600 transition"
                          title="Play Puzzle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onOpenEditModal(p)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition cursor-pointer"
                          title="Edit Puzzle"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePuzzle(p.id, p.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Puzzle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Pencil, AlertCircle, CheckCircle2, Tag, Loader2 } from "lucide-react";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";
import { AdminPuzzle } from "./types";

interface AdminEditPuzzleModalProps {
  isOpen: boolean;
  puzzle: AdminPuzzle | null;
  onClose: () => void;
  onSuccess: (updatedPuzzle: AdminPuzzle) => void;
}

export default function AdminEditPuzzleModal({
  isOpen,
  puzzle,
  onClose,
  onSuccess,
}: AdminEditPuzzleModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormError, setEditFormError] = useState("");
  const [editFormSuccess, setEditFormSuccess] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState(CATEGORIES_LIST[0].name);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<"easy" | "medium" | "hard" | "very-hard" | "supreme">("medium");
  const [editDescription, setEditDescription] = useState("");
  const [editVoucherCode, setEditVoucherCode] = useState("");
  const [editDiscountPercent, setEditDiscountPercent] = useState("");
  const [editProductUrl, setEditProductUrl] = useState("");
  const [editProductPriceOriginal, setEditProductPriceOriginal] = useState("");
  const [editProductPriceSale, setEditProductPriceSale] = useState("");

  useEffect(() => {
    if (puzzle) {
      setEditTitle(puzzle.title);
      setEditCategory(puzzle.category);
      setEditImageUrl(puzzle.image);
      setEditDifficulty((puzzle.difficulty as any) || "medium");
      setEditDescription(puzzle.description || "");
      setEditVoucherCode(puzzle.voucherCode || "");
      setEditDiscountPercent(puzzle.discountPercent !== undefined ? String(puzzle.discountPercent) : "");
      setEditProductUrl(puzzle.productUrl || "");
      setEditProductPriceOriginal(puzzle.productPriceOriginal || "");
      setEditProductPriceSale(puzzle.productPriceSale || "");
      setEditFormError("");
      setEditFormSuccess("");
    }
  }, [puzzle]);

  if (!isOpen || !puzzle) return null;

  const handleUpdatePuzzle = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError("");
    setEditFormSuccess("");
    setIsUpdating(true);

    try {
      const res = await fetch("/api/puzzles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: puzzle.id,
          title: editTitle.trim(),
          category: editCategory,
          image: editImageUrl.trim(),
          difficulty: editDifficulty,
          description: editDescription.trim(),
          voucherCode: editVoucherCode.trim() || undefined,
          discountPercent: editDiscountPercent.trim() ? Number(editDiscountPercent) : undefined,
          productUrl: editProductUrl.trim() || undefined,
          productPriceOriginal: editProductPriceOriginal.trim() || undefined,
          productPriceSale: editProductPriceSale.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setEditFormSuccess("Puzzle updated successfully!");
        onSuccess({ ...puzzle, ...json.data });
        setTimeout(() => {
          onClose();
          setEditFormSuccess("");
        }, 800);
      } else {
        setEditFormError(json.error || "Failed to update puzzle");
      }
    } catch {
      setEditFormError("Network error while updating puzzle");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Edit Puzzle</h3>
              <p className="text-[11px] text-stone-400 font-medium">Update puzzle metadata and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdatePuzzle} className="p-5 space-y-4 text-xs">
          {editFormError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{editFormError}</span>
            </div>
          )}
          {editFormSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{editFormSuccess}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">Puzzle Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
              >
                {CATEGORIES_LIST.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Default Difficulty</label>
              <select
                value={editDifficulty}
                onChange={(e) => setEditDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold capitalize"
              >
                <option value="easy">Easy (9 pcs)</option>
                <option value="medium">Medium (16 pcs)</option>
                <option value="hard">Hard (30 pcs)</option>
                <option value="very-hard">Very Hard (40 pcs)</option>
                <option value="supreme">Supreme (50 pcs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Image URL</label>
            <input
              type="url"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          {editImageUrl && (
            <div className="mt-2">
              <span className="block font-semibold text-stone-500 text-[11px] mb-1">Image Preview:</span>
              <div className="w-full h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={editImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* E-Commerce & Lookbook Settings */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>E-Commerce & Lookbook (CunFashion Rewards)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 text-[11px] mb-1">
                  Voucher Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUN15"
                  value={editVoucherCode}
                  onChange={(e) => setEditVoucherCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-600 text-[11px] mb-1">
                  Discount % (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="15"
                  value={editDiscountPercent}
                  onChange={(e) => setEditDiscountPercent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 text-[11px] mb-1">
                Shop / Lookbook URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://cute.cunfashion.com/..."
                value={editProductUrl}
                onChange={(e) => setEditProductUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 text-[11px] mb-1">
                  Original Price (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $59.99"
                  value={editProductPriceOriginal}
                  onChange={(e) => setEditProductPriceOriginal(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-600 text-[11px] mb-1">
                  Sale Price (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $49.99"
                  value={editProductPriceSale}
                  onChange={(e) => setEditProductPriceSale(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black shadow-sm transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Puzzle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

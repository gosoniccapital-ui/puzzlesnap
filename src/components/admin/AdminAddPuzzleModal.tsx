"use client";

import React, { useState } from "react";
import { Plus, AlertCircle, CheckCircle2, Tag, Loader2 } from "lucide-react";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";

interface AdminAddPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAddPuzzleModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminAddPuzzleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES_LIST[0].name);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard" | "very-hard" | "supreme">("medium");
  const [newDescription, setNewDescription] = useState("");
  const [newVoucherCode, setNewVoucherCode] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState("");
  const [newProductUrl, setNewProductUrl] = useState("");
  const [newProductPriceOriginal, setNewProductPriceOriginal] = useState("");
  const [newProductPriceSale, setNewProductPriceSale] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newTitle.trim() || !newImageUrl.trim()) {
      setFormError("Title and Image URL are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const catObj = CATEGORIES_LIST.find((c) => c.name === newCategory) || CATEGORIES_LIST[0];
      const res = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: catObj.name,
          categorySlug: catObj.slug,
          image: newImageUrl.trim(),
          difficulty: newDifficulty,
          description: newDescription.trim() || `Beautiful jigsaw puzzle of ${newTitle.trim()}`,
          voucherCode: newVoucherCode.trim() || undefined,
          discountPercent: newDiscountPercent.trim() ? Number(newDiscountPercent) : undefined,
          productUrl: newProductUrl.trim() || undefined,
          productPriceOriginal: newProductPriceOriginal.trim() || undefined,
          productPriceSale: newProductPriceSale.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess("Puzzle created successfully!");
        setNewTitle("");
        setNewImageUrl("");
        setNewDescription("");
        setNewVoucherCode("");
        setNewDiscountPercent("");
        setNewProductUrl("");
        setNewProductPriceOriginal("");
        setNewProductPriceSale("");
        onSuccess();
        setTimeout(() => {
          onClose();
          setFormSuccess("");
        }, 1200);
      } else {
        setFormError(json.error || "Failed to create puzzle.");
      }
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-6 rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-stone-900">Add New Jigsaw Puzzle</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Puzzle Title</label>
            <input
              type="text"
              placeholder="e.g. Majestic Sunset over Mountains"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
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
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
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
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          {newImageUrl && (
            <div className="mt-2">
              <span className="block font-semibold text-stone-500 text-[11px] mb-1">Image Preview:</span>
              <div className="w-full h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={newImageUrl}
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
              placeholder="Brief description of the puzzle image..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
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
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value)}
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
                  value={newDiscountPercent}
                  onChange={(e) => setNewDiscountPercent(e.target.value)}
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
                value={newProductUrl}
                onChange={(e) => setNewProductUrl(e.target.value)}
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
                  value={newProductPriceOriginal}
                  onChange={(e) => setNewProductPriceOriginal(e.target.value)}
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
                  value={newProductPriceSale}
                  onChange={(e) => setNewProductPriceSale(e.target.value)}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black shadow-sm transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Puzzle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Puzzle,
  TrendingUp,
  Database,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  Loader2,
  Layers,
  LogOut,
  Pencil,
  Tag,
  ShoppingBag,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { CATEGORIES_LIST } from "@/lib/data/puzzles-data";

interface AdminPuzzle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  plays: number;
  likes: number;
  difficulty: string;
  description: string;
  // E-Commerce Extensions (Sprint 6.2)
  voucherCode?: string;
  discountPercent?: number;
  productUrl?: string;
  productPriceOriginal?: string;
  productPriceSale?: string;
}

interface AdminScore {
  id: string;
  puzzleSlug: string;
  playerName: string;
  pieceCount: number;
  elapsedSeconds: number;
  moves: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"puzzles" | "scores" | "health">("puzzles");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      alert("Đã xảy ra lỗi khi đăng xuất.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Data states
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [scores, setScores] = useState<AdminScore[]>([]);
  const [loadingPuzzles, setLoadingPuzzles] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Add Puzzle Form State
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Edit Puzzle Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<AdminPuzzle | null>(null);
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

  const openEditModal = (p: AdminPuzzle) => {
    setEditingPuzzle(p);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditImageUrl(p.image);
    setEditDifficulty((p.difficulty as any) || "medium");
    setEditDescription(p.description || "");
    setEditVoucherCode(p.voucherCode || "");
    setEditDiscountPercent(p.discountPercent !== undefined ? String(p.discountPercent) : "");
    setEditProductUrl(p.productUrl || "");
    setEditProductPriceOriginal(p.productPriceOriginal || "");
    setEditProductPriceSale(p.productPriceSale || "");
    setEditFormError("");
    setEditFormSuccess("");
    setShowEditModal(true);
  };

  const handleUpdatePuzzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPuzzle) return;
    setEditFormError("");
    setEditFormSuccess("");
    setIsUpdating(true);

    try {
      const res = await fetch("/api/puzzles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPuzzle.id,
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
        setPuzzles((prev) =>
          prev.map((item) => (item.id === editingPuzzle.id ? { ...item, ...json.data } : item))
        );
        setTimeout(() => {
          setShowEditModal(false);
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

  // Load Puzzles
  const loadPuzzles = async () => {
    try {
      setLoadingPuzzles(true);
      const res = await fetch("/api/puzzles");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPuzzles(json.data);
      }
    } catch (err) {
      console.error("Failed to load puzzles", err);
    } finally {
      setLoadingPuzzles(false);
    }
  };

  // Load Scores
  const loadScores = async () => {
    try {
      setLoadingScores(true);
      const res = await fetch("/api/scores?all=true");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setScores(json.data);
      }
    } catch (err) {
      console.error("Failed to load scores", err);
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    loadPuzzles();
    loadScores();
  }, []);

  // Handle Add Puzzle
  const handleAddPuzzle = async (e: React.FormEvent) => {
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
        loadPuzzles();
        setTimeout(() => setShowAddModal(false), 1200);
      } else {
        setFormError(json.error || "Failed to create puzzle.");
      }
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Puzzle
  const handleDeletePuzzle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete puzzle: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/puzzles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setPuzzles((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(json.error || "Could not delete puzzle");
      }
    } catch {
      alert("Network error deleting puzzle");
    }
  };

  // Handle Delete Score
  const handleDeleteScore = async (id: string) => {
    if (!confirm("Delete this leaderboard entry?")) return;
    try {
      const res = await fetch(`/api/scores?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setScores((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(json.error || "Could not delete score");
      }
    } catch {
      alert("Network error deleting score");
    }
  };

  // Filtered Puzzles
  const filteredPuzzles = puzzles.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.categorySlug === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalPlays = puzzles.reduce((acc, p) => acc + (p.plays || 0), 0);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-900 pb-16">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition"
            >
              Back to Site
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Puzzle
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Đăng xuất khỏi phiên quản trị"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? "Đang thoát..." : "Đăng xuất"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Puzzles</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{puzzles.length}</p>
              <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Across {CATEGORIES_LIST.length} categories</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Puzzle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Plays</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{totalPlays.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active player sessions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Leaderboard Scores</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{scores.length}</p>
              <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Verified solutions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Engine Health</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-lg font-black text-stone-900">100% Online</p>
              </div>
              <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Canvas 2D + DSU 60fps</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab("puzzles")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "puzzles"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Puzzle className="w-4 h-4" />
            Puzzle Catalog ({puzzles.length})
          </button>
          <button
            onClick={() => setActiveTab("scores")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "scores"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard Audit ({scores.length})
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "health"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Database className="w-4 h-4" />
            System & Database Health
          </button>
        </div>

        {/* Tab 1: Puzzles Catalog */}
        {activeTab === "puzzles" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter puzzles by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Puzzle
                </button>
              </div>
            </div>

            {/* Puzzles Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              {loadingPuzzles ? (
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
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition cursor-pointer"
                                title="Edit Puzzle"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePuzzle(p.id, p.title)}
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
        )}

        {/* Tab 2: Leaderboard Audit */}
        {activeTab === "scores" && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-stone-900">Global Score Records Audit</h3>
              <button
                onClick={loadScores}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 transition cursor-pointer"
              >
                Refresh Scores
              </button>
            </div>

            {loadingScores ? (
              <div className="py-12 text-center text-xs font-semibold text-stone-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                Loading scores...
              </div>
            ) : scores.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-stone-400">
                No scores recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-[11px] uppercase font-bold text-stone-400 border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Score ID</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Puzzle Slug</th>
                      <th className="py-3 px-4 text-right">Pieces</th>
                      <th className="py-3 px-4 text-right">Time</th>
                      <th className="py-3 px-4 text-right">Moves</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                    {scores.map((s) => {
                      const mins = Math.floor(s.elapsedSeconds / 60);
                      const secs = s.elapsedSeconds % 60;
                      const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                      return (
                        <tr key={s.id} className="hover:bg-stone-50/60 transition">
                          <td className="py-2.5 px-4 font-mono text-[11px] text-stone-400">{s.id}</td>
                          <td className="py-2.5 px-4 font-bold text-stone-900">{s.playerName}</td>
                          <td className="py-2.5 px-4 font-mono text-stone-600 text-[11px]">{s.puzzleSlug}</td>
                          <td className="py-2.5 px-4 text-right font-mono">{s.pieceCount}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-stone-600">{timeFormatted}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-stone-500">{s.moves}</td>
                          <td className="py-2.5 px-4 text-right font-black text-amber-600">
                            {s.elapsedSeconds + s.moves}
                          </td>
                          <td className="py-2.5 px-4 text-[11px] text-stone-400">
                            {new Date(s.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteScore(s.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Score"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: System Health */}
        {activeTab === "health" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                <Database className="w-4 h-4 text-amber-500" />
                Database & Backend Architecture
              </div>
              <ul className="text-xs space-y-3 font-semibold text-stone-600">
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>Supabase Integration</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Schema Ready & Auto-Fallback
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>In-Memory Persistence</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                    Active (Zero latency)
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>Cron Keep-Alive Skill</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Installed (`keeping-supabase-alive`)
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Frontend Engine & Assets
              </div>
              <ul className="text-xs space-y-3 font-semibold text-stone-600">
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>Cubic Bézier Cuts</span>
                  <span className="text-stone-900 font-bold">Classic, Hearts, Stars</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>Audio Synthesizer</span>
                  <span className="text-stone-900 font-bold">Web Audio API (Synthesized clicks & chimes)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>Disjoint-Set Union (DSU)</span>
                  <span className="text-stone-900 font-bold">Path compression + Union by rank</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span>PWA Manifest</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Installed (`site.webmanifest`)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Add Puzzle Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative bg-white p-6 rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-stone-900">Add New Jigsaw Puzzle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddPuzzle} className="space-y-3.5 text-xs">
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

              {/* Image Preview */}
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
                      placeholder="e.g. 1.250.000₫"
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
                      placeholder="e.g. 1.050.000₫"
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
                  onClick={() => setShowAddModal(false)}
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
      )}

      {/* Edit Puzzle Modal */}
      {showEditModal && editingPuzzle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden">
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
                onClick={() => setShowEditModal(false)}
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
                      placeholder="e.g. 1.250.000₫"
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
                      placeholder="e.g. 1.050.000₫"
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
                  onClick={() => setShowEditModal(false)}
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
      )}
    </div>
  );
}

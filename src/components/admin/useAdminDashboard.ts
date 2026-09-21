"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminPuzzle, AdminScore, AdminAnalyticsData } from "./types";
import { AdminTab } from "./AdminTabsNav";

export function useAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("puzzles");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Data states
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [scores, setScores] = useState<AdminScore[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
  const [loadingPuzzles, setLoadingPuzzles] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingOrdersCsv, setIsExportingOrdersCsv] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<AdminPuzzle | null>(null);

  // Logout
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

  // Load Puzzles
  const loadPuzzles = useCallback(async () => {
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
  }, []);

  // Load Scores
  const loadScores = useCallback(async () => {
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
  }, []);

  // Load Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setAnalyticsData(json.data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      const res = await fetch("/api/admin/analytics?format=csv");
      if (!res.ok) {
        throw new Error("Failed to export CSV from server");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cunfashion-affiliate-clicks-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Export CSV failed:", err);
      alert("Đã xảy ra lỗi khi xuất file CSV.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Export Orders CSV
  const handleExportOrdersCsv = async () => {
    try {
      setIsExportingOrdersCsv(true);
      const res = await fetch("/api/admin/analytics?format=conversions_csv");
      if (!res.ok) {
        throw new Error("Failed to export orders CSV from server");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cunfashion-affiliate-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Export orders CSV failed:", err);
      alert("Đã xảy ra lỗi khi xuất file CSV đơn hàng.");
    } finally {
      setIsExportingOrdersCsv(false);
    }
  };

  // Delete Puzzle
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

  // Delete Score
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

  const openEditModal = (p: AdminPuzzle) => {
    setEditingPuzzle(p);
    setShowEditModal(true);
  };

  const handlePuzzleUpdated = (updated: AdminPuzzle) => {
    setPuzzles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  useEffect(() => {
    loadPuzzles();
    loadScores();
    loadAnalytics();
  }, [loadPuzzles, loadScores, loadAnalytics]);

  const totalPlays = puzzles.reduce((acc, p) => acc + (p.plays || 0), 0);

  return {
    activeTab,
    setActiveTab,
    isLoggingOut,
    handleLogout,
    puzzles,
    scores,
    analyticsData,
    loadingPuzzles,
    loadingScores,
    loadingAnalytics,
    isExportingCsv,
    isExportingOrdersCsv,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    editingPuzzle,
    openEditModal,
    handlePuzzleUpdated,
    loadPuzzles,
    loadScores,
    loadAnalytics,
    handleExportCsv,
    handleExportOrdersCsv,
    handleDeletePuzzle,
    handleDeleteScore,
    totalPlays,
  };
}

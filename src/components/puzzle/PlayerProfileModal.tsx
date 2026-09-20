"use client";

import React, { useState, useEffect } from "react";
import { User, Sparkles, X, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export const PLAYER_COLORS = [
  { name: "Amber", hex: "#f59e0b", bg: "bg-amber-500" },
  { name: "Emerald", hex: "#10b981", bg: "bg-emerald-500" },
  { name: "Sky", hex: "#0ea5e9", bg: "bg-sky-500" },
  { name: "Rose", hex: "#f43f5e", bg: "bg-rose-500" },
  { name: "Purple", hex: "#a855f7", bg: "bg-purple-500" },
  { name: "Indigo", hex: "#6366f1", bg: "bg-indigo-500" },
];

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (name: string, color: string) => void;
}

export default function PlayerProfileModal({
  isOpen,
  onClose,
  onSaved,
}: PlayerProfileModalProps) {
  const { isVietnamese } = useTranslation();
  const [nickname, setNickname] = useState("");
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].hex);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName =
        localStorage.getItem("cunfashion_player_name") ||
        localStorage.getItem("puzzlesnap_player_name") ||
        "";
      const savedCol =
        localStorage.getItem("cunfashion_player_color") || PLAYER_COLORS[0].hex;
      setNickname(savedName);
      setSelectedColor(savedCol);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nickname.trim().replace(/<[^>]*>/g, "").substring(0, 25);
    const finalName = clean || (isVietnamese ? "Người chơi" : "Player");

    if (typeof window !== "undefined") {
      localStorage.setItem("cunfashion_player_name", finalName);
      localStorage.setItem("cunfashion_player_color", selectedColor);
      window.dispatchEvent(
        new CustomEvent("player_profile_updated", {
          detail: { name: finalName, color: selectedColor },
        })
      );
    }

    onSaved?.(finalName, selectedColor);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-stone-950 font-black shadow-md transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isVietnamese ? "Hồ Sơ Người Chơi" : "Player Profile"}
              </h3>
              <p className="text-xs text-stone-400">
                {isVietnamese ? "Danh tính tham gia ghép hình & rủ bạn bè" : "Your identity in leaderboards and co-op rooms"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">
              {isVietnamese ? "Tên Nickname hiển thị:" : "Display Nickname:"}
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={isVietnamese ? "Ví dụ: Minh Tuấn, Sunny, Hero..." : "e.g., Alex, Sophia, Hawk..."}
              className="w-full bg-stone-950 text-stone-200 text-sm font-semibold px-4 py-3 rounded-xl border border-stone-800 outline-none focus:border-amber-500 transition"
            />
            <p className="text-[11px] text-stone-500">
              {isVietnamese
                ? "Tên này sẽ tự động xuất hiện trên Bảng Xếp Hạng và khi bạn rủ bạn bè vào phòng Co-Op."
                : "This name appears on the leaderboard and in multiplayer Co-Op games."}
            </p>
          </div>

          {/* Color Palette */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">
              {isVietnamese ? "Màu sắc đại diện trong phòng:" : "Player Badge Color:"}
            </label>
            <div className="flex items-center gap-2.5 pt-1">
              {PLAYER_COLORS.map((col) => {
                const isSelected = selectedColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col.hex)}
                    className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                      isSelected ? "ring-4 ring-amber-400 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-stone-950 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Benefit Card */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {isVietnamese
                ? "Không cần đăng ký phức tạp! Danh tính được lưu tự động trên trình duyệt để bạn sẵn sàng chơi ngay và mời bạn bè bất cứ lúc nào."
                : "Zero friction! Your profile is saved locally so you are always ready to play and invite friends without complicated sign-ups."}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
            >
              {isVietnamese ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-stone-950 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                savedSuccess
                  ? "bg-emerald-400 hover:bg-emerald-300"
                  : "bg-amber-400 hover:bg-amber-300 active:scale-95"
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              <span>{savedSuccess ? (isVietnamese ? "Đã lưu!" : "Saved!") : (isVietnamese ? "Lưu Thay Đổi" : "Save Changes")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

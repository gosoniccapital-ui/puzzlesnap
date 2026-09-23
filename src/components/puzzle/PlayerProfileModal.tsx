"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Sparkles, X, Check, LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

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
  const { t, lang } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].hex);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
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

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          if (googleName && !localStorage.getItem("cunfashion_player_name")) {
            setNickname(googleName);
          }
        }
      });
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    try {
      setIsAuthLoading(true);
      setAuthNotice(null);
      const redirectUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (data?.url) {
        // Pre-flight probe to verify Supabase Google OAuth provider is active before redirecting
        try {
          const res = await fetch(data.url);
          if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            if (
              errJson?.msg?.includes("missing OAuth client ID") ||
              errJson?.msg?.includes("not enabled")
            ) {
              setAuthNotice(
                lang === "vi"
                  ? "Google OAuth đang chờ nạp Client ID trên Supabase. Bạn có thể đặt Biệt danh để lưu hồ sơ chơi ngay!"
                  : "Google OAuth is awaiting Client ID on Supabase. You can set a nickname and play now!"
              );
              return;
            }
          }
        } catch {
          // If probe is blocked by browser CORS/policy, proceed to standard navigation
        }
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google auth error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Handle ESC key to dismiss modal cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nickname.trim().slice(0, 25);
    const finalName = clean || t.profile.defaultName;

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

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161822] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl cursor-default transition-colors duration-200"
      >
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
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-cinzel">
                {t.profile.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.profile.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.profile.nicknameLabel}
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.profile.nicknamePlaceholder}
              className="w-full bg-stone-50 dark:bg-[#0c0d12] text-stone-900 dark:text-stone-100 text-sm font-semibold px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 outline-none focus:border-amber-500 transition"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {t.profile.nicknameHelper}
            </p>
          </div>

          {/* Color Palette */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.profile.colorLabel}
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
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              {t.profile.nicknameHelper}
            </span>
          </div>

          {/* Cloud Sync (Lazy Auth) Section */}
          <div className="pt-1 border-t border-stone-200 dark:border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-600 dark:text-stone-300">
                {t.profile.orConnect}
              </span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                Cloud Backup
              </span>
            </div>

            {userEmail ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-[#0c0d12] border border-stone-200 dark:border-stone-800 text-xs">
                <div className="truncate pr-2">
                  <span className="text-stone-600 dark:text-stone-300">{t.profile.connectedAs}: </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{userEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 transition shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.profile.signOut}
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs font-semibold border border-stone-200 dark:border-stone-700/80 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isAuthLoading ? "Connecting..." : t.profile.signInWithGoogle}</span>
                </button>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center leading-tight">
                  {t.profile.cloudSyncBenefit}
                </p>
                {authNotice && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center leading-relaxed">
                    {authNotice}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
            >
              {t.profile.cancel}
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-stone-950 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                savedSuccess
                  ? "bg-emerald-400 hover:bg-emerald-300"
                  : "bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 active:scale-95"
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              <span>{savedSuccess ? t.profile.saved : t.profile.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

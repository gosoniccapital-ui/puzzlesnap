"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isLoaded } = useTheme();

  if (!isLoaded) {
    // Render static placeholder matching dimensions to avoid layout shift
    return (
      <div className={`w-12 h-12 rounded-xl border border-stone-250 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative group flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
        isDark
          ? "bg-[#161822] hover:bg-[#1f2230] border-amber-500/25 text-amber-400 hover:text-amber-300 shadow-[0_0_15px_-4px_rgba(223,186,115,0.2)]"
          : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-900 shadow-sm hover:border-amber-400/50"
      } ${className}`}
      title={isDark ? "Switch to Haute Couture Light Theme" : "Switch to Velvet Midnight Dark Theme"}
      aria-label="Toggle visual theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12 text-stone-700" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wider uppercase">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

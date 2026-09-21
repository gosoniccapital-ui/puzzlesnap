"use client";

import React from "react";
import Link from "next/link";
import { Plus, LogOut } from "lucide-react";
import Logo from "@/components/brand/Logo";

interface AdminHeaderProps {
  onOpenAddModal: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function AdminHeader({
  onOpenAddModal,
  onLogout,
  isLoggingOut,
}: AdminHeaderProps) {
  return (
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
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 text-xs font-extrabold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Puzzle
          </button>
          <button
            onClick={onLogout}
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
  );
}

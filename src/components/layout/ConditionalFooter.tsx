"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Cắt bỏ hoàn toàn footer Jigsaw Puzzle trên trang Style Advisor
  if (pathname === "/style-advisor") {
    return null;
  }

  return (
    <footer className="border-t border-stone-800/80 bg-[#09090b]/90 backdrop-blur-xl py-12 text-center text-xs text-stone-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        <p className="font-semibold text-stone-300 tracking-wide font-cinzel">
          {t.footer?.brandTitle || "CunFashion — Artisanal Online Jigsaw Puzzles"}
        </p>
        <p className="text-stone-500 text-[11px]">
          {t.footer?.copyright || "© 2026 CunFashion. All rights reserved."}
        </p>
        <div className="pt-2">
          <a
            href="/admin/login"
            className="text-stone-600 hover:text-[#dfba73] text-[11px] transition duration-150"
          >
            {t.footer?.adminAccess || "Admin Access"}
          </a>
        </div>
      </div>
    </footer>
  );
}

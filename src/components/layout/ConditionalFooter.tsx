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
    <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-[#faf9f6]/90 dark:bg-[#09090b]/90 backdrop-blur-xl py-10 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-semibold text-stone-800 dark:text-stone-300 tracking-wide font-cinzel">
          {t.footer?.brandTitle || "CunFashion — Artisanal Online Jigsaw Puzzles"}
        </p>
        <p className="text-stone-500 dark:text-stone-500 text-[11px]">
          {t.footer?.copyright || "© 2026 CunFashion. All rights reserved."}
        </p>
      </div>
    </footer>
  );
}

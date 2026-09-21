"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import SocialLinks from "@/components/layout/SocialLinks";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Cắt bỏ hoàn toàn footer Jigsaw Puzzle trên trang Style Advisor
  if (pathname === "/style-advisor") {
    return null;
  }

  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-[#faf9f6]/90 dark:bg-[#09090b]/90 backdrop-blur-xl py-8 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full border-b border-stone-200/60 dark:border-stone-800/60 pb-6 gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-stone-900 dark:text-stone-200 tracking-wide font-cinzel text-sm">
              {t.footer?.brandTitle || "CunFashion — Artisanal Online Jigsaw Puzzles"}
            </p>
            <p className="text-stone-500 dark:text-stone-500 text-[11px] mt-0.5">
              {t.footer?.copyright || "© 2026 CunFashion. All rights reserved."}
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Connect With Us
            </span>
            <SocialLinks size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}

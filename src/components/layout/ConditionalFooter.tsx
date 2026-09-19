"use client";

import { usePathname } from "next/navigation";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Cắt bỏ hoàn toàn footer Jigsaw Puzzle trên trang Style Advisor
  if (pathname === "/style-advisor") {
    return null;
  }

  return (
    <footer className="border-t border-stone-200 bg-white py-12 text-center text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-bold text-stone-700">CunFashion — Free Online Jigsaw Puzzles</p>
        <p>© 2026 CunFashion. All rights reserved.</p>
        <div className="pt-2">
          <a href="/admin/login" className="text-stone-300 hover:text-stone-500 text-[11px] transition">
            Admin Access
          </a>
        </div>
      </div>
    </footer>
  );
}

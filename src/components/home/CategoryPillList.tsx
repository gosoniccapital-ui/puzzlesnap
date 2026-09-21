import React from "react";
import Link from "next/link";

interface CategoryPillListProps {
  categories: { name: string; slug: string }[];
  title: string;
  seeAllLabel: string;
}

export function CategoryPillList({
  categories,
  title,
  seeAllLabel,
}: CategoryPillListProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
          {title}
        </h2>
        <Link
          href="/categories"
          className="touch-target inline-flex items-center text-xs font-bold text-[#dfba73] hover:text-amber-500 dark:hover:text-amber-300 transition"
        >
          {seeAllLabel}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/90 dark:border-stone-800 hover:border-[#dfba73] text-center font-bold text-xs text-stone-700 dark:text-stone-300 hover:text-[#dfba73] dark:hover:text-[#dfba73] transition-all duration-200 shadow-2xs hover:shadow-[0_0_15px_rgba(223,186,115,0.15)] backdrop-blur-md"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

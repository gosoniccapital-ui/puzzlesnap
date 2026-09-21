import React from "react";

export function HomeSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading puzzle feed..."
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 animate-pulse"
    >
      {/* 1. Hero Section Skeleton */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-100/60 dark:bg-stone-900/40 p-6 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="w-44 h-7 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="space-y-3">
              <div className="w-3/4 h-12 rounded-xl bg-stone-300 dark:bg-stone-800" />
              <div className="w-1/2 h-8 rounded-xl bg-stone-200 dark:bg-stone-800/80" />
              <div className="w-full h-16 rounded-xl bg-stone-200/70 dark:bg-stone-800/50" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="w-40 h-12 rounded-full bg-stone-300 dark:bg-stone-700" />
              <div className="w-40 h-12 rounded-full bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] rounded-2xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      </section>

      {/* 2. Featured Grid Skeleton */}
      <section className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="w-48 h-8 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="w-20 h-5 rounded bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </section>

      {/* 3. Lookbook Skeleton */}
      <section className="p-6 sm:p-10 rounded-3xl bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="w-56 h-8 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="w-36 h-9 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </section>
    </div>
  );
}

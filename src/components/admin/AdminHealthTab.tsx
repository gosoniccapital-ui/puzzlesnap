"use client";

import React from "react";
import { Database, Sparkles } from "lucide-react";

export default function AdminHealthTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
          <Database className="w-4 h-4 text-amber-500" />
          Database & Backend Architecture
        </div>
        <ul className="text-xs space-y-3 font-semibold text-stone-600">
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>Supabase Integration</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Schema Ready & Auto-Fallback
            </span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>In-Memory Persistence</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
              Active (Zero latency)
            </span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>Cron Keep-Alive Skill</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Installed (`keeping-supabase-alive`)
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Frontend Engine & Assets
        </div>
        <ul className="text-xs space-y-3 font-semibold text-stone-600">
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>Cubic Bézier Cuts</span>
            <span className="text-stone-900 font-bold">Classic, Hearts, Stars</span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>Audio Synthesizer</span>
            <span className="text-stone-900 font-bold">Web Audio API (Synthesized clicks & chimes)</span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>Disjoint-Set Union (DSU)</span>
            <span className="text-stone-900 font-bold">Path compression + Union by rank</span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span>PWA Manifest</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Installed (`site.webmanifest`)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

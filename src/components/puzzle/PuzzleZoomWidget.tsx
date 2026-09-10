"use client";

import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

export interface PuzzleZoomWidgetProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function PuzzleZoomWidget({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PuzzleZoomWidgetProps) {
  return (
    <div className="absolute bottom-3 right-3 z-10 flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md p-1 gap-1 select-none">
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition cursor-pointer"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onResetZoom}
        className="px-2 py-0.5 text-[11px] font-black text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100 transition min-w-[42px] text-center cursor-pointer"
        title="Reset Zoom to 100%"
      >
        {zoomPercent}%
      </button>
      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition cursor-pointer"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

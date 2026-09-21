import React from "react";
import { Chrome, X, Check, Lightbulb } from "lucide-react";

interface StyleExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StyleExtensionModal({ isOpen, onClose }: StyleExtensionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#161822] border border-amber-500/30 dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="touch-target absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#dfba73] flex items-center justify-center">
            <Chrome className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-lg font-cinzel">
              Cun Style Advisor Extension
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Instant AI outfit matching on any website
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          <p className="font-semibold text-stone-900 dark:text-stone-100">
            Installation Guide (Developer Mode):
          </p>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>
              Open Google Chrome and navigate to <code className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-amber-600 dark:text-amber-400">chrome://extensions</code>
            </li>
            <li>Enable <strong>Developer mode</strong> in the top right toggle.</li>
            <li>Click <strong>Load unpacked</strong>.</li>
            <li>Select the folder: <code className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-stone-800 dark:text-stone-200">extension/cun-style-advisor</code> from this project.</li>
          </ol>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#dfba73]" />
          <span>
            Right-click any fashion photo on Pinterest, Instagram, or Lookbook and select &quot;Analyze Outfit with CunFashion&quot; for instant Amazon search!
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="touch-target w-full py-3.5 bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-xs sm:text-sm rounded-full transition shadow-md cursor-pointer"
        >
          Got It, Let&apos;s Style!
        </button>
      </div>
    </div>
  );
}

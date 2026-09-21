import React, { useRef } from "react";
import { Search, Camera, X, SlidersHorizontal, Shuffle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface StyleAdvisorSearchBarProps {
  keyword: string;
  onKeywordChange: (kw: string) => void;
  selectedImage: string | null;
  imageName: string;
  onClearImage: () => void;
  onImageFile: (f: File) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onSurpriseMe: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  quickKeywords: string[];
}

export function StyleAdvisorSearchBar({
  keyword,
  onKeywordChange,
  selectedImage,
  imageName,
  onClearImage,
  onImageFile,
  showFilters,
  onToggleFilters,
  onSurpriseMe,
  onAnalyze,
  isAnalyzing,
  quickKeywords,
}: StyleAdvisorSearchBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Unified Search Input with Image Upload */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 text-[#dfba73] pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isAnalyzing) onAnalyze();
            }}
            placeholder={
              selectedImage
                ? "Describe style nuance or search with your uploaded photo..."
                : "Search garment, trend, or aesthetic (e.g., Trench coat, Soft Retro, Silk Dress)..."
            }
            className="w-full pl-12 pr-28 sm:pr-32 py-4 rounded-2xl bg-stone-100/90 dark:bg-stone-900/90 border border-stone-300/80 dark:border-stone-700/80 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 font-medium text-xs sm:text-sm focus:outline-none focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73] transition backdrop-blur-md shadow-inner"
          />

          {/* Right Action Icons Inside Bar */}
          <div className="absolute right-3 flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedImage
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                  : "bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#dfba73] hover:bg-[#dfba73]/10"
              }`}
              title="Upload an outfit image to match style"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">
                {selectedImage ? "Photo Loaded" : "Upload Photo"}
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="touch-target flex-1 sm:flex-none px-7 py-4 bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-[0_0_20px_rgba(223,186,115,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{isAnalyzing ? "Analyzing..." : "Find Outfits"}</span>
          </button>

          <button
            type="button"
            onClick={onSurpriseMe}
            disabled={isAnalyzing}
            className="touch-target p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700/80 hover:border-[#dfba73] text-stone-700 dark:text-stone-300 hover:text-[#dfba73] transition flex items-center justify-center cursor-pointer shadow-sm"
            title="Surprise Me with Curated Trend"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFilters}
            className={`touch-target p-4 rounded-2xl border transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              showFilters
                ? "bg-[#dfba73] text-stone-950 border-[#dfba73]"
                : "bg-stone-100 dark:bg-stone-900 border-stone-300/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-[#dfba73]"
            }`}
            title="Toggle Filter Options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Selected Image Chip */}
      {selectedImage && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 w-fit animate-fadeIn">
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold line-clamp-1 max-w-xs">{imageName || "Custom Outfit Photo"}</span>
          <button
            type="button"
            onClick={onClearImage}
            className="p-1 hover:bg-emerald-500/20 rounded-md transition ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Keywords */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Popular:</span>
        {quickKeywords.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => onKeywordChange(kw)}
            className="touch-target px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-800 hover:border-[#dfba73] transition cursor-pointer"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}

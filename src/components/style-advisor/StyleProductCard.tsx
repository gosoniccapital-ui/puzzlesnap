import React, { useState } from "react";
import { ShoppingBag, ExternalLink, Heart, Check, Copy } from "lucide-react";
import type { StyleProduct } from "@/lib/data/style-advisor-data";

interface StyleProductCardProps {
  product: StyleProduct;
  isSaved: boolean;
  onToggleWardrobe: (p: StyleProduct) => void;
  onTrackClick: (id: string, name: string, platform: string, link: string) => void;
  shopOnAmazonLabel: string;
}

export function StyleProductCard({
  product: p,
  isSaved,
  onToggleWardrobe,
  onTrackClick,
  shopOnAmazonLabel,
}: StyleProductCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(p.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onTrackClick(p.id, p.name, p.platform, p.link);
  };

  return (
    <div className="bg-white dark:bg-[#161822] rounded-2xl border border-stone-200/90 dark:border-stone-800/80 overflow-hidden shadow-sm hover:shadow-[0_12px_30px_rgba(223,186,115,0.2)] dark:hover:shadow-[0_12px_30px_rgba(223,186,115,0.15)] hover:border-[#dfba73] dark:hover:border-[#dfba73] transition-all duration-300 flex flex-col justify-between group backdrop-blur-md">
      <div>
        <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-950 overflow-hidden">
          <img
            src={p.img}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-95 group-hover:brightness-105"
          />
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
              p.platform === "CunCute Store"
                ? "bg-pink-600 text-white"
                : p.platform === "Rakuten"
                ? "bg-red-600 text-white"
                : p.platform === "Amazon"
                ? "bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 font-black shadow-md"
                : "bg-stone-900 text-white"
            }`}
          >
            {p.platform}
          </span>
          {p.tag && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-stone-950/90 text-[#dfba73] border border-[#dfba73]/30 shadow-sm backdrop-blur-md">
              {p.tag}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWardrobe(p);
            }}
            className={`touch-target absolute bottom-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition shadow-md flex items-center justify-center cursor-pointer ${
              isSaved
                ? "bg-pink-600 text-white shadow-pink-600/40 scale-105"
                : "bg-black/60 dark:bg-black/70 text-white hover:bg-[#dfba73] hover:text-stone-950 hover:scale-105 border border-white/20"
            }`}
            title={isSaved ? "Remove from Wardrobe" : "Save to Wardrobe"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-white text-white" : "text-current"}`} />
          </button>
        </div>

        <div className="p-3.5">
          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-[#dfba73] dark:group-hover:text-[#dfba73] transition">
            {p.name}
          </h4>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm sm:text-base font-extrabold text-[#dfba73]">
              {p.price}
            </span>
            {p.originalPrice && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                {p.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-0 space-y-2">
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrackClick(p.id, p.name, p.platform, p.link)}
          className={`touch-target w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold rounded-xl transition shadow-sm ${
            p.platform === "CunCute Store"
              ? "bg-pink-600 hover:bg-pink-700 text-white"
              : p.platform === "Rakuten"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : p.platform === "Amazon"
              ? "bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black shadow-[0_0_15px_rgba(223,186,115,0.3)]"
              : "bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            {p.platform === "CunCute Store"
              ? "Shop at CunCute Store"
              : p.platform === "Rakuten"
              ? "Shop on Rakuten"
              : shopOnAmazonLabel}
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="touch-target w-full py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  RotateCcw,
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Tag,
} from "lucide-react";

export interface PuzzleVictoryModalProps {
  isOpen: boolean;
  title: string;
  seconds: number;
  moveCount: number;
  formatTime: (secs: number) => string;
  playerName: string;
  onPlayerNameChange: (val: string) => void;
  onSubmitScore: (e: React.FormEvent) => void;
  isSubmittingScore: boolean;
  scoreSubmitted: boolean;
  onPlayAgain: () => void;
  // E-Commerce Extensions (Sprint 6.2 & Sprint 7.5 Dual Rewards)
  voucherCode?: string;
  secondaryVoucherCode?: string;
  discountPercent?: number;
  secondaryDiscountPercent?: number;
  productUrl?: string;
  productPriceOriginal?: string;
  productPriceSale?: string;
  imageSrc?: string;
  ctaText?: string;
}

export default function PuzzleVictoryModal({
  isOpen,
  title,
  seconds,
  moveCount,
  formatTime,
  playerName,
  onPlayerNameChange,
  onSubmitScore,
  isSubmittingScore,
  scoreSubmitted,
  onPlayAgain,
  voucherCode,
  secondaryVoucherCode,
  discountPercent,
  productUrl,
  productPriceOriginal,
  productPriceSale,
  ctaText,
}: PuzzleVictoryModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Dual Vouchers: 70Cute7LOOK (Lookbook Special) & CUNFASHION2026 (Storewide Reward)
  const primaryVoucher = voucherCode || "70Cute7LOOK";
  const secondaryVoucher = secondaryVoucherCode || "CUNFASHION2026";
  const resolvedDiscount = discountPercent || 10;

  // Comprehensive tracking URL supporting both voucher codes in query and UTM parameters
  const defaultProductUrl = `https://cute.cunfashion.com?coupon=${encodeURIComponent(
    primaryVoucher
  )}&secondary_coupon=${encodeURIComponent(
    secondaryVoucher
  )}&utm_source=puzzlesnap&utm_medium=victory_modal&utm_campaign=puzzle_rewards&utm_term=${encodeURIComponent(
    primaryVoucher
  )}&utm_content=${encodeURIComponent(secondaryVoucher)}`;

  const resolvedProductUrl = productUrl || defaultProductUrl;
  const resolvedCtaText = ctaText || "Shop Cute Outfits";

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2200);
    } catch {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2200);
    }
  };

  const handleCtaClick = () => {
    // Frictionless E-Commerce UX: Auto-copy primary voucher into clipboard on click
    copyToClipboard(primaryVoucher);
  };

  return (
    <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 p-4 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Header & Completion Stats */}
      <div className="flex flex-col items-center text-center space-y-2 max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <CheckCircle2 className="w-8 h-8 text-stone-950 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Congratulations!
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            You completed <strong className="text-amber-400">{title}</strong> in{" "}
            <strong className="text-amber-400 font-mono">{formatTime(seconds)}</strong> with{" "}
            <strong className="text-amber-400">{moveCount} moves</strong>!
          </p>
        </div>
      </div>

      {/* 2. Haute Couture E-Commerce Reward Card */}
      <div className="max-w-md w-full rounded-2xl bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-amber-500/40 p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CunFashion Exclusive Rewards</span>
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            2 VOUCHERS UNLOCKED
          </span>
        </div>

        {/* Dual Voucher Cards List */}
        <div className="space-y-2.5">
          {/* Voucher 1: Lookbook Special Reward */}
          <div className="bg-stone-950/80 border border-dashed border-amber-500/50 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 transition hover:border-amber-400">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  👗 Lookbook Special
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40">
                  VIP
                </span>
              </div>
              <span className="font-mono font-black text-sm sm:text-base text-amber-300 tracking-wider block truncate">
                {primaryVoucher}
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(primaryVoucher)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 ${
                copiedCode === primaryVoucher
                  ? "bg-emerald-500 text-stone-950 font-black"
                  : "bg-amber-400 hover:bg-amber-300 text-stone-950"
              }`}
              title={`Copy code ${primaryVoucher}`}
            >
              {copiedCode === primaryVoucher ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Voucher 2: Storewide Reward */}
          <div className="bg-stone-950/80 border border-dashed border-stone-700/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 transition hover:border-amber-500/40">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  🏷️ Storewide Reward
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-stone-800 text-amber-300 border border-stone-700">
                  {resolvedDiscount}% OFF
                </span>
              </div>
              <span className="font-mono font-black text-sm sm:text-base text-stone-200 tracking-wider block truncate">
                {secondaryVoucher}
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(secondaryVoucher)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 ${
                copiedCode === secondaryVoucher
                  ? "bg-emerald-500 text-stone-950 font-black"
                  : "bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700"
              }`}
              title={`Copy code ${secondaryVoucher}`}
            >
              {copiedCode === secondaryVoucher ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pricing (Optional) & "Shop Cute Outfits" Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          {productPriceSale ? (
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] text-stone-400 block">Lookbook Price:</span>
              <div className="flex items-baseline gap-1.5">
                {productPriceOriginal && (
                  <span className="text-xs text-stone-500 line-through">
                    {productPriceOriginal}
                  </span>
                )}
                <span className="text-sm font-black text-amber-400">
                  {productPriceSale}
                </span>
              </div>
            </div>
          ) : null}

          <a
            href={resolvedProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span>{resolvedCtaText}</span>
            <ExternalLink className="w-3 h-3 text-stone-950 opacity-75" />
          </a>
        </div>
      </div>

      {/* 3. Score Submission Form */}
      <div className="max-w-md w-full">
        {!scoreSubmitted ? (
          <form
            onSubmit={onSubmitScore}
            className="flex flex-col sm:flex-row items-center gap-2 bg-stone-900/90 p-2.5 rounded-2xl border border-stone-800 shadow-xl"
          >
            <input
              type="text"
              placeholder="Enter your nickname..."
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              maxLength={25}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400 border border-stone-700 w-full sm:w-56"
              required
            />
            <button
              type="submit"
              disabled={isSubmittingScore || !playerName.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isSubmittingScore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Save to Leaderboard
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 text-emerald-300 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-700/60 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Your score was recorded on the Leaderboard!
          </div>
        )}
      </div>

      {/* 4. Play Again & Action Buttons */}
      <button
        onClick={onPlayAgain}
        className="px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer border border-stone-700"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Play Again
      </button>
    </div>
  );
}

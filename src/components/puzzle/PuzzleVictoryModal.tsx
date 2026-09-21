"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Heart,
  Compass,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useWardrobe } from "@/lib/hooks/useWardrobe";

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
  slug?: string;
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
  slug,
  voucherCode,
  secondaryVoucherCode,
  discountPercent,
  productUrl,
  productPriceOriginal,
  productPriceSale,
  imageSrc,
  ctaText,
}: PuzzleVictoryModalProps) {
  const { t } = useTranslation();
  const { saveItem, isSaved, removeItem } = useWardrobe();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showShareGroup, setShowShareGroup] = useState(false);

  const wardrobeId = `puz-${slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const isLookSaved = isSaved(wardrobeId);

  const handleToggleWardrobe = () => {
    if (isLookSaved) {
      removeItem(wardrobeId);
    } else {
      saveItem({
        id: wardrobeId,
        name: title,
        price: productPriceSale || "$49.99",
        originalPrice: productPriceOriginal || "$59.99",
        discount: discountPercent ? `${discountPercent}% OFF` : "VIP",
        img: imageSrc || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
        link: productUrl || "https://cunfashion.com",
        platform: "Amazon",
        category: "Fashion",
        closetCategory: "party",
        savedAt: new Date().toISOString(),
      });
    }
  };

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
  const resolvedCtaText = ctaText || t.victory.shopCuteOutfits;

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

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return slug ? `${window.location.origin}/puzzle/${slug}` : window.location.href;
    }
    return `https://cunfashion.com/puzzle/${slug || ""}`;
  };

  const shareText = `🏆 ${t.victory.title} I solved "${title}" in ${formatTime(seconds)} with ${moveCount} ${t.victory.moves} on CunFashion! Can you beat my record?`;

  const handleShareVictory = async () => {
    const shareUrl = getShareUrl();
    if (typeof window !== "undefined" && navigator?.share) {
      try {
        await navigator.share({
          title: `CunFashion Puzzle: ${title}`,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback("Shared successfully!");
        setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard and toggle quick share group
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
      setShareFeedback("Score & Link copied to clipboard!");
      setShowShareGroup(true);
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      setShowShareGroup(true);
    }
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
            {t.victory.title}
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            {t.victory.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl shadow-inner">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {t.victory.time}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {formatTime(seconds)}
            </span>
          </div>
          <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl shadow-inner">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              {t.victory.moves}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {moveCount}
            </span>
          </div>
        </div>

        {/* 1-Click Share Victory Score Action */}
        <div className="w-full pt-1 space-y-2">
          <button
            onClick={handleShareVictory}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#dfba73] to-amber-400 hover:brightness-110 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-stone-950" />
            <span>{t.victory.shareResult}</span>
          </button>

          {shareFeedback && (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 py-1.5 px-3 rounded-lg animate-in fade-in">
              {shareFeedback}
            </div>
          )}

          {showShareGroup && (
            <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-xs"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 transition cursor-pointer shadow-xs"
                title="Share on X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + getShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition cursor-pointer shadow-xs"
                title="Share on Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          )}
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

        {/* Featured Lookbook Item & Quick Wardrobe Save */}
        {imageSrc ? (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={imageSrc}
                alt={title}
                className="w-12 h-12 rounded-lg object-cover border border-amber-500/30 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-200 block truncate">
                  {title}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {productPriceSale && (
                    <span className="text-xs font-black text-amber-400">
                      {productPriceSale}
                    </span>
                  )}
                  {productPriceOriginal && (
                    <span className="text-[10px] text-stone-500 line-through">
                      {productPriceOriginal}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleWardrobe}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer ${
                isLookSaved
                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
              }`}
              title={isLookSaved ? t.victory.savedToWardrobe : t.victory.saveToWardrobe}
            >
              <Heart
                className={`w-4 h-4 transition ${
                  isLookSaved ? "fill-rose-500 text-rose-500" : "text-stone-400"
                }`}
              />
              <span className="text-[11px] hidden sm:inline">
                {isLookSaved ? t.victory.savedToWardrobe : t.victory.saveToWardrobe}
              </span>
            </button>
          </div>
        ) : null}

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

        {/* Dual Actions: Shop on Amazon & Style Advisor Bridge */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <a
            href={resolvedProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span>{resolvedCtaText}</span>
            <ExternalLink className="w-3 h-3 text-stone-950 opacity-75" />
          </a>

          <Link
            href={`/style-advisor?keyword=${encodeURIComponent(title)}`}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 font-bold text-xs transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.victory.styleAdvisorMatch}</span>
          </Link>
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

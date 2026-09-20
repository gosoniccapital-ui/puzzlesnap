"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Check,
  HeartCrack,
  Link2,
  Camera,
  Copy,
  FolderHeart,
  Cloud
} from "lucide-react";
import { useWardrobe, WardrobeItem, ClosetCategory } from "@/lib/hooks/useWardrobe";
import { generateWardrobeShareUrl } from "@/lib/wardrobe/sharing";
import LookbookModal from "@/components/wardrobe/LookbookModal";

interface WardrobeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackClick?: (productId: string, productName: string, platform: string, url: string) => void;
}

export default function WardrobeDrawer({
  isOpen,
  onClose,
  onTrackClick
}: WardrobeDrawerProps) {
  const { items, count, removeItem, clearWardrobe, updateItemCategory, isCloudSyncing } = useWardrobe();
  const [selectedCategory, setSelectedCategory] = useState<ClosetCategory>("all");
  const [copied, setCopied] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);

  // Category counts
  const counts = useMemo(() => {
    const c = { all: items.length, party: 0, office: 0, casual: 0 };
    for (const item of items) {
      const cat = item.closetCategory || "casual";
      if (cat in c) {
        c[cat] += 1;
      }
    }
    return c;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => (item.closetCategory || "casual") === selectedCategory);
  }, [items, selectedCategory]);

  if (!isOpen) return null;

  const handleShareLink = () => {
    if (items.length === 0) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://cunfashion.com";
    const shareUrl = generateWardrobeShareUrl(items, origin);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2500);
    });
  };

  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = items
      .map(
        (it, idx) =>
          `${idx + 1}. [${getCategoryLabel(it.closetCategory)}] ${it.name} - ${it.price} (${it.platform})\nLink: ${it.link}`
      )
      .join("\n\n");
    const fullText = `👗 CunFashion - Personalized Wardrobe (${items.length} items):\n\n${text}\n\nExplore styles at: https://cunfashion.com/style-advisor`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleProductClick = (item: WardrobeItem) => {
    if (onTrackClick) {
      onTrackClick(item.id, item.name, item.platform, item.link);
    }
  };

  function getCategoryLabel(cat?: ClosetCategory) {
    switch (cat) {
      case "party":
        return "Party";
      case "office":
        return "Work";
      case "casual":
      default:
        return "Casual";
    }
  }

  function cycleCategory(currentCat?: ClosetCategory): ClosetCategory {
    switch (currentCat) {
      case "party":
        return "office";
      case "office":
        return "casual";
      case "casual":
      default:
        return "party";
    }
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "Amazon":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          label: "Amazon US"
        };
      case "Rakuten":
        return {
          bg: "bg-red-500/20 text-red-300 border-red-500/40",
          label: "Rakuten Brands"
        };
      case "CunCute Store":
        return {
          bg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
          label: "CunCute Merch"
        };
      case "Shopee":
        return {
          bg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
          label: "Shopee VN"
        };
      case "TikTok Shop":
        return {
          bg: "bg-stone-700 text-stone-200 border-stone-600",
          label: "TikTok Shop"
        };
      default:
        return {
          bg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
          label: platform
        };
    }
  };

  const categoryTabs: { id: ClosetCategory; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "✨" },
    { id: "party", label: "Party", icon: "🥂" },
    { id: "office", label: "Work", icon: "💼" },
    { id: "casual", label: "Casual", icon: "☕" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 flex flex-col shadow-2xl transition-colors duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-pink-500/20 border border-amber-500/30 dark:border-pink-500/40 flex items-center justify-center text-[#dfba73] dark:text-pink-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-white font-cinzel">
                    Personal Wardrobe
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 shadow-2xs">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Haute Couture Curated Wardrobe
                  </p>
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400/90 font-medium">
                    <Cloud className={`w-3 h-3 ${isCloudSyncing ? "animate-pulse text-amber-500" : "text-[#dfba73]"}`} />
                    <span>{isCloudSyncing ? "Syncing..." : "Cloud"}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your entire wardrobe?")) {
                      clearWardrobe();
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800/80 rounded-lg transition"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/80 rounded-lg transition"
                title="Close wardrobe"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Closet Categorization Tabs */}
          {count > 0 && (
            <div className="px-4 py-2.5 bg-stone-100/60 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-1 overflow-x-auto">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                const tabCount = counts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-pink-600/30 border-amber-400 dark:border-pink-500/70 text-stone-900 dark:text-pink-300 shadow-xs"
                        : "bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-750 text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75">({tabCount})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {count === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700/60 flex items-center justify-center text-[#dfba73] dark:text-stone-400">
                  <HeartCrack className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white font-cinzel">
                    Your Wardrobe is Empty
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed">
                    Bookmark or like any fashion piece from Style Advisor to curate your personalized closet collection!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-[#dfba73] hover:bg-[#dfba73] hover:text-stone-950 dark:hover:bg-amber-400 text-xs font-bold text-white dark:text-stone-950 transition cursor-pointer shadow-xs"
                >
                  Explore Outfits Now
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <FolderHeart className="w-8 h-8 text-stone-400 dark:text-stone-500 stroke-[1.5]" />
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 font-cinzel">
                  No outfits in this category yet
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Click category tags on items to sort them into this group!
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const badge = getPlatformBadge(item.platform);
                const currentCat = item.closetCategory || "casual";

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-stone-800/50 hover:bg-stone-50/80 dark:hover:bg-stone-800/80 border border-stone-200/90 dark:border-stone-755 rounded-2xl transition flex gap-3 group relative shadow-2xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-850 flex-shrink-0 relative border border-stone-200 dark:border-stone-700/50">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        unoptimized
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>

                          {/* Interactive Closet Category Badge */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextCat = cycleCategory(currentCat);
                              updateItemCategory(item.id, nextCat);
                            }}
                            title="Click to switch category (Party ➜ Work ➜ Casual)"
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                              currentCat === "party"
                                ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                                : currentCat === "office"
                                ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 hover:bg-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                            }`}
                          >
                            <span>
                              {currentCat === "party"
                                ? "🥂 Party"
                                : currentCat === "office"
                                ? "💼 Work"
                                : "☕ Casual"}
                            </span>
                            <span className="opacity-50 text-[9px]">⇄</span>
                          </button>

                          {item.discount && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-[#dfba73]">
                              {item.discount}
                            </span>
                          )}
                        </div>
                        <h4
                          className="text-xs font-bold text-stone-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#dfba73] transition"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-[#dfba73]">
                            {item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="text-[11px] text-stone-400 dark:text-stone-500 line-through">
                              {item.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleProductClick(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 text-stone-950 text-xs font-bold shadow-2xs transition"
                          >
                            <span>Buy</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-950/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>
                  {selectedCategory === "all"
                    ? "Total wardrobe items:"
                    : `Filtering by [${getCategoryLabel(selectedCategory)}]:`}
                </span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {filteredItems.length} / {count} {count === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Action 1: Export Multi-Theme Lookbook Story */}
              <button
                onClick={() => setIsLookbookOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-105 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Export Lookbook Story Studio (3 Themes)</span>
              </button>

              {/* Action 2: Copy Wardrobe URL Share Link */}
              <button
                onClick={handleShareLink}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                {isShareCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Wardrobe share link copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-[#dfba73]" />
                    <span>Copy share link (?wardrobe=...)</span>
                  </>
                )}
              </button>

              {/* Action 3: Copy Text Outfit List */}
              <button
                onClick={handleCopyList}
                className="w-full py-2 px-3 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Outfit list copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy outfit list as text</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-stone-400 dark:text-stone-500">
                Purchases via these links support CunFashion with affiliate rewards.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lookbook Export Modal with selected filtered items */}
      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        items={filteredItems.length > 0 ? filteredItems : items}
      />
    </div>
  );
}

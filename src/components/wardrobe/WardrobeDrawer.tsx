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
  FolderHeart
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
  const { items, count, removeItem, clearWardrobe, updateItemCategory } = useWardrobe();
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
    const fullText = `👗 CunFashion - Tủ Đồ Cá Nhân Hóa (${items.length} món):\n\n${text}\n\nKhám phá thêm tại: https://cunfashion.com/style-advisor`;

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
        return "Đi tiệc";
      case "office":
        return "Công sở";
      case "casual":
      default:
        return "Dạo phố";
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
    { id: "all", label: "Tất cả", icon: "✨" },
    { id: "party", label: "Đi tiệc", icon: "🥂" },
    { id: "office", label: "Công sở", icon: "💼" },
    { id: "casual", label: "Dạo phố", icon: "☕" }
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
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-white">
                    Tủ Đồ Cá Nhân Hóa
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-600 text-white shadow">
                    {count} món
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Haute Couture Curated Wardrobe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Đại Ka có chắc muốn xóa toàn bộ tủ đồ?")) {
                      clearWardrobe();
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800/80 rounded-lg transition"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-stone-800/80 rounded-lg transition"
                title="Đóng tủ đồ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Closet Categorization Tabs */}
          {count > 0 && (
            <div className="px-4 py-2.5 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between gap-1 overflow-x-auto">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                const tabCount = counts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-pink-600/30 border-pink-500/70 text-pink-300 shadow-sm"
                        : "bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-400"
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
                <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center justify-center text-stone-400">
                  <HeartCrack className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white">
                    Tủ đồ đang trống
                  </h3>
                  <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                    Đại Ka hãy bấm vào biểu tượng Bookmark / Tym trên các sản phẩm thời trang ở Style Advisor để lưu lại những món đồ ưng ý nhất!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 transition"
                >
                  Khám phá trang phục ngay
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <FolderHeart className="w-8 h-8 text-stone-500 stroke-[1.5]" />
                <p className="text-xs font-bold text-stone-300">
                  Chưa có trang phục nào trong phân nhóm này
                </p>
                <p className="text-[11px] text-stone-500">
                  Bấm vào tag phong cách trên từng món đồ để phân loại sang nhóm này!
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const badge = getPlatformBadge(item.platform);
                const currentCat = item.closetCategory || "casual";

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-800/50 hover:bg-stone-800/80 border border-stone-750 rounded-2xl transition flex gap-3 group relative"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-850 flex-shrink-0 relative border border-stone-700/50">
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
                            title="Bấm để đổi phân nhóm (Đi tiệc ➜ Công sở ➜ Dạo phố)"
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                              currentCat === "party"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                                : currentCat === "office"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                            }`}
                          >
                            <span>
                              {currentCat === "party"
                                ? "🥂 Đi tiệc"
                                : currentCat === "office"
                                ? "💼 Công sở"
                                : "☕ Dạo phố"}
                            </span>
                            <span className="opacity-50 text-[9px]">⇄</span>
                          </button>

                          {item.discount && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-400">
                              {item.discount}
                            </span>
                          )}
                        </div>
                        <h4
                          className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-pink-300 transition"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-pink-400">
                            {item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="text-[11px] text-stone-500 line-through">
                              {item.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-700/60 rounded-lg transition"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleProductClick(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow transition"
                          >
                            <span>Mua</span>
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
            <div className="p-4 border-t border-stone-800 bg-stone-950/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  {selectedCategory === "all"
                    ? "Tổng cộng trong tủ đồ:"
                    : `Đang lọc theo [${getCategoryLabel(selectedCategory)}]:`}
                </span>
                <span className="font-bold text-white">
                  {filteredItems.length} / {count} món đồ
                </span>
              </div>

              {/* Action 1: Export Multi-Theme Lookbook Story */}
              <button
                onClick={() => setIsLookbookOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:opacity-95 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Xuất ảnh Lookbook Story Studio (3 Themes)</span>
              </button>

              {/* Action 2: Copy Wardrobe URL Share Link */}
              <button
                onClick={handleShareLink}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isShareCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">
                      Đã sao chép liên kết chia sẻ tủ đồ!
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-amber-400" />
                    <span>Sao chép link chia sẻ cho bạn bè (?wardrobe=...)</span>
                  </>
                )}
              </button>

              {/* Action 3: Copy Text Outfit List */}
              <button
                onClick={handleCopyList}
                className="w-full py-2 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép văn bản!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép danh sách văn bản</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-stone-500">
                Mỗi món mua qua link đều được gắn mã hỗ trợ phát triển CunFashion.
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

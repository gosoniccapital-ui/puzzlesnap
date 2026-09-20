"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Palette,
  Chrome,
  ArrowRight,
  Check,
  Copy,
  X,
  Lightbulb,
  Smartphone,
  Monitor,
  RotateCcw,
  Search,
  Camera,
  SlidersHorizontal,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Heart
} from "lucide-react";
import { useWardrobe, WardrobeItem } from "@/lib/hooks/useWardrobe";
import WardrobeDrawer from "@/components/wardrobe/WardrobeDrawer";
import SharedWardrobeBanner from "@/components/wardrobe/SharedWardrobeBanner";
import { parseSharedWardrobeParam } from "@/lib/wardrobe/sharing";
import {
  generateStylistAdvice,
  AdviceResult,
  StyleProduct,
  STYLE_CATALOG,
  AMAZON_STYLE_CATALOG,
  getRandomSurpriseLook
} from "@/lib/data/style-advisor-data";



export default function StyleAdvisorPage() {
  const [viewMode, setViewMode] = useState<"wide" | "mobile">("wide");
  const [market, setMarket] = useState<"ALL" | "FOURTHWALL" | "RAKUTEN" | "US">("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [occasion, setOccasion] = useState("all");
  const [style, setStyle] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState("all");
  const [color, setColor] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [isExtensionBannerDismissed, setIsExtensionBannerDismissed] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [sharedWardrobeItems, setSharedWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isSharedBannerDismissed, setIsSharedBannerDismissed] = useState(false);
  const { count: wardrobeCount, isSaved: isSavedInWardrobe, toggleItem: toggleWardrobeItem } = useWardrobe();

  // Detect shared wardrobe link (?wardrobe=id1,id2,...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const wardrobeParam = params.get("wardrobe");
      if (wardrobeParam) {
        const items = parseSharedWardrobeParam(wardrobeParam, AMAZON_STYLE_CATALOG);
        if (items.length > 0) {

          setSharedWardrobeItems(items);
        }
      }
    } catch (e) {
      console.error("Failed to parse wardrobe query param:", e);
    }
  }, []);

  const handleDismissSharedBanner = () => {
    setIsSharedBannerDismissed(true);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("wardrobe");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      } catch (e) {
        console.error("Failed to update URL:", e);
      }
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);


  const QUICK_COLORS = ["Pastel Pink", "Noir Black", "Oatmeal Beige", "Pure White", "Sky Blue", "Cognac Brown"];
  const QUICK_KEYWORDS = [
    "Trench Coat",
    "Tailored Blazer",
    "Cashmere Knit",
    "Silk Slip Dress",
    "Wide Leg Trousers",
    "Suede Boots",
    "Leather Bag",
    "Evening Gown"
  ];

  // Tự động phân tích look mẫu ban đầu trên tất cả các sàn để khách vào trang là thấy ngay kết quả trực quan
  useEffect(() => {
    fetch("/api/style-advisor/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occasion: "casual",
        style: "minimal",
        budget: "mid",
        color: "neutral",
        market: "ALL",
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setResult(json.data);
        }
      })
      .catch(() => {
        const initialAdvice = generateStylistAdvice({
          occasion: "casual",
          style: "minimal",
          budget: "mid",
          color: "neutral",
          hasCustomImage: false,
          market: "ALL",
        });
        setResult(initialAdvice);
      });
  }, []);

  const compressImage = (file: File, maxDimension = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return reject(new Error("Canvas context failed"));
        }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageName(file.name);
    try {
      const compressedDataUrl = await compressImage(file);
      setSelectedImage(compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTrackAffiliateClick = (
    productId: string,
    productName: string,
    platform: string,
    affiliateUrl: string
  ) => {
    try {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      fetch("/api/style-advisor/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          platform,
          affiliateUrl,
          keyword: keyword.trim() || undefined,
          deviceType: isMobile ? "Mobile" : "Desktop"
        })
      }).catch((err) => console.warn("Track click failed:", err));
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisStatus(
      selectedImage
        ? "Đang gửi sang Google Gemini 3.6 Flash Vision..."
        : "Đang tìm kiếm & đối soát sản phẩm trên hệ thống..."
    );

    try {
      const res = await fetch("/api/style-advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          keyword: keyword.trim(),
          occasion,
          style,
          budget,
          color,
          market,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setResult(json.data);
          setIsAnalyzing(false);
          setAnalysisStatus("");
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          return;
        }
      }
      throw new Error("API analysis returned non-OK status");
    } catch (err) {
      console.warn("Falling back to smart local heuristic:", err);
      const advice = generateStylistAdvice({
        occasion,
        style,
        budget,
        color,
        hasCustomImage: Boolean(selectedImage),
        market,
        keyword: keyword.trim(),
      });
      setResult(advice);
      setIsAnalyzing(false);
      setAnalysisStatus("");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSurpriseMe = () => {
    const look = getRandomSurpriseLook();
    setKeyword(look.keyword);
    setOccasion(look.occasion);
    setStyle(look.style);
    setBudget(look.budget);
    setColor(look.color);
    setIsAnalyzing(true);
    setAnalysisStatus(`Đang phối ngẫu hứng: "${look.description}"...`);

    fetch("/api/style-advisor/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: null,
        keyword: look.keyword,
        occasion: look.occasion,
        style: look.style,
        budget: look.budget,
        color: look.color,
        market,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setResult(json.data);
        }
      })
      .catch(() => {
        const advice = generateStylistAdvice({
          occasion: look.occasion,
          style: look.style,
          budget: look.budget,
          color: look.color,
          hasCustomImage: false,
          market,
          keyword: look.keyword,
        });
        setResult(advice);
      })
      .finally(() => {
        setIsAnalyzing(false);
        setAnalysisStatus("");
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
  };

  const handleCopyLink = (product: StyleProduct) => {
    navigator.clipboard.writeText(product.link);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderProductCard = (p: StyleProduct) => {
    const saved = isSavedInWardrobe(p.id);
    return (
      <div
        key={p.id}
        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-pink-300 transition flex flex-col justify-between group"
      >
        <div>
          {/* Product Image */}
          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <span
              className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                p.platform === "CunCute Store"
                  ? "bg-pink-600 text-white"
                  : p.platform === "Rakuten"
                  ? "bg-red-600 text-white"
                  : p.platform === "Amazon"
                  ? "bg-amber-500 text-stone-950 font-black"
                  : "bg-stone-900 text-white"
              }`}
            >
              {p.platform}
            </span>
            {p.tag && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-stone-900 text-white shadow-sm">
                {p.tag}
              </span>
            )}

            {/* Bookmark / Wardrobe Save Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWardrobeItem(p);
              }}
              className={`absolute bottom-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition shadow-md flex items-center justify-center ${
                saved
                  ? "bg-pink-600 text-white shadow-pink-600/40 scale-105"
                  : "bg-black/60 text-white hover:bg-pink-600 hover:scale-105"
              }`}
              title={saved ? "Bỏ lưu khỏi Tủ Đồ" : "Lưu vào Tủ Đồ yêu thích"}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-white text-white" : "text-white"}`} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-3.5">
            <h4 className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 leading-snug group-hover:text-pink-600 transition">
              {p.name}
            </h4>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm sm:text-base font-extrabold text-pink-600">
                {p.price}
              </span>
              {p.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {p.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-3.5 pt-0 space-y-2">
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleTrackAffiliateClick(p.id, p.name, p.platform, p.link)}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-white text-xs font-bold rounded-xl transition shadow-sm ${
              p.platform === "CunCute Store"
                ? "bg-pink-600 hover:bg-pink-700"
                : p.platform === "Rakuten"
                ? "bg-red-600 hover:bg-red-700"
                : p.platform === "Amazon"
                ? "bg-amber-500 hover:bg-amber-600 text-stone-950 font-black"
                : "bg-stone-900 hover:bg-pink-600"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {p.platform === "CunCute Store"
                ? "Mua tại CunCute Store"
                : p.platform === "Rakuten"
                ? "Mua trên Rakuten"
                : "Xem trên Amazon US"}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              handleCopyLink(p);
              handleTrackAffiliateClick(p.id, p.name, p.platform, p.link);
            }}
            className="w-full py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition flex items-center justify-center gap-1"
          >
            {copiedId === p.id ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Đã sao chép link</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy link affiliate</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20 font-sans">
      {/* Top Toolbar Switcher (Wide | Mobile | Extension) */}
      <div className="sticky top-0 z-30 bg-stone-900 text-stone-200 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switcher Viewport */}
          <div className="flex items-center bg-stone-800 rounded-xl p-1 border border-stone-700">
            <button
              onClick={() => setViewMode("wide")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "wide"
                  ? "bg-stone-700 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
              title="Giao diện toàn màn hình máy tính"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Wide</span>
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "mobile"
                  ? "bg-pink-600 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
              title="Giao diện khung điện thoại (như ảnh demo)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWardrobeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shadow transition relative"
            title="Xem Tủ Đồ cá nhân hóa"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
            <span>Tủ đồ</span>
            {wardrobeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-600 text-white shadow">
                {wardrobeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowExtensionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow transition"
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Google Extension</span>
          </button>
        </div>
      </div>

      {/* Shared Wardrobe Notification Banner */}
      {!isSharedBannerDismissed && sharedWardrobeItems.length > 0 && (
        <SharedWardrobeBanner
          sharedItems={sharedWardrobeItems}
          onOpenDrawer={() => setIsWardrobeOpen(true)}
          onDismiss={handleDismissSharedBanner}
        />
      )}

      {/* Main Container Wrapper */}

      <div
        className={`mx-auto pt-6 px-4 transition-all duration-300 ${
          viewMode === "mobile"
            ? "max-w-[420px] my-6 bg-white rounded-[40px] border-8 border-stone-800 shadow-2xl p-4 sm:p-5 overflow-hidden"
            : "max-w-4xl"
        }`}
      >
        {/* Banner Link to Chrome Extension (ở chế độ Wide) */}
        {viewMode === "wide" && !isExtensionBannerDismissed && (
          <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs relative">
            <button
              onClick={() => setIsExtensionBannerDismissed(true)}
              className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-black/5 transition"
              title="Đóng thông báo này"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-3 pr-6 sm:pr-0">
              <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                <Chrome className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                  <span>Google Chrome Extension</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-100 text-pink-800 font-extrabold">
                    NEW
                  </span>
                </p>
                <p className="text-xs text-stone-600">
                  Tự động đề xuất set đồ phối hợp ngay khi bạn đang lướt Amazon, Pinterest, Zara, ASOS...
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow transition shrink-0"
            >
              <span>Xem & Cài đặt Extension</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header Tiêu Đề */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Cun Style Advisor
          </h1>
          <p className="text-stone-500 mt-1.5 text-xs sm:text-sm font-medium">
            Gõ từ khóa tìm đồ HOẶC Upload ảnh trang phục → Nhận tư vấn stylist + link mua hàng
          </p>
        </div>

        {/* Card Form Chính: Unified Omni-Search Bar + Upload Image + ALL Market + Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-4 sm:p-6 mb-6">
          {/* Main Search Bar with Inline Camera & Search Button */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              id="style-advisor-keyword-input"
              name="keyword"
              aria-label="Search designer pieces or aesthetics"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="Search designer pieces or aesthetics (e.g. trench coat, cashmere, slip dress, tailored blazer...)"
              className="w-full border-2 border-stone-200 rounded-2xl pl-12 pr-32 py-3.5 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 outline-none transition font-medium text-stone-900 placeholder:text-stone-400 shadow-inner"
            />

            {/* Right Action Controls: Inline Camera + Submit */}
            <div className="absolute right-2 flex items-center gap-1.5">
              {/* Camera Icon Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-stone-500 hover:text-pink-600 hover:bg-pink-50 transition cursor-pointer"
                title="Tải ảnh trang phục lên để AI Vision quét mẫu"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                type="file"
                id="style-advisor-image-file"
                name="outfitImage"
                aria-label="Upload outfit photo"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Submit Search Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Tìm</span>
                    <Sparkles className="w-3 h-3 text-pink-300" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Image Chip Preview */}
          {selectedImage && (
            <div className="mt-3 inline-flex items-center gap-2.5 bg-pink-50 border border-pink-200/90 rounded-2xl px-3 py-1.5 shadow-xs animate-in fade-in duration-200">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-8 h-8 rounded-lg object-cover border border-pink-200"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-pink-900 line-clamp-1">
                  {imageName || "Ảnh trang phục đã tải lên"}
                </span>
                <span className="text-[10px] text-pink-600 font-medium">
                  AI Vision sẵn sàng phân tích
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="ml-1 p-1 rounded-full text-pink-700 hover:bg-pink-200/60 transition cursor-pointer"
                title="Xóa ảnh"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Keywords & Surprise Me Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium mr-1">Gợi ý nhanh:</span>
              {QUICK_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setKeyword(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
                    keyword.toLowerCase() === kw.toLowerCase()
                      ? "bg-pink-100 text-pink-700 border-pink-300 font-bold"
                      : "bg-stone-100/80 hover:bg-stone-200/70 text-stone-600 border-stone-200/80"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Surprise Me Button */}
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
              title="Phối đồ ngẫu hứng không cần suy nghĩ"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>🎲 Gợi ý ngẫu hứng</span>
            </button>
          </div>

          {/* Sàn liên kết (Affiliate Market Selector) with ALL as default */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Sàn mua sắm (Affiliate Market):
            </label>
            <div className="inline-flex flex-wrap rounded-xl bg-stone-100 p-1 border border-stone-200 gap-1">
              <button
                type="button"
                onClick={() => setMarket("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "ALL"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Quét & tổng hợp sản phẩm trên tất cả các sàn (Khuyên dùng)"
              >
                <span>🌐 Tất cả sàn (All Global)</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("US")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "US"
                    ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Amazon US Affiliate (StoreID: cuncute-20)"
              >
                <span>📦 Amazon US</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("RAKUTEN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "RAKUTEN"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Thời trang chính hãng qua Rakuten Advertising (Nike, Macy's, ASOS...)"
              >
                <span>👗 Rakuten Brands</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("FOURTHWALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "FOURTHWALL"
                    ? "bg-pink-600 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Sản phẩm thời trang độc quyền từ CunCute Store (cute.cunfashion.com)"
              >
                <span>🌟 Cun Cute Store</span>
              </button>
            </div>
          </div>

          {/* Toggle Bộ Lọc Nâng Cao (Collapsible Filters) */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-pink-600 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600" />
              <span>Bộ lọc nâng cao (Dịp, Phong cách, Ngân sách, Màu sắc)</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-stone-400 font-medium">
              {showFilters ? "Bấm để thu gọn" : "Tùy chọn thêm"}
            </span>
          </div>

          {/* Panel Bộ Lọc Nâng Cao */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Dịp sử dụng
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">Tất cả / Mọi dịp</option>
                  <option value="work">Đi làm / Công sở</option>
                  <option value="casual">Casual / Hàng ngày</option>
                  <option value="date">Hẹn hò lãng mạn</option>
                  <option value="party">Party / Tiệc tùng</option>
                  <option value="travel">Du lịch & Dạo phố</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Phong cách
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">Tất cả / Đa dạng phong cách</option>
                  <option value="elegant">Elegant / Thanh lịch</option>
                  <option value="minimal">Minimal / Tối giản</option>
                  <option value="street">Streetwear / Cá tính</option>
                  <option value="romantic">Romantic / Nữ tính</option>
                  <option value="classic">Classic / Cổ điển</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Ngân sách
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">Mọi mức giá</option>
                  <option value="low">Tiết kiệm</option>
                  <option value="mid">Tiêu chuẩn</option>
                  <option value="high">Cao cấp</option>
                </select>
              </div>

              <div>
                <label htmlFor="style-advisor-color-input" className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Tông màu yêu thích
                </label>
                <input
                  type="text"
                  id="style-advisor-color-input"
                  name="color"
                  aria-label="Tông màu yêu thích"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Để trống hoặc gõ màu..."
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800 placeholder:text-stone-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Kết Quả Phân Tích */}
        {result && (
          <div ref={resultRef} className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Card Gợi ý phong cách */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">💡</span>
                  <span>Gợi ý phong cách</span>
                </h2>
                {result.source === "gemini-vision" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                    ✨ Google Gemini 3.6 Flash
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    ⚡ Smart Heuristic
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium bg-pink-50/40 p-4 rounded-2xl border border-pink-100">
                {result.adviceText}
              </p>

              {/* Món đồ nhận diện từ AI hoặc Từ khóa tìm kiếm */}
              {result.detectedItems && result.detectedItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      {result.keyword ? "Món đồ tìm kiếm & bóc tách phối hợp:" : "Món đồ AI nhận diện được từ ảnh:"}
                    </p>
                    {result.keyword && (
                      <span className="text-[11px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md font-bold border border-pink-200">
                        🔍 &quot;{result.keyword}&quot;
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedItems.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1">
                        <span>👗</span>
                        <span>{item.name}</span>
                        {item.color && <span className="text-stone-500 font-normal">({item.color})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bảng phối màu đề xuất */}
              {result.palette && result.palette.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Bảng phối màu gợi ý (Color Palette):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {result.palette.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                        <span className="w-5 h-5 rounded-lg border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-stone-800 truncate">{c.name}</p>
                          <p className="text-[9px] text-stone-400 font-mono uppercase">{c.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 1.5 Direct Affiliate Search Hub (khi từ khóa tìm kiếm không có sẵn trong catalog) */}
            {result.hasDirectMatch === false && result.keyword && (
              <div className="bg-white rounded-3xl shadow-sm border-2 border-amber-300/80 p-5 sm:p-6 bg-gradient-to-br from-amber-50/60 via-white to-pink-50/40">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                      Tìm kiếm trực tiếp &quot;{result.keyword}&quot; trên các sàn mua sắm
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      Từ khóa <strong>&quot;{result.keyword}&quot;</strong> không có trong kho mẫu thời trang có sẵn. Bấm vào các liên kết trực tiếp bên dưới để tìm sản phẩm chính xác và nhận ưu đãi affiliate tốt nhất:
                    </p>
                  </div>
                </div>

                {result.searchLinks && result.searchLinks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {result.searchLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-xs shadow-xs transition hover:scale-[1.02] active:scale-95 ${link.colorClass}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">
                            {link.platform === "Amazon" ? "📦" : link.platform === "Rakuten" ? "👗" : "🌟"}
                          </span>
                          <div className="text-left truncate">
                            <div className="truncate font-bold">{link.label}</div>
                            <span className="text-[10px] opacity-80 font-normal">{link.badge}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Card Sản phẩm gợi ý (Affiliate) */}
            <div>
              {result.keyMatchedProducts &&
              result.keyMatchedProducts.length > 0 &&
              result.coordinatedProducts &&
              result.coordinatedProducts.length > 0 ? (
                <div className="space-y-8">
                  {/* Phân nhóm 1: Món đồ tìm kiếm trọng tâm */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-black">
                          🎯
                        </span>
                        <span>Món đồ tìm kiếm trọng tâm</span>
                        {result.keyword && (
                          <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                            Khớp từ khóa: &quot;{result.keyword}&quot;
                          </span>
                        )}
                      </h2>
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-200/60 px-2.5 py-1 rounded-full">
                        {result.keyMatchedProducts.length} items
                      </span>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        viewMode === "mobile"
                          ? "grid-cols-1"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {result.keyMatchedProducts.map(renderProductCard)}
                    </div>
                  </div>

                  {/* Phân nhóm 2: Gợi ý phối đồ hoàn hảo (Complete The Look) */}
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                          ✨
                        </span>
                        <span>Gợi ý phối đồ hoàn hảo (Complete The Look)</span>
                        {result.keyword && (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                            Phối cùng &quot;{result.keyword}&quot;
                          </span>
                        )}
                      </h2>
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-200/60 px-2.5 py-1 rounded-full">
                        {result.coordinatedProducts.length} items
                      </span>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        viewMode === "mobile"
                          ? "grid-cols-1"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {result.coordinatedProducts.map(renderProductCard)}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                      <ShoppingBag className="w-5 h-5 text-pink-600 shrink-0" />
                      <span>
                        {result.hasDirectMatch === false
                          ? "🔥 Gợi ý thời trang thịnh hành dành cho bạn (Trending Picks)"
                          : "Sản phẩm gợi ý (Affiliate)"}
                      </span>
                      {result.keyword && (
                        result.hasDirectMatch === false ? (
                          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                            Gợi ý tham khảo (Kho mẫu không có &quot;{result.keyword}&quot;)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                            Khớp từ khóa: &quot;{result.keyword}&quot;
                          </span>
                        )
                      )}
                    </h2>
                    <span className="text-[11px] font-bold text-stone-500 bg-stone-200/60 px-2.5 py-1 rounded-full">
                      {result.suggestedProducts.length} items
                    </span>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      viewMode === "mobile"
                        ? "grid-cols-1"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {result.suggestedProducts.map(renderProductCard)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Wardrobe Button */}
      {wardrobeCount > 0 && (
        <button
          onClick={() => setIsWardrobeOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl shadow-pink-600/40 border-2 border-white flex items-center gap-2.5 transition hover:scale-105 active:scale-95 animate-bounce-short"
          title="Xem Tủ Đồ yêu thích của bạn"
        >
          <ShoppingBag className="w-4 h-4 text-white animate-pulse" />
          <span>Tủ Đồ ({wardrobeCount})</span>
        </button>
      )}

      {/* Wardrobe Drawer */}
      <WardrobeDrawer
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        onTrackClick={handleTrackAffiliateClick}
      />

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Chrome className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                  Cun Style Advisor Chrome Extension
                </h3>
                <p className="text-xs text-stone-500">Đề xuất gợi ý outfit khi lướt web (Manifest V3)</p>
              </div>
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 mb-5 text-xs text-pink-900 space-y-1.5">
              <p className="font-bold">Cách cài đặt vào Google Chrome (30 giây):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-pink-800">
                <li>Mở trình duyệt Google Chrome, gõ <code className="bg-pink-100 px-1 rounded">chrome://extensions</code></li>
                <li>Bật công tắc <strong>"Developer mode"</strong> ở góc trên bên phải.</li>
                <li>Bấm nút <strong>"Load unpacked"</strong> và chọn thư mục <code className="bg-pink-100 px-1 rounded">extension/cun-style-advisor</code></li>
                <li>Ghim (Pin) icon Cun Style Advisor lên thanh công cụ để sử dụng tiện lợi nhất!</li>
              </ol>
            </div>

            <button
              onClick={() => setShowExtensionModal(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
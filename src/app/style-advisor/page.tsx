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
                ? "Shop at CunCute Store"
                : p.platform === "Rakuten"
                ? "Shop on Rakuten"
                : "Shop on Amazon US"}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              handleCopyLink(p);
              handleTrackAffiliateClick(p.id, p.name, p.platform, p.link);
            }}
            className="w-full py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedId === p.id ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Link copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy affiliate link</span>
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
              title="Full screen desktop view"
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
              title="Mobile frame view"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWardrobeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shadow transition relative cursor-pointer"
            title="Open Personalized Wardrobe"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
            <span>Wardrobe</span>
            {wardrobeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-600 text-white shadow">
                {wardrobeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowExtensionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow transition cursor-pointer"
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Chrome Extension</span>
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
        {/* Banner Link to Chrome Extension (in Wide mode) */}
        {viewMode === "wide" && !isExtensionBannerDismissed && (
          <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs relative">
            <button
              onClick={() => setIsExtensionBannerDismissed(true)}
              className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-black/5 transition cursor-pointer"
              title="Dismiss banner"
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
                  Instantly receive outfit styling matches while browsing Amazon, Pinterest, Zara, ASOS...
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow transition shrink-0 cursor-pointer"
            >
              <span>Get Chrome Extension</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Cun Style Advisor
          </h1>
          <p className="text-stone-500 mt-1.5 text-xs sm:text-sm font-medium">
            Search luxury fashion pieces OR upload an outfit photo for AI styling advice and direct shopping links
          </p>
        </div>

        {/* Card Form Main: Unified Omni-Search Bar + Upload Image + ALL Market + Filters */}
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
                title="Upload outfit photo for AI Vision styling"
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
                    <span>Search</span>
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
                  {imageName || "Uploaded outfit photo"}
                </span>
                <span className="text-[10px] text-pink-600 font-medium">
                  AI Vision ready to analyze
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="ml-1 p-1 rounded-full text-pink-700 hover:bg-pink-200/60 transition cursor-pointer"
                title="Clear image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Keywords & Surprise Me Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium mr-1">Quick tags:</span>
              {QUICK_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setKeyword(kw)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
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
              title="Surprise me with trending looks"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>🎲 Surprise Me</span>
            </button>
          </div>

          {/* Affiliate Market Selector with ALL as default */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Affiliate Market:
            </label>
            <div className="inline-flex flex-wrap rounded-xl bg-stone-100 p-1 border border-stone-200 gap-1">
              <button
                type="button"
                onClick={() => setMarket("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  market === "ALL"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Scan & aggregate fashion across all global platforms (Recommended)"
              >
                <span>🌐 All Global Platforms</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("US")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  market === "US"
                    ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Amazon US Associates (StoreID: cuncute-20)"
              >
                <span>📦 Amazon US</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("RAKUTEN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  market === "RAKUTEN"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Designer brands via Rakuten Advertising (Nike, Macy's, ASOS...)"
              >
                <span>👗 Rakuten Brands</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("FOURTHWALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  market === "FOURTHWALL"
                    ? "bg-pink-600 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Exclusive fashion from CunCute Store (cute.cunfashion.com)"
              >
                <span>🌟 Cun Cute Store</span>
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-pink-600 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600" />
              <span>Advanced Filters (Occasion, Style, Budget, Color)</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-stone-400 font-medium">
              {showFilters ? "Click to collapse" : "More options"}
            </span>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">All Occasions</option>
                  <option value="work">Work / Office</option>
                  <option value="casual">Casual / Daily</option>
                  <option value="date">Date Night</option>
                  <option value="party">Party / Evening</option>
                  <option value="travel">Travel & Street</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Style Mood
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">All Styles</option>
                  <option value="elegant">Elegant / Haute</option>
                  <option value="minimal">Minimal / Chic</option>
                  <option value="street">Streetwear</option>
                  <option value="romantic">Romantic</option>
                  <option value="classic">Classic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800"
                >
                  <option value="all">All Budgets</option>
                  <option value="low">Value (&lt; $50)</option>
                  <option value="mid">Mid-Tier ($50 - $150)</option>
                  <option value="high">Luxury (&gt; $150)</option>
                </select>
              </div>

              <div>
                <label htmlFor="style-advisor-color-input" className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Preferred Color Accent
                </label>
                <input
                  type="text"
                  id="style-advisor-color-input"
                  name="color"
                  aria-label="Preferred Color Accent"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Optional (e.g. beige, black, emerald...)"
                  className="w-full border border-stone-200 rounded-xl px-2.5 py-2 text-xs bg-white focus:border-pink-500 outline-none transition font-medium text-stone-800 placeholder:text-stone-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Kết Quả Phân Tích */}
        {result && (
          <div ref={resultRef} className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Stylist Advice Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">💡</span>
                  <span>Haute Couture Stylist Recommendation</span>
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

              {/* Detected Items from AI or Search Keywords */}
              {result.detectedItems && result.detectedItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      {result.keyword ? "Detected Items & Styling Breakdown:" : "Items detected by AI Vision:"}
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

              {/* Suggested Color Palette */}
              {result.palette && result.palette.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Suggested Color Palette:
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

            {/* Direct Affiliate Search Hub (when search term has no direct catalog matches) */}
            {result.hasDirectMatch === false && result.keyword && (
              <div className="bg-white rounded-3xl shadow-sm border-2 border-amber-300/80 p-5 sm:p-6 bg-gradient-to-br from-amber-50/60 via-white to-pink-50/40">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                      Search directly for &quot;{result.keyword}&quot; across global stores
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      The keyword <strong>&quot;{result.keyword}&quot;</strong> is not in our static catalog. Click below to search live inventory and get verified affiliate pricing:
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

            {/* 2. Suggested Products (Affiliate) */}
            <div>
              {result.keyMatchedProducts &&
              result.keyMatchedProducts.length > 0 &&
              result.coordinatedProducts &&
              result.coordinatedProducts.length > 0 ? (
                <div className="space-y-8">
                  {/* Group 1: Target Search Matches */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-black">
                          🎯
                        </span>
                        <span>Target Search Matches</span>
                        {result.keyword && (
                          <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                            Matched: &quot;{result.keyword}&quot;
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

                  {/* Group 2: Complete The Look */}
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                          ✨
                        </span>
                        <span>Complete The Look (Coordinated Pairings)</span>
                        {result.keyword && (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                            Paired with &quot;{result.keyword}&quot;
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
                          ? "🔥 Trending Picks Curated For You"
                          : "Curated Fashion Matches"}
                      </span>
                      {result.keyword && (
                        result.hasDirectMatch === false ? (
                          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                            Trending alternative for &quot;{result.keyword}&quot;
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                            Matched: &quot;{result.keyword}&quot;
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
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl shadow-pink-600/40 border-2 border-white flex items-center gap-2.5 transition hover:scale-105 active:scale-95 animate-bounce-short cursor-pointer"
          title="View your saved wardrobe"
        >
          <ShoppingBag className="w-4 h-4 text-white animate-pulse" />
          <span>Wardrobe ({wardrobeCount})</span>
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
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              aria-label="Close"
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
                <p className="text-xs text-stone-500">Live AI styling recommendations while browsing the web (Manifest V3)</p>
              </div>
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 mb-5 text-xs text-pink-900 space-y-1.5">
              <p className="font-bold">How to install in Google Chrome (30 seconds):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-pink-800">
                <li>Open Google Chrome and navigate to <code className="bg-pink-100 px-1 rounded">chrome://extensions</code></li>
                <li>Turn ON the <strong>&quot;Developer mode&quot;</strong> toggle in the top-right corner.</li>
                <li>Click <strong>&quot;Load unpacked&quot;</strong> and select the directory <code className="bg-pink-100 px-1 rounded">extension/cun-style-advisor</code></li>
                <li>Pin the Cun Style Advisor icon to your browser toolbar for instant 1-click styling!</li>
              </ol>
            </div>

            <button
              onClick={() => setShowExtensionModal(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
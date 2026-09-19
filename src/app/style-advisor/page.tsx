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
  Camera
} from "lucide-react";
import {
  generateStylistAdvice,
  AdviceResult,
  StyleProduct,
  STYLE_CATALOG
} from "@/lib/data/style-advisor-data";

export default function StyleAdvisorPage() {
  const [viewMode, setViewMode] = useState<"wide" | "mobile">("wide");
  const [market, setMarket] = useState<"FOURTHWALL" | "RAKUTEN" | "US" | "VN">("FOURTHWALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80"
  );
  const [imageName, setImageName] = useState<string>("ZXixb.jpg (Blazer đỏ công sở)");
  const [occasion, setOccasion] = useState("work");
  const [style, setStyle] = useState("elegant");
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState("mid");
  const [color, setColor] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const QUICK_COLORS = ["Hồng pastel", "Đen", "Be sữa", "Trắng", "Xanh pastel", "Nâu tây"];
  const QUICK_KEYWORDS = [
    "Cardigan",
    "Blazer",
    "Trench Coat",
    "Váy dạ hội",
    "Vớ cute",
    "Hoodie",
    "Quần ống rộng",
    "Sneaker"
  ];

  // Tự động phân tích look mẫu ban đầu để khách vào trang là thấy ngay kết quả trực quan
  useEffect(() => {
    fetch("/api/style-advisor/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occasion: "work",
        style: "elegant",
        budget: "mid",
        color: "đen, be, trung tính",
        market: "FOURTHWALL",
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
          occasion: "work",
          style: "elegant",
          budget: "mid",
          color: "đen, be, trung tính",
          hasCustomImage: true,
          market: "FOURTHWALL",
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

  const handleLoadDemoBlazer = () => {
    setSelectedImage("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80");
    setImageName("ZXixb.jpg (Blazer đỏ công sở)");
    setOccasion("work");
    setStyle("elegant");
    setBudget("mid");
    setColor("đen, be, trung tính");
    setMarket("US");
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

  const handleCopyLink = (product: StyleProduct) => {
    navigator.clipboard.writeText(product.link);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
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

          <button
            onClick={handleLoadDemoBlazer}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-950/60 text-pink-300 border border-pink-800/80 hover:bg-pink-900 transition"
          >
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Nạp ảnh mẫu Blazer Đỏ (như hình)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExtensionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow transition"
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Google Extension</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div
        className={`mx-auto pt-6 px-4 transition-all duration-300 ${
          viewMode === "mobile"
            ? "max-w-[420px] my-6 bg-white rounded-[40px] border-8 border-stone-800 shadow-2xl p-4 sm:p-5 overflow-hidden"
            : "max-w-4xl"
        }`}
      >
        {/* Banner Link to Chrome Extension (ở chế độ Wide) */}
        {viewMode === "wide" && (
          <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                <Chrome className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                  <span>Google Chrome Extension</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-100 text-pink-800 font-extrabold">
                    NEW
                  </span>
                </p>
                <p className="text-xs text-stone-600">
                  Tự động đề xuất set đồ phối hợp ngay khi bạn đang lướt Shopee, TikTok Shop, Pinterest, Zara...
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow transition shrink-0"
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

        {/* Card Form Chính: Keyword, Upload & Điền Tiêu Chí */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 mb-6">
          {/* 1. Nhập từ khóa / Tên món đồ cần tìm */}
          <div className="mb-5 pb-5 border-b border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-pink-600" />
                <span>1. Tìm kiếm theo từ khóa / Tên trang phục (Hoặc kết hợp ảnh bên dưới)</span>
              </label>
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="text-xs text-stone-400 hover:text-stone-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa từ khóa
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
                placeholder="Nhập tên món đồ cần tìm (ví dụ: áo cardigan, blazer dạ, trench coat, váy dự tiệc, vớ cute...)"
                className="w-full border border-stone-200 rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800 placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <span>Tìm</span>
                <Sparkles className="w-3 h-3 text-pink-400" />
              </button>
            </div>

            {/* Gợi ý từ khóa nhanh (Quick Tag Pills) */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
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
          </div>

          {/* 2. Upload ảnh (Tùy chọn) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-stone-600" />
                <span>2. Upload ảnh trang phục (Tùy chọn: AI Vision quét mẫu người mặc)</span>
              </label>
              {selectedImage && (
                <button
                  onClick={handleClearImage}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa ảnh
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="block text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition cursor-pointer"
              />
              <button
                type="button"
                onClick={handleLoadDemoBlazer}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded-xl border border-rose-200 transition"
              >
                Ảnh Blazer đỏ mẫu
              </button>
            </div>

            {/* Preview Image */}
            {selectedImage && (
              <div className="mt-3 relative bg-stone-50 rounded-2xl border border-stone-200 p-3 flex flex-col items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-h-64 w-auto object-contain rounded-xl shadow-sm"
                />
                <span className="mt-2 text-[11px] text-stone-500 font-medium">
                  {imageName || "Đã nạp ảnh thành công"}
                </span>
              </div>
            )}
          </div>

          {/* Thị trường mục tiêu (Fourthwall, Rakuten, US Amazon, VN) */}
          <div className="mb-4 pb-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Thị trường mua sắm (Affiliate Market):
            </label>
            <div className="inline-flex flex-wrap rounded-xl bg-stone-100 p-1 border border-stone-200 gap-1">
              <button
                type="button"
                onClick={() => setMarket("FOURTHWALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "FOURTHWALL"
                    ? "bg-pink-600 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
                title="Sản phẩm thời trang độc quyền từ CunCute Store (cute.cunfashion.com)"
              >
                <span>🌟 Cun Cute Store</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("RAKUTEN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "RAKUTEN"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
                title="Thời trang chính hãng qua Rakuten Advertising (Nike, Macy's, ASOS...)"
              >
                <span>👗 Rakuten Brands</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("US")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "US"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <span>📦 Amazon US</span>
              </button>
              <button
                type="button"
                onClick={() => setMarket("VN")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  market === "VN"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <span>🇻🇳 Shopee/TikTok</span>
              </button>
            </div>
          </div>

          {/* 2. Form Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Dịp sử dụng
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                <option value="work">Đi làm</option>
                <option value="casual">Casual / Hàng ngày</option>
                <option value="date">Hẹn hò</option>
                <option value="party">Party / Sự kiện</option>
                <option value="travel">Du lịch</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Phong cách
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                <option value="elegant">Elegant / Thanh lịch</option>
                <option value="minimal">Minimal / Tối giản</option>
                <option value="street">Streetwear</option>
                <option value="romantic">Romantic / Nữ tính</option>
                <option value="classic">Classic</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Ngân sách
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                {market === "US" ? (
                  <>
                    <option value="low">Under $30 (Tiết kiệm)</option>
                    <option value="mid">$30 - $80 (Tiêu chuẩn)</option>
                    <option value="high">Over $80 (Cao cấp)</option>
                  </>
                ) : (
                  <>
                    <option value="low">Dưới 500k (Tiết kiệm)</option>
                    <option value="mid">500k - 1.5tr (Tiêu chuẩn)</option>
                    <option value="high">Trên 1.5tr (Cao cấp)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                Màu ưa thích
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ví dụ: hồng pastel, đen, be..."
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Nút Phân Tích Màu Hồng Đặc Trưng */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-6 w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-pink-600/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-75 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{analysisStatus || "Đang tìm kiếm & phân tích..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {keyword.trim()
                    ? `Tìm kiếm "${keyword.trim()}" & Gợi ý phối đồ`
                    : selectedImage
                    ? "Phân tích ảnh & Gợi ý sản phẩm"
                    : "Khám phá phong cách & Gợi ý sản phẩm"}
                </span>
              </>
            )}
          </button>
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

            {/* 2. Card Sản phẩm gợi ý (Affiliate) */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                  <ShoppingBag className="w-5 h-5 text-pink-600 shrink-0" />
                  <span>Sản phẩm gợi ý (Affiliate)</span>
                  {result.keyword && (
                    <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                      Khớp từ khóa: &quot;{result.keyword}&quot;
                    </span>
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
                {result.suggestedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-pink-300 transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                          p.platform === "CunCute Store"
                            ? "bg-pink-600 text-white"
                            : p.platform === "Rakuten"
                            ? "bg-red-600 text-white"
                            : p.platform === "Amazon"
                            ? "bg-amber-500 text-stone-950"
                            : "bg-white/90 text-stone-800 backdrop-blur-sm"
                        }`}>
                          {p.platform}
                        </span>
                        {p.tag && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-stone-900 text-white shadow-sm">
                            {p.tag}
                          </span>
                        )}
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
                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-white text-xs font-bold rounded-xl transition shadow-sm ${
                          p.platform === "CunCute Store"
                            ? "bg-pink-600 hover:bg-pink-700"
                            : p.platform === "Rakuten"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-stone-900 hover:bg-pink-600"
                        }`}
                      >
                        <span>
                          {p.platform === "CunCute Store"
                            ? "Mua tại CunCute Store"
                            : p.platform === "Rakuten"
                            ? "Xem & Mua tại Brand"
                            : p.platform === "Amazon"
                            ? "Xem trên Amazon"
                            : "Xem & Mua ngay"}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(p)}
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
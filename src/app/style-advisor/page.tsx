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
  Check,
  Copy,
  X,
  Smartphone,
  Monitor,
  History,
  Tag,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Star,
  Layers,
  ArrowUpRight
} from "lucide-react";
import {
  AdviceResult,
  StyleProduct,
  DetectedOutfitItem,
  AMAZON_ASSOCIATE_TAG,
  buildAmazonSearchUrl
} from "@/lib/data/style-advisor-data";

interface HistoryRecord {
  id: string;
  timestamp: string;
  imageThumbnail: string | null;
  headline: string;
  result: AdviceResult;
}

export default function StyleAdvisorPage() {
  const [viewMode, setViewMode] = useState<"wide" | "mobile">("wide");
  const [market, setMarket] = useState<"US" | "VN">("US");
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80"
  );
  const [imageName, setImageName] = useState<string>("fall-trench-boots-look.jpg");
  const [occasion, setOccasion] = useState("casual");
  const [style, setStyle] = useState("classic");
  const [budget, setBudget] = useState("low");
  const [color, setColor] = useState("camel, khaki, beige");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cun_fashion_style_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("Vui lòng chọn ảnh dung lượng dưới 5MB");
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSampleLook = () => {
    setSelectedImage("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80");
    setImageName("amazon-fall-trench-coat.jpg");
    setOccasion("casual");
    setStyle("classic");
    setBudget("low");
    setColor("camel, khaki, beige");
    showToast("Đã tải look mẫu: Fall Trench Coat & Suede Boots (Amazon US)");
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/style-advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          occasion,
          style,
          budget,
          color,
          market
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const adviceResult: AdviceResult = data.data;
        setResult(adviceResult);

        // Save to history
        const newRecord: HistoryRecord = {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          imageThumbnail: selectedImage ? selectedImage.slice(0, 500) : null,
          headline: adviceResult.headline,
          result: adviceResult
        };

        const updatedHistory = [newRecord, ...history.slice(0, 9)];
        setHistory(updatedHistory);
        try {
          localStorage.setItem("cun_fashion_style_history", JSON.stringify(updatedHistory));
        } catch {
          // ignore quota error
        }

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        showToast("Không thể phân tích ảnh lúc này. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Analysis network error:", err);
      showToast("Lỗi kết nối máy chủ phân tích!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyLink = (product: StyleProduct) => {
    navigator.clipboard.writeText(product.link);
    setCopiedId(product.id);
    showToast(`Đã sao chép link Affiliate ${product.platform}!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrackClick = async (product: StyleProduct) => {
    try {
      await fetch("/api/style-advisor/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          platform: product.platform,
          affiliateUrl: product.link
        })
      });
    } catch {
      // Non-blocking
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-24 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-amber-500/50 text-amber-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Mode Switcher Bar */}
      <header className="sticky top-0 z-30 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Market Badges */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition">
                C
              </span>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-400 transition">
                CunFashion
              </span>
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-stone-800" />

            <div className="flex items-center bg-stone-800/80 rounded-xl p-1 border border-stone-700/60 text-xs">
              <button
                onClick={() => setMarket("US")}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  market === "US"
                    ? "bg-amber-500 text-stone-950 shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span>🇺🇸 Amazon US</span>
                <span className="text-[10px] px-1 py-0.2 bg-stone-950/20 rounded font-black">
                  {AMAZON_ASSOCIATE_TAG}
                </span>
              </button>
              <button
                onClick={() => setMarket("VN")}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  market === "VN"
                    ? "bg-amber-500 text-stone-950 shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span>🇻🇳 Shopee / VN</span>
              </button>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Wide / Mobile Preview Toggle */}
            <div className="hidden md:flex items-center bg-stone-800/80 rounded-xl p-1 border border-stone-700/60">
              <button
                onClick={() => setViewMode("wide")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === "wide" ? "bg-stone-700 text-white" : "text-stone-400 hover:text-white"
                }`}
                title="Desktop Wide View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Wide</span>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === "mobile" ? "bg-stone-700 text-white" : "text-stone-400 hover:text-white"
                }`}
                title="Mobile Viewport Simulation"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>History</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner with StoreID & Value Proposition */}
      <section className="border-b border-stone-800/80 bg-gradient-to-b from-stone-900/60 to-transparent py-8 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Visual Fashion Matcher • Official Amazon StoreID: {AMAZON_ASSOCIATE_TAG}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Snap To Shop • AI Fashion Stylist
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Tải ảnh trang phục bất kỳ để AI bóc tách từng món (Áo, Quần, Giày, Phụ kiện) và tự động đối soát link Amazon Associates US để bạn sở hữu outfit chuẩn gu ngay lập tức.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main
        className={`mx-auto pt-8 px-4 transition-all duration-300 ${
          viewMode === "mobile"
            ? "max-w-[430px] my-6 bg-stone-900 rounded-[40px] border-8 border-stone-800 shadow-2xl p-4 overflow-hidden"
            : "max-w-5xl"
        }`}
      >
        {/* Upload & Form Control Box */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          {/* Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <span>Tải ảnh trang phục cần phối đồ / tìm mua</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleLook}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
                >
                  ⚡ Nạp Look Mẫu (Trench Coat & Boots)
                </button>
                {selectedImage && (
                  <button
                    onClick={handleClearImage}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Canvas */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition p-6 cursor-pointer flex flex-col items-center justify-center overflow-hidden min-h-[220px] ${
                dragOver
                  ? "border-amber-500 bg-amber-500/10"
                  : selectedImage
                  ? "border-stone-700 bg-stone-950/60"
                  : "border-stone-800 bg-stone-950/40 hover:border-stone-700"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative w-full flex flex-col items-center">
                  <div className="relative max-h-72 w-auto rounded-xl overflow-hidden shadow-md">
                    <img
                      src={selectedImage}
                      alt="Outfit Preview"
                      className="max-h-72 w-auto object-contain rounded-xl"
                    />

                    {/* Laser Radar Scanner Animation during analysis */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] flex flex-col justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-pulse relative" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2.5 text-xs text-stone-400 font-medium">
                    {imageName} • Nhấn để đổi ảnh khác
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-800 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-stone-200">
                    Kéo thả ảnh outfit vào đây hoặc <span className="text-amber-400 underline">chọn từ thiết bị</span>
                  </p>
                  <p className="text-xs text-stone-500">Hỗ trợ JPG, PNG, WEBP (tối đa 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-800">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Dịp sử dụng (Occasion)
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-200 focus:border-amber-500 focus:outline-none transition font-medium"
              >
                <option value="casual">Casual / Hàng ngày</option>
                <option value="work">Đi làm / Business Casual</option>
                <option value="date">Hẹn hò / Date Night</option>
                <option value="party">Tiệc tùng / Cocktail</option>
                <option value="travel">Du lịch / Resort Wear</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Phong cách (Style)
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-200 focus:border-amber-500 focus:outline-none transition font-medium"
              >
                <option value="classic">Timeless Classic (Cổ điển)</option>
                <option value="minimal">Clean Minimalist (Tối giản)</option>
                <option value="street">Modern Streetwear (Cá tính)</option>
                <option value="romantic">Feminine Romantic (Nữ tính)</option>
                <option value="elegant">Sophisticated Elegant (Sang trọng)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Ngân sách (Budget)
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-200 focus:border-amber-500 focus:outline-none transition font-medium"
              >
                <option value="low">Tiết kiệm (Dưới $50)</option>
                <option value="mid">Tiêu chuẩn ($50 - $150)</option>
                <option value="high">Cao cấp ($150+)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Tông màu mong muốn
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="VD: camel, beige, black..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-200 placeholder-stone-600 focus:border-amber-500 focus:outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Analyze CTA Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-stone-950" />
                <span>AI đang quét chi tiết outfit & đối soát Amazon...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-stone-950" />
                <span>Quét Phân Tích & Tìm Đồ Trên Amazon US</span>
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div ref={resultRef} className="mt-8 space-y-6 animate-in fade-in duration-300">
            {/* Header: Headline & AI Source */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {result.source === "gemini-vision"
                      ? "Powered by Google Gemini Vision"
                      : "CunFashion Smart Fashion Engine"}
                  </span>
                </span>

                <span className="text-xs text-stone-400 font-medium">
                  Thị trường: <strong className="text-amber-400">{result.market === "US" ? "Amazon US" : "Việt Nam"}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {result.headline}
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                {result.adviceText}
              </p>

              {/* Color Palette Display */}
              {result.palette && result.palette.length > 0 && (
                <div className="pt-3 border-t border-stone-800/80">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Bảng phối màu hài hòa đề xuất (Palette):
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {result.palette.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl text-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone-700 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-semibold text-stone-200">{c.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">{c.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stylist Pro Tips */}
              {result.styleTips && result.styleTips.length > 0 && (
                <div className="pt-3 border-t border-stone-800/80 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Bí kíp tôn dáng & phối đồ từ Stylist:
                  </p>
                  <ul className="space-y-1 text-xs text-stone-300">
                    {result.styleTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Detected Pieces - Breakdown & Amazon Search Deep Links */}
            {result.detectedItems && result.detectedItems.length > 0 && (
              <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      Chi Tiết Từng Món Được Bóc Tách (Detected Pieces)
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">
                    {result.detectedItems.length} món nhận diện
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {result.detectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-stone-950 border border-stone-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                            {item.category}
                          </span>
                          <span className="text-xs font-semibold text-amber-400">
                            {item.color}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                          {item.name}
                        </h4>
                        {item.style && (
                          <p className="text-xs text-stone-400">{item.style}</p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-800/80">
                        <a
                          href={item.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-stone-950 text-xs font-bold transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5" />
                            <span>Tìm đồ tương tự trên Amazon</span>
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curated Product Recommendation Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>Sản Phẩm Đề Xuất Phù Hợp ({result.market === "US" ? "Amazon US" : "CunFashion"})</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Đã tích hợp sẵn mã theo dõi Affiliate StoreID: <strong className="text-amber-400">{AMAZON_ASSOCIATE_TAG}</strong>
                  </p>
                </div>
              </div>

              <div
                className={`grid gap-4 ${
                  viewMode === "mobile"
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {result.suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/60 transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Thumbnail with Badges */}
                      <div className="relative aspect-[4/5] bg-stone-950 overflow-hidden">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        {/* Platform & Tag Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-stone-950/90 text-white border border-stone-700 shadow-md">
                            {product.platform}
                          </span>
                          {product.tag && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-stone-950 shadow-md">
                              {product.tag}
                            </span>
                          )}
                        </div>

                        {/* Discount Pill */}
                        {product.discount && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-600 text-white shadow-md">
                            {product.discount}
                          </span>
                        )}
                      </div>

                      {/* Product Metadata */}
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition">
                          {product.name}
                        </h4>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="ml-1 font-bold">{product.rating}</span>
                          </div>
                          <span>•</span>
                          <span>({product.reviewCount} đánh giá)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base sm:text-lg font-black text-amber-400">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-stone-500 line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View on Amazon & Copy Link */}
                    <div className="p-4 pt-0 space-y-2">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(product)}
                        className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Xem & Mua Trên Amazon</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(product)}
                        className="w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-semibold rounded-xl transition flex items-center justify-center gap-1.5 border border-stone-700 cursor-pointer"
                      >
                        {copiedId === product.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã chép link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-400" />
                            <span>Copy Affiliate Link</span>
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
      </main>

      {/* History Drawer Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Lịch Sử Phân Tích Gần Đây</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">
                Chưa có lịch sử quét nào. Hãy tải ảnh lên và bấm phân tích!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setResult(h.result);
                      setShowHistoryModal(false);
                      showToast("Đã nạp lại kết quả từ lịch sử");
                      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                    }}
                    className="p-3 bg-stone-950 border border-stone-800 hover:border-amber-500/60 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {h.imageThumbnail ? (
                        <img
                          src={h.imageThumbnail}
                          alt="History"
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-stone-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{h.headline}</p>
                        <p className="text-[10px] text-stone-500">{h.timestamp}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
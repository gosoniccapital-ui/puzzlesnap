"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  ImageIcon,
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
  Heart,
  SlidersHorizontal
} from "lucide-react";
import {
  generateStylistAdvice,
  AdviceResult,
  StyleProduct
} from "@/lib/data/style-advisor-data";

export default function StyleAdvisorPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("casual");
  const [style, setStyle] = useState("minimal");
  const [budget, setBudget] = useState("low");
  const [color, setColor] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const QUICK_COLORS = ["Hồng pastel", "Đen", "Be sữa", "Trắng", "Xanh pastel", "Nâu tây"];

  const SAMPLE_IMAGES = [
    {
      title: "Casual năng động",
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Thanh lịch đi làm",
      url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Hẹn hò nữ tính",
      url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleImage = (url: string) => {
    setSelectedImage(url);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI scanning & stylist recommendation processing
    setTimeout(() => {
      const advice = generateStylistAdvice({
        occasion,
        style,
        budget,
        color,
        hasCustomImage: Boolean(selectedImage)
      });
      setResult(advice);
      setIsAnalyzing(false);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 1200);
  };

  const handleCopyLink = (product: StyleProduct) => {
    navigator.clipboard.writeText(product.link);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Banner Link to Chrome Extension */}
        <div className="mb-6 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                <span>Google Chrome Extension</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-100 text-pink-800 font-extrabold">NEW</span>
              </p>
              <p className="text-xs text-stone-600">
                Nhận gợi ý phối đồ thời trang ngay khi đang lướt Shopee, TikTok Shop, Pinterest, Zara...
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExtensionModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow transition"
          >
            <span>Xem & Tải Extension</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>AI Powered Fashion Stylist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Cun Style Advisor
          </h1>
          <p className="text-stone-600 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Upload ảnh trang phục hoặc người mặc → Điền form sở thích → Nhận ngay lời khuyên phối đồ chuẩn gu kèm sản phẩm gợi ý!
          </p>
        </div>

        {/* Main Card: Upload & Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8 mb-8">
          {/* 1. Upload ảnh */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-stone-800">
                1. Upload ảnh trang phục / người mặc
              </label>
              {selectedImage && (
                <button
                  onClick={handleClearImage}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa ảnh
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              id="imageInput"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 transition cursor-pointer"
            />

            {/* Preview Image */}
            {selectedImage ? (
              <div className="mt-4 relative bg-stone-100/70 rounded-2xl border border-stone-200 p-3 flex flex-col items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-h-72 w-auto object-contain rounded-xl shadow-sm"
                />
                <span className="mt-2 text-[11px] text-stone-500 font-medium">
                  Đã tải ảnh thành công. Stylist sẽ phân tích dựa trên trang phục này.
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-[11px] text-stone-500 mb-2">
                  Hoặc chọn nhanh ảnh mẫu để trải nghiệm thử:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleImage(sample.url)}
                      className="group relative rounded-xl overflow-hidden border border-stone-200 hover:border-pink-500 transition text-left h-20"
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute inset-0 bg-black/40 flex items-end p-1.5 text-[10px] text-white font-semibold">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Form Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Dịp sử dụng
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-stone-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                <option value="casual">Casual / Hàng ngày</option>
                <option value="work">Đi làm / Công sở</option>
                <option value="date">Hẹn hò lãng mạn</option>
                <option value="party">Party / Sự kiện nổi bật</option>
                <option value="travel">Du lịch & Dạo phố</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Phong cách
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-stone-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                <option value="minimal">Minimal / Tối giản</option>
                <option value="elegant">Elegant / Thanh lịch</option>
                <option value="street">Streetwear / Năng động</option>
                <option value="romantic">Romantic / Nữ tính</option>
                <option value="classic">Classic / Cổ điển</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Ngân sách
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-stone-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800"
              >
                <option value="low">Dưới 500k</option>
                <option value="mid">500k - 1.5tr</option>
                <option value="high">Trên 1.5tr (Cao cấp)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Màu ưa thích
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ví dụ: hồng pastel, đen, be sữa..."
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-stone-50/50 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition font-medium text-stone-800 placeholder-stone-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_COLORS.map((qc) => (
                  <button
                    key={qc}
                    type="button"
                    onClick={() => setColor(qc)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-pink-100 hover:text-pink-700 text-stone-600 font-medium transition"
                  >
                    {qc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-8 w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-pink-600/20 hover:shadow-pink-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 text-base disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Stylist đang quét ảnh & phân tích outfit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Phân tích & Gợi ý sản phẩm</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Visualizer State */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl border border-pink-100 p-8 text-center animate-pulse mb-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Cun Style Advisor đang làm việc</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Đang đối soát phong cách, bảng màu phù hợp và chọn lọc các sản phẩm thời trang chất lượng nhất từ CunFashion & Shopee Affiliate...
            </p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div ref={resultRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Stylist Advice Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-600">
                    Cun Fashion Stylist Recommendation
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                    {result.headline}
                  </h2>
                </div>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed bg-pink-50/40 p-4 rounded-2xl border border-pink-100 mb-6 font-medium">
                {result.adviceText}
              </p>

              {/* Color Palette */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-stone-400" />
                  Bảng phối màu gợi ý (Color Palette)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.palette.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200/80 bg-stone-50/50"
                    >
                      <span
                        className="w-7 h-7 rounded-lg border border-black/10 shadow-sm shrink-0"
                        style={{ backgroundColor: item.hex }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-stone-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono uppercase">{item.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Tips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Tips phối đồ từ chuyên gia
                </h4>
                <ul className="space-y-2">
                  {result.styleTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Products Grid (Affiliate) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-pink-600" />
                    Sản Phẩm Gợi Ý Phối Đồ (Affiliate)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sản phẩm được chọn lọc tương thích cao nhất với phong cách & ngân sách của bạn.
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                  {result.suggestedProducts.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.suggestedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:border-pink-300 transition group flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {p.tag && (
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-600 text-white shadow">
                            {p.tag}
                          </span>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-stone-800 backdrop-blur-sm shadow-sm">
                          {p.platform}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-stone-800 line-clamp-2 group-hover:text-pink-600 transition">
                          {p.name}
                        </h4>

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-extrabold text-pink-600">
                            {p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              {p.originalPrice}
                            </span>
                          )}
                          {p.discount && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {p.discount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-stone-500">
                          <span className="text-amber-500 font-bold">★ {p.rating}</span>
                          <span>•</span>
                          <span>Đã bán {p.reviewCount}+</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Actions */}
                    <div className="p-4 pt-0 space-y-2">
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow"
                      >
                        <span>Xem & Mua ngay</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(p)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition"
                      >
                        {copiedId === p.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã sao chép link affiliate</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy link sản phẩm</span>
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

      {/* Extension Info Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Chrome className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  Cun Style Advisor Chrome Extension
                </h3>
                <p className="text-xs text-stone-500">Đề xuất gợi ý outfit khi lướt web (Manifest V3)</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <p className="font-bold text-stone-800">Tính năng tiện ích khi lướt web:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-stone-800">Click chuột phải vào bất kỳ ảnh thời trang</strong> trên Shopee, TikTok Shop, Pinterest, Zara... → Chọn <em>"Tư vấn phối đồ với Cun Style Advisor"</em>.
                </li>
                <li>
                  <strong className="text-stone-800">Popup tiện lợi:</strong> Tra cứu nhanh phong cách, nhận ngay danh sách sản phẩm liên quan và link affiliate.
                </li>
                <li>
                  <strong className="text-stone-800">Không tải nặng máy:</strong> Nhẹ, nhanh, bảo mật tuyệt đối.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 mb-6 text-xs text-pink-900">
              <p className="font-bold mb-1">Cách cài đặt vào Google Chrome (30 giây):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-pink-800">
                <li>Mở trình duyệt Google Chrome, gõ <code className="bg-pink-100 px-1 rounded">chrome://extensions</code>.</li>
                <li>Bật công tắc <strong>"Developer mode"</strong> ở góc trên bên phải.</li>
                <li>Bấm nút <strong>"Load unpacked"</strong> và chọn thư mục <code className="bg-pink-100 px-1 rounded">extension/</code> trong mã nguồn dự án.</li>
                <li>Ghim (Pin) icon Cun Style Advisor lên thanh công cụ để sử dụng bất cứ lúc nào!</li>
              </ol>
            </div>

            <button
              onClick={() => setShowExtensionModal(false)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
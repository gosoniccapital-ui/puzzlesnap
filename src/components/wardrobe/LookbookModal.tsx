"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Download, Sparkles, Loader2, Check, Palette } from "lucide-react";
import { WardrobeItem } from "@/lib/hooks/useWardrobe";
import {
  renderLookbookCanvas,
  LookbookTheme,
  LOOKBOOK_THEMES
} from "@/lib/canvas/lookbook-generator";

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WardrobeItem[];
}

export default function LookbookModal({
  isOpen,
  onClose,
  items
}: LookbookModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<LookbookTheme>("haute-couture");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setPreviewUrl(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const title =
      selectedTheme === "cute-pastel"
        ? "CUNCUTE PASTEL LOOKBOOK"
        : selectedTheme === "minimalist-noir"
        ? "MINIMALIST NOIR LOOKBOOK"
        : "HAUTE COUTURE LOOKBOOK";

    renderLookbookCanvas(items, title, selectedTheme)
      .then((canvas) => {
        if (!isMounted) return;
        canvasRef.current = canvas;
        const dataUrl = canvas.toDataURL("image/png");
        setPreviewUrl(dataUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lookbook generation error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, items, selectedTheme]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current && !previewUrl) return;
    setDownloading(true);

    try {
      const a = document.createElement("a");
      a.href = previewUrl || (canvasRef.current ? canvasRef.current.toDataURL("image/png") : "");
      a.download = `cunfashion-lookbook-${selectedTheme}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Không thể tải ảnh tự động. Đại Ka có thể nhấn giữ hoặc chuột phải vào ảnh để lưu!");
    } finally {
      setDownloading(false);
    }
  };

  const themeOptions: { id: LookbookTheme; label: string; icon: string; style: string }[] = [
    {
      id: "haute-couture",
      label: "Haute Couture",
      icon: "👑",
      style: "from-amber-500/30 to-amber-900/40 border-amber-500/60 text-amber-300"
    },
    {
      id: "minimalist-noir",
      label: "Minimalist Noir",
      icon: "🖤",
      style: "from-stone-700/40 to-stone-900/60 border-stone-500/60 text-stone-200"
    },
    {
      id: "cute-pastel",
      label: "Cute Pastel",
      icon: "🌸",
      style: "from-rose-500/30 to-pink-900/40 border-pink-500/60 text-pink-300"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Multi-Theme Lookbook Studio
              </h3>
              <p className="text-xs text-stone-400">
                Tỉ lệ 9:16 (1080x1920) chuẩn Instagram, TikTok & Facebook Story
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Selector Bar */}
        <div className="px-4 py-3 border-b border-stone-800/80 bg-stone-950/40 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold flex-shrink-0">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {themeOptions.map((th) => {
              const isActive = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-r ${th.style} shadow-md scale-102`
                      : "bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-400"
                  }`}
                >
                  <span>{th.icon}</span>
                  <span className="whitespace-nowrap">{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-stone-950/50 min-h-[360px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-8">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-stone-300">
                Đang vẽ giao diện theme {LOOKBOOK_THEMES[selectedTheme].name}...
              </p>
              <p className="text-[11px] text-stone-500">
                Tự động tối ưu độ phân giải cao 1080x1920
              </p>
            </div>
          ) : previewUrl ? (
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="CunFashion Outfit Lookbook Preview"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <p className="text-sm font-bold text-red-400">
                Không thể tải bản xem trước ảnh Lookbook
              </p>
              <p className="text-xs text-stone-400">
                Vui lòng thử lại hoặc kiểm tra kết nối mạng của bạn.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || !previewUrl || downloading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-stone-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-60 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span className="text-stone-950">Đã tải ảnh về máy!</span>
              </>
            ) : downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>Đang xuất ảnh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-stone-950" />
                <span>Tải Ảnh Story (1080x1920) • {LOOKBOOK_THEMES[selectedTheme].name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

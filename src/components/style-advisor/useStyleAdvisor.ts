"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  generateStylistAdvice,
  AdviceResult,
  getRandomSurpriseLook,
} from "@/lib/data/style-advisor-data";

export function useStyleAdvisor() {
  const [market, setMarket] = useState<"ALL" | "FOURTHWALL" | "RAKUTEN" | "US">("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [occasion, setOccasion] = useState("all");
  const [style, setStyle] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [budget, setBudget] = useState("all");
  const [color, setColor] = useState("");
  const [status, setStatus] = useState<"loading" | "error" | "empty" | "ready">("loading");
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AdviceResult | null>(null);

  const initialLoadedRef = useRef(false);

  const fetchInitial = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);
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
          setStatus("ready");
        } else {
          throw new Error("Invalid response format");
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
        setStatus("ready");
      });
  }, []);

  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      fetchInitial();
    }
  }, [fetchInitial]);

  const compressImage = (file: File, maxDimension = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
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

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageName("");
  };

  const trackAffiliateClick = (
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
          deviceType: isMobile ? "Mobile" : "Desktop",
        }),
      }).catch((err) => console.warn("Track click failed:", err));
    } catch {
      // ignore
    }
  };

  const analyze = async () => {
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setAnalysisStatus(
      selectedImage
        ? "Analyzing fashion silhouette with Google Gemini Flash Vision..."
        : "Matching fashion catalog across global affiliate stores..."
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
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setStatus("ready");
      } else {
        throw new Error(json.error || "Analysis failed");
      }
    } catch (err: unknown) {
      // Offline fallback
      try {
        const advice = generateStylistAdvice({
          occasion,
          style,
          budget,
          color,
          hasCustomImage: !!selectedImage,
          market,
          keyword: keyword.trim(),
        });
        setResult(advice);
        setStatus("ready");
      } catch (fallbackErr: any) {
        setErrorMessage(fallbackErr.message || "Failed to generate style recommendations");
        setStatus("error");
      }
    } finally {
      setAnalysisStatus("");
    }
  };

  const handleSurpriseMe = () => {
    const look = getRandomSurpriseLook();
    setKeyword(look.keyword);
    setOccasion(look.occasion);
    setStyle(look.style);
    setBudget(look.budget);
    setColor(look.color);
    setSelectedImage(null);
    setImageName("");

    setStatus("loading");
    setAnalysisStatus("Surprising you with a trending Haute Couture curation...");

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
          setStatus("ready");
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
        setStatus("ready");
      })
      .finally(() => {
        setAnalysisStatus("");
      });
  };

  return {
    market,
    setMarket,
    selectedImage,
    imageName,
    handleImageFile,
    handleClearImage,
    occasion,
    setOccasion,
    style,
    setStyle,
    keyword,
    setKeyword,
    budget,
    setBudget,
    color,
    setColor,
    status,
    analysisStatus,
    errorMessage,
    result,
    analyze,
    handleSurpriseMe,
    trackAffiliateClick,
  };
}

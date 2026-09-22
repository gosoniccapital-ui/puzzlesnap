"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, Share2, X, Sparkles, Smartphone } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function PwaInstallBanner() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Check if previously dismissed in the last 7 days
    const dismissedAt = localStorage.getItem("cun_pwa_dismissed_at");
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return;
      }
    }

    // Detect mobile / iOS devices - do not show intrusive floating mobile banner on desktop
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isMobileDevice = /mobile|android|iphone|ipad|ipod/.test(ua) || window.innerWidth < 1024;
    setIsIos(isIosDevice);

    if (!isMobileDevice) {
      return;
    }

    // Listen for Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS Safari not standalone, show after 3s delay
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setIsDismissed(false);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("cun_pwa_dismissed_at", Date.now().toString());
    } catch (e) {
      console.warn("Could not save dismissal state", e);
    }
  };

  // Strictly hide on active game canvas routes to prevent event stealing & blocking puzzle pieces
  const isGameRoute = Boolean(
    pathname &&
    (pathname.startsWith("/make-puzzle") || pathname.startsWith("/puzzle"))
  );

  if (isStandalone || isDismissed || isGameRoute) return null;

  return (
    <aside aria-label="Install CunFashion App" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md max-w-[calc(100vw-2rem)] z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl shadow-2xl border border-amber-500/40 text-stone-100 flex flex-col gap-3 relative overflow-hidden bg-stone-950/95 backdrop-blur-xl">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-black shadow-md shrink-0">
              <Sparkles className="w-5 h-5 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  CunFashion Web App
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug mt-0.5">
                {isIos
                  ? "Tap Share then 'Add to Home Screen' for instant fullscreen fashion app."
                  : "Install for lightning-fast mobile experience & offline jigsaw play."}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-stone-400 hover:text-white rounded-xl hover:bg-stone-850 transition cursor-pointer -mr-2 -mt-2"
            title="Dismiss"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-1">
          {isIos ? (
            <div className="flex-1 min-h-[48px] py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300 flex items-center justify-center gap-1.5 font-medium">
              <span>Tap</span>
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share ➜ &apos;Add to Home Screen&apos;</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:opacity-95 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install App Free</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="min-h-[48px] py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 text-xs font-semibold border border-stone-800 transition cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </aside>
  );
}

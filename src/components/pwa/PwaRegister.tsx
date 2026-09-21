"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Auto-recover from chunk load errors caused by new deployments or stale caches
      const handleChunkError = (e: ErrorEvent) => {
        const msg = (e.message || "").toLowerCase();
        if (
          msg.includes("chunkloaderror") ||
          msg.includes("loading chunk") ||
          msg.includes("failed to load resource")
        ) {
          if ("caches" in window) {
            caches.keys().then((names) => {
              names.forEach((name) => caches.delete(name));
            });
          }
          // Hard reload bypass cache
          window.location.reload();
        }
      };

      window.addEventListener("error", handleChunkError);

      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((registration) => {
              // Immediately check for SW updates
              registration.update();
            })
            .catch(() => {
              // Ignore failure
            });
        });
      }

      return () => {
        window.removeEventListener("error", handleChunkError);
      };
    }
  }, []);

  return null;
}

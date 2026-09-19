"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}

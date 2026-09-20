"use client";

import { useState, useEffect, useCallback } from "react";
import { en, type TranslationDictionary } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";

export type LanguageCode = "en" | "vi";

export const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
  en,
  vi,
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "vi"];

export function getTranslation(lang?: string | null): TranslationDictionary {
  if (lang === "vi") return vi;
  return en;
}

export function getCurrentLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    // 1. Priority: localStorage preference
    const stored = localStorage.getItem("cunfashion_lang");
    if (stored === "vi" || stored === "en") return stored;

    // 2. Cookie preference
    const match = document.cookie.match(/(?:^|;\s*)cun_lang=([^;]+)/);
    if (match && (match[1] === "vi" || match[1] === "en")) {
      return match[1] as LanguageCode;
    }
  } catch {
    // Fallback if localStorage or cookie access blocked
  }

  return DEFAULT_LANGUAGE;
}

export function setLanguagePreference(lang: LanguageCode): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("cunfashion_lang", lang);
    document.cookie = `cun_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("cun_language_changed", { detail: { lang } }));
  } catch (err) {
    console.warn("Could not save language preference:", err);
  }
}

export function useTranslation() {
  const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLang(getCurrentLanguage());

    const handleLangChange = (e: Event) => {
      const custom = e as CustomEvent<{ lang: LanguageCode }>;
      if (custom.detail?.lang) {
        setLang(custom.detail.lang);
      }
    };

    window.addEventListener("cun_language_changed", handleLangChange);
    return () => window.removeEventListener("cun_language_changed", handleLangChange);
  }, []);

  const changeLanguage = useCallback((newLang: LanguageCode) => {
    setLang(newLang);
    setLanguagePreference(newLang);
  }, []);

  const t = DICTIONARIES[lang] || en;

  return {
    lang,
    t,
    changeLanguage,
    isEnglish: lang === "en",
    isVietnamese: lang === "vi",
  };
}

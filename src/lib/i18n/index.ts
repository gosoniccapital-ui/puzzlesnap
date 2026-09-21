"use client";

import { useState, useEffect, useCallback } from "react";
import { en, type TranslationDictionary } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import { ja } from "./dictionaries/ja";
import { fr } from "./dictionaries/fr";
import { de } from "./dictionaries/de";
import { es } from "./dictionaries/es";
import { zh } from "./dictionaries/zh";

export type LanguageCode = "en" | "vi" | "ja" | "fr" | "de" | "es" | "zh";

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_CONFIG: Record<LanguageCode, LanguageMeta> = {
  en: { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  vi: { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  ja: { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  fr: { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  de: { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  es: { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  zh: { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
};

export const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
  en,
  vi,
  ja,
  fr,
  de,
  es,
  zh,
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "vi", "ja", "fr", "de", "es", "zh"];
// Active user-facing global languages (excluding Vietnamese as platform is 100% global-first)
export const GLOBAL_LANGUAGES: LanguageCode[] = ["en", "ja", "fr", "de", "es", "zh"];

export function getTranslation(lang?: string | null): TranslationDictionary {
  if (!lang) return en;
  const normalized = lang.toLowerCase().slice(0, 2) as LanguageCode;
  if (normalized === "vi") return en; // Auto-fallback Vietnamese to English for 100% global audience
  return DICTIONARIES[normalized] || en;
}

export function getCurrentLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    // 1. Priority: localStorage preference
    const stored = localStorage.getItem("cunfashion_lang");
    if (stored === "vi") {
      // Migrate legacy Vietnamese preference to English
      setLanguagePreference("en");
      return "en";
    }
    if (stored && GLOBAL_LANGUAGES.includes(stored as LanguageCode)) {
      return stored as LanguageCode;
    }

    // 2. Cookie preference
    const match = document.cookie.match(/(?:^|;\s*)cun_lang=([^;]+)/);
    if (match) {
      if (match[1] === "vi") {
        setLanguagePreference("en");
        return "en";
      }
      if (GLOBAL_LANGUAGES.includes(match[1] as LanguageCode)) {
        return match[1] as LanguageCode;
      }
    }

    // 3. Browser navigator language detection
    if (navigator?.language) {
      const browserLang = navigator.language.slice(0, 2).toLowerCase() as LanguageCode;
      if (GLOBAL_LANGUAGES.includes(browserLang)) {
        return browserLang;
      }
    }
  } catch {
    // Fallback if storage access is blocked
  }

  return DEFAULT_LANGUAGE;
}

export function setLanguagePreference(lang: LanguageCode): void {
  if (typeof window === "undefined") return;

  try {
    const targetLang = lang === "vi" ? "en" : lang;
    localStorage.setItem("cunfashion_lang", targetLang);
    document.cookie = `cun_lang=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("cun_language_changed", { detail: { lang: targetLang } }));
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
      if (custom.detail?.lang && GLOBAL_LANGUAGES.includes(custom.detail.lang)) {
        setLang(custom.detail.lang);
      }
    };

    window.addEventListener("cun_language_changed", handleLangChange);
    return () => window.removeEventListener("cun_language_changed", handleLangChange);
  }, []);

  const changeLanguage = useCallback((newLang: LanguageCode) => {
    if (!GLOBAL_LANGUAGES.includes(newLang)) return;
    setLang(newLang);
    setLanguagePreference(newLang);
  }, []);

  const t = DICTIONARIES[lang] || en;
  const currentMeta = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.en;

  return {
    lang,
    t,
    currentMeta,
    languages: GLOBAL_LANGUAGES.map((code) => LANGUAGE_CONFIG[code]),
    changeLanguage,
    isEnglish: lang === "en",
    isVietnamese: false,
  };
}

export type { TranslationDictionary };

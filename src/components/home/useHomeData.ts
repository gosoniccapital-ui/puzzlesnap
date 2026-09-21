"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PUZZLES_DATA,
  getDailyPuzzle,
  CATEGORIES_LIST,
  type PuzzleItem,
} from "@/lib/data/puzzles-data";

export type HomeDataStatus = "loading" | "error" | "empty" | "ready";

export interface UseHomeDataReturn {
  status: HomeDataStatus;
  daily: PuzzleItem | null;
  featuredList: PuzzleItem[];
  lookbookList: PuzzleItem[];
  categoriesList: typeof CATEGORIES_LIST;
  errorMessage: string | null;
  retry: () => void;
}

export function useHomeData(): UseHomeDataReturn {
  const [status, setStatus] = useState<HomeDataStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!PUZZLES_DATA || PUZZLES_DATA.length === 0) {
        setStatus("empty");
        return;
      }
      setStatus("ready");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load puzzle dataset";
      setErrorMessage(msg);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Micro-delay to avoid synchronous hydration glitches
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const daily = useMemo(() => {
    if (status !== "ready") return null;
    return getDailyPuzzle();
  }, [status]);

  const featuredList = useMemo(() => {
    if (status !== "ready") return [];
    return PUZZLES_DATA.slice(1, 7);
  }, [status]);

  const lookbookList = useMemo(() => {
    if (status !== "ready") return [];
    return PUZZLES_DATA.filter((p) => p.categorySlug === "fashion-lookbook");
  }, [status]);

  return {
    status,
    daily,
    featuredList,
    lookbookList,
    categoriesList: CATEGORIES_LIST,
    errorMessage,
    retry: loadData,
  };
}

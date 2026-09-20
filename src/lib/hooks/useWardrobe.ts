"use client";

import { useState, useEffect, useCallback } from "react";
import type { StyleProduct } from "@/lib/data/style-advisor-data";

export type ClosetCategory = "all" | "party" | "office" | "casual";

export interface WardrobeItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  img: string;
  link: string;
  platform: string;
  category?: string;
  closetCategory?: ClosetCategory;
  savedAt: string;
}

const STORAGE_KEY = "cunfashion_wardrobe_v1";
const EVENT_NAME = "cunfashion:wardrobe-updated";

/**
 * Resolves or creates a persistent player ID for multi-device sync
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "guest";
  let id = localStorage.getItem("cunfashion_player_id");
  if (!id) {
    const rawName =
      localStorage.getItem("cunfashion_player_name") ||
      localStorage.getItem("puzzlesnap_player_name") ||
      "player";
    const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "player";
    const rand = Math.random().toString(36).substring(2, 8);
    id = `${cleanName}-${rand}`;
    localStorage.setItem("cunfashion_player_id", id);
  }
  return id;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function triggerCloudSync(items: WardrobeItem[]) {
  if (typeof window === "undefined") return;
  const playerId = getOrCreatePlayerId();
  if (!playerId || playerId === "guest") return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    fetch("/api/wardrobe/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, items }),
    }).catch((err) => {
      // Background non-blocking sync error
      console.warn("[Cloud Wardrobe] Background sync deferred:", err);
    });
  }, 1200);
}

/**
 * Infer an initial closet category from product name, category or occasion
 */
export function inferClosetCategory(name?: string, category?: string): ClosetCategory {
  const combined = `${name || ""} ${category || ""}`.toLowerCase();
  if (
    combined.includes("party") ||
    combined.includes("tiệc") ||
    combined.includes("dạ hội") ||
    combined.includes("gala") ||
    combined.includes("heels") ||
    combined.includes("clutch") ||
    combined.includes("cocktail")
  ) {
    return "party";
  }
  if (
    combined.includes("blazer") ||
    combined.includes("office") ||
    combined.includes("công sở") ||
    combined.includes("trench") ||
    combined.includes("shirt") ||
    combined.includes("sơ mi") ||
    combined.includes("suit") ||
    combined.includes("trousers")
  ) {
    return "office";
  }
  return "casual";
}

function loadWardrobeFromStorage(): WardrobeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      closetCategory: item.closetCategory || inferClosetCategory(item.name, item.category)
    }));
  } catch (err) {
    console.error("Failed to parse wardrobe items from localStorage:", err);
    return [];
  }
}

function saveWardrobeToStorage(items: WardrobeItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    triggerCloudSync(items);
  } catch (err) {
    console.error("Failed to save wardrobe items to localStorage:", err);
  }
}

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const refreshItems = useCallback(() => {
    setItems(loadWardrobeFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshItems();

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<WardrobeItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail);
      } else {
        refreshItems();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        refreshItems();
      }
    };

    window.addEventListener(EVENT_NAME, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [refreshItems]);

  const isSaved = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items]
  );

  const saveItem = useCallback((product: StyleProduct | WardrobeItem) => {
    const current = loadWardrobeFromStorage();
    if (current.some((i) => i.id === product.id)) return;

    const closetCategory =
      "closetCategory" in product && product.closetCategory
        ? product.closetCategory
        : inferClosetCategory(product.name, product.category);

    const newItem: WardrobeItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      img: product.img,
      link: product.link,
      platform: product.platform,
      category: product.category,
      closetCategory,
      savedAt: new Date().toISOString()
    };

    const next = [newItem, ...current];
    saveWardrobeToStorage(next);
    setItems(next);
  }, []);

  const updateItemCategory = useCallback((id: string, newCategory: ClosetCategory) => {
    const current = loadWardrobeFromStorage();
    const next = current.map((i) =>
      i.id === id ? { ...i, closetCategory: newCategory } : i
    );
    saveWardrobeToStorage(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((id: string) => {
    const current = loadWardrobeFromStorage();
    const next = current.filter((i) => i.id !== id);
    saveWardrobeToStorage(next);
    setItems(next);
  }, []);

  const toggleItem = useCallback(
    (product: StyleProduct | WardrobeItem): boolean => {
      const current = loadWardrobeFromStorage();
      const exists = current.some((i) => i.id === product.id);
      if (exists) {
        removeItem(product.id);
        return false;
      } else {
        saveItem(product);
        return true;
      }
    },
    [removeItem, saveItem]
  );

  const clearWardrobe = useCallback(() => {
    saveWardrobeToStorage([]);
    setItems([]);
  }, []);

  const importItems = useCallback((newItems: WardrobeItem[]): number => {
    if (!newItems || newItems.length === 0) return 0;
    const current = loadWardrobeFromStorage();
    const existingIds = new Set(current.map((i) => i.id));
    const toAdd = newItems
      .filter((i) => !existingIds.has(i.id))
      .map((i) => ({
        ...i,
        closetCategory: i.closetCategory || inferClosetCategory(i.name, i.category)
      }));
    if (toAdd.length === 0) return 0;

    const merged = [...toAdd, ...current];
    saveWardrobeToStorage(merged);
    setItems(merged);
    return toAdd.length;
  }, []);

  const pullFromCloud = useCallback(async (targetPlayerId?: string): Promise<number> => {
    if (typeof window === "undefined") return 0;
    const playerId = targetPlayerId || getOrCreatePlayerId();
    if (!playerId || playerId === "guest") return 0;

    setIsCloudSyncing(true);
    try {
      const res = await fetch(`/api/wardrobe/sync?playerId=${encodeURIComponent(playerId)}`);
      if (!res.ok) return 0;
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        return importItems(data.items);
      }
      return 0;
    } catch (err) {
      console.warn("[Cloud Wardrobe] Pull failed:", err);
      return 0;
    } finally {
      setIsCloudSyncing(false);
    }
  }, [importItems]);

  return {
    items,
    isLoaded,
    isCloudSyncing,
    count: items.length,
    isSaved,
    saveItem,
    removeItem,
    toggleItem,
    clearWardrobe,
    importItems,
    updateItemCategory,
    pullFromCloud
  };
}


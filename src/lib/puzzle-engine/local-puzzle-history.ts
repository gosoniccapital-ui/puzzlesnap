export interface SavedCustomPuzzle {
  id: string;
  title: string;
  image: string;
  difficulty: string;
  createdAt: number;
}

const STORAGE_KEY = "cunfashion_my_custom_puzzles";
const MAX_HISTORY = 24;

export function getMyCustomPuzzles(): SavedCustomPuzzle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMyCustomPuzzle(puzzle: SavedCustomPuzzle): void {
  if (typeof window === "undefined" || !puzzle.id) return;
  try {
    const existing = getMyCustomPuzzles();
    // Remove if already exists with same id to push to front
    const filtered = existing.filter((p) => p.id !== puzzle.id);
    const updated = [puzzle, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save custom puzzle to local history:", err);
  }
}

export function deleteMyCustomPuzzle(id: string): SavedCustomPuzzle[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getMyCustomPuzzles();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

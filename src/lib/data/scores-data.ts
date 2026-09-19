export interface ScoreRecord {
  id: string;
  puzzleSlug: string;
  playerName: string;
  pieceCount: number;
  elapsedSeconds: number;
  moves: number;
  createdAt: string;
}

// Global in-memory score registry (persists across API invocations in server runtime)
const globalScores: ScoreRecord[] = [
  {
    id: "sc-1",
    puzzleSlug: "colorful-fireworks-jigsaw-puzzle",
    playerName: "SpeedySolver",
    pieceCount: 16,
    elapsedSeconds: 58,
    moves: 19,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "sc-2",
    puzzleSlug: "colorful-fireworks-jigsaw-puzzle",
    playerName: "JigsawMaster99",
    pieceCount: 16,
    elapsedSeconds: 74,
    moves: 22,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "sc-3",
    puzzleSlug: "colorful-fireworks-jigsaw-puzzle",
    playerName: "PuzzleQueen",
    pieceCount: 16,
    elapsedSeconds: 92,
    moves: 28,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "sc-4",
    puzzleSlug: "colorful-fireworks-jigsaw-puzzle",
    playerName: "VietNamPuzzle",
    pieceCount: 16,
    elapsedSeconds: 105,
    moves: 31,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "sc-5",
    puzzleSlug: "colorful-fireworks-jigsaw-puzzle",
    playerName: "PixelCrafter",
    pieceCount: 16,
    elapsedSeconds: 124,
    moves: 36,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: "sc-6",
    puzzleSlug: "lone-house-alpine-valley",
    playerName: "AlpineExplorer",
    pieceCount: 30,
    elapsedSeconds: 185,
    moves: 45,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "sc-7",
    puzzleSlug: "lavender-basket-sunrise",
    playerName: "SunriseGazer",
    pieceCount: 20,
    elapsedSeconds: 110,
    moves: 27,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
];

export function getScoresForPuzzle(slug: string, pieceCount?: number): ScoreRecord[] {
  let filtered = globalScores.filter((s) => s.puzzleSlug === slug);
  if (pieceCount) {
    filtered = filtered.filter((s) => s.pieceCount === pieceCount);
  }
  return filtered.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds || a.moves - b.moves);
}

export function getAllScores(): ScoreRecord[] {
  return [...globalScores].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addScoreRecord(record: Omit<ScoreRecord, "id" | "createdAt">): ScoreRecord {
  const newRecord: ScoreRecord = {
    ...record,
    id: "sc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };
  if (globalScores.length >= 1000) {
    globalScores.shift(); // Evict oldest record to preserve memory
  }
  globalScores.push(newRecord);
  return newRecord;
}

export function deleteScoreRecord(id: string): boolean {
  const index = globalScores.findIndex((s) => s.id === id);
  if (index !== -1) {
    globalScores.splice(index, 1);
    return true;
  }
  return false;
}

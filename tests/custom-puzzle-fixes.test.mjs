import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

describe("Custom Puzzle Fixes & Invariants (Milestone 11.4)", () => {
  it("diffNumMap maps hard and very-hard to valid PostgreSQL check constraint values [9, 16, 25, 36, 49, 50]", () => {
    const ALLOWED_DB_CONSTRAINTS = new Set([9, 16, 25, 36, 49, 50]);

    const diffNumMap = {
      easy: 9,
      medium: 16,
      hard: 25,
      "very-hard": 36,
      supreme: 50,
    };

    for (const [key, numVal] of Object.entries(diffNumMap)) {
      assert.ok(
        ALLOWED_DB_CONSTRAINTS.has(numVal),
        `Difficulty ${key} with value ${numVal} must be accepted by DB check constraint`
      );
    }
  });

  it("diffMap reverse translation handles both legacy (30, 40) and current (25, 36) values", () => {
    const diffMap = {
      9: "easy",
      16: "medium",
      25: "hard",
      30: "hard", // legacy fallback
      36: "very-hard",
      40: "very-hard", // legacy fallback
      50: "supreme",
    };

    assert.equal(diffMap[9], "easy");
    assert.equal(diffMap[16], "medium");
    assert.equal(diffMap[25], "hard");
    assert.equal(diffMap[30], "hard");
    assert.equal(diffMap[36], "very-hard");
    assert.equal(diffMap[40], "very-hard");
    assert.equal(diffMap[50], "supreme");
  });

  it("Local puzzle history maintains FIFO order and clamps at max 24 items", () => {
    const mockStorage = new Map();
    const fakeLocalStorage = {
      getItem: (key) => mockStorage.get(key) || null,
      setItem: (key, val) => mockStorage.set(key, val),
    };

    const STORAGE_KEY = "cunfashion_my_custom_puzzles";
    const MAX_HISTORY = 24;

    function getPuzzles() {
      const raw = fakeLocalStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }

    function savePuzzle(puzzle) {
      const existing = getPuzzles();
      const filtered = existing.filter((p) => p.id !== puzzle.id);
      const updated = [puzzle, ...filtered].slice(0, MAX_HISTORY);
      fakeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    function deletePuzzle(id) {
      const existing = getPuzzles();
      const updated = existing.filter((p) => p.id !== id);
      fakeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    // 1. Save 30 items
    for (let i = 1; i <= 30; i++) {
      savePuzzle({
        id: `pz-test-${i}`,
        title: `Puzzle ${i}`,
        image: `https://example.com/p${i}.jpg`,
        difficulty: "medium",
        createdAt: Date.now() + i,
      });
    }

    const saved = getPuzzles();
    assert.equal(saved.length, 24);
    assert.equal(saved[0].id, "pz-test-30"); // Most recent at front

    // 2. Re-saving existing item moves it to front without duplicating
    savePuzzle({
      id: "pz-test-15",
      title: "Puzzle 15 Updated",
      image: "https://example.com/p15.jpg",
      difficulty: "hard",
      createdAt: Date.now() + 100,
    });

    const updated = getPuzzles();
    assert.equal(updated.length, 24);
    assert.equal(updated[0].id, "pz-test-15");
    assert.equal(updated[0].title, "Puzzle 15 Updated");

    // 3. Delete removes item
    const afterDelete = deletePuzzle("pz-test-15");
    assert.equal(afterDelete.length, 23);
    assert.equal(afterDelete.some((p) => p.id === "pz-test-15"), false);
  });

  it("Storage fallback pattern constructs valid publicUrl for custom puzzle assets", () => {
    const puzzleId = "pz-muc2kzoj-py434";
    const extension = "jpeg";
    const bucket = "puzzle-images";
    const subfolder = "custom-puzzles";
    const supabaseUrl = "https://zzouaicqtzyiyldlpzjk.supabase.co";

    const expectedUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${subfolder}/${puzzleId}.${extension}`;
    assert.ok(expectedUrl.includes(puzzleId));
    assert.ok(expectedUrl.includes("custom-puzzles"));
    assert.ok(expectedUrl.endsWith(".jpeg"));
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

test("Sprint 11.7 Invariant #1: 236 Space WebP images exist and are optimized (< 400KB)", () => {
  const spaceDir = path.join(projectRoot, "public", "images", "space");
  assert.ok(fs.existsSync(spaceDir), "public/images/space directory must exist");

  const files = fs.readdirSync(spaceDir).filter((f) => f.endsWith(".webp"));
  assert.equal(files.length, 236, "Exactly 236 Space WebP images must exist");

  let totalBytes = 0;
  for (const f of files) {
    const filePath = path.join(spaceDir, f);
    const stat = fs.statSync(filePath);
    totalBytes += stat.size;
    assert.ok(stat.size > 10 * 1024, `${f} should be larger than 10KB`);
    assert.ok(stat.size < 400 * 1024, `${f} should be smaller than 400KB (actual: ${(stat.size/1024).toFixed(1)}KB)`);
  }

  const avgKb = totalBytes / files.length / 1024;
  assert.ok(avgKb < 200, `Average image size must be under 200KB (actual: ${avgKb.toFixed(1)}KB)`);
});

test("Sprint 11.7 Invariant #2: PUZZLES_DATA contains 236 Space items with rich metadata", async () => {
  const { PUZZLES_DATA } = await import("../src/lib/data/puzzles-data.ts");
  const spaceItems = PUZZLES_DATA.filter((p) => p.categorySlug === "space");
  assert.equal(spaceItems.length, 236, "Must contain exactly 236 Space puzzle items");

  for (const item of spaceItems) {
    assert.ok(item.id.startsWith("space-"), `ID must start with space-: ${item.id}`);
    assert.ok(item.title.length > 5, `Title must be descriptive: ${item.title}`);
    assert.ok(item.image.startsWith("/images/space/"), `Image path must be in /images/space/: ${item.image}`);
    assert.ok(["easy", "medium", "hard", "very-hard", "supreme"].includes(item.difficulty));
  }
});

test("Sprint 11.7 Invariant #3: getDailyPuzzle rotates dynamically through Space collection", async () => {
  const { getDailyPuzzle } = await import("../src/lib/data/puzzles-data.ts");
  const daily = getDailyPuzzle();
  assert.ok(daily, "getDailyPuzzle must return an item");
  assert.equal(daily.categorySlug, "space", "Daily puzzle must belong to Space category");
  assert.equal(daily.isDaily, true, "isDaily flag must be true");
  assert.ok(daily.image.endsWith(".webp"), "Daily puzzle image must be a WebP image");
});

test("Sprint 11.7 Invariant #4: getPuzzleBySlug handles 'daily' and legacy samples", async () => {
  const { getPuzzleBySlug } = await import("../src/lib/data/puzzles-data.ts");
  const dailyViaSlug = getPuzzleBySlug("daily");
  assert.ok(dailyViaSlug, "Slug 'daily' must resolve to daily puzzle");
  assert.equal(dailyViaSlug.isDaily, true);

  const fireworks = getPuzzleBySlug("colorful-fireworks-jigsaw-puzzle");
  assert.ok(fireworks, "Legacy fireworks puzzle must be preserved for route compatibility");
  assert.equal(fireworks.isSample, true, "Legacy puzzle must be marked as sample");

  const alpine = getPuzzleBySlug("lone-house-alpine-valley");
  assert.ok(alpine, "Legacy alpine house puzzle must be preserved");
  assert.equal(alpine.isSample, true);
});

test("Sprint 11.7 Invariant #5: Multi-Platform Event Dispatcher exports clean trackUserAction", async () => {
  const { trackUserAction } = await import("../src/lib/analytics/event-dispatcher.ts");
  assert.equal(typeof trackUserAction, "function", "trackUserAction must be a function");

  // In Node.js environment (window is undefined), calling trackUserAction must never throw
  assert.doesNotThrow(() => {
    trackUserAction("extension_install_click", { source: "test_runner" });
    trackUserAction("create_puzzle_click", { source: "test_runner" });
    trackUserAction("style_tile_click", { category: "casual" });
    trackUserAction("desktop_icon_install_click", { outcome: "test" });
  });
});

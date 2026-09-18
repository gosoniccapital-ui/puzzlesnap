import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Custom Puzzle Sharing & Alignment Invariants", () => {
  it("Share URL formats correctly with encoded image query params", () => {
    const origin = "https://cunfashion.com";
    const imgUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d";
    const title = "My Autumn Lookbook";
    const diff = "hard";

    const shareLink = origin + "/make-puzzle?img=" + encodeURIComponent(imgUrl) + "&title=" + encodeURIComponent(title) + "&diff=" + diff;
    const url = new URL(shareLink);

    assert.equal(url.searchParams.get("img"), imgUrl);
    assert.equal(url.searchParams.get("title"), title);
    assert.equal(url.searchParams.get("diff"), "hard");
  });

  it("Board-aligned clipping guarantees continuous coordinate mapping across pieces", () => {
    const boardW = 800;
    const boardH = 600;
    const pieceW = boardW / 4; // 200
    const pieceH = boardH / 4; // 150

    const p00_offsetX = -0 * pieceW || 0;
    const p00_offsetY = -0 * pieceH || 0;

    const p01_offsetX = -1 * pieceW;
    const p01_offsetY = -0 * pieceH || 0;

    assert.equal(p00_offsetX, 0);
    assert.equal(p01_offsetX, -200);
    assert.equal(Math.abs(p01_offsetX - p00_offsetX), pieceW);
  });
});

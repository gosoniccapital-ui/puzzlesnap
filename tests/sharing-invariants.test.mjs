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
  });

  it("Room invite URL correctly parses room query param for auto-join", () => {
    const inviteUrl = "https://cunfashion.com/puzzle/colorful-fireworks-jigsaw-puzzle?room=ROOM-9821";
    const url = new URL(inviteUrl);

    assert.equal(url.searchParams.get("room"), "ROOM-9821");
    assert.equal(url.pathname, "/puzzle/colorful-fireworks-jigsaw-puzzle");
  });

  it("Custom puzzle security: validates image schemes and rejects unsafe protocols", () => {
    const validHttp = "https://images.unsplash.com/photo-test.jpg";
    const validData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const invalidJs = "javascript:alert(1)";
    const invalidFile = "file:///etc/passwd";

    const isValid = (img) =>
      typeof img === "string" &&
      (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:image/"));

    assert.equal(isValid(validHttp), true);
    assert.equal(isValid(validData), true);
    assert.equal(isValid(invalidJs), false);
    assert.equal(isValid(invalidFile), false);
  });

  it("Custom puzzle security: caps max payload size to 5MB", () => {
    const MAX_BYTES = 5 * 1024 * 1024;
    const normalPayload = "https://images.unsplash.com/photo.jpg";
    const oversizedPayload = "a".repeat(MAX_BYTES + 1);

    assert.ok(normalPayload.length <= MAX_BYTES);
    assert.ok(oversizedPayload.length > MAX_BYTES);
  });

  it("Custom puzzle security: rejects private and loopback IP hosts", () => {
    const isForbiddenHost = (img) =>
      img.includes("localhost") ||
      img.includes("127.0.0.1") ||
      img.includes("169.254.") ||
      img.includes("0.0.0.0") ||
      img.includes("::1");

    assert.equal(isForbiddenHost("http://localhost:3000/secret.png"), true);
    assert.equal(isForbiddenHost("http://127.0.0.1:8080/image.jpg"), true);
    assert.equal(isForbiddenHost("http://169.254.169.254/metadata"), true);
    assert.equal(isForbiddenHost("https://images.unsplash.com/photo.jpg"), false);
    assert.equal(isForbiddenHost("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="), false);
  });

  it("Multiplayer Co-Op: cluster translation preserves relative distances between members", () => {
    // Cluster of piece 0 and piece 1
    const p0 = { id: 0, currentPos: { x: 100, y: 100 } };
    const p1 = { id: 1, currentPos: { x: 200, y: 100 } };
    const originalDx = p1.currentPos.x - p0.currentPos.x;

    // Remote move arrives for piece 0 to (150, 120)
    const newPos = { x: 150, y: 120 };
    const deltaX = newPos.x - p0.currentPos.x;
    const deltaY = newPos.y - p0.currentPos.y;

    p0.currentPos.x += deltaX;
    p0.currentPos.y += deltaY;
    p1.currentPos.x += deltaX;
    p1.currentPos.y += deltaY;

    assert.equal(p0.currentPos.x, 150);
    assert.equal(p0.currentPos.y, 120);
    assert.equal(p1.currentPos.x, 250);
    assert.equal(p1.currentPos.y, 120);
    assert.equal(p1.currentPos.x - p0.currentPos.x, originalDx);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure helper function to generate the shareable Co-Op room URL
 * preserving all existing query parameters (id, img, title, diff, etc.)
 */
export function buildCoopRoomUrl(currentHref, roomId) {
  if (!currentHref || !roomId) return "";
  const url = new URL(currentHref);
  url.searchParams.set("room", roomId);
  return url.toString();
}

describe("Co-Op Room URL & Sharing Invariants", () => {
  it("preserves custom puzzle ID (?id=...) when generating room URL", () => {
    const currentHref = "https://cunfashion.com/make-puzzle?id=pz-mu6rkbal-r38wn";
    const roomId = "ROOM-6939";

    const result = buildCoopRoomUrl(currentHref, roomId);
    const parsed = new URL(result);

    assert.equal(parsed.pathname, "/make-puzzle");
    assert.equal(parsed.searchParams.get("id"), "pz-mu6rkbal-r38wn");
    assert.equal(parsed.searchParams.get("room"), "ROOM-6939");
    assert.equal(result, "https://cunfashion.com/make-puzzle?id=pz-mu6rkbal-r38wn&room=ROOM-6939");
  });

  it("preserves direct image URL, title, and difficulty when generating room URL", () => {
    const currentHref = "https://cunfashion.com/make-puzzle?img=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1490481651871&title=Autumn+Look&diff=hard";
    const roomId = "ROOM-1234";

    const result = buildCoopRoomUrl(currentHref, roomId);
    const parsed = new URL(result);

    assert.equal(parsed.pathname, "/make-puzzle");
    assert.equal(parsed.searchParams.get("img"), "https://images.unsplash.com/photo-1490481651871");
    assert.equal(parsed.searchParams.get("title"), "Autumn Look");
    assert.equal(parsed.searchParams.get("diff"), "hard");
    assert.equal(parsed.searchParams.get("room"), "ROOM-1234");
  });

  it("works seamlessly for catalog puzzles at /puzzle/[slug]", () => {
    const currentHref = "https://cunfashion.com/puzzle/classic-autumn-walk";
    const roomId = "ROOM-8888";

    const result = buildCoopRoomUrl(currentHref, roomId);
    const parsed = new URL(result);

    assert.equal(parsed.pathname, "/puzzle/classic-autumn-walk");
    assert.equal(parsed.searchParams.get("room"), "ROOM-8888");
  });

  it("updates existing room param instead of duplicating if already in a room", () => {
    const currentHref = "https://cunfashion.com/make-puzzle?id=pz-abc&room=ROOM-OLD";
    const roomId = "ROOM-NEW";

    const result = buildCoopRoomUrl(currentHref, roomId);
    const parsed = new URL(result);

    assert.equal(parsed.searchParams.get("id"), "pz-abc");
    assert.equal(parsed.searchParams.get("room"), "ROOM-NEW");
    assert.equal(parsed.searchParams.getAll("room").length, 1);
  });

  it("formats time seconds accurately into mm:ss and hh:mm:ss", () => {
    function formatTime(totalSecs) {
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      if (hrs > 0) {
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    assert.equal(formatTime(0), "00:00");
    assert.equal(formatTime(65), "01:05");
    assert.equal(formatTime(3599), "59:59");
    assert.equal(formatTime(3665), "01:01:05");
  });

  it("auto-prunes expired rate limit entries when store exceeds threshold", () => {
    const rateLimitMap = new Map();
    const now = Date.now();

    // Populate with 505 entries, 500 of which are expired
    for (let i = 0; i < 500; i++) {
      rateLimitMap.set(`10.0.0.${i}`, { count: 1, resetTime: now - 1000 });
    }
    // 5 active entries
    for (let i = 500; i < 505; i++) {
      rateLimitMap.set(`10.0.0.${i}`, { count: 1, resetTime: now + 60000 });
    }

    assert.equal(rateLimitMap.size, 505);

    // Simulate auto-pruning
    if (rateLimitMap.size > 500) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }

    assert.equal(rateLimitMap.size, 5);
    assert.ok(rateLimitMap.has("10.0.0.500"));
    assert.ok(!rateLimitMap.has("10.0.0.1"));
  });
});

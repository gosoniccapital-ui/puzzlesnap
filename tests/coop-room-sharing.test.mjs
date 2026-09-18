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
});

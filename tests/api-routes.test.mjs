import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "https://cunfashion.com";

test("API: GET /api/daily should return today's daily puzzle", async () => {
  const res = await fetch(`${BASE_URL}/api/daily`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.slug);
  assert.ok(json.date);
});

test("API: GET /api/puzzles should support category and query filters", async () => {
  const resAll = await fetch(`${BASE_URL}/api/puzzles`);
  assert.equal(resAll.status, 200);
  const jsonAll = await resAll.json();
  assert.equal(jsonAll.success, true);
  assert.ok(jsonAll.data.length >= 8);

  const resCat = await fetch(`${BASE_URL}/api/puzzles?category=nature`);
  assert.equal(resCat.status, 200);
  const jsonCat = await resCat.json();
  assert.equal(jsonCat.success, true);
  assert.ok(jsonCat.data.every((p) => p.categorySlug === "nature"));

  const resSearch = await fetch(`${BASE_URL}/api/puzzles?q=fireworks`);
  assert.equal(resSearch.status, 200);
  const jsonSearch = await resSearch.json();
  assert.equal(jsonSearch.success, true);
  assert.ok(jsonSearch.data.some((p) => p.slug.includes("fireworks")));
});

test("API: GET and POST /api/scores should persist and sort leaderboard entries", async () => {
  const testSlug = "colorful-fireworks-jigsaw-puzzle";
  const uniqueName = "TestBot_" + Date.now();

  const postRes = await fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      puzzleSlug: testSlug,
      playerName: uniqueName,
      pieceCount: 16,
      elapsedSeconds: 5,
      moves: 3,
    }),
  });
  assert.equal(postRes.status, 200);
  const postJson = await postRes.json();
  assert.equal(postJson.success, true);
  assert.equal(postJson.data.playerName, uniqueName);

  const getRes = await fetch(`${BASE_URL}/api/scores?slug=${testSlug}&pieceCount=16`);
  assert.equal(getRes.status, 200);
  const getJson = await getRes.json();
  assert.equal(getJson.success, true);
  const found = getJson.data.find((s) => s.playerName === uniqueName);
  assert.ok(found, "Newly submitted score should be present on leaderboard");
});

test("API: POST /api/scores should sanitize XSS tags and enforce input validation", async () => {
  const testSlug = "colorful-fireworks-jigsaw-puzzle";

  // 1. Test XSS sanitization
  const xssName = "<script>alert('xss')</script>Hero";
  const postRes = await fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      puzzleSlug: testSlug,
      playerName: xssName,
      pieceCount: 16,
      elapsedSeconds: 30,
      moves: 10,
    }),
  });
  assert.equal(postRes.status, 200);
  const postJson = await postRes.json();
  assert.equal(postJson.success, true);
  assert.ok(!postJson.data.playerName.includes("<script>"), "Player name must not contain HTML tags");
  assert.ok(!postJson.data.playerName.includes("<"), "Player name must not contain '<'");
  assert.ok(!postJson.data.playerName.includes(">"), "Player name must not contain '>'");

  // 2. Test Invalid pieceCount rejected
  const invalidRes = await fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      puzzleSlug: testSlug,
      playerName: "InvalidTester",
      pieceCount: 999, // Invalid pieceCount
      elapsedSeconds: 30,
      moves: 10,
    }),
  });
  assert.equal(invalidRes.status, 400);
});


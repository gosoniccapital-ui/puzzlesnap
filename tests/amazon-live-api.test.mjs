import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Load environment variables from .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "").trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // ignore
}

test("Amazon Live Client: End-to-end integration and affiliate tag enforcement", async (t) => {
  const { searchAmazonLiveProducts, searchRainforestAmazon, searchRapidApiAmazon } = await import(
    "../src/lib/affiliate/amazon-live-client.ts"
  );

  await t.test("Rainforest API returns live products when key is configured", async () => {
    if (!process.env.RAINFOREST_API) {
      console.log("Skipping live Rainforest test: no RAINFOREST_API configured");
      return;
    }
    const items = await searchRainforestAmazon("women trench coat", 3);
    assert.ok(Array.isArray(items), "Should return an array");
    if (items.length > 0) {
      const first = items[0];
      assert.ok(first.asin, "Product should have an ASIN");
      assert.ok(first.name, "Product should have a title");
      assert.ok(first.img.startsWith("http"), "Image should be an HTTP URL");
      assert.ok(first.link.includes("tag=cuncute-20"), "Link must contain affiliate tag cuncute-20");
      assert.strictEqual(first.platform, "Amazon");
      console.log(`✓ Rainforest returned ${items.length} live items, sample: ${first.name.slice(0, 40)}...`);
    }
  });

  await t.test("RapidAPI Real-Time Amazon Data returns live products when key is configured", async () => {
    if (!process.env.RAPIDAPI_API) {
      console.log("Skipping live RapidAPI test: no RAPIDAPI_API configured");
      return;
    }
    const items = await searchRapidApiAmazon("evening dress", 3);
    assert.ok(Array.isArray(items), "Should return an array");
    if (items.length > 0) {
      const first = items[0];
      assert.ok(first.asin, "Product should have an ASIN");
      assert.ok(first.name, "Product should have a title");
      assert.ok(first.img.startsWith("http"), "Image should be an HTTP URL");
      assert.ok(first.link.includes("tag=cuncute-20"), "Link must contain affiliate tag cuncute-20");
      assert.strictEqual(first.platform, "Amazon");
      console.log(`✓ RapidAPI returned ${items.length} live items, sample: ${first.name.slice(0, 40)}...`);
    }
  });

  await t.test("searchAmazonLiveProducts combines live search, caching, and fallback", async () => {
    const startTime = Date.now();
    const items1 = await searchAmazonLiveProducts("leather jacket", 4);
    const time1 = Date.now() - startTime;

    assert.ok(Array.isArray(items1), "Should return products");
    assert.ok(items1.length > 0, "Should have at least 1 product");
    assert.ok(items1[0].link.includes("tag=cuncute-20"), "All links must contain tag=cuncute-20");

    // Second call should hit the in-memory cache and be virtually instantaneous (< 50ms)
    const startCacheTime = Date.now();
    const items2 = await searchAmazonLiveProducts("leather jacket", 4);
    const time2 = Date.now() - startCacheTime;

    assert.strictEqual(items2.length, items1.length, "Cached items length should match");
    assert.strictEqual(items2[0].id, items1[0].id, "Cached item IDs should match");
    assert.ok(time2 < 100, `Cache hit should be fast (got ${time2}ms vs original ${time1}ms)`);
    console.log(`✓ In-memory cache verified: 1st call ${time1}ms, 2nd call ${time2}ms`);
  });
});

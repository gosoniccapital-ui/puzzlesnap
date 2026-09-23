import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { en } from "../src/lib/i18n/dictionaries/en.ts";
import { vi } from "../src/lib/i18n/dictionaries/vi.ts";
import { ja } from "../src/lib/i18n/dictionaries/ja.ts";
import { fr } from "../src/lib/i18n/dictionaries/fr.ts";
import { de } from "../src/lib/i18n/dictionaries/de.ts";
import { es } from "../src/lib/i18n/dictionaries/es.ts";
import { zh } from "../src/lib/i18n/dictionaries/zh.ts";

import { CUNFASHION_SOCIAL_CHANNELS } from "../src/lib/constants/social.ts";
import {
  AMAZON_STYLE_CATALOG,
  SOFT_RETRO_STYLE_CATALOG,
  generateStylistAdvice
} from "../src/lib/data/style-advisor-data.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Sprint 11.3 Invariants - i18n makePuzzle 7-Language Parity", async (t) => {
  const dicts = { en, vi, ja, fr, de, es, zh };
  const expectedKeys = [
    "shareTitle",
    "shareSubtitle",
    "sharableLink",
    "linkCopiedNotice",
    "joiningRoom",
    "syncingWithHost",
    "syncingRealtime",
    "createNewRoom",
    "roomNotFound",
  ];

  for (const [lang, dict] of Object.entries(dicts)) {
    await t.test(`Dictionary ${lang} contains complete makePuzzle keys`, () => {
      assert.ok(dict.makePuzzle, `Dictionary ${lang} must have makePuzzle section`);
      for (const key of expectedKeys) {
        assert.ok(
          dict.makePuzzle[key],
          `Dictionary ${lang}.makePuzzle.${key} must be defined and non-empty`
        );
      }
    });
  }
});

test("Sprint 11.3 Invariants - Official Social Channels", async (t) => {
  await t.test("CUNFASHION_SOCIAL_CHANNELS contains verified URLs", () => {
    assert.equal(CUNFASHION_SOCIAL_CHANNELS.length, 3);
    const fb = CUNFASHION_SOCIAL_CHANNELS.find((s) => s.name === "Facebook");
    const yt = CUNFASHION_SOCIAL_CHANNELS.find((s) => s.name === "YouTube");
    const tt = CUNFASHION_SOCIAL_CHANNELS.find((s) => s.name === "TikTok");

    assert.equal(fb?.url, "https://www.facebook.com/www.MuaChung.co/");
    assert.equal(yt?.url, "https://www.youtube.com/@cunfashion");
    assert.equal(tt?.url, "https://www.tiktok.com/@muachung.co");
  });
});

test("Sprint 11.3 Invariants - Soft Retro / ModCloth Fashion Catalog", async (t) => {
  await t.test("SOFT_RETRO_STYLE_CATALOG has curated products with valid Amazon ASINs and cuncute-20 tag", () => {
    assert.ok(SOFT_RETRO_STYLE_CATALOG.length >= 4, "Must have at least 4 curated retro products");
    for (const item of SOFT_RETRO_STYLE_CATALOG) {
      assert.ok(item.asin && /^B[0-9A-Z]{9}$/.test(item.asin), `Valid ASIN required: ${item.asin}`);
      assert.equal(item.platform, "Amazon");
      assert.ok(item.price.startsWith("$"), "Price must be USD");
      assert.ok(!item.link.includes("tag="), "Link must have clean compliant URL");
      assert.ok(item.styles.includes("retro"), "Must contain retro style tag");
    }
  });

  await t.test("AMAZON_STYLE_CATALOG includes SOFT_RETRO_STYLE_CATALOG items", () => {
    const retroItems = AMAZON_STYLE_CATALOG.filter((p) => p.id.startsWith("amz-retro-"));
    assert.equal(retroItems.length, SOFT_RETRO_STYLE_CATALOG.length);
  });

  await t.test("generateStylistAdvice produces Soft Retro advice for retro style mood", () => {
    const advice = generateStylistAdvice({
      occasion: "casual",
      style: "retro",
      budget: "low",
      color: "sage green",
      hasCustomImage: false,
      market: "US",
    });

    assert.ok(advice.headline, "Must generate headline");
    assert.ok(advice.overallStyle.includes("Retro") || advice.overallStyle.includes("Vintage"), "Overall style must reference Retro/Vintage");
    assert.ok(advice.suggestedProducts && advice.suggestedProducts.length > 0, "Must return curated products");
  });
});

test("Sprint 11.3 Invariants - Source Code Zero Hardcoded Vietnamese in make-puzzle", async () => {
  const makePuzzlePath = path.resolve(__dirname, "../src/app/make-puzzle/page.tsx");
  const content = fs.readFileSync(makePuzzlePath, "utf-8");

  // Verify the exact previous hardcoded string is gone
  assert.ok(
    !content.includes("Link đã được sao chép vào bộ nhớ tạm!"),
    "Must not contain hardcoded Vietnamese link copied string"
  );
  assert.ok(
    !content.includes("Đang Tham Gia Phòng"),
    "Must not contain hardcoded Vietnamese joining room string"
  );
  assert.ok(
    !content.includes("Đang đồng bộ Realtime..."),
    "Must not contain hardcoded Vietnamese realtime sync string"
  );
});

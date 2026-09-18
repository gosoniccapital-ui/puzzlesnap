import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  STYLE_CATALOG,
  generateStylistAdvice
} from "../src/lib/data/style-advisor-data.ts";

test("Style Advisor: Catalog integrity check", () => {
  assert.ok(Array.isArray(STYLE_CATALOG), "STYLE_CATALOG must be an array");
  assert.ok(STYLE_CATALOG.length >= 10, "Should have at least 10 fashion products");

  for (const item of STYLE_CATALOG) {
    assert.ok(item.id, "Product must have an id");
    assert.ok(item.name, "Product must have a name");
    assert.ok(item.price, "Product must have a price");
    assert.ok(item.img, "Product must have an image");
    assert.ok(item.link, "Product must have an affiliate link");
    assert.ok(["Shopee", "TikTok Shop", "Lazada", "CunFashion"].includes(item.platform), "Platform must be recognized");
    assert.ok(Array.isArray(item.occasions) && item.occasions.length > 0, "Occasions must be non-empty");
  }
});

test("Style Advisor: generateStylistAdvice produces valid output for Work occasion", () => {
  const result = generateStylistAdvice({
    occasion: "work",
    style: "elegant",
    budget: "low",
    color: "hồng pastel",
    hasCustomImage: true
  });

  assert.ok(result.headline.includes("Đi làm / Công sở"), "Headline should reflect occasion");
  assert.ok(result.adviceText.includes("hồng pastel"), "Advice text should reflect preferred color");
  assert.ok(result.palette.length >= 4, "Should return color palette with at least 4 colors");
  assert.ok(result.suggestedProducts.length >= 2, "Should return suggested products");
  assert.ok(result.styleTips.some(tip => tip.includes("phân tích tỉ lệ")), "Should include custom image tip");
});

test("Style Advisor: generateStylistAdvice produces valid output for Party occasion with High budget", () => {
  const result = generateStylistAdvice({
    occasion: "party",
    style: "romantic",
    budget: "high",
    color: "đen",
    hasCustomImage: false
  });

  assert.ok(result.headline.includes("Tiệc tùng"), "Headline should reflect party occasion");
  assert.ok(result.palette.some(p => p.name.includes("Đen")), "Palette should contain black tones");
  assert.ok(result.suggestedProducts.length > 0, "Should have product suggestions");
});

test("Chrome Extension: Manifest V3 validation", () => {
  const manifestPath = path.resolve("extension/cun-style-advisor/manifest.json");
  assert.ok(fs.existsSync(manifestPath), "manifest.json must exist");

  const rawContent = fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "");
  const manifest = JSON.parse(rawContent);
  assert.equal(manifest.manifest_version, 3, "Manifest version must be 3");
  assert.ok(manifest.name.includes("Cun Style Advisor"), "Name should match");
  assert.ok(manifest.action.default_popup === "popup.html", "Popup should be popup.html");
  assert.ok(manifest.background.service_worker === "background.js", "Background worker should be background.js");
  assert.ok(manifest.permissions.includes("contextMenus"), "Must include contextMenus permission");
  assert.ok(manifest.permissions.includes("storage"), "Must include storage permission");
  assert.ok(fs.existsSync(path.resolve("extension/cun-style-advisor/popup.html")), "popup.html must exist");
  assert.ok(fs.existsSync(path.resolve("extension/cun-style-advisor/popup.js")), "popup.js must exist");
  assert.ok(fs.existsSync(path.resolve("extension/cun-style-advisor/background.js")), "background.js must exist");
  assert.ok(fs.existsSync(path.resolve("extension/cun-style-advisor/content.js")), "content.js must exist");
  assert.ok(fs.existsSync(path.resolve("extension/cun-style-advisor/icons/icon48.png")), "icon48.png must exist");
});
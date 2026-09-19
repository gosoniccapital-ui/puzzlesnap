import test from "node:test";
import assert from "node:assert/strict";
import {
  PUZZLES_DATA,
  getPuzzleBySlug,
  addPuzzleItem,
  updatePuzzleItem,
  deletePuzzleItem,
} from "../src/lib/data/puzzles-data.ts";

test("E-Commerce: Sample fashion puzzles must have valid voucher and product info", () => {
  const f1 = getPuzzleBySlug("cunfashion-autumn-haute-couture");
  assert.ok(f1, "f1 must exist in PUZZLES_DATA");
  assert.equal(f1.voucherCode, "CUNAUTUMN15");
  assert.equal(f1.discountPercent, 15);
  assert.ok(f1.productUrl.includes("cute.cunfashion.com"), "f1 productUrl must point to cute.cunfashion.com");
  assert.ok(f1.productUrl.includes("coupon=CUNAUTUMN15"), "f1 productUrl must contain coupon query param");
  assert.equal(f1.ctaText, "Shop Cute Outfits");
  assert.ok(f1.productPriceOriginal, "f1 should have original price");
  assert.ok(f1.productPriceSale, "f1 should have sale price");

  const f4 = getPuzzleBySlug("runway-evening-gown");
  assert.ok(f4, "f4 must exist in PUZZLES_DATA");
  assert.equal(f4.voucherCode, "RUNWAY25");
  assert.equal(f4.discountPercent, 25);
  assert.ok(f4.productUrl.includes("coupon=RUNWAY25"));
  assert.equal(f4.ctaText, "Shop Cute Outfits");
});

test("E-Commerce: addPuzzleItem supports creating a puzzle with e-commerce metadata", () => {
  const newSlug = "test-ecommerce-puzzle-" + Date.now();
  const created = addPuzzleItem({
    title: "Test Haute Look",
    slug: newSlug,
    category: "Fashion & Lookbook",
    categorySlug: "fashion-lookbook",
    image: "https://cunfashion.com/test.jpg",
    difficulty: "easy",
    description: "A glamorous test dress",
    voucherCode: "TESTVIP30",
    discountPercent: 30,
    productUrl: "https://cunfashion.com/products/test-dress",
    productPriceOriginal: "1.000.000₫",
    productPriceSale: "700.000₫",
  });

  assert.equal(created.voucherCode, "TESTVIP30");
  assert.equal(created.discountPercent, 30);
  assert.equal(created.productPriceOriginal, "1.000.000₫");
  assert.equal(created.productPriceSale, "700.000₫");

  deletePuzzleItem(created.id);
});

test("E-Commerce: updatePuzzleItem updates e-commerce metadata cleanly", () => {
  const f2 = getPuzzleBySlug("urban-streetwear-lookbook");
  assert.ok(f2);
  const originalVoucher = f2.voucherCode;

  const updated = updatePuzzleItem(f2.id, {
    voucherCode: "UPDATED2026",
    discountPercent: 40,
    productPriceSale: "570.000₫",
  });

  assert.ok(updated);
  assert.equal(updated.voucherCode, "UPDATED2026");
  assert.equal(updated.discountPercent, 40);
  assert.equal(updated.productPriceSale, "570.000₫");

  // Restore
  updatePuzzleItem(f2.id, {
    voucherCode: originalVoucher,
    discountPercent: 20,
    productPriceSale: "760.000₫",
  });
});

test("E-Commerce Invariant: Default fallback voucher when puzzle lacks custom coupon", () => {
  const p2 = getPuzzleBySlug("lone-house-alpine-valley");
  assert.ok(p2);
  assert.equal(p2.voucherCode, undefined);

  const resolveReward = (puzzle) => {
    const voucher = puzzle.voucherCode || "CUNFASHION2026";
    return {
      voucherCode: voucher,
      discountPercent: puzzle.discountPercent || 10,
      productUrl: puzzle.productUrl || `https://cute.cunfashion.com?coupon=${encodeURIComponent(voucher)}&utm_source=puzzlesnap&utm_medium=victory_modal&utm_campaign=puzzle_reward`,
      ctaText: puzzle.ctaText || "Shop Cute Outfits",
    };
  };

  const reward = resolveReward(p2);
  assert.equal(reward.voucherCode, "CUNFASHION2026");
  assert.equal(reward.discountPercent, 10);
  assert.ok(reward.productUrl.startsWith("https://cute.cunfashion.com?coupon=CUNFASHION2026"));
  assert.ok(reward.productUrl.includes("utm_source=puzzlesnap"));
  assert.equal(reward.ctaText, "Shop Cute Outfits");
});

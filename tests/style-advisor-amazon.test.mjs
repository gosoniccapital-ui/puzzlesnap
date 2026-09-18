import test from "node:test";
import assert from "node:assert/strict";

import {
  AMAZON_ASSOCIATE_TAG,
  AMAZON_STYLE_CATALOG,
  buildAmazonSearchUrl,
  buildAmazonProductUrl,
  generateStylistAdvice
} from "../src/lib/data/style-advisor-data.ts";

test("Amazon Associates Tag: cuncute-20 verification", () => {
  assert.equal(AMAZON_ASSOCIATE_TAG, "cuncute-20", "StoreID must be cuncute-20");

  const query = "cropped trench coat women";
  const searchUrl = buildAmazonSearchUrl(query);
  assert.ok(searchUrl.includes("tag=cuncute-20"), "Search URL must include tag=cuncute-20");
  assert.ok(searchUrl.includes("k=cropped%20trench%20coat%20women"), "Search keywords must be URI encoded");

  const asin = "B09V7N7Y6B";
  const productUrl = buildAmazonProductUrl(asin);
  assert.equal(productUrl, "https://www.amazon.com/dp/B09V7N7Y6B?tag=cuncute-20");
});

test("Amazon US Catalog Integrity & Products Verification", () => {
  assert.ok(Array.isArray(AMAZON_STYLE_CATALOG), "Catalog must be an array");
  assert.ok(AMAZON_STYLE_CATALOG.length >= 6, "Must have at least 6 Amazon US items");

  for (const item of AMAZON_STYLE_CATALOG) {
    assert.ok(item.id.startsWith("amz-"), `Item ID ${item.id} should start with amz-`);
    assert.equal(item.platform, "Amazon", "Platform must be Amazon");
    assert.equal(item.market, "US", "Market must be US");
    assert.ok(item.price.startsWith("$"), `Price ${item.price} must be in USD`);
    assert.ok(item.link.includes("tag=cuncute-20"), `Link ${item.link} must have tag=cuncute-20`);
    assert.ok(item.asin, `Item ${item.name} must have an ASIN`);
    assert.ok(item.rating >= 4.0, `Rating ${item.rating} should be high-quality (>= 4.0)`);
    assert.ok(item.reviewCount > 0, `Review count should be positive`);
  }

  // Verify the specific featured products from user screenshot
  const trenchCoat = AMAZON_STYLE_CATALOG.find((p) => p.name.includes("PRETTYGARDEN Cropped Trench Coat"));
  assert.ok(trenchCoat, "Trench coat from user screenshot must be present");
  assert.equal(trenchCoat.price, "$38.99");
  assert.equal(trenchCoat.rating, 4.3);

  const boots = AMAZON_STYLE_CATALOG.find((p) => p.name.includes("Erocalli Women's Fall Suede Mid Calf Slouchy Boots"));
  assert.ok(boots, "Boots from user screenshot must be present");
  assert.equal(boots.price, "$52.99");
  assert.equal(boots.rating, 4.9);

  const loungeSet = AMAZON_STYLE_CATALOG.find((p) => p.name.includes("Ekouaer 2 Piece Sets"));
  assert.ok(loungeSet, "Lounge set from user screenshot must be present");
  assert.equal(loungeSet.price, "$29.99");
  assert.equal(loungeSet.rating, 4.3);
});

test("Style Advisor Engine: US Market Generation with Detected Items", () => {
  const result = generateStylistAdvice({
    occasion: "casual",
    style: "classic",
    budget: "low",
    color: "camel",
    hasCustomImage: true,
    market: "US"
  });

  assert.equal(result.market, "US");
  assert.ok(result.headline.includes("Casual"), "Headline should include Casual");
  assert.ok(result.suggestedProducts.length >= 3, "Should return at least 3 Amazon product suggestions");
  assert.ok(result.suggestedProducts.every((p) => p.market === "US"));
  assert.ok(result.detectedItems && result.detectedItems.length >= 3, "Must return detected items for visual mapping");

  for (const det of result.detectedItems) {
    assert.ok(det.amazonUrl.includes("tag=cuncute-20"), "Detected item amazonUrl must include tag=cuncute-20");
    assert.ok(det.searchQuery, "Detected item must have searchQuery");
  }
});

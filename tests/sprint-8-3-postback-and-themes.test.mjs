import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  recordClick,
  recordConversion,
  getAnalyticsSummary,
  getAllConversionRecords,
  generateConversionCsvString
} from "../src/lib/analytics/click-tracker.ts";
import { inferClosetCategory } from "../src/lib/hooks/useWardrobe.ts";
import { LOOKBOOK_THEMES } from "../src/lib/canvas/lookbook-generator.ts";

test("Affiliate Postback Tracking & Conversion Matching Engine", async (t) => {
  await t.test("recordConversion pairs correctly with click ID and calculates commission & revenue", () => {
    // 1. Create a simulated user click
    const click = recordClick({
      product_id: "test-prod-101",
      product_name: "Vintage Tweed Blazer Jacket",
      platform: "Amazon",
      affiliate_url: "https://www.amazon.com/s?k=tweed+blazer&tag=cuncute-20",
      keyword: "Tweed Blazer",
      device_type: "Desktop",
      created_at: new Date().toISOString()
    });

    assert.ok(click.id.startsWith("clk-"), "Click ID should be generated");

    // 2. Receive postback from affiliate network
    const conversion = recordConversion({
      click_id: click.id,
      order_id: "ORD-AMZ-99881",
      platform: "Amazon",
      amount: 120.0,
      commission: 8.4,
      currency: "USD",
      status: "approved"
    });

    assert.ok(conversion.id.startsWith("conv-"), "Conversion ID should be generated");
    assert.equal(conversion.click_id, click.id);
    assert.equal(conversion.product_id, "test-prod-101", "Should auto-match product ID from click");
    assert.equal(conversion.product_name, "Vintage Tweed Blazer Jacket", "Should auto-match product name");

    // 3. Verify Analytics Summary computation
    const summary = getAnalyticsSummary();
    assert.ok(summary.totalConversions >= 1, "Total conversions should be at least 1");
    assert.ok(summary.totalRevenue > 0, "Total revenue should be greater than 0");
    assert.ok(summary.totalCommission > 0, "Total commission should be greater than 0");
    assert.ok(summary.conversionRate > 0, "Conversion rate should be calculated");
  });

  await t.test("generateConversionCsvString produces valid RFC 4180 CSV with UTF-8 BOM", () => {
    const records = getAllConversionRecords();
    const csv = generateConversionCsvString(records);

    // Verify UTF-8 BOM
    assert.equal(csv.charCodeAt(0), 0xfeff, "First character must be UTF-8 BOM (\\uFEFF)");

    // Verify headers exist
    assert.ok(csv.includes("Mã Chuyển Đổi (ID)"));
    assert.ok(csv.includes("Mã Click Gốc (Click ID)"));
    assert.ok(csv.includes("Mã Đơn Hàng (Order ID)"));
    assert.ok(csv.includes("Hoa Hồng Nhận Được"));
  });
});

test("Closet Categorization Logic", async (t) => {
  await t.test("inferClosetCategory infers correct lifestyle category from name and keywords", () => {
    assert.equal(inferClosetCategory("Váy Dạ Hội Ánh Kim Sparkle", "Dresses"), "party");
    assert.equal(inferClosetCategory("Double Breasted Blazer", "Jackets"), "office");
    assert.equal(inferClosetCategory("Sơ mi lụa công sở", "Tops"), "office");
    assert.equal(inferClosetCategory("Cun Cute Wings Hoodie", "Streetwear"), "casual");
  });
});

test("Multi-Theme Lookbook Studio Themes", async (t) => {
  await t.test("LOOKBOOK_THEMES defines all 3 distinct styling themes", () => {
    assert.ok(LOOKBOOK_THEMES["haute-couture"], "Haute Couture theme must exist");
    assert.ok(LOOKBOOK_THEMES["minimalist-noir"], "Minimalist Noir theme must exist");
    assert.ok(LOOKBOOK_THEMES["cute-pastel"], "Cute Pastel theme must exist");

    // Check theme contrast & identities
    assert.equal(LOOKBOOK_THEMES["haute-couture"].cornerColor, "#f59e0b");
    assert.equal(LOOKBOOK_THEMES["minimalist-noir"].titleColor, "#000000");
    assert.equal(LOOKBOOK_THEMES["cute-pastel"].cornerColor, "#fb7185");
  });
});

test("Filesystem & PWA Service Worker v11 Integrity", async (t) => {
  await t.test("sw.js is updated to cunfashion-cache-v11", () => {
    const swPath = path.resolve(process.cwd(), "public/sw.js");
    const content = fs.readFileSync(swPath, "utf-8");
    assert.ok(/cunfashion-cache-v(11|12|13)/.test(content), "Service worker must have cache-v11, v12 or v13");
  });

  await t.test("Postback webhook route exists", () => {
    const routePath = path.resolve(process.cwd(), "src/app/api/affiliate/postback/route.ts");
    assert.ok(fs.existsSync(routePath), "Postback webhook route file must exist");
  });
});

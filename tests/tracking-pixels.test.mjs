import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  GA_TRACKING_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
} from "../src/lib/analytics/pixel-config.ts";

test("Tracking Pixels: Constant IDs match user specifications exactly", () => {
  assert.equal(GA_TRACKING_ID, "G-V4LESB1SH5", "GA4 Tracking ID must match");
  assert.equal(FB_PIXEL_ID, "540649208737743", "Facebook Pixel ID must match");
  assert.equal(TIKTOK_PIXEL_ID, "D1GJ0MRC77UFSVFK31Q0", "TikTok Pixel ID must match");
});

test("Tracking Pixels: layout.tsx includes TrackingPixels component", () => {
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf8");
  assert.ok(content.includes("TrackingPixels"), "layout.tsx must import TrackingPixels");
  assert.ok(content.includes("<TrackingPixels />"), "layout.tsx must render <TrackingPixels /> in body");
});

test("Tracking Pixels: next.config.mjs CSP whitelists all tracking domains", () => {
  const configPath = path.resolve(process.cwd(), "next.config.mjs");
  const content = fs.readFileSync(configPath, "utf8");

  // Google Analytics & Tag Manager
  assert.ok(content.includes("googletagmanager.com"), "CSP must allow googletagmanager.com");
  assert.ok(content.includes("google-analytics.com"), "CSP must allow google-analytics.com");

  // Facebook / Meta
  assert.ok(content.includes("connect.facebook.net"), "CSP must allow connect.facebook.net");
  assert.ok(content.includes("facebook.com"), "CSP must allow facebook.com");

  // TikTok Pixel
  assert.ok(content.includes("analytics.tiktok.com"), "CSP must allow analytics.tiktok.com");
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  GA_TRACKING_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  X_PIXEL_ID,
  X_CONVERSION_EVENT_ID,
  RAKUTEN_AUTOMATE_KEY,
} from "../src/lib/analytics/pixel-config.ts";

test("Tracking Pixels: Constant IDs match user specifications exactly", () => {
  assert.equal(GA_TRACKING_ID, "G-V4LESB1SH5", "GA4 Tracking ID must match");
  assert.equal(FB_PIXEL_ID, "540649208737743", "Facebook Pixel ID must match");
  assert.equal(TIKTOK_PIXEL_ID, "D1GJ0MRC77UFSVFK31Q0", "TikTok Pixel ID must match");
  assert.equal(X_PIXEL_ID, "rfs1q", "X Pixel ID must match");
  assert.equal(X_CONVERSION_EVENT_ID, "tw-rfs1q-rfs1s", "X Conversion Event ID must match");
  assert.equal(RAKUTEN_AUTOMATE_KEY, "nLOsPQ64OPucpR0KJEBScMn0DWZ6nbfc", "Rakuten Automate widget key must match");
});

test("Tracking Pixels: layout.tsx includes TrackingPixels component", () => {
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf8");
  assert.ok(content.includes("TrackingPixels"), "layout.tsx must import TrackingPixels");
  assert.ok(content.includes("<TrackingPixels />"), "layout.tsx must render <TrackingPixels /> in body");
});

test("Tracking Pixels: TrackingPixels.tsx includes X conversion tracking event", () => {
  const compPath = path.resolve(process.cwd(), "src/components/analytics/TrackingPixels.tsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert.ok(content.includes("x-conversion-pixel-init"), "TrackingPixels must render x-conversion-pixel-init");
  assert.ok(content.includes("twq('event'"), "TrackingPixels must trigger twq event");
  assert.ok(content.includes("X_CONVERSION_EVENT_ID"), "TrackingPixels must reference X_CONVERSION_EVENT_ID");
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

  // X / Twitter Pixel
  assert.ok(content.includes("static.ads-twitter.com"), "CSP must allow static.ads-twitter.com");
  assert.ok(content.includes("analytics.twitter.com"), "CSP must allow analytics.twitter.com");

  // Rakuten Automate & LinkSynergy
  assert.ok(content.includes("automate-frontend.linksynergy.com"), "CSP must allow automate-frontend.linksynergy.com");
  assert.ok(content.includes("automate.linksynergy.com"), "CSP must allow automate.linksynergy.com");
  assert.ok(content.includes("*.linksynergy.com"), "CSP must allow *.linksynergy.com");
});

test("Tracking Pixels: TrackingPixels.tsx includes Rakuten Automate script", () => {
  const compPath = path.resolve(process.cwd(), "src/components/analytics/TrackingPixels.tsx");
  const content = fs.readFileSync(compPath, "utf8");
  assert.ok(content.includes("rakuten-automate-init"), "TrackingPixels must render rakuten-automate-init");
  assert.ok(content.includes("RAKUTEN_AUTOMATE_KEY"), "TrackingPixels must reference RAKUTEN_AUTOMATE_KEY");
  assert.ok(content.includes("automate-frontend.linksynergy.com/minified_logic.js"), "TrackingPixels must reference Rakuten snippetURL");
  assert.ok(content.includes("_rakuten_automate.run(ael)"), "TrackingPixels must run automate on ready");
});


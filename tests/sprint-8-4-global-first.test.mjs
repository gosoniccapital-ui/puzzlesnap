import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AMAZON_STYLE_CATALOG,
  buildAmazonSearchUrl,
  buildAmazonProductUrl,
  buildAffiliateSearchLinks,
  generateStylistAdvice
} from '../src/lib/data/style-advisor-data.ts';
import { recordClick, recordConversion, getAnalyticsSummary } from '../src/lib/analytics/click-tracker.ts';

test('Global-First Amazon Catalog & SubID Invariants', async (t) => {
  await t.test('AMAZON_STYLE_CATALOG has extensive curated products (>= 24 items)', () => {
    assert.ok(AMAZON_STYLE_CATALOG.length >= 24, 'Catalog must contain at least 24 curated fashion pieces');
    
    // Check categories
    const categories = new Set(AMAZON_STYLE_CATALOG.map(p => p.category));
    assert.ok(categories.has('outerwear'), 'Must have outerwear');
    assert.ok(categories.has('dress'), 'Must have dresses');
    assert.ok(categories.has('top'), 'Must have tops');
    assert.ok(categories.has('bottom'), 'Must have bottoms');
    assert.ok(categories.has('shoes'), 'Must have shoes');
    assert.ok(categories.has('accessory'), 'Must have accessories');
  });

  await t.test('All Amazon products have valid USD prices, ASIN and cuncute-20 affiliate tag', () => {
    for (const item of AMAZON_STYLE_CATALOG) {
      assert.ok(item.price.startsWith('$'), `Price must be in USD for ${item.id}: ${item.price}`);
      assert.ok(item.link.includes('tag=cuncute-20'), `Must have tag cuncute-20 for ${item.id}`);
      assert.ok(item.asin && item.asin.length >= 8, `Must have valid ASIN for ${item.id}`);
      assert.ok(item.img.startsWith('https://'), `Must have secure image CDN for ${item.id}`);
    }
  });

  await t.test('buildAmazonSearchUrl appends subId via ascsubtag parameter correctly', () => {
    const defaultUrl = buildAmazonSearchUrl('cropped trench coat');
    assert.ok(defaultUrl.includes('tag=cuncute-20'));
    assert.ok(!defaultUrl.includes('ascsubtag'));

    const trackedUrl = buildAmazonSearchUrl('cropped trench coat', 'clk-user-9912');
    assert.ok(trackedUrl.includes('tag=cuncute-20'));
    assert.ok(trackedUrl.includes('ascsubtag=clk-user-9912'));
  });

  await t.test('buildAmazonProductUrl formats clean DP link with tag and optional subId', () => {
    const url = buildAmazonProductUrl('B09V7N7Y6B', 'clk-sub-123');
    assert.equal(url, 'https://www.amazon.com/dp/B09V7N7Y6B?tag=cuncute-20&ascsubtag=clk-sub-123');
  });
});

test('Zero Shopee/TikTok Dependencies & Clean Global Search Links', async (t) => {
  await t.test('buildAffiliateSearchLinks returns strictly global networks (Amazon, Rakuten, CunCute)', () => {
    const links = buildAffiliateSearchLinks('Cashmere Sweater', 'ALL');
    assert.ok(links.length >= 3, 'Must return at least 3 global search links');
    
    const platforms = links.map(l => l.platform);
    assert.ok(platforms.includes('Amazon'), 'Must include Amazon US');
    assert.ok(platforms.includes('Rakuten'), 'Must include Rakuten Brands');
    assert.ok(platforms.includes('CunCute Store'), 'Must include CunCute Store');
    
    assert.ok(!platforms.includes('Shopee'), 'Must NOT include Shopee');
    assert.ok(!platforms.includes('TikTok Shop'), 'Must NOT include TikTok Shop');
  });

  await t.test('style-advisor-data.ts source code has zero references to shopee.vn', () => {
    const srcPath = path.resolve(process.cwd(), 'src/lib/data/style-advisor-data.ts');
    const content = fs.readFileSync(srcPath, 'utf-8');
    assert.ok(!content.includes('shopee.vn'), 'Must not contain any shopee.vn URLs');
  });
});

test('Global Analytics & Currency Invariants', async (t) => {
  await t.test('recordClick and recordConversion process USD amounts cleanly', () => {
    const click = recordClick({
      product_id: 'amz-01',
      product_name: 'PRETTYGARDEN Cropped Trench Coat',
      platform: 'Amazon',
      affiliate_url: 'https://www.amazon.com/s?k=trench+coat&tag=cuncute-20',
      keyword: 'Trench Coat',
      device_type: 'Desktop',
      created_at: new Date().toISOString()
    });
    assert.ok(click.id.startsWith('clk-'));

    const conv = recordConversion({
      click_id: click.id,
      order_id: 'AMZ-GLOBAL-9812',
      platform: 'Amazon',
      amount: 120.50,
      commission: 8.44,
      currency: 'USD',
      status: 'approved'
    });
    assert.equal(conv.currency, 'USD');
    assert.equal(conv.amount, 120.50);
    assert.equal(conv.product_name, 'PRETTYGARDEN Cropped Trench Coat');

    const summary = getAnalyticsSummary();
    assert.ok(summary.totalRevenue > 0);
    assert.ok(summary.platforms['Amazon'] >= 1);
  });
});

test('PWA Service Worker v12 Integrity', async (t) => {
  await t.test('sw.js defines cunfashion-cache-v12', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const content = fs.readFileSync(swPath, 'utf-8');
    assert.ok(content.includes('cunfashion-cache-v12'), 'Must be upgraded to cache-v12');
  });
});

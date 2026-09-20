import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AMAZON_STYLE_CATALOG,
  generateStylistAdvice
} from '../src/lib/data/style-advisor-data.ts';
import {
  recordClick,
  getAnalyticsSummary
} from '../src/lib/analytics/click-tracker.ts';

test('Style Advisor Assets: Amazon US catalog images strictly match fashion garments', () => {
  const amz01 = AMAZON_STYLE_CATALOG.find((p) => p.id === 'amz-01');
  assert.ok(amz01, 'amz-01 must exist');
  assert.ok(amz01.img.includes('photo-1544441893-675973e31985'), 'amz-01 must use accurate trench coat photo');

  const amz02 = AMAZON_STYLE_CATALOG.find((p) => p.id === 'amz-02');
  assert.ok(amz02, 'amz-02 must exist');
  assert.ok(amz02.img.includes('photo-1543163521-1bf539c55dd2'), 'amz-02 must use accurate women boots photo');

  const amz03 = AMAZON_STYLE_CATALOG.find((p) => p.id === 'amz-03');
  assert.ok(amz03, 'amz-03 must exist');
  assert.ok(amz03.img.includes('photo-1515886657613-9f3515b0c78f'), 'amz-03 must use accurate knit 2-piece set photo');

  const amz06 = AMAZON_STYLE_CATALOG.find((p) => p.id === 'amz-06');
  assert.ok(amz06, 'amz-06 must exist');
  assert.ok(amz06.img.includes('photo-1590874103328-eac38a683ce7'), 'amz-06 must use accurate hobo handbag photo');
});

test('Style Advisor Engine: Differentiates Key Matches from Coordinated Complete-the-Look pieces', () => {
  const advice = generateStylistAdvice({
    occasion: 'all',
    style: 'all',
    budget: 'all',
    color: '',
    hasCustomImage: false,
    market: 'ALL',
    keyword: 'Trench Coat'
  });

  assert.equal(advice.hasDirectMatch, true);
  assert.ok(advice.keyMatchedProducts && advice.keyMatchedProducts.length > 0, 'Must have key matched products');
  assert.equal(advice.keyMatchedProducts[0].id, 'amz-01', 'Key matched product should be trench coat amz-01');
  assert.ok(advice.coordinatedProducts && advice.coordinatedProducts.length > 0, 'Must have coordinated products');
  assert.ok(advice.suggestedProducts.length >= advice.keyMatchedProducts.length, 'Backwards compatible suggestedProducts');
});

test('Analytics Engine: recordClick and getAnalyticsSummary accurately track affiliate conversions', () => {
  const initial = getAnalyticsSummary();
  const initialClicks = initial.totalClicks;

  recordClick({
    product_id: 'test-amz-item',
    product_name: 'Test Trench Coat Luxury Edition',
    platform: 'Amazon',
    affiliate_url: 'https://www.amazon.com/dp/test?tag=cuncute-20',
    keyword: 'Trench Coat',
    device_type: 'Desktop',
    created_at: new Date().toISOString()
  });

  const updated = getAnalyticsSummary();
  assert.equal(updated.totalClicks, initialClicks + 1, 'Total clicks must increment by 1');
  assert.ok(updated.platforms['Amazon'] >= 1, 'Amazon platform count must increment');
  
  const topAmz = updated.topProducts.find((p) => p.productId === 'test-amz-item');
  assert.ok(topAmz, 'New product must be tracked in topProducts');
  assert.equal(topAmz.platform, 'Amazon');

  const topKw = updated.topKeywords.find((k) => k.keyword === 'Trench Coat');
  assert.ok(topKw, 'Keyword Trench Coat must be tracked in topKeywords');
});

test('Wardrobe Architecture: Component and Hook files exist and are integrated cleanly', () => {
  const hookPath = path.resolve('src', 'lib', 'hooks', 'useWardrobe.ts');
  assert.ok(fs.existsSync(hookPath), 'useWardrobe hook must exist on disk');
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  assert.ok(hookContent.includes('cunfashion_wardrobe_v1'), 'Must use versioned wardrobe storage key');
  assert.ok(hookContent.includes('toggleItem'), 'Must provide toggleItem');
  assert.ok(hookContent.includes('isSaved'), 'Must provide isSaved');

  const drawerPath = path.resolve('src', 'components', 'wardrobe', 'WardrobeDrawer.tsx');
  assert.ok(fs.existsSync(drawerPath), 'WardrobeDrawer component must exist on disk');
  const drawerContent = fs.readFileSync(drawerPath, 'utf8');
  assert.ok(drawerContent.includes('Personal Wardrobe') || drawerContent.includes('Tủ Đồ Cá Nhân Hóa'), 'Must render wardrobe title');
  assert.ok(drawerContent.includes('clearWardrobe'), 'Must provide clear wardrobe option');

  const pagePath = path.resolve('src', 'app', 'style-advisor', 'page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  assert.ok(pageContent.includes('WardrobeDrawer'), 'page.tsx must integrate WardrobeDrawer');
  assert.ok(pageContent.includes('Tủ Đồ'), 'page.tsx must render Tủ Đồ pill');
  assert.ok(!pageContent.includes('handleLoadDemoBlazer'), 'page.tsx must have removed demo blazer button');
});

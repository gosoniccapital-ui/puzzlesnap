import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  generateWardrobeShareUrl,
  parseSharedWardrobeParam
} from '../src/lib/wardrobe/sharing.ts';
import {
  AMAZON_STYLE_CATALOG
} from '../src/lib/data/style-advisor-data.ts';
import {
  getAllClickRecords,
  generateClickCsvString,
  recordClick
} from '../src/lib/analytics/click-tracker.ts';

test('Wardrobe Sharing: generateWardrobeShareUrl creates clean query param URL', () => {
  const dummyItems = [
    { id: 'amz-01', name: 'Trench Coat', price: '$38.99', img: 'https://...', link: 'https://...', platform: 'Amazon', savedAt: new Date().toISOString() },
    { id: 'amz-02', name: 'Suede Boots', price: '$52.99', img: 'https://...', link: 'https://...', platform: 'Amazon', savedAt: new Date().toISOString() }
  ];

  const shareUrl = generateWardrobeShareUrl(dummyItems, 'https://cunfashion.com');
  assert.equal(
    shareUrl,
    'https://cunfashion.com/style-advisor?wardrobe=amz-01,amz-02',
    'Share URL must contain comma-separated encoded product IDs'
  );

  const emptyUrl = generateWardrobeShareUrl([], 'https://cunfashion.com');
  assert.equal(emptyUrl, 'https://cunfashion.com/style-advisor', 'Empty items should point to base style advisor');
});

test('Wardrobe Sharing: parseSharedWardrobeParam accurately resolves catalog pieces and fallbacks', () => {
  const resolved = parseSharedWardrobeParam('amz-01,amz-02,custom-item-99', AMAZON_STYLE_CATALOG);
  assert.equal(resolved.length, 3, 'Must resolve exactly 3 items');


  const item1 = resolved[0];
  assert.equal(item1.id, 'amz-01');
  assert.ok(item1.name.includes('Trench Coat'), 'Item 1 must be trench coat');
  assert.ok(item1.img.includes('photo-1544441893-675973e31985'), 'Item 1 must use trench coat image');
  assert.equal(item1.platform, 'Amazon');

  const item2 = resolved[1];
  assert.equal(item2.id, 'amz-02');
  assert.ok(item2.name.includes('Boots'), 'Item 2 must be boots');

  const item3 = resolved[2];
  assert.equal(item3.id, 'custom-item-99');
  assert.ok(item3.name.includes('Trang phục thời trang'), 'Fallback item should have graceful name');
  assert.ok(!item3.link.includes('tag='), 'Fallback item should have clean URL without affiliate tag');
});

test('CSV Analytics Exporter: generateClickCsvString formats valid CSV with UTF-8 BOM', () => {
  recordClick({
    product_id: 'test-csv-prod',
    product_name: 'Váy Dạ Hội "Haute Couture", Bản Đặc Biệt',
    platform: 'Amazon',
    affiliate_url: 'https://www.amazon.com/dp/test?tag=cuncute-20',
    keyword: 'Váy dạ hội',
    device_type: 'Mobile',
    created_at: '2026-09-19T20:00:00.000Z'
  });

  const records = getAllClickRecords();
  assert.ok(records.length > 0, 'Must have at least one record');

  const csv = generateClickCsvString(records);
  assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 Byte Order Mark for Excel compatibility');
  
  const lines = csv.split('\r\n');
  assert.ok(lines.length >= 2, 'Must have header line and at least 1 data row');

  // Check header
  const header = lines[0];
  assert.ok(header.includes('Mã Click (ID)'));
  assert.ok(header.includes('Thời Gian'));
  assert.ok(header.includes('Sàn Mua Sắm'));
  assert.ok(header.includes('Link Affiliate Đích'));

  // Check escaped cell for double quotes
  const matchingLine = lines.find((l) => l.includes('test-csv-prod'));
  assert.ok(matchingLine, 'Target test product must be in CSV lines');
  assert.ok(matchingLine.includes('""Haute Couture""'), 'Quotes inside cell must be doubled for standard CSV compliance');
});

test('Lookbook Generator & Architecture: Canvas, Modal, Banner and Admin integration', () => {
  // 1. Lookbook Canvas Generator
  const canvasGenPath = path.resolve('src', 'lib', 'canvas', 'lookbook-generator.ts');
  assert.ok(fs.existsSync(canvasGenPath), 'lookbook-generator.ts must exist');
  const canvasContent = fs.readFileSync(canvasGenPath, 'utf8');
  assert.ok(canvasContent.includes('1080'), 'Must target 1080px width for 9:16 story');
  assert.ok(canvasContent.includes('1920'), 'Must target 1920px height for 9:16 story');
  assert.ok(canvasContent.includes('crossOrigin = "anonymous"'), 'Must set crossOrigin to prevent canvas tainting');
  assert.ok(canvasContent.includes('renderLookbookCanvas'), 'Must export renderLookbookCanvas');

  // 2. Lookbook Modal
  const modalPath = path.resolve('src', 'components', 'wardrobe', 'LookbookModal.tsx');
  assert.ok(fs.existsSync(modalPath), 'LookbookModal.tsx must exist');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  assert.ok(modalContent.includes('Download Story (1080x1920)') || modalContent.includes('Tải Ảnh Story (1080x1920)'), 'Modal must have Story download button');

  // 3. Shared Wardrobe Banner
  const bannerPath = path.resolve('src', 'components', 'wardrobe', 'SharedWardrobeBanner.tsx');
  assert.ok(fs.existsSync(bannerPath), 'SharedWardrobeBanner.tsx must exist');
  const bannerContent = fs.readFileSync(bannerPath, 'utf8');
  assert.ok(bannerContent.includes('Shared Outfit Wardrobe') || bannerContent.includes('Tủ Đồ Outfit Được Chia Sẻ'), 'Banner must display shared wardrobe title');
  assert.ok(bannerContent.includes('importItems'), 'Banner must trigger importItems to merge into wardrobe');

  // 4. Admin CSV Export Integration
  const adminRoutePath = path.resolve('src', 'app', 'api', 'admin', 'analytics', 'route.ts');
  const routeContent = fs.readFileSync(adminRoutePath, 'utf8');
  assert.ok(routeContent.includes('format === "csv"'), 'Analytics API must handle format=csv');
  assert.ok(routeContent.includes('text/csv; charset=utf-8'), 'Analytics API must set CSV Content-Type');

  const adminPagePath = path.resolve('src', 'app', 'admin', 'page.tsx');
  const pageContent = fs.readFileSync(adminPagePath, 'utf8');
  assert.ok(pageContent.includes('handleExportCsv'), 'Admin page must have handleExportCsv');
  assert.ok(pageContent.includes('Xuất dữ liệu CSV'), 'Admin page must have Xuất dữ liệu CSV button');
});

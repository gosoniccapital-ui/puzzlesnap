import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import i18n dictionaries
import { en } from '../src/lib/i18n/dictionaries/en.ts';
import { vi } from '../src/lib/i18n/dictionaries/vi.ts';
import { recordClick, getAnalyticsSummary } from '../src/lib/analytics/click-tracker.ts';

test('Sprint 9.1 Invariants - Chrome Extension Sync', async (t) => {
  const manifestPath = path.join(rootDir, 'extension', 'cun-style-advisor', 'manifest.json');
  const popupJsPath = path.join(rootDir, 'extension', 'cun-style-advisor', 'popup.js');
  const popupHtmlPath = path.join(rootDir, 'extension', 'cun-style-advisor', 'popup.html');

  await t.test('Manifest V3 conforms to version 1.1.0 and has host_permissions for cunfashion.com', () => {
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.equal(manifest.manifest_version, 3, 'Must be Chrome Manifest V3');
    assert.equal(manifest.version, '1.1.0', 'Extension version must be bumped to 1.1.0');
    assert.ok(
      manifest.host_permissions && manifest.host_permissions.includes('https://cunfashion.com/*'),
      'host_permissions must allow https://cunfashion.com/*'
    );
  });

  await t.test('Popup JS contains ZERO legacy mock data (Shopee, TikTok, VND)', () => {
    assert.ok(fs.existsSync(popupJsPath), 'popup.js must exist');
    const content = fs.readFileSync(popupJsPath, 'utf8').toLowerCase();

    assert.ok(!content.includes('shopee'), 'popup.js must not contain shopee references');
    assert.ok(!content.includes('tiktok'), 'popup.js must not contain tiktok references');
    assert.ok(!content.includes('vnd') && !content.includes('vnđ'), 'popup.js must not contain VND currency');
  });

  await t.test('Popup JS embeds Amazon StoreID cuncute-20 and ascsubtag=ext-popup', () => {
    const content = fs.readFileSync(popupJsPath, 'utf8');

    assert.ok(content.includes('cuncute-20'), 'Must contain Amazon Associate StoreID cuncute-20');
    assert.ok(content.includes('ascsubtag=ext-popup'), 'Must contain ascsubtag=ext-popup tracking parameter');
    assert.ok(content.includes('https://cunfashion.com/api/style-advisor/analyze'), 'Must call primary CunFashion API endpoint');
  });

  await t.test('Popup HTML is 100% English and contains Keyword Search bar', () => {
    assert.ok(fs.existsSync(popupHtmlPath), 'popup.html must exist');
    const content = fs.readFileSync(popupHtmlPath, 'utf8');

    assert.ok(content.includes('id="inputKeyword"'), 'Must contain quick keyword search input');
    assert.ok(content.includes('Search'), 'Must have Search button');
    assert.ok(!content.includes('Shopee') && !content.includes('TikTok'), 'HTML must not have Shopee/TikTok');
  });
});

test('Sprint 9.1 Invariants - Edge Geo-IP Integration', async (t) => {
  const middlewarePath = path.join(rootDir, 'src', 'middleware.ts');
  const geoRoutePath = path.join(rootDir, 'src', 'app', 'api', 'geo', 'route.ts');

  await t.test('Next.js Middleware extracts Edge geo headers and injects cookies', () => {
    assert.ok(fs.existsSync(middlewarePath), 'middleware.ts must exist');
    const content = fs.readFileSync(middlewarePath, 'utf8');

    assert.ok(content.includes('x-vercel-ip-country'), 'Must inspect Vercel geo country header');
    assert.ok(content.includes('cf-ipcountry'), 'Must inspect Cloudflare geo country header');
    assert.ok(content.includes('x-cun-country'), 'Must inject x-cun-country request header');
    assert.ok(content.includes('cun_country'), 'Must set cun_country cookie');
  });

  await t.test('GET /api/geo route exists and handles geo resolution', () => {
    assert.ok(fs.existsSync(geoRoutePath), 'src/app/api/geo/route.ts must exist');
    const content = fs.readFileSync(geoRoutePath, 'utf8');

    assert.ok(content.includes('export async function GET'), 'Must export GET handler');
    assert.ok(content.includes('x-cun-country') || content.includes('x-vercel-ip-country'), 'Must read country headers');
  });

  await t.test('ClickTracker records Geo data (country and city) in ClickRecord', () => {
    const testItemId = `test-geo-item-${Date.now()}`;
    const record = recordClick({
      itemId: testItemId,
      platform: 'Amazon',
      category: 'dress',
      price: '$49.99',
      subId: 'test-geo-sub',
      country: 'US',
      city: 'Seattle'
    });

    assert.equal(record.country, 'US', 'Click record must store country');
    assert.equal(record.city, 'Seattle', 'Click record must store city');
    assert.equal(record.platform, 'Amazon');

    const summary = getAnalyticsSummary();
    assert.ok(summary.totalClicks > 0, 'Analytics summary must reflect recorded click');
  });
});

test('Sprint 9.1 Invariants - Global-First i18n Parity', async (t) => {
  const i18nIndexPath = path.join(rootDir, 'src', 'lib', 'i18n', 'index.ts');

  await t.test('i18n module specifies English default and supported languages EN & VI', () => {
    assert.ok(fs.existsSync(i18nIndexPath), 'src/lib/i18n/index.ts must exist');
    const content = fs.readFileSync(i18nIndexPath, 'utf8');

    assert.ok(content.includes('DEFAULT_LANGUAGE: LanguageCode = "en"'), 'Default platform language must be English');
    assert.ok(content.includes('["en", "vi"') || (content.includes('"en"') && content.includes('"vi"')), 'Must support en and vi');
    assert.ok(content.includes('export function getTranslation'), 'Must export getTranslation');
    assert.ok(content.includes('export function useTranslation'), 'Must export useTranslation hook');
  });

  await t.test('English and Vietnamese dictionaries have 100% key parity', () => {
    const compareObjects = (objA, objB, prefix = '') => {
      const keysA = Object.keys(objA).sort();
      const keysB = Object.keys(objB).sort();

      assert.deepEqual(
        keysA,
        keysB,
        `Dictionary key mismatch at path "${prefix}": [${keysA.join(', ')}] vs [${keysB.join(', ')}]`
      );

      for (const key of keysA) {
        const valA = objA[key];
        const valB = objB[key];
        const currentPath = prefix ? `${prefix}.${key}` : key;

        assert.equal(
          typeof valA,
          typeof valB,
          `Type mismatch at "${currentPath}": ${typeof valA} vs ${typeof valB}`
        );

        if (typeof valA === 'object' && valA !== null) {
          compareObjects(valA, valB, currentPath);
        }
      }
    };

    compareObjects(en, vi, 'root');
  });

  await t.test('en and vi dictionaries have valid core values', () => {
    assert.equal(en.navbar.styleAdvisor, 'Style Advisor');
    assert.equal(en.common.loading, 'Loading...');

    assert.equal(vi.navbar.styleAdvisor, 'Tư Vấn Phong Cách');
    assert.equal(vi.common.loading, 'Đang tải...');
  });
});

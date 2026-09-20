import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import all 7 i18n dictionaries
import { en } from '../src/lib/i18n/dictionaries/en.ts';
import { vi } from '../src/lib/i18n/dictionaries/vi.ts';
import { ja } from '../src/lib/i18n/dictionaries/ja.ts';
import { fr } from '../src/lib/i18n/dictionaries/fr.ts';
import { de } from '../src/lib/i18n/dictionaries/de.ts';
import { es } from '../src/lib/i18n/dictionaries/es.ts';
import { zh } from '../src/lib/i18n/dictionaries/zh.ts';

const dictionaries = { en, vi, ja, fr, de, es, zh };
const requiredSections = [
  'common',
  'navbar',
  'home',
  'toolbar',
  'victory',
  'styleAdvisor',
  'coop',
  'pwa',
  'footer',
];

test('Sprint 10 Invariants - 7 Languages & 100% Dictionary Parity', async (t) => {
  await t.test('All 7 language dictionaries exist and export valid objects', () => {
    for (const [code, dict] of Object.entries(dictionaries)) {
      assert.ok(dict, `Dictionary ${code} must exist`);
      assert.equal(typeof dict, 'object', `Dictionary ${code} must be an object`);
    }
  });

  await t.test('All 7 dictionaries contain all required top-level sections', () => {
    for (const [code, dict] of Object.entries(dictionaries)) {
      for (const section of requiredSections) {
        assert.ok(
          dict[section],
          `Dictionary ${code} must contain section '${section}'`
        );
      }
    }
  });

  await t.test('All 7 dictionaries have 100% key parity with English dictionary', () => {
    const enSections = Object.keys(en);

    for (const [code, dict] of Object.entries(dictionaries)) {
      if (code === 'en') continue;

      for (const section of enSections) {
        const enKeys = Object.keys(en[section] || {});
        const targetKeys = Object.keys(dict[section] || {});

        for (const key of enKeys) {
          assert.ok(
            key in dict[section],
            `Dictionary '${code}' missing key '${section}.${key}' found in English dictionary`
          );
          assert.equal(
            typeof dict[section][key],
            'string',
            `Dictionary '${code}.${section}.${key}' must be a non-empty string`
          );
          assert.ok(
            dict[section][key].length > 0,
            `Dictionary '${code}.${section}.${key}' cannot be blank`
          );
        }
      }
    }
  });

  await t.test('Home page dictionary contains all necessary Hero, Lookbook & Category keys', () => {
    const requiredHomeKeys = [
      'heroTitle',
      'heroSubtitle',
      'heroDescription',
      'playToday',
      'makeYourOwn',
      'dailyBadge',
      'plays',
      'likes',
      'featuredTitle',
      'viewAll',
      'originalsBadge',
      'lookbookTitle',
      'exploreLookbooks',
      'categoriesTitle',
      'seeAllCategories',
    ];

    for (const [code, dict] of Object.entries(dictionaries)) {
      for (const key of requiredHomeKeys) {
        assert.ok(
          key in dict.home,
          `Dictionary '${code}.home' missing required key '${key}'`
        );
      }
    }
  });

  await t.test('PWA install dictionary contains iOS and Android instructions', () => {
    for (const [code, dict] of Object.entries(dictionaries)) {
      assert.ok(dict.pwa.installTitle, `${code}.pwa must have installTitle`);
      assert.ok(dict.pwa.iosStep1, `${code}.pwa must have iosStep1`);
      assert.ok(dict.pwa.iosStep2, `${code}.pwa must have iosStep2`);
      assert.ok(dict.pwa.androidInstallBtn, `${code}.pwa must have androidInstallBtn`);
    }
  });
});

test('Sprint 10 Invariants - Haute Couture Aesthetics & Design Tokens', async (t) => {
  const cssPath = path.join(rootDir, 'src', 'app', 'globals.css');
  const layoutPath = path.join(rootDir, 'src', 'app', 'layout.tsx');
  const manifestPath = path.join(rootDir, 'public', 'site.webmanifest');
  const swPath = path.join(rootDir, 'public', 'sw.js');

  await t.test('globals.css defines luxury typography and Haute Couture tokens', () => {
    assert.ok(fs.existsSync(cssPath), 'globals.css must exist');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('Cinzel'), 'Must import Cinzel luxury font');
    assert.ok(css.includes('Playfair Display'), 'Must import Playfair Display font');
    assert.ok(css.includes('--brand-gold: #dfba73'), 'Must define --brand-gold token');
    assert.ok(css.includes('.luxury-glass'), 'Must define .luxury-glass utility');
    assert.ok(css.includes('.gold-gradient-text'), 'Must define .gold-gradient-text utility');
    assert.ok(css.includes('.gold-glow'), 'Must define .gold-glow utility');
    assert.ok(css.includes('.safe-area-bottom'), 'Must define .safe-area-bottom for mobile');
  });

  await t.test('layout.tsx configures obsidian background, themeColor and PwaInstallBanner', () => {
    assert.ok(fs.existsSync(layoutPath), 'layout.tsx must exist');
    const layout = fs.readFileSync(layoutPath, 'utf8');

    assert.ok(layout.includes('themeColor: "#09090b"'), 'themeColor must be #09090b');
    assert.ok(layout.includes('viewportFit: "cover"'), 'viewportFit must be cover');
    assert.ok(layout.includes('PwaInstallBanner'), 'Must import and render PwaInstallBanner');
    assert.ok(layout.includes('bg-[#09090b]'), 'body must use bg-[#09090b]');
  });

  await t.test('site.webmanifest specifies obsidian theme color and background', () => {
    assert.ok(fs.existsSync(manifestPath), 'site.webmanifest must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.equal(manifest.background_color, '#09090b', 'manifest background_color must be #09090b');
    assert.equal(manifest.theme_color, '#dfba73', 'manifest theme_color must be #dfba73');
    assert.equal(manifest.display, 'standalone', 'manifest display must be standalone');
  });

  await t.test('Service Worker is bumped to cunfashion-cache-v13', () => {
    assert.ok(fs.existsSync(swPath), 'sw.js must exist');
    const sw = fs.readFileSync(swPath, 'utf8');

    assert.ok(sw.includes('cunfashion-cache-v13'), 'CACHE_NAME must be cunfashion-cache-v13');
  });
});

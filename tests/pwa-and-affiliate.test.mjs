import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { VN_STYLE_CATALOG, AMAZON_STYLE_CATALOG } from '../src/lib/data/style-advisor-data.ts';

test('PWA: site.webmanifest exists and contains standalone config and valid icons', () => {
  const manifestPath = path.resolve('public', 'site.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'site.webmanifest must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons && manifest.icons.length >= 2, 'Must have at least 2 icons');
  
  for (const icon of manifest.icons) {
    const iconFile = path.resolve('public', icon.src.replace(/^\//, ''));
    assert.ok(fs.existsSync(iconFile), 'Icon file must exist on disk: ' + icon.src);
  }
});

test('PWA: Service Worker public/sw.js exists and defines caching lifecycle', () => {
  const swPath = path.resolve('public', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.ok(/cunfashion-cache-v\d+/.test(swContent), 'Must have versioned cache name');
  assert.ok(swContent.includes('install'), 'Must have install event');
  assert.ok(swContent.includes('activate'), 'Must have activate event');
  assert.ok(swContent.includes('fetch'), 'Must have fetch event');
});

test('Style Advisor: Zero fake shop links and verified clean Amazon links', () => {
  for (const item of AMAZON_STYLE_CATALOG) {
    assert.ok(!item.link.includes('cunfashion.com/shop/'), 'Amazon item should not link to fake /shop: ' + item.id);
    assert.ok(!item.link.includes('tag='), 'Amazon item must NOT have affiliate tag: ' + item.id);
    assert.ok(item.price.startsWith('$'), 'Amazon item price must be in USD ($): ' + item.price);
  }
});

test('Puzzle Interactions: incrementLikes and incrementPlays update counter cleanly', async () => {
  const { incrementLikes, incrementPlays, getPuzzleBySlug } = await import('../src/lib/data/puzzles-data.ts');
  const slug = 'colorful-fireworks-jigsaw-puzzle';
  const before = getPuzzleBySlug(slug);
  assert.ok(before, 'Puzzle must exist');
  const initialLikes = before.likes;
  const initialPlays = before.plays;

  const newLikes = incrementLikes(slug);
  assert.equal(newLikes, initialLikes + 1);

  const newPlays = incrementPlays(slug);
  assert.equal(newPlays, initialPlays + 1);

  assert.equal(before.likes, initialLikes + 1);
  assert.equal(before.plays, initialPlays + 1);
});

test('UI Components: PwaRegister and PuzzleLikeButton exist', () => {
  const pwaComponent = path.resolve('src', 'components', 'pwa', 'PwaRegister.tsx');
  assert.ok(fs.existsSync(pwaComponent), 'PwaRegister.tsx must exist');

  const likeButton = path.resolve('src', 'components', 'puzzle', 'PuzzleLikeButton.tsx');
  assert.ok(fs.existsSync(likeButton), 'PuzzleLikeButton.tsx must exist');
});


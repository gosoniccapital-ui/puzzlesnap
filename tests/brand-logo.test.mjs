import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Brand Assets: All required CunFashion brand files exist on disk', () => {
  const assets = [
    'public/images/brand/cunfashion-mark.png',
    'public/images/brand/cunfashion-mark.webp',
    'public/images/brand/cunfashion-transparent.png',
    'public/images/brand/cunfashion-transparent.webp',
    'public/images/brand/logo-animated.webp',
    'public/images/puzzle-icon-192.png',
    'public/images/puzzle-icon-512.png',
    'public/favicon.ico',
  ];

  for (const relPath of assets) {
    const fullPath = path.resolve(relPath);
    assert.ok(fs.existsSync(fullPath), `Brand asset must exist: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `Brand asset must not be empty: ${relPath} (size: ${stat.size} bytes)`);
  }

  const mp4Path = path.resolve('public/videos/logo.mp4');
  if (fs.existsSync(mp4Path)) {
    const stat = fs.statSync(mp4Path);
    assert.ok(stat.size > 0, 'MP4 video must not be empty');
  }
});

test('Brand Logo Component: Logo.tsx integrates CunFashion brand mark and typography', () => {
  const logoPath = path.resolve('src', 'components', 'brand', 'Logo.tsx');
  assert.ok(fs.existsSync(logoPath), 'Logo.tsx must exist');
  const content = fs.readFileSync(logoPath, 'utf8');

  assert.ok(content.includes('CunFashion'), 'Must contain CunFashion brand name');
  assert.ok(content.includes('logo-animated.webp'), 'Must reference animated WebP logo asset');
  assert.ok(content.includes('cunfashion-transparent.webp'), 'Must support transparent WebP variant');
  assert.ok(content.includes('logo.mp4'), 'Must support MP4 video variant');
  assert.ok(content.includes('variant'), 'Must support variant prop');
});

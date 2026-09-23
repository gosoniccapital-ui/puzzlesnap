import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Sprint 11 Amazon Affiliate & Monetization Engine Verification', async (t) => {
  await t.test('1. Zero VND Invariant: No VND currency (₫) remains in active data files', () => {
    const puzzleDataPath = path.join(rootDir, 'src', 'lib', 'data', 'puzzles-data.ts');
    const styleAdvisorPath = path.join(rootDir, 'src', 'lib', 'data', 'style-advisor-data.ts');

    const puzzleContent = fs.readFileSync(puzzleDataPath, 'utf8');
    const styleAdvisorContent = fs.readFileSync(styleAdvisorPath, 'utf8');

    assert.equal(
      puzzleContent.includes('₫'),
      false,
      'puzzles-data.ts must contain 0 VND currency symbols (₫)'
    );
    assert.equal(
      styleAdvisorContent.includes('₫'),
      false,
      'style-advisor-data.ts must contain 0 VND currency symbols (₫)'
    );
  });

  await t.test('2. Dynamic Tag & Standard Variant Parameter Invariant', async () => {
    const { buildAmazonProductUrl, AMAZON_ASSOCIATE_TAG } = await import(
      '../src/lib/data/style-advisor-data.ts'
    );

    // Verify tag is string (disabled by default for policy compliance)
    assert.equal(typeof AMAZON_ASSOCIATE_TAG, 'string');

    // Generate link for B0CSWYSY6V with preserveVariants
    const generatedUrl = buildAmazonProductUrl('B0CSWYSY6V', 'puzzle_victory_couture', { preserveVariants: true });

    assert.ok(
      generatedUrl.startsWith('https://www.amazon.com/dp/B0CSWYSY6V'),
      'Generated URL should point to direct Amazon ASIN'
    );
    assert.ok(
      generatedUrl.includes('th=1&psc=1'),
      'Generated URL must include Amazon variant preservation parameters th=1&psc=1'
    );

    // Also verify backward compatibility: clean DP link when preserveVariants is not set
    const cleanUrl = buildAmazonProductUrl('B0CSWYSY6V', 'test_sub');
    assert.ok(!cleanUrl.includes('th=1&psc=1'), 'Clean URL should omit variant params');

    // Ensure tag parameter is NOT present for policy compliance
    const tagMatches = generatedUrl.match(/[?&]tag=/g);
    assert.equal(
      tagMatches?.length || 0,
      0,
      'URL must have ZERO tag parameter to comply with Amazon Affiliate Operating Agreement'
    );
  });

  await t.test('3. Puzzle Datasets Funnel: f1 to f5 have direct Amazon Lookbook links', async () => {
    const { PUZZLES_DATA } = await import('../src/lib/data/puzzles-data.ts');

    const couturePuzzles = PUZZLES_DATA.filter((p) =>
      ['f1', 'f2', 'f3', 'f4', 'f5'].includes(p.id)
    );

    assert.equal(couturePuzzles.length, 5, 'Must have 5 couture lookbook puzzles (f1 to f5)');

    for (const puzzle of couturePuzzles) {
      assert.ok(
        puzzle.productUrl && puzzle.productUrl.includes('amazon.com/dp/'),
        `Puzzle ${puzzle.id} (${puzzle.title}) must have a valid Amazon ASIN productUrl`
      );
      assert.ok(
        puzzle.ctaText === 'Shop Look on Amazon',
        `Puzzle ${puzzle.id} must have ctaText 'Shop Look on Amazon'`
      );
      assert.ok(
        puzzle.productPriceSale && puzzle.productPriceSale.startsWith('$'),
        `Puzzle ${puzzle.id} sale price must be in USD format (starting with $)`
      );
    }
  });

  await t.test('4. Style Advisor Featured Products: Valid ASIN and USD pricing', async () => {
    const { AMAZON_STYLE_CATALOG } = await import('../src/lib/data/style-advisor-data.ts');

    assert.ok(AMAZON_STYLE_CATALOG.length >= 6, 'Must have at least 6 Amazon US style items');

    for (const item of AMAZON_STYLE_CATALOG) {
      assert.ok(
        item.asin && item.asin.length >= 8,
        `Item ${item.id} (${item.name}) must have a valid Amazon ASIN`
      );
      assert.ok(
        item.link && !item.link.includes('tag='),
        `Item ${item.id} link must NOT contain affiliate tag=`
      );
      assert.ok(
        item.price.startsWith('$'),
        `Item ${item.id} price must be formatted in USD ($)`
      );
    }
  });
});

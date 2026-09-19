import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseRakutenXml } from '../src/lib/affiliate/rakuten-client.ts';
import { fetchFourthwallProducts } from '../src/lib/fourthwall/client.ts';
import { generateStylistAdvice } from '../src/lib/data/style-advisor-data.ts';

if (fs.existsSync('.env.local')) {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // ignore
  }
}

test('Rakuten Client: parseRakutenXml handles XML with items correctly', () => {
  const sampleXml = [
    '<result>',
    '  <TotalMatches>1</TotalMatches>',
    '  <item>',
    '    <mid>1234</mid>',
    '    <merchantname>Macys Fashion</merchantname>',
    '    <productname>Silk Floral Evening Dress</productname>',
    '    <price>129.99</price>',
    '    <linkurl>https://click.linksynergy.com/fs-bin/click?id=123</linkurl>',
    '    <imageurl>https://media.macys.com/sample.jpg</imageurl>',
  '  </item>',
  '</result>'
  ].join('\n');

  const items = parseRakutenXml(sampleXml);
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Silk Floral Evening Dress');
  assert.equal(items[0].price, '$129.99 USD');
  assert.equal(items[0].platform, 'Rakuten');
  assert.equal(items[0].tag, 'Macys Fashion');
  assert.ok(items[0].link.includes('click.linksynergy.com'));
});

test('Rakuten Client: parseRakutenXml handles empty TotalMatches 0 gracefully', () => {
  const emptyXml = '<result><TotalMatches>0</TotalMatches><TotalPages>0</TotalPages></result>';
  const items = parseRakutenXml(emptyXml);
  assert.deepEqual(items, []);
});

test('Fourthwall Client: fetchFourthwallProducts returns real products from cute.cunfashion.com', async () => {
  const items = await fetchFourthwallProducts(5);
  assert.ok(Array.isArray(items), 'Should return an array');
  if (process.env.FOURTHWALL_UNAME && process.env.FOURTHWALL_UPASS) {
    assert.ok(items.length > 0, 'Should fetch at least 1 real product from shop');
    const first = items[0];
    assert.equal(first.platform, 'CunCute Store');
    assert.ok(first.link.startsWith('https://cute.cunfashion.com/products/'));
    assert.ok(first.img.includes('fourthwall.com') || first.img.includes('fourthwall.dev'));
  }
});

test('Style Advisor Data: generateStylistAdvice supports FOURTHWALL and RAKUTEN markets', () => {
  const fwAdvice = generateStylistAdvice({
    occasion: 'casual',
    style: 'minimal',
    budget: 'mid',
    color: 'pink',
    hasCustomImage: false,
    market: 'FOURTHWALL'
  });
  assert.equal(fwAdvice.market, 'FOURTHWALL');
  assert.ok(fwAdvice.suggestedProducts.length >= 3);

  const rakutenAdvice = generateStylistAdvice({
    occasion: 'work',
    style: 'elegant',
    budget: 'high',
    color: 'black',
    hasCustomImage: false,
    market: 'RAKUTEN'
  });
  assert.equal(rakutenAdvice.market, 'RAKUTEN');
  assert.ok(rakutenAdvice.suggestedProducts.length >= 3);
});

test('Fourthwall Client: fetchFourthwallProducts filters by query correctly', async () => {
  if (process.env.FOURTHWALL_UNAME && process.env.FOURTHWALL_UPASS) {
    const cardigans = await fetchFourthwallProducts(5, 'cardigan');
    assert.ok(Array.isArray(cardigans));
    assert.ok(cardigans.length > 0);
    const hasCardigan = cardigans.some(p => p.name.toLowerCase().includes('cardigan'));
    assert.ok(hasCardigan, 'Should prioritize items matching query keyword');
  }
});

test('Style Advisor Data: generateStylistAdvice supports keyword-first input without image', () => {
  const keywordAdvice = generateStylistAdvice({
    occasion: 'casual',
    style: 'street',
    budget: 'mid',
    color: 'đen',
    hasCustomImage: false,
    market: 'US',
    keyword: 'Trench Coat'
  });

  assert.equal(keywordAdvice.keyword, 'Trench Coat');
  assert.ok(keywordAdvice.headline.includes('Trench Coat'));
  assert.ok(keywordAdvice.detectedItems?.[0]?.name === 'Trench Coat');
  assert.ok(keywordAdvice.detectedItems?.[0]?.amazonUrl?.includes('Trench%20Coat'));
  assert.ok(keywordAdvice.styleTips.some(t => t.includes('Trench Coat')));
});

test('Style Advisor Data: generateStylistAdvice supports ALL market aggregator and flexible filters', () => {
  const allAdvice = generateStylistAdvice({
    occasion: 'all',
    style: 'all',
    budget: 'all',
    color: '',
    hasCustomImage: false,
    market: 'ALL',
    keyword: 'Blazer'
  });

  assert.equal(allAdvice.market, 'ALL');
  assert.ok(allAdvice.suggestedProducts.length >= 4, 'Should aggregate products from multiple sources');
  assert.ok(allAdvice.headline.includes('Blazer'));
});

test('Style Advisor Data: getRandomSurpriseLook returns valid presets', async () => {
  const { getRandomSurpriseLook, SURPRISE_LOOKS } = await import('../src/lib/data/style-advisor-data.ts');
  assert.ok(Array.isArray(SURPRISE_LOOKS) && SURPRISE_LOOKS.length >= 5);
  const look = getRandomSurpriseLook();
  assert.ok(look.keyword && typeof look.keyword === 'string');
  assert.ok(look.occasion && typeof look.occasion === 'string');
  assert.ok(look.style && typeof look.style === 'string');
  assert.ok(look.description && typeof look.description === 'string');
});

test('Style Advisor Data: Honest Affiliate Search handles uncatalogued terms like webroot without fake cards', () => {
  const webrootAdvice = generateStylistAdvice({
    occasion: 'all',
    style: 'all',
    budget: 'all',
    color: '',
    hasCustomImage: false,
    market: 'ALL',
    keyword: 'webroot'
  });

  assert.equal(webrootAdvice.hasDirectMatch, false, 'webroot should be marked as hasDirectMatch: false');
  assert.ok(webrootAdvice.searchLinks && webrootAdvice.searchLinks.length >= 3, 'Should provide direct search links');

  const amazonSearchLink = webrootAdvice.searchLinks.find(l => l.platform === 'Amazon');
  assert.ok(amazonSearchLink, 'Must provide Amazon search link');
  assert.ok(amazonSearchLink.url.includes('tag=cuncute-20'), 'Amazon search link must include tag=cuncute-20');
  assert.ok(amazonSearchLink.url.includes('k=webroot'), 'Amazon search link must search for webroot');

  const shopeeSearchLink = webrootAdvice.searchLinks.find(l => l.platform === 'Shopee');
  assert.ok(shopeeSearchLink, 'Must provide Shopee search link');
  assert.ok(shopeeSearchLink.url.includes('webroot'), 'Shopee search link must search for webroot');

  // Verify all suggested products are real products from catalog (no "Check on Amazon" or "Best Deal" fake prices)
  assert.ok(webrootAdvice.suggestedProducts.length > 0, 'Should suggest real trending products');
  for (const product of webrootAdvice.suggestedProducts) {
    assert.notEqual(product.price, 'Check on Amazon', `Product ${product.id} must not have fake price`);
    assert.notEqual(product.originalPrice, 'Best Deal', `Product ${product.id} must not have fake originalPrice`);
    assert.ok(product.img && product.img.startsWith('http'), `Product ${product.id} must have valid image URL`);
  }
});
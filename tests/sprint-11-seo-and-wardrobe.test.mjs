import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Sprint 11 Invariants — Rich SEO Schema JSON-LD & Cloud Wardrobe Sync', async (t) => {
  const jsonLdPath = path.join(rootDir, 'src', 'lib', 'seo', 'json-ld.ts');
  const layoutPath = path.join(rootDir, 'src', 'app', 'layout.tsx');
  const puzzlePagePath = path.join(rootDir, 'src', 'app', 'puzzle', '[slug]', 'page.tsx');
  const styleAdvisorLayoutPath = path.join(rootDir, 'src', 'app', 'style-advisor', 'layout.tsx');
  const schemaSqlPath = path.join(rootDir, 'supabase', 'schema.sql');
  const wardrobeSyncRoutePath = path.join(rootDir, 'src', 'app', 'api', 'wardrobe', 'sync', 'route.ts');
  const useWardrobePath = path.join(rootDir, 'src', 'lib', 'hooks', 'useWardrobe.ts');
  const wardrobeDrawerPath = path.join(rootDir, 'src', 'components', 'wardrobe', 'WardrobeDrawer.tsx');

  await t.test('1. JSON-LD Utility Module: Exists and exports Schema.org generators', () => {
    assert.ok(fs.existsSync(jsonLdPath), 'src/lib/seo/json-ld.ts must exist');
    const content = fs.readFileSync(jsonLdPath, 'utf8');

    assert.ok(content.includes('generateWebSiteSchema'), 'Must export generateWebSiteSchema');
    assert.ok(content.includes('generateOrganizationSchema'), 'Must export generateOrganizationSchema');
    assert.ok(content.includes('generatePuzzleGameSchema'), 'Must export generatePuzzleGameSchema');
    assert.ok(content.includes('generateBreadcrumbSchema'), 'Must export generateBreadcrumbSchema');
    assert.ok(content.includes('generateStyleAdvisorSchema'), 'Must export generateStyleAdvisorSchema');
    assert.ok(content.includes('https://schema.org'), 'Must specify Schema.org context');
    assert.ok(content.includes('GameApplication') || content.includes('Game'), 'Must include Game classification');
  });

  await t.test('2. Global OpenGraph, Twitter & JSON-LD in RootLayout: Complete metadata configuration', () => {
    assert.ok(fs.existsSync(layoutPath), 'src/app/layout.tsx must exist');
    const content = fs.readFileSync(layoutPath, 'utf8');

    assert.ok(content.includes('openGraph:'), 'layout.tsx must define openGraph metadata');
    assert.ok(content.includes('twitter:'), 'layout.tsx must define twitter metadata');
    assert.ok(content.includes('summary_large_image'), 'Must configure twitter:card as summary_large_image');
    assert.ok(content.includes('canonical: "https://cunfashion.com"'), 'Must define canonical URL');
    assert.ok(content.includes('type="application/ld+json"'), 'Must render application/ld+json script tags');
    assert.ok(content.includes('generateWebSiteSchema'), 'Must embed WebSite schema');
    assert.ok(content.includes('generateOrganizationSchema'), 'Must embed Organization schema');
  });

  await t.test('3. Puzzle Dynamic OpenGraph & Game Schema: High-intent SEO per puzzle', () => {
    assert.ok(fs.existsSync(puzzlePagePath), 'puzzle/[slug]/page.tsx must exist');
    const content = fs.readFileSync(puzzlePagePath, 'utf8');

    assert.ok(content.includes('openGraph:'), 'Must configure dynamic openGraph in generateMetadata');
    assert.ok(content.includes('twitter:'), 'Must configure twitter card in generateMetadata');
    assert.ok(content.includes('generatePuzzleGameSchema'), 'Must invoke generatePuzzleGameSchema in page');
    assert.ok(content.includes('generateBreadcrumbSchema'), 'Must invoke generateBreadcrumbSchema in page');
    assert.ok(content.includes('type="application/ld+json"'), 'Must render JSON-LD script tags on puzzle page');
  });

  await t.test('4. Style Advisor CollectionPage Schema & Haute Couture Card: Proper categorization', () => {
    assert.ok(fs.existsSync(styleAdvisorLayoutPath), 'style-advisor/layout.tsx must exist');
    const content = fs.readFileSync(styleAdvisorLayoutPath, 'utf8');

    assert.ok(content.includes('openGraph:'), 'Must define OpenGraph for style advisor');
    assert.ok(content.includes('generateStyleAdvisorSchema'), 'Must import and generate Style Advisor schema');
    assert.ok(content.includes('type="application/ld+json"'), 'Must render JSON-LD script tag');
  });

  await t.test('5. Supabase Database Schema: user_wardrobes table and RLS policies', () => {
    assert.ok(fs.existsSync(schemaSqlPath), 'supabase/schema.sql must exist');
    const content = fs.readFileSync(schemaSqlPath, 'utf8');

    assert.ok(content.includes('public.user_wardrobes'), 'Must define user_wardrobes table');
    assert.ok(content.includes('player_id text primary key'), 'Must use player_id as primary key');
    assert.ok(content.includes('items jsonb'), 'Must store items in jsonb format');
    assert.ok(content.includes('idx_user_wardrobes_player'), 'Must create index on player_id');
    assert.ok(content.includes('Allow public read user_wardrobes'), 'Must have RLS read policy');
    assert.ok(content.includes('Allow public upsert user_wardrobes'), 'Must have RLS upsert policy');
  });

  await t.test('6. Cloud Wardrobe Sync Route (/api/wardrobe/sync): Validates payload, limits size and supports GET/POST', () => {
    assert.ok(fs.existsSync(wardrobeSyncRoutePath), 'src/app/api/wardrobe/sync/route.ts must exist');
    const content = fs.readFileSync(wardrobeSyncRoutePath, 'utf8');

    assert.ok(content.includes('export async function POST'), 'Must export POST handler');
    assert.ok(content.includes('export async function GET'), 'Must export GET handler');
    assert.ok(content.includes('isRateLimited'), 'Must enforce rate limiting on sync requests');
    assert.ok(content.includes('isValidPlayerId'), 'Must validate player identity string');
    assert.ok(content.includes('512 * 1024') || content.includes('Payload too large'), 'Must guard against large payloads');
    assert.ok(content.includes('user_wardrobes'), 'Must interact with user_wardrobes table');
    assert.ok(content.includes('memoryWardrobes'), 'Must have memory fallback for offline resilience');
  });

  await t.test('7. useWardrobe Local-First Sync Architecture: Zero latency + background cloud propagation', () => {
    assert.ok(fs.existsSync(useWardrobePath), 'useWardrobe.ts must exist');
    const content = fs.readFileSync(useWardrobePath, 'utf8');

    assert.ok(content.includes('getOrCreatePlayerId'), 'Must provide getOrCreatePlayerId');
    assert.ok(content.includes('triggerCloudSync'), 'Must trigger background cloud sync');
    assert.ok(content.includes('pullFromCloud'), 'Must expose pullFromCloud method');
    assert.ok(content.includes('isCloudSyncing'), 'Must expose isCloudSyncing state');
  });

  await t.test('8. WardrobeDrawer UI Cloud Status Indicator: Visual feedback for cloud sync state', () => {
    assert.ok(fs.existsSync(wardrobeDrawerPath), 'WardrobeDrawer.tsx must exist');
    const content = fs.readFileSync(wardrobeDrawerPath, 'utf8');

    assert.ok(content.includes('isCloudSyncing'), 'Drawer must consume isCloudSyncing');
    assert.ok(content.includes('Cloud'), 'Must render Cloud indicator badge');
  });

  await t.test('9. SEO JSON-LD Schema Validation: Verify required Schema.org fields are generated', () => {
    const content = fs.readFileSync(jsonLdPath, 'utf8');

    // Verify properties for WebSite
    assert.ok(content.includes('"@type": "WebSite"'));
    assert.ok(content.includes('potentialAction'));

    // Verify properties for Organization
    assert.ok(content.includes('"@type": "Organization"'));
    assert.ok(content.includes('sameAs'));

    // Verify properties for Game
    assert.ok(content.includes('GameApplication'));
    assert.ok(content.includes('AggregateRating'));
    assert.ok(content.includes('BreadcrumbList'));
    assert.ok(content.includes('CollectionPage'));
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Behavioral & Security Audit Invariants', async (t) => {
  const middlewarePath = path.join(rootDir, 'src', 'middleware.ts');
  const gameBoardPath = path.join(rootDir, 'src', 'components', 'puzzle', 'PuzzleGameBoard.tsx');
  const customPuzzlesPath = path.join(rootDir, 'src', 'app', 'api', 'custom-puzzles', 'route.ts');
  const styleAdvisorPath = path.join(rootDir, 'src', 'app', 'api', 'style-advisor', 'analyze', 'route.ts');
  const publicFaviconPath = path.join(rootDir, 'public', 'favicon.ico');
  const appFaviconPath = path.join(rootDir, 'src', 'app', 'favicon.ico');

  await t.test('1. Favicon Parity: Both public/favicon.ico and src/app/favicon.ico exist and match', () => {
    assert.ok(fs.existsSync(publicFaviconPath), 'public/favicon.ico must exist');
    assert.ok(fs.existsSync(appFaviconPath), 'src/app/favicon.ico must exist');
    assert.ok(fs.statSync(publicFaviconPath).size > 0, 'public/favicon.ico must not be empty');
    assert.ok(fs.statSync(appFaviconPath).size > 0, 'src/app/favicon.ico must not be empty');
  });

  await t.test('2. Global English Default Language Invariant: Enforces English default for all new visitors', () => {
    assert.ok(fs.existsSync(middlewarePath), 'middleware.ts must exist');
    const content = fs.readFileSync(middlewarePath, 'utf8');

    assert.ok(content.includes('cun_lang'), 'Middleware must inspect cun_lang cookie');
    assert.ok(content.includes('defaultLang = "en"'), 'Must strictly default to English');
    assert.ok(content.includes('response.cookies.set("cun_lang", defaultLang'), 'Must set cun_lang response cookie with defaultLang');
  });

  await t.test('3. Mobile Canvas Touch Hardening: Prevents browser pull-to-refresh and rubber-banding conflicts', () => {
    assert.ok(fs.existsSync(gameBoardPath), 'PuzzleGameBoard.tsx must exist');
    const content = fs.readFileSync(gameBoardPath, 'utf8');

    assert.ok(content.includes('overscrollBehavior: "none"'), 'Canvas container must enforce overscrollBehavior: none');
    assert.ok(content.includes('touchAction: "none"'), 'Canvas container and canvas element must enforce touchAction: none');
    assert.ok(content.includes('overscroll-none'), 'Must use overscroll-none utility class');
    assert.ok(content.includes('touch-none'), 'Must use touch-none utility class');
  });

  await t.test('4. Custom Puzzles SSRF Guard: Blocks RFC 1918 private subnets and local domain patterns', () => {
    assert.ok(fs.existsSync(customPuzzlesPath), 'src/app/api/custom-puzzles/route.ts must exist');
    const content = fs.readFileSync(customPuzzlesPath, 'utf8');

    assert.ok(content.includes('127.0.0.1'), 'Must block loopback IP');
    assert.ok(content.includes('localhost'), 'Must block localhost');
    assert.ok(content.includes('192\\.168') || content.includes('192.168'), 'Must block 192.168.0.0/16');
    assert.ok(content.includes('169\\.254') || content.includes('169.254'), 'Must block link-local 169.254.0.0/16');
    assert.ok(content.includes('.local'), 'Must block .local mDNS names');
  });

  await t.test('5. Style Advisor Vision SSRF Guard: Blocks private subnets before fetching remote images', () => {
    assert.ok(fs.existsSync(styleAdvisorPath), 'src/app/api/style-advisor/analyze/route.ts must exist');
    const content = fs.readFileSync(styleAdvisorPath, 'utf8');

    assert.ok(content.includes('isForbidden'), 'Must evaluate isForbidden host before remote image fetch');
    assert.ok(content.includes('192\\.168') || content.includes('192.168'), 'Must block 192.168.0.0/16');
    assert.ok(content.includes('.internal'), 'Must block internal domains');
  });
});

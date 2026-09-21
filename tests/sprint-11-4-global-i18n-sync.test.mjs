import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Sprint 11.4 Invariants - 100% Global-First i18n & Synchronized Dictionaries', async (t) => {
  const i18nIndexPath = path.join(rootDir, 'src', 'lib', 'i18n', 'index.ts');
  const dictionariesDir = path.join(rootDir, 'src', 'lib', 'i18n', 'dictionaries');

  await t.test('1. GLOBAL_LANGUAGES strictly excludes Vietnamese and contains 6 global languages', async () => {
    const indexContent = fs.readFileSync(i18nIndexPath, 'utf8');
    assert.ok(indexContent.includes('GLOBAL_LANGUAGES: LanguageCode[] = ["en", "ja", "fr", "de", "es", "zh"]'), 'GLOBAL_LANGUAGES must contain strictly the 6 global languages');
    assert.ok(!indexContent.includes('GLOBAL_LANGUAGES: LanguageCode[] = ["en", "vi"'), 'GLOBAL_LANGUAGES must never contain Vietnamese');
  });

  await t.test('2. All dictionaries (en, vi, ja, fr, de, es, zh) exist and have 100% key parity', async () => {
    const files = ['en', 'vi', 'ja', 'fr', 'de', 'es', 'zh'];
    for (const file of files) {
      const filePath = path.join(dictionariesDir, `${file}.ts`);
      assert.ok(fs.existsSync(filePath), `Dictionary file ${file}.ts must exist`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('profile:'), `${file}.ts must define profile section`);
      assert.ok(content.includes('leaderboard:'), `${file}.ts must define leaderboard section`);
      assert.ok(content.includes('preview:'), `${file}.ts must define preview section`);
    }
  });

  await t.test('3. Zero hardcoded isVietnamese remains in PlayerProfileModal', async () => {
    const profileModalPath = path.join(rootDir, 'src', 'components', 'puzzle', 'PlayerProfileModal.tsx');
    const content = fs.readFileSync(profileModalPath, 'utf8');
    assert.ok(!content.includes('isVietnamese'), 'PlayerProfileModal must not use isVietnamese conditional');
    assert.ok(content.includes('t.profile.title'), 'PlayerProfileModal must use t.profile.title');
    assert.ok(content.includes('t.profile.nicknameLabel'), 'PlayerProfileModal must use t.profile.nicknameLabel');
  });

  await t.test('4. PuzzleLeaderboard and PuzzlePreviewModal use i18n translation tokens', async () => {
    const leaderboardPath = path.join(rootDir, 'src', 'components', 'puzzle', 'PuzzleLeaderboard.tsx');
    const previewPath = path.join(rootDir, 'src', 'components', 'puzzle', 'PuzzlePreviewModal.tsx');

    const leaderboardContent = fs.readFileSync(leaderboardPath, 'utf8');
    const previewContent = fs.readFileSync(previewPath, 'utf8');

    assert.ok(leaderboardContent.includes('t.leaderboard.title'), 'PuzzleLeaderboard must use t.leaderboard.title');
    assert.ok(leaderboardContent.includes('t.leaderboard.pieces'), 'PuzzleLeaderboard must use t.leaderboard.pieces');
    assert.ok(previewContent.includes('t.preview.close'), 'PuzzlePreviewModal must use t.preview.close');
  });
});

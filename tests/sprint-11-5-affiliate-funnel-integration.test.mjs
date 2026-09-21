import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Sprint 11.5 Invariants - E-Commerce Affiliate & Style Advisor Funnel Bridge", async (t) => {
  const rootDir = process.cwd();

  await t.test("1. PuzzleVictoryModal embeds Lookbook preview, Wardrobe toggle and Style Advisor CTA", () => {
    const victoryPath = path.join(rootDir, "src", "components", "puzzle", "PuzzleVictoryModal.tsx");
    assert.ok(fs.existsSync(victoryPath), "PuzzleVictoryModal.tsx must exist");
    const content = fs.readFileSync(victoryPath, "utf8");

    assert.ok(content.includes("useWardrobe"), "PuzzleVictoryModal must integrate useWardrobe hook");
    assert.ok(content.includes("styleAdvisorMatch"), "PuzzleVictoryModal must reference t.victory.styleAdvisorMatch");
    assert.ok(content.includes("saveToWardrobe"), "PuzzleVictoryModal must reference t.victory.saveToWardrobe");
    assert.ok(content.includes("/style-advisor?keyword="), "PuzzleVictoryModal must bridge to style-advisor with keyword param");
  });

  await t.test("2. StyleAdvisorPage extracts and sets deep-linked keyword param", () => {
    const pagePath = path.join(rootDir, "src", "app", "style-advisor", "page.tsx");
    assert.ok(fs.existsSync(pagePath), "StyleAdvisorPage must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    assert.ok(content.includes('params.get("keyword")'), "StyleAdvisorPage must extract keyword query param");
    assert.ok(content.includes("setKeyword(keywordParam)"), "StyleAdvisorPage must apply keywordParam to state");
  });

  await t.test("3. All 7 dictionaries maintain 100% key parity for victory keys", () => {
    const dictDir = path.join(rootDir, "src", "lib", "i18n", "dictionaries");
    const languages = ["en", "vi", "ja", "fr", "de", "es", "zh"];

    for (const lang of languages) {
      const filePath = path.join(dictDir, `${lang}.ts`);
      assert.ok(fs.existsSync(filePath), `Dictionary ${lang}.ts must exist`);
      const content = fs.readFileSync(filePath, "utf8");

      assert.ok(content.includes("styleAdvisorMatch:"), `${lang}.ts must have styleAdvisorMatch`);
      assert.ok(content.includes("saveToWardrobe:"), `${lang}.ts must have saveToWardrobe`);
      assert.ok(content.includes("savedToWardrobe:"), `${lang}.ts must have savedToWardrobe`);
    }
  });
});

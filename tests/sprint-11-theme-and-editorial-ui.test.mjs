import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

test("Sprint 11.1 Invariant #1: Global Default Language is strictly English ('en')", () => {
  const middlewarePath = path.join(ROOT_DIR, "src", "middleware.ts");
  const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

  // Verify step 5 enforces defaultLang = "en"
  assert.match(
    middlewareContent,
    /const\s+defaultLang\s*=\s*"en"/,
    "Middleware must enforce 'en' as defaultLang for un-cookied visitors"
  );
});

test("Sprint 11.1 Invariant #2: Tailwind CSS is configured for class-based Dark Mode", () => {
  const tailwindPath = path.join(ROOT_DIR, "tailwind.config.ts");
  const tailwindContent = fs.readFileSync(tailwindPath, "utf-8");

  assert.match(
    tailwindContent,
    /darkMode:\s*"class"/,
    "Tailwind config must specify darkMode: 'class'"
  );

  assert.match(
    tailwindContent,
    /champagne/,
    "Tailwind colors must include champagne gold tokens"
  );

  assert.match(
    tailwindContent,
    /noir/,
    "Tailwind colors must include Velvet Noir tokens"
  );
});

test("Sprint 11.1 Invariant #3: globals.css dual-theme tokens (:root is Light default, .dark is Velvet Noir)", () => {
  const cssPath = path.join(ROOT_DIR, "src", "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  // :root must define Silk Alabaster light theme
  assert.match(
    cssContent,
    /--background:\s*#faf9f6/,
    "globals.css :root must set background to Silk Alabaster (#faf9f6)"
  );
  assert.match(
    cssContent,
    /--foreground:\s*#18181b/,
    "globals.css :root must set foreground to espresso charcoal (#18181b)"
  );

  // .dark must define Velvet Midnight Noir
  assert.match(
    cssContent,
    /\.dark\s*\{[\s\S]*?--background:\s*#0c0d12/,
    "globals.css .dark must set background to Midnight Obsidian (#0c0d12)"
  );
  assert.match(
    cssContent,
    /\.dark\s*\{[\s\S]*?--card:\s*#161822/,
    "globals.css .dark must set card background to Velvet Noir (#161822)"
  );
});

test("Sprint 11.1 Invariant #4: ThemeProvider and ThemeToggle components are implemented", () => {
  const providerPath = path.join(ROOT_DIR, "src", "components", "theme", "ThemeProvider.tsx");
  const togglePath = path.join(ROOT_DIR, "src", "components", "theme", "ThemeToggle.tsx");

  assert.ok(fs.existsSync(providerPath), "ThemeProvider.tsx must exist");
  assert.ok(fs.existsSync(togglePath), "ThemeToggle.tsx must exist");

  const providerContent = fs.readFileSync(providerPath, "utf-8");
  assert.match(
    providerContent,
    /cunfashion_theme/,
    "ThemeProvider must use 'cunfashion_theme' for localStorage persistence"
  );
});

test("Sprint 11.1 Invariant #5: Root layout includes zero-flicker script and ThemeProvider", () => {
  const layoutPath = path.join(ROOT_DIR, "src", "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  assert.match(
    layoutContent,
    /<ThemeProvider>/,
    "layout.tsx must wrap application in ThemeProvider"
  );

  assert.match(
    layoutContent,
    /cunfashion_theme/,
    "layout.tsx head must contain synchronous zero-flash anti-flicker script"
  );

  assert.match(
    layoutContent,
    /bg-\[var\(--background\)\]\s+text-\[var\(--foreground\)\]/,
    "layout.tsx body must use CSS variable theme classes"
  );
});

test("Sprint 11.1 Invariant #6: Style Advisor and Home pages are free of hardcoded dark backgrounds", () => {
  const advisorPath = path.join(ROOT_DIR, "src", "app", "style-advisor", "page.tsx");
  const homePath = path.join(ROOT_DIR, "src", "app", "page.tsx");

  const advisorContent = fs.readFileSync(advisorPath, "utf-8");
  const heroPath = path.join(ROOT_DIR, "src", "components", "home", "HomeHeroSection.tsx");
  const homeContent = fs.existsSync(heroPath)
    ? fs.readFileSync(heroPath, "utf-8")
    : fs.readFileSync(homePath, "utf-8");

  // Root container in StyleAdvisor must use bg-[var(--background)] instead of bg-[#09090b]
  assert.match(
    advisorContent,
    /bg-\[var\(--background\)\]/,
    "Style Advisor main container must use adaptive CSS variable background"
  );

  // Home Hero must use adaptive border and gradient
  assert.match(
    homeContent,
    /dark:from-\[#161822\]/,
    "Home page Hero must support dark mode gradient"
  );
});

test("Sprint 11.1 Invariant #7: Admin Login link is completely hidden from public UI", () => {
  const footerPath = path.join(ROOT_DIR, "src", "components", "layout", "ConditionalFooter.tsx");
  const footerContent = fs.readFileSync(footerPath, "utf-8");

  assert.doesNotMatch(
    footerContent,
    /\/admin\/login/,
    "ConditionalFooter must NOT contain any link or reference to /admin/login"
  );
});

test("Sprint 11.1 Invariant #8: PlayerProfileModal has backdrop click-to-dismiss, Escape listener, and dual-theme classes", () => {
  const modalPath = path.join(ROOT_DIR, "src", "components", "puzzle", "PlayerProfileModal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  assert.match(
    modalContent,
    /onClick=\{onClose\}/,
    "Backdrop overlay must trigger onClose when clicked"
  );
  assert.match(
    modalContent,
    /e\.stopPropagation\(\)/,
    "Modal card must stop propagation to prevent premature dismiss"
  );
  assert.match(
    modalContent,
    /e\.key\s*===\s*"Escape"/,
    "Modal must listen to Escape key to dismiss"
  );
  assert.match(
    modalContent,
    /dark:bg-\[#161822\]/,
    "Modal card must support dual-theme styling"
  );
});

test("Sprint 11.1 Invariant #9: Safe-Area & Overflow-X Invariants are strictly enforced in CSS", () => {
  const cssPath = path.join(ROOT_DIR, "src", "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.match(
    cssContent,
    /html\s*\{[\s\S]*?overflow-x:\s*hidden/,
    "html must have overflow-x: hidden to prevent horizontal scroll"
  );
  assert.match(
    cssContent,
    /body\s*\{[\s\S]*?overflow-x:\s*hidden/,
    "body must have overflow-x: hidden"
  );
  assert.match(
    cssContent,
    /env\(safe-area-inset-top/,
    "CSS must respect iOS/Android safe-area-inset-top"
  );
  assert.match(
    cssContent,
    /env\(safe-area-inset-bottom/,
    "CSS must respect iOS/Android safe-area-inset-bottom"
  );
});

test("Sprint 11.1 Invariant #10: Minimum Touch Target is enforced on mobile interactive elements", () => {
  const togglePath = path.join(ROOT_DIR, "src", "components", "theme", "ThemeToggle.tsx");
  const navbarPath = path.join(ROOT_DIR, "src", "components", "layout", "Navbar.tsx");

  const toggleContent = fs.readFileSync(togglePath, "utf-8");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");

  assert.match(
    toggleContent,
    /min-h-\[(?:44|48)px\]/,
    "ThemeToggle button must enforce minimum 44px or 48px height"
  );
  assert.match(
    navbarContent,
    /min-h-\[(?:44|48)px\]/,
    "Navbar action buttons must enforce minimum 44px or 48px height"
  );
});

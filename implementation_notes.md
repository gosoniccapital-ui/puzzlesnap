# Implementation Notes: Milestone 11.11 — Rakuten Automate Tracking Script & CSP Hardening

## 1. Unspecified & Implicit Decisions
- **Script Strategy Selection (`afterInteractive` vs `beforeInteractive`):** Placed the Rakuten Automate snippet inside `src/components/analytics/TrackingPixels.tsx` using Next.js `<Script strategy="afterInteractive">`. This guarantees that React 19 and Next.js finish hydrating and attaching event listeners before Rakuten hooks `window.addEventListener`, preventing race conditions or swallowing React synthetic events.
- **Idempotency & SPA Route Guard:** Added `if (typeof window !== "undefined" && !window._rakuten_automate)` to prevent duplicate script evaluation, duplicate XMLHttpRequest firing, or multiple event listener hooks during client-side Next.js route transitions.
- **Strict-Mode Loop Safety:** Hardened the timeout replay loop from `for(i=0;...)` to `for (var i = 0; ...)` to ensure that JavaScript strict mode does not throw `ReferenceError: i is not defined`.
- **Config-First Architecture:** Declared `NEXT_PUBLIC_RAKUTEN_AUTOMATE_KEY` in `.env.local` and `.env.example`, exported with fallback from `src/lib/analytics/pixel-config.ts` to adhere to Trụ cột 1 của `ai-copilot-alignment`.

## 2. Deviations from Specification
- Whitelisted `https://automate-frontend.linksynergy.com`, `https://automate.linksynergy.com`, and `https://*.linksynergy.com` across `script-src`, `connect-src`, `img-src`, and `frame-src` in `next.config.mjs` Content-Security-Policy. Without this proactive surgical change, the browser's CSP would have silently blocked Rakuten Automate in production.

## 3. Considered Trade-offs
- **Direct Raw Script in Head vs Next.js Script in TrackingPixels:** Directly dumping raw HTML `<script>` into `head` could cause Next.js SSR hydration mismatches and block First Contentful Paint (FCP). Integrating into `TrackingPixels.tsx` unifies all marketing telemetry (GA4, Meta Pixel, TikTok, X, Rakuten) in one managed, non-blocking client bundle.
- **Offline / Network Interruption Resilience:** The script retains the native 5000ms timeout with automatic fallback restoring `useDefaultAEL = true` and flushing any buffered listeners, ensuring seamless UX even if LinkSynergy servers are temporarily unreachable.

## 4. Maintenance Notes
- **Environment Variables:**
  - `NEXT_PUBLIC_RAKUTEN_AUTOMATE_KEY`: Widget key provided by Rakuten Advertising LinkSynergy (`nLOsPQ64OPucpR0KJEBScMn0DWZ6nbfc`).
  - `NEXT_PUBLIC_RAKUTEN_U1`: Optional SubID / Member ID parameter for customized tracking.
- **Automated Verification:**
  - Node.js native test runner verifies constant IDs, script rendering, and CSP domain whitelisting (`tests/tracking-pixels.test.mjs`).
  - Total test suite: 202/202 passing tests with 0 failures.

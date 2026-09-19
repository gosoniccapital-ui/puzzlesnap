# Project Context: PuzzleSnap Full Stack

## ?? Current Goal
Xy d?ng n?n t?ng Web Jigsaw Puzzle Full Stack tuong t? PuzzleSnap:
- [x] Milestone 1: N?n t?ng Next.js 15 Full Stack + Core Jigsaw Canvas Engine (Bzier cutter, DSU grouping, magnetic snap, sound fx, victory celebration, toolbar helpers).
- [x] Milestone 2: Schema Supabase PostgreSQL (`supabase/schema.sql`) + Client Helper (`src/lib/supabase/client.ts`) + Keep-alive skill integration.
- [x] Milestone 4: Giao diện chuẩn 1:1 PuzzleSnap, Admin Console (/admin), Live Leaderboard REST APIs, Cut Styles (Classic, Hearts, Star).
- [x] Milestone 5.2: Security Hardening (next.config.mjs HTTP Security Headers, CSP, XSS Sanitization, In-Memory Rate Limiting) + Orientation Change Coordinate Re-scale Invariant + Modular Refactoring (PuzzleToolbar, PuzzleLeaderboard, PuzzleVictoryModal, PuzzlePreviewModal, PuzzleZoomWidget) + Supabase Storage sync for Custom Puzzle Maker.
- [x] Milestone 5.3 (Domain & Branding): Trỏ Apex domain cunfashion.com sang Vercel Anycast IP (76.76.21.21) qua Cloudflare API, bảo toàn 100% các subdomain khác (LadiPage www, cute, quietude, support), đồng bộ toàn bộ nhận diện thương hiệu sang CunFashion.
- [x] Milestone 5.3 (Feature Completion): Chế độ xoay mảnh ghép (Piece Rotation Mode 90°/180°/270° qua Space, Right-Click, Double-Tap & UI Widgets), CunFashion Exclusive Lookbook Collection, tối ưu hóa 60fps Mobile Canvas Engine (rAF loop), và 8/8 automated invariant tests pass 100%.
- [x] Milestone 6.1: Admin Security & Passcode Auth Gate (HMAC-SHA256, Next.js Edge Middleware, timing-safe compare, sliding-window rate limit, modal edit puzzle, floating reference thumbnail, 21/21 tests pass 100%).
- [x] Milestone 6.2: Gamified E-Commerce Funnel (Haute Couture Victory Voucher Card, 1-click clipboard copy, Shop The Look CTA, admin e-commerce controls, XSS & URL sanitization, 25/25 automated tests pass 100%).

## 🏛️ Decisions & Architecture
- **Frontend Framework:** Next.js 15.1 (App Router, React 19) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tuân thủ `design-taste-frontend` (Anti-slop, tông màu Amber/Stone sang trọng, typography rõ ràng).
- **Core Puzzle Engine:**
  - `bezier-cutter.ts`: Tạo cạnh mấu lồi/lỗ khuyết Cubic Bézier mượt mà, đảm bảo bất biến đối xứng giữa 2 mảnh kề nhau.
  - `disjoint-set.ts`: Cấu trúc Union-Find quản lý cụm mảnh ghép đã snap, di chuyển đồng bộ toàn cụm.
  - `sound.ts`: Tổng hợp âm thanh click gỗ và chime progression tăng tiến bằng Web Audio API offline không phụ thuộc file ngoài.
  - `puzzle-canvas.ts`: Controller điều phối Canvas 2D 60fps, xử lý kéo thả PointerEvents, ma trận Camera chuyển đổi World Space <-> Screen Space, Pinch-to-zoom 2 ngón, pan, hút nam châm bất biến tỉ lệ, lọc viền (Edges) và bóng mờ (Ghost).
- **Database & Storage (Supabase):**
  - Schema PostgreSQL hoàn chỉnh trong `supabase/schema.sql`: các bảng `categories`, `puzzles`, `puzzle_scores` kèm RLS policies an toàn và Storage bucket `puzzle-images`.
  - Client helper: `src/lib/supabase/client.ts` tự động fallback graceful khi chưa nạp API key.
- **Code Intelligence:** Đã index toàn bộ codebase qua CodeGraph CLI v1.5.0.
- **Git Strategy:** Phát triển trên nhánh `feature/fullstack-puzzle-foundation`. Commit vertical slices an toàn với pre-check.
- **Cloud Infrastructure:**
  - Production Custom Domain: [https://cunfashion.com](https://cunfashion.com) (HTTP 200 OK, SSL Active)
  - Vercel Deployment Alias: [https://puzzle-tung.vercel.app](https://puzzle-tung.vercel.app) & [https://cunfashion-qprzyoi2h-newgmer-s-projects.vercel.app](https://cunfashion-qprzyoi2h-newgmer-s-projects.vercel.app)
  - GitHub Repository: https://github.com/gosoniccapital-ui/puzzlesnap
  - Cloudflare Zone: `cunfashion.com` (Apex A Record trỏ 76.76.21.21, bảo toàn 100% LadiPage www và các subdomain khác).

## 📦 Skills Installed (Project Scope: `.agents/skills/`)
1. `vibe-engineering-workflow`
2. `vibe-git-manager`
3. `behavior-model-debugger`
4. `design-taste-frontend`
5. `puzzle-engine-architect`
6. `codegraph`
7. `tdd`
8. `code-review`
9. `codebase-design`
10. `keeping-supabase-alive`
11. `stitch-fidelity-sync`

## 🔒 Rollback Anchor
- Base Init Commit: `4660c18`
- Milestone 1 (Foundation & Engine): `4c1b9ac`
- Milestone 2 & 3 (Supabase Schema & Custom Puzzle Maker): `17a369e`
- Milestone 4 (1:1 PuzzleSnap, Admin Dashboard, Live Leaderboard & Cut Styles): `605463a`
- Milestone 5.1 (Mobile Touch, Zoom Matrix, GitHub & Vercel Production): `03802b6`
- Milestone 6.1 (Admin Security & Passcode Auth Gate): `7548772`
- [x] Milestone 6.2 (Gamified E-Commerce Voucher & Shop The Look): `0e8793d`
- [x] Milestone 6.3 (Tab Clipping Alignment, Art Sharing & Multiplayer Co-Op Engine): Fix tab margin clipping, implement query/ID-based art sharing, add real-time multiplayer co-op room engine with 30/30 tests passing 100%. Commit: `8b6e999`.
- [x] Milestone 6.4 (Behavior Model Audit, Anti-Placeholder Clean-up & Security Hardening): Eliminated dead buttons (Embed, Navbar Sign in, Puzzle Share), enabled instant co-op auto-join via ?room= query param with toast indicator, fortified custom-puzzles API with IP rate limiting, 5MB payload cap, and memory FIFO eviction, reinforced mutation APIs with defense-in-depth token verification. 33/33 tests passing 100%, production build verified. Commit: `9c31aa8`.
- [x] Milestone 6.5 (Player Identity Modal, Discreet Admin Access & Live Production Rollout): Replaced public Admin login in top navbar with Zero-Friction Player Profile Pill (avatar color dot + nickname), added interactive PlayerProfileModal for instant identity change & co-op sync, relocated Admin access link discreetly to the layout footer, added Style Advisor AI fashion suite with Manifest V3 Chrome extension, normalized Supabase live query endpoints. 37/37 automated tests passing 100%, live deployment verified on https://cunfashion.com/. Commit: `76fb6d6`.
- [x] Milestone 6.6 (AI Visual Fashion Stylist & Amazon Associates US Integration): Full production integration of Amazon Associates StoreID `cuncute-20`, protected Next.js API `/api/style-advisor/analyze` with Google Gemini Vision integration and offline fallback parser, `/api/style-advisor/track-click` affiliate conversion logger, laser radar scan animation, detected piece breakdown with deep-linked Amazon search queries, curated US catalog matching user outfit lookbook (trench coats, suede boots, lounge sets), persistent localStorage history drawer, and 42/42 automated tests passing 100%. Commit: `e5f790c`.
- [x] Milestone 6.7 (Behavioral Model Audit, Security Hardening & Vercel Live Deployment): Conducted deep behavioral audit via `/behavior-model-debugger`, patched in-memory rate limiter with auto-pruning to eliminate memory leaks, enforced 4MB payload cap, expanded CSP to allow Amazon/external fashion CDNs, added client-side canvas image compression (< 200KB), verified 42/42 tests passing, and deployed to live production on `https://cunfashion.com/` (Deployment ID: `dpl_HoHcDZcnZiFbsmzXNVWW9xFyQkkd`). Documented in `docs/BEHAVIOR_AND_SECURITY_AUDIT_REPORT.md`. Rollback Anchor: `45e4eb5`.
- [x] Milestone 6.8 (Real Affiliate Search Links & Full PWA Service Worker Rollout): Replaced all placeholder `/shop/...` links with real Shopee (`shopee.vn/search`), TikTok Shop (`tiktok.com/search`), Lazada (`lazada.vn/catalog`), and Amazon US (`cuncute-20`) destination search URLs across Style Advisor dataset, standalone HTML demo, and Chrome Extension. Activated full PWA Service Worker (`public/sw.js`) with Cache-First/Stale-While-Revalidate static asset caching and offline HTML fallback, registered via client component in `layout.tsx`, added iOS `appleWebApp` metadata & icons, expanded CSP to allow `worker-src 'self' blob:`, and verified 47/47 automated tests passing 100%. Deployed to live production on `https://cunfashion.com/` (Deployment ID: `dpl_7gn7NUjyjDazYzLewncYQYyERstM`). Rollback Anchor: `ee9b213`.
- [x] Milestone 6.9 (Supabase Admin Cloud Persistence, Real Likes & Plays Counter & Interaction Engine): Connected Admin `POST`, `PUT`, `DELETE` in `/api/puzzles` and all-scores query (`?all=true`) directly to Supabase cloud tables with memory fallback. Implemented real interaction endpoint `/api/puzzles/interact` with IP sliding-window rate limiting, optimistic Heart Like button (`PuzzleLikeButton.tsx`) with localStorage deduplication on puzzle detail pages, session-mount play count tracker in `PuzzleGameBoard.tsx`, distributed retry resilience in API tests, and 49/49 automated tests passing 100% (19/19 Next.js production routes built). Rollback Anchor: `5a2ae50`.
- [x] Milestone 6.10 (Co-Op Room Query Preservation & Realtime Host Metadata Sync): Patched `PuzzleGameBoard.tsx` to preserve 100% query parameters (`?id=...`, `?img=...`, `?diff=...`) in Co-Op room share link. Implemented P2P Host Sync via `RealtimeRoomEngine` so guests can join directly via `?room=ROOM-xxxx` and auto-sync puzzle image/metadata from the host even when serverless cache expires. Added auto-URL enrichment, friendly connecting screen with timeout, and Supabase Storage persistence in `/api/custom-puzzles`. Verified 53/53 automated tests passing, 19/19 routes built. Rollback Anchor: `079d982`.
- [x] Milestone 7.0 (Haute Couture Brand Mark, Animated WebP Logo & Multi-format Architecture): Replaced legacy puzzle-face SVG with CunFashion signature hooded angel brand mark. Processed desktop `logo.mp4` and hi-res artwork into optimized 24-bit TrueColor Animated WebP (`logo-animated.webp`), transparent cutout WebP/PNG (`cunfashion-transparent.webp`), static master WebP, and raw MP4. Built flexible `Logo.tsx` supporting 4 variants (`animated` [default Haute Couture dark emblem], `transparent`, `static`, `video`) with neon hover micro-glow and zero layout shift. Synchronized 192px/512px PWA icons and `favicon.ico`. 55/55 automated tests passing 100%, production build verified. Rollback Anchor: `c9eb599`.
- [x] Milestone 7.1 (Multiplayer Co-Op Game-Loop, Victory Broadcast, Board State Sync & Unified Sharing): Solved isolated play UX in Co-Op rooms with Realtime Victory Broadcast (`room_victory`), celebratory Remote Victory Modal, Host-to-Guest Initial Board State Sync (`board_sync` / `request_board_sync`), automatic `&room=` enrichment on the top "Share Puzzle" button, canvas engine lifecycle stabilization via `secondsRef` / `moveCountRef`, and clean room exit without re-connection loops. Verified 55/55 automated tests passing 100%, Next.js 15 production build passing cleanly. Rollback Anchor: `dac5b47`.
- [x] Milestone 7.2 (Engine Stability, Co-Op URL Sync & Rate Limiter Pruning): Stabilized canvas engine lifecycle by moving pure `formatTime` to module scope and decoupling `handleVictory` callback from timer ticks, synchronized browser address bar with `?room=ROOM-xxxx` on in-game Co-Op join/create, and hardened in-memory rate limiters in `/api/custom-puzzles` and `/api/puzzles/interact` with auto-pruning. Verified 57/57 automated tests passing 100%, Next.js 15 production build passing cleanly. Pushed to remote GitHub `gosoniccapital-ui/puzzlesnap` and deployed live to `https://cunfashion.com/` (Deployment ID: `dpl_JiKwx98ymMAbQxnuRJW5PPsRsgWq`, HTTP 200 OK). Rollback Anchor: `d043d37`.
- [x] Milestone 7.3 (Custom Puzzle Storage CDN Persistence & Permanent Room Link Resolution): Resolved missing room image bug (`?id=pz-xxxx&room=ROOM-xxxx`). Created public Supabase Storage bucket `puzzle-images`, added `SUPABASE_SERVICE_ROLE_KEY` to Vercel production environment, configured `supabaseAdmin` to bypass RLS for custom puzzle persistence. Converted custom puzzle images to public Supabase CDN URLs (`custom-puzzles/pz-xxxx.ext`), mapped custom puzzle IDs to Supabase `puzzles.description` with `source: 'user'`, and aligned query lookup in `/api/custom-puzzles`. Verified 57/57 tests passing 100%, production build in 21s, live probe POST/GET 200 OK with CDN URL. Pushed to GitHub and deployed live to `https://cunfashion.com/` (Deployment ID: `dpl_ACSfnpeCnLuGQv7KqMeTBjWaJyex`). Rollback Anchor: `61aa021`.
- [x] Milestone 7.4 (Dual-Layer Realtime Room Engine, Stale Channel Unbind & Remote Victory Sync): Resolved desynchronization and silent victory bug in multiplayer Co-Op. Fixed Supabase client channel caching collision (`cannot add "presence" callbacks after subscribe()`) by explicitly removing pre-existing topic channels with `supabase.removeChannel()` on connect and disconnect. Disconnected temporary metadata-sync engine in `make-puzzle/page.tsx` once resolved. Decoupled `handleConnectCoopRoom` via stable ref to eliminate infinite reconnection loops. Implemented dual-layer broadcast redundancy (Supabase WebSocket + BroadcastChannel) with `winnerId !== localPlayerId` filtering. Sanitized share URLs using standard `URLSearchParams.toString()` to eliminate invalid `&&` syntax. Added automated tests verifying channel cleanup and victory payloads (59/59 passing 100%). Pushed to GitHub and deployed live to `https://cunfashion.com/` (Deployment ID: `dpl_3uBEowoV9PF9BqHbzPfTRZLzmaDn`). Rollback Anchor: `33b00f5`.
- [x] Milestone 7.5 (E-Commerce CTA "Shop Cute Outfits" & Fourthwall Funnel Optimization): Optimized e-commerce conversion touchpoint on `PuzzleVictoryModal.tsx`. Updated destination to Fourthwall shop `https://cute.cunfashion.com` with auto-applied `coupon` param and UTM analytics tracking. Replaced CTA label with high-converting micro-CTA "Shop Cute Outfits". Added friction-free silent voucher auto-copy to clipboard on CTA button click. Synchronized `ctaText` across `PuzzleGameBoard`, `puzzles-data.ts`, Admin console, and automated tests (59/59 tests passing 100%). Documented strategy in `docs/SPRINT_7_5_ECOMMERCE_CTA_FOURTHWALL_STRATEGY.md`. Rollback Anchor: `705cf87`.





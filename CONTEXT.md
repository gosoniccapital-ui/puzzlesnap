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

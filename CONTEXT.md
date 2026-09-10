# Project Context: PuzzleSnap Full Stack

## ?? Current Goal
Xy d?ng n?n t?ng Web Jigsaw Puzzle Full Stack tuong t? PuzzleSnap:
- [x] Milestone 1: N?n t?ng Next.js 15 Full Stack + Core Jigsaw Canvas Engine (Bzier cutter, DSU grouping, magnetic snap, sound fx, victory celebration, toolbar helpers).
- [x] Milestone 2: Schema Supabase PostgreSQL (`supabase/schema.sql`) + Client Helper (`src/lib/supabase/client.ts`) + Keep-alive skill integration.
- [x] Milestone 4: Giao diện chuẩn 1:1 PuzzleSnap, Admin Console (/admin), Live Leaderboard REST APIs, Cut Styles (Classic, Hearts, Star).
- [x] Milestone 5.1: Mobile Canvas Touch Engine (Pinch-to-zoom 0.5x-3.0x, Pan 2 ngón & 1 ngón, Camera Matrix transforms, Floating Zoom Widget) + Cloud Deploy (GitHub repo gosoniccapital-ui/puzzlesnap & Vercel Production https://puzzle-tung.vercel.app).

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
  - GitHub Repository: https://github.com/gosoniccapital-ui/puzzlesnap
  - Vercel Production: https://puzzle-tung.vercel.app

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

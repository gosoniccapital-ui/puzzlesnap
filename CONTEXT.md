# Project Context: PuzzleSnap Full Stack

## ?? Current Goal
X�y d?ng n?n t?ng Web Jigsaw Puzzle Full Stack tuong t? PuzzleSnap:
- [x] Milestone 1: N?n t?ng Next.js 15 Full Stack + Core Jigsaw Canvas Engine (B�zier cutter, DSU grouping, magnetic snap, sound fx, victory celebration, toolbar helpers).
- [x] Milestone 2: Schema Supabase PostgreSQL (`supabase/schema.sql`) + Client Helper (`src/lib/supabase/client.ts`) + Keep-alive skill integration.
- [x] Milestone 3: Custom Puzzle Maker (`/make-puzzle`), Danh m?c (`/categories`), Trang chi ti?t c�u d? d?ng (`/puzzle/[slug]`) v?i breadcrumbs v� share buttons.

## ??? Decisions & Architecture
- **Frontend Framework:** Next.js 15.1 (App Router, React 19) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tu�n th? `design-taste-frontend` (Anti-slop, t�ng m�u Amber/Stone sang tr?ng, typography r� r�ng).
- **Core Puzzle Engine:**
  - `bezier-cutter.ts`: T?o c?nh m?u l?i/l? khuy?t Cubic B�zier mu?t m�, d?m b?o b?t bi?n d?i x?ng gi?a 2 m?nh k? nhau.
  - `disjoint-set.ts`: C?u tr�c Union-Find qu?n l� c?m m?nh gh�p d� snap, di chuy?n d?ng b? to�n c?m.
  - `sound.ts`: T?ng h?p �m thanh click g? v� chime progression tang ti?n b?ng Web Audio API offline kh�ng ph? thu?c file ngo�i.
  - `puzzle-canvas.ts`: Controller di?u ph?i Canvas 2D 60fps, x? l� k�o th? PointerEvents, h�t nam ch�m, l?c vi?n (Edges) v� b�ng m? (Ghost).
- **Database & Storage (Supabase):**
  - Schema PostgreSQL ho�n ch?nh trong `supabase/schema.sql`: c�c b?ng `categories`, `puzzles`, `puzzle_scores` k�m RLS policies an to�n v� Storage bucket `puzzle-images`.
  - Client helper: `src/lib/supabase/client.ts` t? d?ng fallback graceful khi chua n?p API key.
- **Code Intelligence:** �� index to�n b? codebase qua CodeGraph CLI v1.5.0.
- **Git Strategy:** Ph�t tri?n tr�n nh�nh `feature/fullstack-puzzle-foundation`. Commit vertical slices an to�n v?i pre-check.

## ?? Skills Installed (Project Scope: `.agents/skills/`)
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

## ?? Rollback Anchor
- Base Init Commit: `4660c18`
- Milestone 1 (Foundation & Engine): `4c1b9ac`
- Milestone 2 & 3 (Supabase Schema & Custom Puzzle Maker): 17a369e
- Milestone 4 (1:1 PuzzleSnap, Admin Dashboard, Live Leaderboard & Cut Styles): 605463a

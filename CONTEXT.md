# Project Context: PuzzleSnap Full Stack

## ?? Current Goal
Xây d?ng n?n t?ng Web Jigsaw Puzzle Full Stack tuong t? PuzzleSnap (tru?c dây là "I''m a Puzzle"):
1. Kho thu vi?n puzzle theo danh m?c (Daily Puzzle, Animals, Art, Nature, Holidays, v.v.).
2. Engine ghép hình HTML5 Canvas/WebGL tuong tác th?i gian th?c (60fps, drag & drop, magnetic snap, ghép c?m m?nh, tr? th? biên, xem tru?c, tính gi?, b?ng x?p h?ng).
3. Công c? Custom Puzzle Maker: Upload ?nh b?t k? (JPG, PNG, GIF) -> C?t m?nh th?i gian th?c -> Tùy ch?n s? m?nh (9 - 50+ pcs) và phong cách c?t (Classic, Hearts, Star, Honeycomb) -> Chia s? link choi ngay.
4. H? th?ng ngu?i dùng, tài kho?n luu puzzle, leaderboard, Supabase database & storage.

## ??? Decisions & Architecture
- **Frontend Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tuân th? `design-taste-frontend` (Anti-slop, không gradient tím r? ti?n, layout rõ ràng, typography cao c?p).
- **Core Puzzle Engine:**
  - Thu?t toán t?o c?nh m?nh ghép b?ng du?ng cong Cubic Bézier d?i x?ng (Tab l?i / Blank lõm).
  - Qu?n lý c?m m?nh ghép dã n?i b?ng c?u trúc d? li?u Disjoint-Set Union (DSU).
  - T?i uu hi?u nang b?ng OffscreenCanvas / ImageBitmap pre-rendering và Spatial Grid Partitioning ($O(1)$ collision check).
- **Backend & Database:**
  - Supabase PostgreSQL (Puzzles, Categories, Users, Highscores, Likes).
  - Supabase Storage Bucket (`puzzle-images`, `custom-uploads`).
  - Keep-alive bot qua `keeping-supabase-alive` d? gi? Supabase Free Tier luôn online.
- **Git & Security Protocol:** Tuân th? tuy?t d?i `vibe-git-manager`, ignore toàn b? `.env*`, quét secret tru?c commit.

## ?? Skills & Ecosystem Installed
- `vibe-engineering-workflow`: Smart router d?nh tuy?n công vi?c và pre-check gates.
- `vibe-git-manager`: Qu?n lý Git an toàn, zero leak.
- `behavior-model-debugger`: Audit hành vi ngu?i dùng, b?t l?i xung d?t t?a d?/tr?ng thái.
- `design-taste-frontend`: Thi?t k? giao di?n anti-slop, chu?n visual qu?c t?.
- `puzzle-engine-architect`: Ki?n trúc toán h?c và rendering Canvas cho Jigsaw Puzzle.
- `keeping-supabase-alive`: Gi? d? án Supabase luôn ho?t d?ng.

## ?? Rollback Anchor
- Base Init Commit: 4660c18

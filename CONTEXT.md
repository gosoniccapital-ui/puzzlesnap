# Project Context: PuzzleSnap Full Stack

## ?? Current Goal
Xây d?ng n?n t?ng Web Jigsaw Puzzle Full Stack tuong t? PuzzleSnap:
- [x] Milestone 1: N?n t?ng Next.js 15 Full Stack + Core Jigsaw Canvas Engine (Bézier cutter, DSU grouping, magnetic snap, sound fx, victory celebration, toolbar helpers).
- [ ] Milestone 2: Tích h?p Supabase (Database b?ng `puzzles`, `categories`, `highscores` + Storage ?nh).
- [ ] Milestone 3: Custom Puzzle Maker hoàn thi?n (Upload, custom crop/aspect ratio, sinh shareable link).

## ??? Decisions & Architecture
- **Frontend Framework:** Next.js 15.1 (App Router, React 19) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tuân th? `design-taste-frontend` (Anti-slop, tông màu Amber/Stone sang tr?ng, typography rõ ràng).
- **Core Puzzle Engine:**
  - `bezier-cutter.ts`: T?o c?nh m?u l?i/l? khuy?t Cubic Bézier mu?t mà, d?m b?o b?t bi?n d?i x?ng gi?a 2 m?nh k? nhau.
  - `disjoint-set.ts`: C?u trúc Union-Find qu?n lý c?m m?nh ghép dã snap, di chuy?n d?ng b? toàn c?m.
  - `sound.ts`: T?ng h?p âm thanh click g? và chime progression tang ti?n b?ng Web Audio API offline không ph? thu?c file ngoài.
  - `puzzle-canvas.ts`: Controller di?u ph?i Canvas 2D 60fps, x? lý kéo th? PointerEvents, hít nam châm, l?c vi?n (Edges) và bóng m? (Ghost).
- **Code Intelligence:** Ðã index toàn b? codebase qua CodeGraph CLI v1.5.0 (`109 nodes, 222 edges`).
- **Git Strategy:** Phát tri?n trên nhánh `feature/fullstack-puzzle-foundation`. Commit vertical slices an toàn v?i pre-check.

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
- Milestone 1 (Foundation & Engine): 4c1b9ac

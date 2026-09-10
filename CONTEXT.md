# Project Context: PuzzleSnap Full Stack

## 🎯 Current Goal
Xây dựng nền tảng Web Jigsaw Puzzle Full Stack tương tự PuzzleSnap:
- [x] Milestone 1: Nền tảng Next.js 15 Full Stack + Core Jigsaw Canvas Engine (Bézier cutter, DSU grouping, magnetic snap, sound fx, victory celebration, toolbar helpers).
- [ ] Milestone 2: Tích hợp Supabase (Database bảng `puzzles`, `categories`, `highscores` + Storage ảnh).
- [ ] Milestone 3: Custom Puzzle Maker hoàn thiện (Upload, custom crop/aspect ratio, sinh shareable link).

## 🏛️ Decisions & Architecture
- **Frontend Framework:** Next.js 15.1 (App Router, React 19) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tuân thủ `design-taste-frontend` (Anti-slop, tông màu Amber/Stone sang trọng, typography rõ ràng).
- **Core Puzzle Engine:**
  - `bezier-cutter.ts`: Tạo cạnh mấu lồi/lỗ khuyết Cubic Bézier mượt mà, đảm bảo bất biến đối xứng giữa 2 mảnh kề nhau.
  - `disjoint-set.ts`: Cấu trúc Union-Find quản lý cụm mảnh ghép đã snap, di chuyển đồng bộ toàn cụm.
  - `sound.ts`: Tổng hợp âm thanh click gỗ và chime progression tăng tiến bằng Web Audio API offline không phụ thuộc file ngoài.
  - `puzzle-canvas.ts`: Controller điều phối Canvas 2D 60fps, xử lý kéo thả PointerEvents, hít nam châm, lọc viền (Edges) và bóng mờ (Ghost).
- **Code Intelligence:** Đã index toàn bộ codebase qua CodeGraph CLI v1.5.0 (`109 nodes, 222 edges`).
- **Git Strategy:** Phát triển trên nhánh `feature/fullstack-puzzle-foundation`. Commit vertical slices an toàn với pre-check.

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

## 🔄 Rollback Anchor
- Base Init Commit: `4660c18`
- Milestone 1 (Foundation & Engine): (Pending commit)

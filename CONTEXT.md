# Project Context: PuzzleSnap Full Stack

## 🎯 Current Goal
Xây dựng nền tảng Web Jigsaw Puzzle Full Stack tương tự PuzzleSnap (trước đây là "I''m a Puzzle"):
1. Kho thư viện puzzle theo danh mục (Daily Puzzle, Animals, Art, Nature, Holidays, v.v.).
2. Engine ghép hình HTML5 Canvas/WebGL tương tác thời gian thực (60fps, drag & drop, magnetic snap, ghép cụm mảnh, trợ thủ biên, xem trước, tính giờ, bảng xếp hạng).
3. Công cụ Custom Puzzle Maker: Upload ảnh bất kỳ (JPG, PNG, GIF) -> Cắt mảnh thời gian thực -> Tùy chọn số mảnh (9 - 50+ pcs) và phong cách cắt (Classic, Hearts, Star, Honeycomb) -> Chia sẻ link chơi ngay.
4. Hệ thống người dùng, tài khoản lưu puzzle, leaderboard, Supabase database & storage.

## 🏛️ Decisions & Architecture
- **Frontend Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **UI & UX Standard:** Tuân thủ `design-taste-frontend` (Anti-slop, không gradient tím rẻ tiền, layout rõ ràng, typography cao cấp).
- **Core Puzzle Engine:**
  - Thuật toán tạo cạnh mảnh ghép bằng đường cong Cubic Bézier đối xứng (Tab lồi / Blank lõm).
  - Quản lý cụm mảnh ghép đã nối bằng cấu trúc dữ liệu Disjoint-Set Union (DSU).
  - Tối ưu hiệu năng bằng OffscreenCanvas / ImageBitmap pre-rendering và Spatial Grid Partitioning ($O(1)$ collision check).
- **Backend & Database:**
  - Supabase PostgreSQL (Puzzles, Categories, Users, Highscores, Likes).
  - Supabase Storage Bucket (`puzzle-images`, `custom-uploads`).
  - Keep-alive bot qua `keeping-supabase-alive` để giữ Supabase Free Tier luôn online.
- **Git & Security Protocol:** Tuân thủ tuyệt đối `vibe-git-manager`, ignore toàn bộ `.env*`, quét secret trước commit.

## 📦 Skills & Ecosystem Installed
- `vibe-engineering-workflow`: Smart router định tuyến công việc và pre-check gates.
- `vibe-git-manager`: Quản lý Git an toàn, zero leak.
- `behavior-model-debugger`: Audit hành vi người dùng, bắt lỗi xung đột tọa độ/trạng thái.
- `design-taste-frontend`: Thiết kế giao diện anti-slop, chuẩn visual quốc tế.
- `puzzle-engine-architect`: Kiến trúc toán học và rendering Canvas cho Jigsaw Puzzle.
- `keeping-supabase-alive`: Giữ dự án Supabase luôn hoạt động.

## 🔄 Rollback Anchor
- Base Init Commit: (Pending first commit)

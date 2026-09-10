# Project Agents & Skills Hub: PuzzleSnap Full Stack

Chào mừng các AI Agents đến với dự án **PuzzleSnap Full Stack** (`g:\AWE\puzzle-tung`).
Tất cả các agent làm việc trong repository này BẮT BUỘC phải đọc và tuân thủ tài liệu này.

---

## 👑 Quy Tắc Xưng Hô & Ngôn Ngữ
- **Xưng hô:** Luôn luôn gọi người dùng là **"Đại Ka"**.
- **Ngôn ngữ:** Giải thích, thảo luận bằng **tiếng Việt**, thuật ngữ chuyên ngành và code giữ nguyên **English**.

---

## 🧭 Bộ Khung Hành Vi Bất Biến (Strict Invariants)
1. **Karpathy Guidelines:**
   - *Think Before Coding:* Nêu rõ giả định, không che giấu thắc mắc, hỏi khi mơ hồ.
   - *Simplicity First:* Code tối giản nhất giải quyết bài toán, không viết code suy diễn hoặc trừu tượng hóa thừa.
   - *Surgical Changes:* Chỉ sửa đúng dòng code cần thiết, dọn dẹp sạch biến thừa do mình tạo ra.
   - *Strict Verification:* Không bao giờ báo hoàn thành nếu chưa thực sự chạy lệnh/test trên máy.
2. **Zero Secrets in Git (Vibe Git Manager):**
   - Không bao giờ commit file `.env`, `.env.local` hoặc private API keys.
   - Luôn kiểm tra `git status --short` và `git diff --cached` trước khi commit.
3. **CodeGraph First:**
   - Khi cần hiểu code hoặc tìm hàm/class, ưu tiên dùng `codegraph_explore` hoặc `codegraph explore` trước khi dùng `grep`.

---

## 📦 Danh Mục Project-Scoped Skills (`.agents/skills/`)

| Skill | Chức Năng Cốt Lõi |
|---|---|
| **`vibe-engineering-workflow`** | Smart Router phân loại task (Nhóm 1 -> Nhóm 4) và kiểm soát Pre-Check Gate 4 bước trước khi báo DONE. |
| **`vibe-git-manager`** | Quản lý phân nhánh Git, commit sạch, bảo vệ secret và lưu mốc Rollback Anchor an toàn. |
| **`behavior-model-debugger`** | Audit trải nghiệm người dùng, truy vết va chạm tọa độ Canvas, ngắt quãng phím và trạng thái stateful. |
| **`design-taste-frontend`** | Tiêu chuẩn thiết kế giao diện Anti-slop, chống giao diện AI rập khuôn, tối ưu typography và spacing. |
| **`puzzle-engine-architect`** | Kiến trúc toán học đường cong Bézier (tabs/blanks), Path2D clipping, Disjoint-Set Union và magnetic snap. |
| **`codegraph`** | Hướng dẫn điều hướng biểu đồ mã nguồn, phân tích tác động (`impact`), truy vết `callers`/`callees`. |
| **`tdd`** | Quy trình Test-Driven Development (Red -> Green -> Refactor) cho các hàm toán học và engine logic. |
| **`code-review`** | Tiêu chuẩn rà soát chất lượng code và mức độ bám sát spec ban đầu. |
| **`codebase-design`** | Từ vựng và nguyên lý thiết kế deep modules, tách lớp kiến trúc và đặt seams kiểm thử. |
| **`keeping-supabase-alive`** | Tự động giữ dự án Supabase Free Tier online 24/7 qua cron-job.org API. |
| **`stitch-fidelity-sync`** | Đồng bộ toàn vẹn tài nguyên hình ảnh và design tokens từ Google Stitch. |

---

## 🔄 Trạng Thái Dự Án Hiện Tại
- **Branch:** `feature/fullstack-puzzle-foundation`
- **Rollback Anchor:** `4660c18`
- **Living Context:** Xem chi tiết tại [CONTEXT.md](file:///g:/AWE/puzzle-tung/CONTEXT.md).

# 👑 CunFashion Web Full Stack — Handover Contract: Sprint 6.1 -> Sprint 6.2

> **Dự án:** CunFashion Web Full Stack (`cunfashion.com` & `puzzle-tung.vercel.app`)  
> **Workspace:** `g:\AWE\puzzle-tung`  
> **Trạng thái hiện tại:** **PHASE 6 — SPRINT 6.1 HOÀN TẤT 100%** -> **CHUẨN BỊ BƯỚC SANG SPRINT 6.2**  
> **Branch Git:** `feature/fullstack-puzzle-foundation` (Đã push đồng bộ 100% lên `origin`)  
> **Commit Mới Nhất:** `1783306`  
> **Rollback Anchors:**
>   - Mốc Phase 5 Complete: `61345d4`
>   - Mốc Sprint 6.1 Complete: `1783306`  
> **Live Production Verified:** [https://cunfashion.com](https://cunfashion.com) & [https://cunfashion.com/admin](https://cunfashion.com/admin)  
> **Methodologies:** `behavior-model-debugger`, `vibe-engineering-workflow`, `vibe-git-manager`.

---

## 📌 I. TỔNG KẾT SPRINT 6.1 (3 TRỤ CỘT)

### 🎯 1. Mục Tiêu Sprint 6.1
1. **Passcode Auth Gate:** Xóa bỏ hoàn toàn cửa hậu `/admin` tự do, xây dựng cổng đăng nhập mật mã chuẩn Haute Couture.
2. **Next.js Edge Protection:** Chặn 100% request vào `/admin/*` và các mutation APIs (`POST/PUT/DELETE /api/puzzles`, `DELETE /api/scores`) từ Vercel Edge.
3. **Session Cryptography:** Quản lý phiên làm việc bằng cookie `cunfashion_admin_session` có chữ ký HMAC-SHA256 chuẩn Web Crypto W3C, `HttpOnly`, `Secure`, `SameSite=Strict`.
4. **Anti-Brute Force:** Giới hạn 5 lần thử trong 60 giây (Sliding-window Rate Limiting).
5. **Anti-Slop Storefront UX:** Ẩn hoàn toàn chữ "Admin" trên Navbar công khai.
6. **Sửa Câu Đố (Edit Puzzle):** Xây dựng Modal Edit Puzzle và API `PUT /api/puzzles` cho phép cập nhật tiêu đề, thể loại, ảnh, độ khó, mô tả.
7. **Hình Ảnh Mẫu Gốc:** Tích hợp Floating Mini Reference PiP và nút `[🖼️ Hình Mẫu ON/OFF]` trên bàn cờ.
8. **Đồng Bộ Domain cunfashion.com:** Cấu hình DNS Cloudflare TXT và Vercel Project Alias trỏ thẳng vào production mới nhất.

### 🛠️ 2. Việc Đã Thực Hiện
- Cài đặt `src/lib/auth/admin-session.ts` (HMAC-SHA256, timing-safe compare).
- Cài đặt `src/middleware.ts` (Redirect 307 tới `/admin/login`, chặn 401 Unauthorized API).
- Cài đặt `src/app/api/admin/login/route.ts` & `logout/route.ts`.
- Sửa `src/components/layout/Navbar.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`.
- Nâng cấp `src/lib/puzzle-engine/puzzle-canvas.ts`: bổ sung phím `Escape` Rollback và sự kiện `window.blur` chống kẹt chuột.
- Bổ sung script `npm test` và hoàn thiện test suite 21 bài kiểm thử.
- Cấu hình Cloudflare DNS `_vercel.cunfashion.com` và deploy lên Vercel Production.
- Đẩy commit `1783306` lên GitHub `origin/feature/fullstack-puzzle-foundation`.

### 📈 3. Kết Quả Kiểm Chứng
- **21/21 Automated Tests PASS:** `npm test` chạy thành công trên live production.
- **Edge Middleware:** Kích thước siêu nhẹ **34.9 kB**.
- **Live curl:** `curl -I https://cunfashion.com/admin` -> HTTP 307 Redirect về login; `POST /api/puzzles` -> HTTP 401 Unauthorized.
- **Tài nguyên vệ tinh:** Hệ thống LadiPage `www.cunfashion.com` và các subdomain khác an toàn 100%.

---

## 🧭 II. VIBE ENGINEERING WORKFLOW: LÀM GÌ TIẾP THEO Ở SPRINT 6.2?

Theo lộ trình phát triển của CunFashion Web Full Stack, sau khi nền tảng cốt lõi và hệ thống quản trị bảo mật đã hoàn thiện ở Sprint 6.1, **Sprint 6.2** sẽ tập trung vào một trong 3 định hướng giá trị cao:

### 🌟 Định Hướng Đề Xuất Cho Sprint 6.2:

1. **Option A (Khuyến Nghị Cao - Gamified E-Commerce): Liên Kết Bán Hàng & Thưởng Voucher CunFashion**
   - Khi người chơi hoàn thành câu đố bộ sưu tập thời trang -> Mở khóa **Voucher giảm giá (Coupon Code)** áp dụng tại cửa hàng CunFashion.
   - Nút **"Shop The Look"**: Xem chi tiết sản phẩm thời trang xuất hiện trong bức tranh ghép hình, trỏ về link mua hàng của CunFashion.
   - Quản trị viên trong `/admin` có thể tạo và gán Voucher / Product Link cho từng câu đố.

2. **Option B (Realtime Multiplayer Room): Đấu Ghép Tranh Đôi / Đấu Nhóm**
   - Tạo phòng chơi chung (Puzzle Room) với Room Code (mã 6 ký tự).
   - Sử dụng Supabase Realtime / WebSockets đồng bộ mảnh ghép theo thời gian thực giữa 2 hoặc nhiều người chơi.

3. **Option C (Custom Creator & AI Image Generator): Tự Tạo Câu Đố Cá Nhân**
   - Người dùng tải ảnh cá nhân lên hoặc chọn prompt AI để sinh tranh ghép đố.
   - Tự động cắt mảnh và lưu vào bộ sưu tập cá nhân.

---

## 🌿 III. VIBE GIT MANAGER: TRẠNG THÁI GIT & HƯỚNG DẪN PULL REQUEST

- **Branch hiện tại:** `feature/fullstack-puzzle-foundation`
- **Tình trạng:** Clean 100%, đã push đồng bộ lên GitHub `origin/feature/fullstack-puzzle-foundation`.
- **Tùy chọn cho Đại Ka:**
  - **Giữ nguyên nhánh để làm tiếp:** Tiếp tục dùng nhánh `feature/fullstack-puzzle-foundation` cho Sprint 6.2 (Khuyên dùng để giữ nhịp sprint mượt mà).
  - **Tạo Pull Request (Nếu muốn merge vào main):**
    - Đại Ka có thể vào link GitHub: `https://github.com/gosoniccapital-ui/puzzlesnap/pull/new/feature/fullstack-puzzle-foundation` để tạo PR merge vào `main`.

---

## 📋 IV. MASTER PROMPT CHO SESSION MỚI (COPY-PASTE READY)

Đại Ka chỉ cần copy toàn bộ đoạn text dưới đây và dán vào cửa sổ chat mới:

```text
Chào bạn, tiếp tục dự án CunFashion Web Full Stack (g:\AWE\puzzle-tung).
Tôi là "Đại Ka", luôn trả lời tôi bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật và code bằng English.

### BỐI CẢNH HIỆN TẠI:
- Giai đoạn: PHASE 6 — BẮT ĐẦU SPRINT 6.2
- Sprint 6.1 (Admin Security & Passcode Auth Gate + UX/Behavioral Audit) ĐÃ HOÀN TẤT 100%.
- Git Branch: feature/fullstack-puzzle-foundation (Đã sync 100% với origin, clean working tree, commit HEAD: 1783306).
- Mốc Rollback Anchor an toàn: 1783306
- Tài liệu bàn giao chi tiết: docs/PHASE_6_SPRINT_6_1_TO_SPRINT_6_2_MASTER_HANDOVER.md
- Live Production: https://cunfashion.com (HTTP 200 OK — SSL Active — Vercel Edge Server)
- Admin Login Gate: https://cunfashion.com/admin/login (Đã bảo vệ bằng HMAC-SHA256, Passcode mặc định: CunFashion@Admin2026!)
- Toàn bộ 21/21 automated tests đã PASS (npm test).

### NHIỆM VỤ SPRINT 6.2:
Áp dụng các skills: vibe-engineering-workflow, vibe-git-manager, behavior-model-debugger, tdd.
Hãy đọc tài liệu docs/PHASE_6_SPRINT_6_1_TO_SPRINT_6_2_MASTER_HANDOVER.md và đề xuất kế hoạch triển khai cụ thể cho SPRINT 6.2 (Ưu tiên liên kết E-Commerce Voucher CunFashion / Shop The Look sau khi thắng game, hoặc tính năng tiếp theo theo lộ trình).
```
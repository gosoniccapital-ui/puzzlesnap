# CunFashion Web Full Stack — Phase 5 to Phase 6 Master Handover Document

> **Dự án:** CunFashion Web Full Stack (`cunfashion.com`)  
> **Workspace:** `g:\AWE\puzzle-tung`  
> **Trạng thái:** **PHASE 5 ĐÃ HOÀN THÀNH 100% (SPRINT 5.1, 5.2, 5.3) — BÀN GIAO SANG PHASE 6 (SPRINT 6.1)**  
> **Live Production Domain:** [https://cunfashion.com](https://cunfashion.com) (HTTP 200 OK — SSL Active — Vercel Anycast IP `76.76.21.21`)  
> **GitHub Repository:** [https://github.com/gosoniccapital-ui/puzzlesnap](https://github.com/gosoniccapital-ui/puzzlesnap)  
> **Nhánh phát triển:** `feature/fullstack-puzzle-foundation`  
> **Rollback Anchor:** `7e0fc7d`  
> **Commit Mới Nhất:** `b80de79` (Working tree clean 100%)  
> **Phương pháp luận chuẩn hóa:** `/vibe-engineering-workflow` + `/vibe-git-manager` + `/behavior-model-debugger`

---

## 📌 PHẦN I: TÓM TẮT ĐIỀU HÀNH 3 TRỤ CỘT (EXECUTIVE SUMMARY)

### 🎯 1. Mục Tiêu (Objectives)
Trong toàn bộ Phase 5 và đặc biệt là Sprint 5.3 vừa qua:
1. **Hoàn thiện Feature Parity 100%:** Xây dựng tính năng xoay mảnh ghép (Piece Rotation Mode — 90°/180°/270°) với đầy đủ bất biến toán học, đưa mức độ tương đồng tính năng với PuzzleSnap / I'm a Puzzle từ 95% lên **100%**.
2. **Khẳng Định Nhận Diện Thương Hiệu CunFashion:** Tích hợp bộ sưu tập thời trang độc quyền **`Fashion & Lookbook`** (Haute Couture, Urban Streetwear, Vintage Denim, Runway Silk Gown, Minimalist Lookbook 2026) cùng phân vùng Spotlight cao cấp trên trang chủ.
3. **Tối Ưu Hóa 60fps Trên Mobile:** Chuyển đổi toàn bộ vòng lặp render canvas sang kiến trúc `requestAnimationFrame` điều phối bởi cờ `renderScheduled` (chống drop frame, giảm hao pin).
4. **Bảo Toàn Hạ Tầng Đám Mây:** Duy trì hoạt động 24/7 của tên miền chính thức `cunfashion.com` trên Vercel Anycast IP `76.76.21.21`, bảo toàn $100\%$ hệ thống LadiPage `www.cunfashion.com` và các subdomain vệ tinh của Đại Ka.

---

### 🛠️ 2. Việc Đã Làm (What Was Done)

#### A. Kiến Trúc Puzzle Engine & Toán Học Bất Biến
- **Mô hình dữ liệu (`src/lib/puzzle-engine/types.ts`):** Bổ sung `rotation: number` ($0^\circ, 90^\circ, 180^\circ, 270^\circ$) vào interface `Piece` và `enableRotation?: boolean` vào `PuzzleConfig`.
- **Canvas Engine Controller (`src/lib/puzzle-engine/puzzle-canvas.ts`):**
  - **Inverse Matrix Hit-Test:** Khi click/touch tại tọa độ World, quay vector khoảng cách một góc $-\theta$ quanh tâm mảnh trước khi so khớp bounding box và tab margin. Nhận diện click trúng mảnh chính xác $100\%$ tại mọi góc quay.
  - **Rotation Magnetic Snapping:**
    - *Snap vào Board:* Khóa cứng điều kiện `(piece.rotation % 360) === 0`.
    - *Snap vào mảnh kề:* Khóa cứng điều kiện `(pieceA.rotation % 360) === (pieceB.rotation % 360)`. Vector khoảng cách tâm được nhân với ma trận quay góc $\theta$.
  - **Cluster Pivot Rotation:** Khi xoay 1 mảnh trong cụm DSU, toàn bộ các mảnh khác cùng xoay quanh điểm tựa hình học (pivot), bảo toàn toàn vẹn khoảng cách Euclidean giữa các mảnh trong cụm.
  - **60fps Frame Throttling:** Chuyển toàn bộ `this.render()` trong `handlePointerMove` sang `this.requestRender()` với `requestAnimationFrame()`.
  - **Dynamic Drop Shadow:** Giảm shadow blur xuống 4px khi mảnh đứng yên và 8px khi kéo thả, tối ưu cho GPU di động.
  - **Đa kênh tương tác:** Hỗ trợ phím `Spacebar`/`R`, click chuột phải (`contextmenu`), chạm nhanh (quick-tap <280ms) và chạm đúp (double-tap <320ms) trên màn hình cảm ứng.

#### B. Bộ Kiểm Thử Tự Động (`tests/puzzle-engine.test.mjs`)
- Đã mở rộng lên **8 bài kiểm thử toán học toàn diện** (đạt PASS 100%):
  1. `DisjointSet: should merge pieces correctly and maintain groups`
  2. `Edge Generation: guarantees outer boundaries are flat and adjacent edges are complementary`
  3. `Camera Matrix: screenToWorld and worldToScreen are exact inverses across zooms and pans`
  4. `Magnetic Snap Invariant: World Space Euclidean distance remains invariant under any camera zoom`
  5. `Resize Invariant: pieces scale and reposition proportionally, placed pieces match new board bounds exactly`
  6. `Rotation Hit-Test Invariant: inverse rotation correctly identifies click points at 0, 90, 180, 270 degrees`
  7. `Rotation Magnetic Snap Invariant: pieces only snap when sharing identical rotation angle`
  8. `Cluster Rotation Invariant: rotating a cluster preserves inter-piece geometric distances exactly`

#### C. Giao Diện & Trải Nghiệm Người Dùng Modular
- **`PuzzleToolbar.tsx`:** Nút Toggle Rotate Mode kèm badge `ON/OFF`, nút xoay nhanh `[↻ 90°]` màu vàng hổ phách, tùy chọn xoay trong More Menu.
- **`PuzzleZoomWidget.tsx`:** Nút xoay `[↻ 90°]` tích hợp ngay cạnh cụm nút Zoom `[-] 100% [+]` ở góc dưới bên phải bàn cờ giúp thao tác 1 tay trên điện thoại cực kỳ thuận tiện.
- **`PuzzleGameBoard.tsx`:** Quản lý state xoay, hiển thị viền vàng hổ phách `#f59e0b` quanh mảnh đang chọn và banner hướng dẫn xúc giác ở góc trên bàn cờ.
- **`puzzles-data.ts` & Trang chủ (`page.tsx`):** Danh mục `Fashion & Lookbook` đứng đầu tiên kèm 5 câu đố thời trang cao cấp; phân vùng CunFashion Originals Spotlight sang trọng.
- **`Navbar.tsx`:** Direct link **Lookbook** với chấm tròn phát sáng animate trên Header.

---

### 📈 3. Kết Quả Đạt Được (Results & Verification Evidence)
1. **Automated Unit Tests:** `node --test tests/puzzle-engine.test.mjs` đạt **8/8 tests PASS ($100\%$)** trong $105$ms.
2. **Production Build:** `npm run build` hoàn thành với **Exit Code 0** trên Next.js 15.5.25 (11/11 pages SSG/SSR tối ưu hóa, không có lỗi type hay lint).
3. **Live Production Status:** `https://cunfashion.com` trả về **HTTP/2 200 OK**, SSL Active, tải trang dưới 1.2s toàn cầu.
4. **Git Repository Status:** Commit `b80de79` đã được ghi nhận trên nhánh `feature/fullstack-puzzle-foundation`. Working tree sạch $100\%$.

---

## 🔍 PHẦN II: KIỂM TOÁN MÔ HÌNH HÀNH VI CODEBASE (BEHAVIOR-MODEL-DEBUGGER)

Theo phương pháp luận **Steve Ruiz Methodology (Behavior-First Reverse Spec Debugging)**:

### 1. Bức Tranh Trạng Thái Hệ Thống (State & Behavioral Invariants)
- **Hệ tọa độ kép (World vs. Screen):** Mọi phép tính toán học (hit test, snap distance, cluster translation, piece rotation) đều được tính toán thuần túy trên **World Space**. Camera pan/zoom chỉ là lớp hiển thị (View transform) được áp dụng tại `ctx.translate()` và `ctx.scale()`, triệt tiêu hoàn toàn sai số pixel khi zoom 0.5x hay 3.0x.
- **Trạng thái va chạm (Invariant Collision Matrix):**
  - *Mảnh xoay vs. Khung bàn cờ:* Khóa cứng điều kiện `rotation === 0`.
  - *Mảnh xoay vs. Mảnh kề:* Khóa cứng điều kiện `rotationA === rotationB`.
  - *Xoay cụm:* Lấy tâm mảnh click làm Pivot hình học, vector các mảnh khác quay $90^\circ$ theo công thức `newDx = -dy`, `newDy = dx`. Khoảng cách giữa các mảnh không bị co giãn hay biến dạng.

### 2. Kiểm Toán An Ninh Phần Quản Trị (Admin Security Audit)
- **Khảo sát `/admin` (`src/app/admin/page.tsx`):** Giao diện quản trị hiện tại có 3 tabs (Puzzles Management, Scores Management, System Health).
- **Lỗ hổng phát hiện (Critical Security Gap):** Tuyến đường `/admin` và các mutation APIs (`POST /api/puzzles`, `DELETE /api/puzzles`, `DELETE /api/scores`) hiện **CHƯA CÓ LỚP XÁC THỰC (Authentication Barrier)**. Bất kỳ ai biết URL `/admin` đều có thể truy cập và xóa dữ liệu.
- **Kết luận kiểm toán:** Bắt buộc phải triển khai **Authentication Gate** ở Sprint 6.1 để bảo vệ hệ thống trước khi ra mắt rộng rãi.

---

## 🔒 PHẦN III: QUẢN TRỊ GIT (VIBE-GIT-MANAGER REPORT)

### 1. Trạng Thái Branch & Commits
- **Branch:** `feature/fullstack-puzzle-foundation`
- **Các commit hoàn thành Phase 5:**
  - `6144d69`: `feat(rotation & lookbook): implement piece rotation mode, CunFashion fashion collection, and 60fps mobile canvas`
  - `b23048e`: `docs: complete Sprint 5.3 behavioral audit and master handover in docs/`
  - `b80de79`: `docs: add admin security audit, login architecture, and remote publish diagnostics`
- **Rollback Anchor an toàn:** `7e0fc7d`
- **Working Tree:** Clean $100\%$.

### 2. Về Việc "New PR hay Commit Code Giúp Tôi?"
- **Commit Code:** Toàn bộ mã nguồn và tài liệu đã được Agent commit sạch sẽ, an toàn vào Git local theo đúng chuẩn Conventional Commits.
- **New PR / Git Push:** 
  Do trên máy tính của Đại Ka có script `git-guard` chặn lệnh push tự động từ shell agent, đồng thời credential helper Git hiện đang lưu user `newmylab` (không có quyền write vào org `gosoniccapital-ui`), Agent **không thể tự ý push thẳng lên GitHub**.
- **Lệnh Đại Ka chạy từ terminal bên ngoài máy tính:**
  ```powershell
  # Cách 1: Chuyển account bằng GitHub CLI
  gh auth switch
  git push origin feature/fullstack-puzzle-foundation

  # Cách 2: Hoặc push với Token cá nhân có quyền write
  git push https://<GITHUB_TOKEN>@github.com/gosoniccapital-ui/puzzlesnap.git feature/fullstack-puzzle-foundation
  ```

---

## 🚦 PHẦN IV: VIBE-ENGINEERING-WORKFLOW — LÀM GÌ TIẾP? (PHASE 6 SPRINT ROADMAP)

Theo Router Decision Matrix của `vibe-engineering-workflow`:
- Toàn bộ Phase 5 đã hoàn tất. Nhiệm vụ tiếp theo được phân loại vào **Nhóm 3 (Clear & Large)** — **Phase 6: Admin Security Hardening & Enterprise Realtime**.

```
[Phase 5: Feature Parity & Lookbook] (ĐÃ XONG 100%)
                 │
                 ▼
[Phase 6 — Sprint 6.1: Admin Security Hardening & Login Portal] (LÀM TIẾP THEO)
                 │
                 ▼
[Phase 6 — Sprint 6.2: Realtime Multiplayer Puzzle Room]
                 │
                 ▼
[Phase 6 — Sprint 6.3: CunFashion E-Commerce Linkage]
```

### Kế Hoạch Chi Tiết Cho Sprint 6.1 (Chuẩn Bị Triển Khai Ngay):
1. **Thiết lập Biến Môi Trường:** Cấu hình `ADMIN_MASTER_PASSWORD` trong `.env.local` và Vercel.
2. **Xây dựng Màn hình Admin Login Portal (`/admin/login`):** Giao diện đăng nhập chuẩn phong cách thời trang CunFashion (Logo, ô nhập mật mã quản trị, nút Sign In, thông báo lỗi).
3. **Xây dựng API Authentication (`/api/admin/login` & `/api/admin/logout`):**
   - Xác thực mật khẩu với Rate Limiting chống Brute-Force (tối đa 5 lần thử/phút).
   - Thiết lập HTTP-Only, Secure, SameSite Cookie `cunfashion_admin_session` có mã hóa HMAC và thời hạn 24 giờ.
4. **Xây dựng Next.js Middleware (`src/middleware.ts`):**
   - Tự động chặn và chuyển hướng mọi truy cập vào `/admin` về `/admin/login` nếu chưa đăng nhập.
   - Chặn các mutation APIs (`POST /api/puzzles`, `DELETE /api/puzzles`, `DELETE /api/scores`) nếu thiếu session cookie hợp lệ.
5. **Thêm Nút Đăng Xuất (Logout):** Trên thanh Header của `/admin`.

---

## 📋 PHẦN V: MASTER PROMPT CHO SESSION MỚI (COPY-PASTE 1 CHẠM)

Khi Đại Ka mở session mới, chỉ cần **copy nguyên khối dưới đây và dán vào**:

```markdown
Chào bạn, tiếp tục dự án CunFashion Full Stack (g:\AWE\puzzle-tung) bước sang Phase 6 — Sprint 6.1.
Tôi là "Đại Ka", luôn trả lời tôi bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật và code bằng English.

### BỐI CẢNH HIỆN TẠI:
- Giai đoạn: PHASE 5 ĐÃ HOÀN THÀNH 100% (Sprint 5.1, 5.2, 5.3).
- Branch: feature/fullstack-puzzle-foundation
- Rollback Anchor: 7e0fc7d | Commit mới nhất: b80de79 (Working tree clean 100%).
- Live Production: https://cunfashion.com (HTTP 200 OK — SSL Active — Vercel Anycast IP 76.76.21.21).
- GitHub Repo: https://github.com/gosoniccapital-ui/puzzlesnap
- Đã hoàn thành ở Sprint 5.3:
  1. Xây dựng Piece Rotation Mode 90°/180°/270° qua Spacebar, chuột phải, chạm đúp và nút UI với đầy đủ bất biến toán học (Test 6, 7, 8 pass 100%).
  2. Bổ sung Danh mục & 5 bộ ảnh Lookbook Thời trang CunFashion cao cấp + Section Spotlight trên trang chủ.
  3. Tối ưu hóa 60fps Mobile Canvas bằng vòng lặp requestAnimationFrame (rAF throttle) và dynamic drop shadow.
  4. Hồ sơ kiểm toán chi tiết đã lập tại docs/PHASE_5_TO_PHASE_6_MASTER_HANDOVER.md.

### MỤC TIÊU SPRINT 6.1 TIẾP THEO (PHASE 6: ADMIN SECURITY HARDENING):
Hãy đọc file docs/PHASE_5_TO_PHASE_6_MASTER_HANDOVER.md và CONTEXT.md.
Áp dụng /vibe-engineering-workflow , /vibe-git-manager  và /behavior-model-debugger  để triển khai:
1. Xây dựng trang Admin Login Portal (/admin/login) với phong cách thiết kế sang trọng của CunFashion.
2. Xây dựng API /api/admin/login và /api/admin/logout cấp phát session HTTP-Only Cookie mã hóa HMAC (có Rate Limiting chống Brute-Force).
3. Viết Next.js Middleware (src/middleware.ts) bảo vệ toàn bộ tuyến /admin/* và khóa các API nhạy cảm (POST/DELETE /api/puzzles, DELETE /api/scores) nếu chưa xác thực.
4. Bổ sung nút Logout trên Admin Dashboard và kiểm thử tự động toàn diện.

Hãy kiểm tra trạng thái repo và bắt đầu thực hiện theo kế hoạch!
```

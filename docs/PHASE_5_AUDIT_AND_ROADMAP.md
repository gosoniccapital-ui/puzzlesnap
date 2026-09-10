# Báo Cáo Kiểm Toán Toàn Diện Codebase, UX Behavioral Model, Refactor & Security: PuzzleSnap Full Stack

> **Dự án:** PuzzleSnap Full Stack Replicate (`puzzlesnap.com` - formerly *I'm a Puzzle*)  
> **Workspace:** `g:\AWE\puzzle-tung`  
> **Production Live URL:** [https://puzzle-tung.vercel.app](https://puzzle-tung.vercel.app)  
> **GitHub Repository:** [https://github.com/gosoniccapital-ui/puzzlesnap](https://github.com/gosoniccapital-ui/puzzlesnap)  
> **Thời gian thực hiện:** 2026-09-10  
> **Phương pháp luận:** `behavior-model-debugger` (Steve Ruiz Methodology) & `vibe-engineering-workflow`  

---

## 🎯 1. Mục Tiêu Kiểm Toán (Audit Objectives)

1. **So sánh đối chuẩn (Feature Parity Gap Analysis):** Đối chiếu chi tiết toàn bộ tính năng của hệ thống hiện tại so với website tham chiếu **PuzzleSnap.com** (tên cũ: *I'm a Puzzle*).
2. **Kiểm toán mô hình hành vi UX (Behavioral Model & Invariant Collisions):** Rà soát các tương tác người dùng, cảm ứng đa điểm di động, ma trận biến đổi tọa độ, và các tình huống xung đột trạng thái (state jitter, unmount, blur, resize).
3. **Kiểm toán chất lượng mã nguồn & Kiến trúc (Codebase & Refactor Opportunities):** Đánh giá cấu trúc file, mức độ gắn kết (cohesion), khớp nối (coupling), và cơ hội refactor component lớn.
4. **Kiểm toán an toàn bảo mật (Security & Hardening Audit):** Rà soát dữ liệu đầu vào API, nguy cơ Injection/XSS, HTTP security headers, rate limiting, và quản trị bí mật môi trường.
5. **Xác lập lộ trình hoàn thiện (Roadmap to 100% Parity):** Đề xuất danh mục công việc tiếp theo để nâng cấp sản phẩm đạt chất lượng thương mại tương đương bản gốc.

---

## 📊 2. Bảng Đối Chuẩn Tính Năng Với Site Tham Chiếu (PuzzleSnap.com)

| Hạng Mục Tính Năng | Hiện Trạng PuzzleSnap.com | Dự Án Hiện Tại (`puzzle-tung`) | Trạng Thái & Đánh Giá |
|---|---|---|---|
| **Bộ Nhận Diện Thương Hiệu** | Logo mặt cười màu vàng `#FFB703`, tông nền giấy ấm `#fbfaf7`, font Nunito Sans | Logo SVG mặt cười chuẩn 1:1, warm paper palette `#fbfaf7`, typography sắc nét | **100% (Hoàn thành)** |
| **Hệ Thống Danh Mục** | 14 danh mục chuẩn (Animals, Art, Food, Nature, Space,...) | Đầy đủ 14 danh mục, trang `/categories` có lọc theo hash URL, thẻ danh mục trang chủ | **100% (Hoàn thành)** |
| **Câu Đố Hàng Ngày (Daily Puzzle)** | Đổi câu đố mỗi ngày, có badge Daily Puzzle trên trang chủ và navbar | API `/api/daily` tự động tính theo ngày âm/dương lịch, banner Hero, link trực tiếp | **100% (Hoàn thành)** |
| **Động Cơ Cắt Mảnh Ghép** | Cắt đường cong mượt mà, nhiều kiểu cắt (Classic, Hearts, Star,...) | `bezier-cutter.ts` với Cubic Bézier nội suy pháp tuyến, 3 Cut Styles: Classic, Hearts, Star | **100% (Hoàn thành)** |
| **Gom Cụm & Nam Châm Hút** | Ghép các mảnh liền kề tự động dính cụm, nam châm hút vào bàn cờ | Cấu trúc dữ liệu Disjoint-Set Union (DSU), khoảng cách hút 16px, di chuyển đồng bộ cả cụm | **100% (Hoàn thành)** |
| **Âm Thanh Game (Audio FX)** | Tiếng click gỗ khi dính mảnh, tiếng chuông khi hoàn thành | Web Audio API offline không phụ thuộc file ngoài: click gỗ và chime progression tăng tiến | **100% (Hoàn thành)** |
| **Thanh Công Cụ (Toolbar)** | Timer, Moves, Pieces count, Cut Style, Difficulty, Preview, Arrange, Edges, Fullscreen | Đầy đủ 100% các công cụ trên Toolbar: Pause/Resume, Hide Timer, Arrange, Edges, Fullscreen | **100% (Hoàn thành)** |
| **Cảm Ứng Di Động & Zoom** | Hỗ trợ chơi trên điện thoại, zoom to nhỏ bàn cờ khi câu đố nhiều mảnh | Ma trận Camera chuyển đổi World $\leftrightarrow$ Screen Space, cử chỉ 2 ngón Pinch-to-zoom (0.5x-3.0x), Pan, Wheel desktop, Floating Widget | **100% (Hoàn thành)** |
| **Tạo Câu Đố Riêng (Custom Maker)** | Tải ảnh cá nhân lên, cắt tức thì để chơi | Trang `/make-puzzle` tải ảnh từ máy, cắt real-time trên canvas, có nút chia sẻ link | **90% (Cần Cloud Upload)** |
| **Bảng Xếp Hạng (Leaderboard)** | Bảng điểm kỷ lục thời gian thực dưới bàn cờ | API `/api/scores` (CRUD), Modal vinh danh, bảng điểm xếp theo `time ASC, moves ASC` | **100% (Hoàn thành)** |
| **Bảng Quản Trị (Admin Console)** | Quản lý câu đố, audit điểm số, theo dõi hệ thống | Trang `/admin` với Catalog management (Thêm/Sửa/Xóa có preview), Score Audit, Health | **100% (Hoàn thành)** |
| **Xoay Mảnh Ghép (Rotation)** | Có chế độ bật xoay mảnh 90°/180°/270° (Độ khó cao) | Hiện tại các mảnh ghép có hướng cố định (0° rotation) | **0% (Chưa có)** |
| **Số Lượng Mảnh Ghép Lớn (>100 pcs)** | Có tùy chọn 100 - 300 mảnh ghép cho màn hình lớn | Hiện hỗ trợ 5 mức: 9, 16, 30, 40, 50 mảnh | **70% (Khá)** |
| **Social OpenGraph Dynamic Image** | Chia sẻ link Facebook/Zalo có ảnh thumbnail đúng câu đố | Đã có manifest PWA và static meta, chưa có Dynamic OG image generator (`/api/og`) | **50% (Cơ bản)** |

---

## 🔍 3. Kiểm Toán Mô Hình Hành Vi UX (Behavioral Model & Invariant Audit)

Áp dụng phương pháp luận của Steve Ruiz để kiểm tra các bất biến (Invariants) và các điểm giao thoa:

### 3.1. Phân Tích Va Chạm Tọa Độ (Coordinate & Transform Collisions)
- **Bất biến 1: Độ nhạy Magnetic Snap độc lập với Zoom:**
  - *Kết quả kiểm tra:* **ĐẠT (PASS)**. Do thuật toán tính khoảng cách snap `Math.hypot(p.currentPos - p.originalPos)` được thực thi hoàn toàn trong **World Space**, khoảng cách dung sai $16\text{px}$ giữ nguyên độ nhạy vật lý bất kể người dùng phóng to $300\%$ hay thu nhỏ $50\%$.
- **Bất biến 2: Chuyển đổi trạng thái từ Kéo mảnh (1 ngón) sang Pinch Zoom (2 ngón):**
  - *Kết quả kiểm tra:* **ĐẠT (PASS)**. Khi người dùng đang kéo 1 mẩu ghép mà vô tình hoặc chủ động đặt ngón thứ 2 lên màn hình để zoom, hệ thống tự động hoàn vị mẩu ghép về `initialPiecePositions` và hủy `activeGroup`, ngăn ngừa hoàn toàn hiện tượng mẩu ghép bị văng lệch tọa độ do ngón thứ hai gây giật delta.
- **Bất biến 3: Resize màn hình / Xoay ngang điện thoại (Orientation Change):**
  - *Lỗ hổng phát hiện:* Khi người dùng xoay điện thoại từ dọc sang ngang, hàm `resize()` tính lại `boardBounds` mới, nhưng tọa độ `pieces[i].currentPos` hiện đang lưu giá trị pixel tuyệt đối từ trước khi xoay. 
  - *Hậu quả:* Các mẩu ghép đã giải hoặc đang xếp dở có thể bị lệch tương đối so với khung bàn cờ mới.
  - *Đề xuất khắc phục:* Trong `engine.resize()`, tính tỉ lệ scale `scaleX = newBoard.width / oldBoard.width`, `scaleY = newBoard.height / oldBoard.height` và cập nhật lại tọa độ tương ứng của toàn bộ các mẩu ghép.

### 3.2. Sự Gián Đoạn & Phục Hồi Trạng Thái (Interruptions & Lifecycle)
- **Mất Focus (`window.blur` / Chuyển Tab):** Timer đang chạy nền. Khi người dùng quay lại tab, thời gian vẫn được đo chính xác thông qua khoảng cách timestamp `Date.now()`.
- **Kéo chuột ra ngoài màn hình (`pointerleave` / `pointercancel`):** Đã đăng ký listener sự kiện trên `window` cho `pointermove` và `pointerup`, đồng thời có `pointercancel`, đảm bảo không bao giờ bị kẹt chuột (stuck drag state).
- **Phím tắt Bàn phím (Keyboard Controls):** Hiện tại chưa hỗ trợ phím tắt (Space để Pause/Resume, `+`/`-` để zoom, `R` để reset view). Đây là điểm có thể bổ sung để tăng tính chuyên nghiệp.

---

## 🛠️ 4. Kiểm Toán Kiến Trúc Mã Nguồn & Cơ Hội Refactor (Codebase Audit)

### 4.1. File `PuzzleGameBoard.tsx` (Monolithic Component)
- **Hiện trạng:** File có độ dài 676 dòng code, đảm nhiệm quá nhiều trách nhiệm:
  1. Quản lý đồng hồ bấm giờ (Timer).
  2. Khởi tạo và đồng bộ vòng đời của Canvas Engine.
  3. Render Toolbar điều khiển.
  4. Quản lý trạng thái nộp điểm và bảng xếp hạng Leaderboard.
  5. Render Modal chúc mừng chiến thắng (Victory Confetti & Modal).
  6. Render Modal xem trước ảnh mẫu (Preview Modal).
- **Đề xuất Refactor:** Tách thành các sub-components độc lập:
  - `src/components/puzzle/PuzzleToolbar.tsx` (Thanh công cụ điều khiển).
  - `src/components/puzzle/PuzzleVictoryModal.tsx` (Modal chúc mừng & form nộp kỷ lục).
  - `src/components/puzzle/PuzzleLeaderboard.tsx` (Bảng xếp hạng dưới bàn cờ).
  - `src/components/puzzle/PuzzlePreviewModal.tsx` (Hộp thoại xem ảnh gốc).

### 4.2. Khớp Nối API & Data Mapping (Type Consistency)
- Hiện tại bảng `puzzle_scores` trong Supabase sử dụng chuẩn `snake_case` (`puzzle_slug`, `player_name`, `elapsed_seconds`), trong khi in-memory store dùng `camelCase` (`puzzleSlug`, `playerName`, `elapsedSeconds`). Code API đã có lớp chuyển đổi thủ công, tuy nhiên nên tạo một module DTO mapper (`src/lib/types/dto.ts`) để đảm bảo tính an toàn kiểu dữ liệu (Type-Safety) xuyên suốt giữa Frontend và Backend.

---

## 🔒 5. Kiểm Toán An Toàn & Bảo Mật (Security Audit)

### 5.1. Rà Soát Bí Mật & Môi Trường (Secret Hygiene)
- **Kết quả:** **AN TOÀN TUYỆT ĐỐI (ZERO-LEAK)**.
  - File `.env.local` đã được cấu hình trong `.gitignore`.
  - Các biến môi trường nhạy cảm (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) không bao giờ được commit vào git hay xuất ra client-side bundle.
  - Các lệnh đẩy code đã sanitize remote URL, không lưu token xác thực trên cấu hình git.

### 5.2. Kiểm Tra Dữ Liệu Đầu Vào API (API Input Validation & Sanitization)
- **Route `/api/scores` (POST):**
  - Đã có giới hạn độ dài nickname: `playerName.trim().substring(0, 30)`.
  - Đã có ép kiểu số nguyên an toàn: `Math.max(1, Math.round(elapsedSeconds))`.
  - *Khuyến nghị bổ sung:* Thêm regex filter để loại bỏ các ký tự đặc biệt nguy hiểm (`<`, `>`, `"`, `'`, `/`, `\`) nhằm ngăn chặn triệt để nguy cơ Stored XSS khi hiển thị tên người chơi ở các môi trường bên ngoài React.
- **Route `/api/puzzles` (POST):**
  - Tạo slug tự động bằng regex an toàn: `.replace(/[^a-z0-9]+/g, "-")`.
  - *Khuyến nghị bổ sung:* Kiểm tra tính hợp lệ của URL hình ảnh (`image` phải bắt đầu bằng `http://`, `https://` hoặc `/images/`).

### 5.3. Rate Limiting & Chống Spam (Abuse Prevention)
- Các route ghi dữ liệu công khai (`POST /api/scores` và `POST /api/puzzles`) hiện chưa có Rate Limiter.
- *Khuyến nghị:* Bổ sung cơ chế Rate Limiting đơn giản dựa trên IP (ví dụ: tối đa 5 lần nộp điểm / phút trên 1 IP) để chống bot flood làm tràn bảng xếp hạng.

### 5.4. HTTP Security Headers
- Ứng dụng hiện chưa cấu hình các HTTP Security Headers trong `next.config.ts`.
- *Khuyến nghị:* Bổ sung các headers bảo mật tiêu chuẩn:
  ```ts
  // next.config.ts headers:
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

---

## 🗺️ 6. Lộ Trình Hoàn Thiện Tiếp Theo (Roadmap to 100% Parity)

Dựa trên kết quả kiểm toán, các hạng mục tiếp theo được phân chia thành 3 nhóm:

### 🟢 Giai Đoạn 1: Hoàn Thiện Trải Nghiệm & Củng Cố Bảo Mật (Ưu tiên cao)
1. **Security Headers & Input Sanitization:** Bổ sung HTTP Security Headers vào `next.config.ts` và bộ lọc regex cho API `/api/scores`.
2. **Xử lý Resize / Orientation Change:** Tự động tính lại tỉ lệ tọa độ mảnh ghép khi người dùng xoay màn hình điện thoại hoặc thay đổi kích thước cửa sổ.
3. **Phím tắt Bàn phím (Keyboard Shortcuts):** Hỗ trợ phím `Space` (Pause), `+`/`-` (Zoom), `Z` (Reset zoom), `E` (Lọc viền), `G` (Bóng mờ).

### 🟡 Giai Đoạn 2: Tối Ưu Hóa & Tái Cấu Trúc Mã Nguồn (Refactor)
1. **Modularize `PuzzleGameBoard.tsx`:** Phân rã thành 4 sub-components chuyên biệt (`PuzzleToolbar`, `PuzzleLeaderboard`, `PuzzleVictoryModal`, `PuzzlePreviewModal`).
2. **Cloud Storage Cho Custom Maker:** Tải ảnh tự tạo của người dùng lên Supabase Storage bucket `puzzle-images` thay vì chỉ lưu `dataURL` cục bộ, cho phép tạo link chia sẻ câu đố cho bạn bè cùng chơi.

### 🔵 Giai Đoạn 3: Tính Năng Nâng Cao So Với PuzzleSnap.com (Advanced Features)
1. **Xoay Mảnh Ghép (Piece Rotation Mode):** Cho phép bật/tắt chế độ khó: mảnh ghép có thể bị xoay ngẫu nhiên 90°, 180°, 270°; người chơi click chuột phải hoặc double-tap để xoay mảnh về góc đúng.
2. **Dynamic Social Share Image (`/api/og`):** Sinh ảnh xem trước OpenGraph tự động khi chia sẻ link câu đố lên mạng xã hội.
3. **Tích hợp Data Người Dùng Chung (với `app.muachung.co` theo yêu cầu của Đại Ka):** Đồng bộ tài khoản, tích điểm thưởng săn sale khi hoàn thành câu đố.

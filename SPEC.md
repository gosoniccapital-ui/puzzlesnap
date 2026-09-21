# SPEC.md - CunFashion (PuzzleSnap Full Stack) Specification

## 1. Executive Summary & Domain Definition
**CunFashion** (tên mã nội bộ: `puzzlesnap`) là nền tảng **Haute Couture Gamified E-Commerce & Jigsaw Puzzle Web Application**.
- **Mục tiêu:** Kết hợp trải nghiệm giải đố xếp hình nghệ thuật (Haute Couture Jigsaw Puzzle) với phễu chuyển đổi thương mại điện tử thời trang cao cấp (Gamified Fashion E-Commerce) và trợ lý thời trang thông minh (AI Visual Stylist).
- **Đối tượng người dùng chính:**
  1. Người yêu thích xếp hình giải trí nghệ thuật (Jigsaw puzzle enthusiasts) trên Desktop & Mobile PWA.
  2. Tín đồ thời trang tìm kiếm cảm hứng phối đồ (Fashion discovery & lookbook shoppers) qua Amazon Associates US, Rakuten, CunCute store.
  3. Quản trị viên thương hiệu (Store Admin) quản lý kho tranh, danh mục, voucher, và phân tích chuyển đổi affiliate realtime.

---

## 2. Information Architecture & Routes Specification

### 2.1. Client-Side Pages & Screens (`src/app/`)
- **`/` (Home Screen):**
  - Hero Showcase phong cách Haute Couture Obsidian Gold (`#09090b` & `#dfba73`).
  - Daily Featured Puzzle Banner với hiệu ứng ambient backlight glow và countdown UTC.
  - Bộ sưu tập Lookbook Puzzles phân theo 4 độ khó: Easy (12 mảnh), Medium (24 mảnh), Hard (48 mảnh), Expert (96 mảnh).
  - Phân loại danh mục Lookbook Carousel (`Cun Lookbook`, `Haute Couture`, `Streetwear`, `Retro Chic`, `Accessories`).
  - PWA Install Banner (`PwaInstallBanner.tsx`) hỗ trợ iOS A2HS và Android Prompt.
  - Ngôn ngữ đa quốc gia (7 ngôn ngữ: `EN`, `VI`, `JA`, `FR`, `DE`, `ES`, `ZH`) với Flag Selector.
- **`/puzzle/[id]` (Game Board Screen):**
  - Bộ điều khiển trò chơi xếp hình Canvas 2D 60fps (`PuzzleGameBoard.tsx`).
  - Hỗ trợ cắt mảnh bằng thuật toán Bézier (`bezier-cutter.ts`) với 3 kiểu cắt: Classic, Hearts, Star.
  - Quản lý cụm mảnh ghép qua Disjoint-Set Union (`disjoint-set.ts`).
  - Căn chỉnh từ tính (Magnetic Snap), âm thanh click/chime offline qua Web Audio API (`sound.ts`).
  - Chế độ xoay mảnh (Piece Rotation Mode 90°/180°/270°) bằng Spacebar, Click phải, Double-Tap hoặc Toolbar Button.
  - Chế độ Co-Op Realtime Multiplayer (`PuzzleCoopModal.tsx`) qua kênh Supabase Realtime + BroadcastChannel.
  - Nút Like đếm tim (`PuzzleLikeButton.tsx`) và bộ đếm lượt chơi với IP rate-limiting.
  - Modal chiến thắng (`PuzzleVictoryModal.tsx`) tích hợp Dual Haute Couture Vouchers (`70Cute7LOOK`, `CUNFASHION2026`) kèm CTA "Shop The Look".
- **`/make-puzzle` (Custom Puzzle Maker Screen):**
  - Tải ảnh cá nhân hoặc kéo thả, tự động nén ảnh phía client (< 200KB).
  - Lựa chọn số mảnh (12, 24, 48, 96 mảnh) và kiểu cắt.
  - Upload trực tiếp lên Supabase Storage bucket `puzzle-images` sinh URL CDN vĩnh viễn.
  - Tự động sinh phòng Co-Op Multiplayer và tạo link chia sẻ tức thì.
- **`/categories` (Categories Screen):**
  - Duyệt kho tranh xếp hình theo bộ sưu tập chủ đề thời trang.
- **`/search` (Search Screen):**
  - Tìm kiếm tranh xếp hình theo tên, tag và từ khóa phong cách.
- **`/style-advisor` (AI Fashion Stylist & Omnisearch Screen):**
  - Omni-Search Bar đa năng: Nhập từ khóa hoặc tải ảnh trang phục qua camera/file picker.
  - Công cụ gợi ý xu hướng ngẫu nhiên: "Surprise Me" trend generator.
  - Tích hợp Google Gemini Vision & Text AI phân tích phối đồ và gợi ý phong cách thời trang.
  - Phễu sản phẩm Amazon US Live Catalog tích hợp Rainforest API & RapidAPI failover.
  - Gắn mã tiếp thị liên kết Amazon StoreID `cuncute-20` và SubID `ascsubtag={click_id}`.
  - Tủ đồ yêu thích cá nhân (`WardrobeDrawer.tsx`) với 4 phân loại phong cách: All, Party, Office, Casual.
  - Xuất Lookbook Canvas chuẩn Story 9:16 (1080x1920) đăng Instagram/TikTok với 3 chủ đề Haute Couture.
  - Chia sẻ tủ đồ qua URL param (`?wardrobe=id1,id2,...`).
- **`/admin` (Admin Console Screen):**
  - Cổng đăng nhập bảo mật qua mã Passcode (HMAC-SHA256, Edge Middleware Guard).
  - Quản lý danh sách Puzzles (Thêm, Sửa, Xóa, ghim Featured).
  - Bảng điều khiển phân tích chuyển đổi (Affiliate Conversion Analytics Dashboard): Tổng click, đơn hàng, doanh thu ước tính, hoa hồng, CR%.
  - Luồng sự kiện click thời gian thực (Live Click Stream) và luồng đơn hàng Postback.
  - Xuất báo cáo dữ liệu dạng CSV chuẩn RFC 4180 có UTF-8 BOM cho Microsoft Excel.

---

## 3. Backend & API Endpoints Specification (`src/app/api/`)

| Method | Endpoint | Quyền hạn | Mô tả chức năng |
|---|---|---|---|
| `GET` | `/api/puzzles` | Public | Lấy danh sách tranh xếp hình (hỗ trợ filter category, difficulty, featured) |
| `POST` | `/api/puzzles` | Admin | Tạo mới tranh xếp hình vào Supabase |
| `PUT` | `/api/puzzles` | Admin | Cập nhật thông tin tranh xếp hình |
| `DELETE` | `/api/puzzles` | Admin | Xóa tranh xếp hình khỏi hệ thống |
| `POST` | `/api/puzzles/interact` | Public (Rate Limited) | Tăng lượt Like hoặc lượt Play với sliding-window IP protection |
| `POST` | `/api/custom-puzzles` | Public (Rate Limited) | Lưu tranh tự tạo của người dùng lên Supabase Storage CDN |
| `GET` | `/api/custom-puzzles` | Public | Lấy thông tin tranh tự tạo theo ID |
| `GET` | `/api/daily` | Public | Lấy tranh xếp hình hàng ngày (Daily Puzzle) tự động xoay vòng |
| `GET/POST` | `/api/scores` | Public | Lưu và lấy bảng xếp hạng điểm thời gian hoàn thành |
| `POST` | `/api/admin/login` | Public | Xác thực Passcode admin, cấp Cookie phiên HMAC-SHA256 |
| `POST` | `/api/admin/logout` | Admin | Xóa cookie phiên admin |
| `GET` | `/api/admin/analytics` | Admin | Lấy số liệu phân tích Affiliate & xuất file CSV |
| `GET/POST` | `/api/affiliate/postback` | Public (Webhook) | Webhook nhận postback đơn hàng từ mạng affiliate, ghép nối clickId |
| `POST` | `/api/style-advisor/analyze` | Public (Rate Limited) | Phân tích trang phục bằng Gemini Vision/Text, trả về catalog gợi ý |
| `POST` | `/api/style-advisor/track-click` | Public (Rate Limited) | Ghi nhận click affiliate kèm Geo-IP (quốc gia, thành phố) và lưu Supabase |
| `GET` | `/api/geo` | Public | Trả về vị trí địa lý của client từ Edge Headers (Vercel/Cloudflare) |
| `GET/POST` | `/api/wardrobe/sync` | Public | Đồng bộ tủ đồ cá nhân giữa localStorage và Supabase cloud |

---

## 4. Core Mathematical & Architectural Modules (`src/lib/`)
- **`puzzle-engine/`**:
  - `bezier-cutter.ts`: Tạo hình mấu lồi/lỗ khuyết Bézier đối xứng chuẩn xác toán học.
  - `disjoint-set.ts`: Cấu trúc dữ liệu Union-Find tối ưu hoá grouping và batch moving.
  - `sound.ts`: Bộ tổng hợp âm thanh Web Audio API offline (click gỗ & victory chime).
- **`canvas/`**:
  - `puzzle-canvas.ts`: Vòng lặp 60fps điều phối kéo thả, Camera World-to-Screen Matrix, Pinch-to-zoom 2 ngón, Snap nam châm.
- **`affiliate/`**:
  - `amazon-live-client.ts`: Tích hợp tìm kiếm Amazon US thời gian thực (Rainforest API -> RapidAPI -> Static Catalog).
  - `click-tracker.ts`: Ghi nhận click/conversion hai tầng (In-memory ring buffer + Supabase PostgreSQL).
- **`wardrobe/`**:
  - `lookbook-generator.ts`: Vẽ thẻ Lookbook Story 9:16 Canvas độ nét cao.
  - `sharing.ts`: Đóng gói và bóc tách danh sách sản phẩm tủ đồ qua URL params.
- **`i18n/`**:
  - Đảm bảo 100% dictionary key parity giữa 7 thứ tiếng: EN (mặc định), VI, JA, FR, DE, ES, ZH.
- **`security/`**:
  - Next.js Edge Middleware (`middleware.ts`) chặn trái phép `/admin` và `/api/admin/*`.
  - HTTP Security Headers: Content-Security-Policy (CSP) đa tầng, X-Frame-Options, HSTS, Permissions-Policy.

# 🔍 Báo Cáo Audit Toàn Diện: Behavioral Model, Refactor & Security Architecture

> **Dự án**: CunFashion Full Stack (`puzzle-tung`)  
> **Thời gian thực hiện**: 18/09/2026  
> **Phương pháp luận**: `/behavior-model-debugger` (Steve Ruiz Methodology) kết hợp `/vibe-engineering-workflow` & `/vibe-git-manager`.  
> **Production Live URL**: [https://cunfashion.com](https://cunfashion.com) | [https://cunfashion.com/style-advisor](https://cunfashion.com/style-advisor)  
> **Rollback Anchor**: `45e4eb5`

---

## 1. 🌐 Tổng Quan Dự Án & Bức Tranh Tính Năng (Holistic Overview)

### Dữ Liệu Đã Quét & Phân Tích
- **Hệ sinh thái**: Next.js 15.5 App Router, React 19, Tailwind CSS, Supabase SSR & Realtime Co-Op.
- **Tài liệu & Kế hoạch**: `CONTEXT.md`, `docs/PHASE_6_*.md`, `.codegraph/`, `.env.local`.
- **Phạm vi kiểm tra**:
  1. Jigsaw Puzzle Core Engine (`puzzle-engine-architect`)
  2. Co-Op Realtime Multiplayer (`realtime-room.ts`)
  3. Lookbook & E-Commerce Vouchers (`puzzles-data.ts`, `sharing-invariants.test.mjs`)
  4. Cun Style Advisor (Web App & API `/api/style-advisor/analyze`)
  5. Google Chrome Extension (Manifest V3 trong `extension/cun-style-advisor/`)
  6. Admin Portal & Authentication Security (`admin-session.ts`, `middleware.ts`)

---

## 2. 🎮 Tái Tạo Mô Hình Hành Vi Người Dùng (Reconstructed Behavioral Model)

### A. Tương Tác Jigsaw Puzzle Engine
- **Hành vi kéo thả (Drag & Drop)**: Sử dụng Pointer Events (`pointerdown`, `pointermove`, `pointerup`). Đảm bảo `setPointerCapture` để không bị đứt quãng khi chuột rời khỏi canvas.
- **Tổ hợp phím & Modifiers**:
  - `Space + Drag`: Pan khung hình tự do.
  - `Wheel`: Zoom mượt mà theo tâm con trỏ chuột (World-to-Screen inverse projection).
  - `R / Click quay`: Xoay mảnh ghép 90° từng nấc (`rotation: 0 -> 90 -> 180 -> 270`).
- **Xử lý ngắt quãng (Interruptions & Lifecycle)**:
  - Khi nhấn phím `Escape` giữa chừng khi đang kéo: Vị trí cụm mảnh ghép lập tức rollback về tọa độ an toàn trước đó (`tests/puzzle-invariants.test.mjs`).
  - Khi xảy ra `window.blur` (Alt-Tab hoặc đổi cửa sổ): Cờ `isDragging` tự động reset để tránh kẹt trạng thái (stuck pointer state).

### B. Tương Tác Cun Style Advisor & Chrome Extension
- **Upload & Xem trước (Preview)**:
  - Hỗ trợ kéo thả ảnh vào Dropzone hoặc chọn file từ thiết bị.
  - **Tối ưu hóa Canvas Compression**: Tự động scale và nén ảnh về chuẩn 1200px max dimension, chất lượng 82% trước khi chuyển đổi sang base64 data URL. Điều này giảm dung lượng từ ~10MB xuống < 200KB, ngăn chặn hoàn toàn lỗi HTTP 413 Payload Too Large khi gửi lên Vercel Serverless Function.
- **Chrome Extension Context Menu**:
  - Click chuột phải vào ảnh thời trang bất kỳ (Shopee, TikTok Shop, Pinterest, Zara) -> Extension lưu URL ảnh vào `chrome.storage.local`.
  - Toast thông báo tức thì hiển thị trên góc phải trang web đang lướt mà không gây ảnh hưởng đến DOM của website gốc.
  - Khi mở Extension Popup: Tự động nạp ảnh vừa chọn và gợi ý ngay set đồ phối hợp kèm link affiliate.

---

## 3. 💥 Ma Trận Va Chạm Luật Chơi (Invariant Collision Matrix)

| Cặp tính năng giao thoa | Nguy cơ va chạm tiềm ẩn | Biện pháp giải quyết đã áp dụng | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Ảnh lớn (10MB+)** vs **Vercel Serverless (4.5MB limit)** | HTTP 413 error khi upload ảnh độ phân giải cao từ điện thoại | Thêm bộ nén Canvas client-side giảm 95% payload trước khi gửi | ✅ Đã khắc phục & Test pass |
| **In-Memory Rate Limiter** vs **Long-Running Memory Leak** | `Map<string, Entry>` phình to vô hạn nếu hàng nghìn bot/crawler quét | Thêm cơ chế **Auto-pruning**: Khi map > 500 entries, tự động quét và xóa sạch các key đã hết hạn TTL | ✅ Đã refactor & Test pass |
| **Amazon CDN Images** vs **Strict Content Security Policy (CSP)** | Ảnh sản phẩm Amazon (`m.media-amazon.com`) bị trình duyệt chặn hiển thị do thiếu CSP directive | Mở rộng directive `img-src` trong `next.config.mjs` hỗ trợ `https:` và các domain Amazon CDN | ✅ Đã cấu hình & Live pass |
| **Co-Op Room Snapping** vs **Simultaneous Piece Move** | 2 người chơi cùng kéo 1 mảnh ghép cùng lúc dẫn đến race condition | Khóa quyền điều khiển mảnh ghép (`lockedBy: playerId`) qua Supabase Realtime broadcast channel | ✅ Đã kiểm chứng qua test |

---

## 4. 🛡️ Báo Cáo Kiểm Tra An Ninh & Mã Nguồn (Security & Code Audit)

### 1. Zero Secrets in Git (Tuân thủ tuyệt đối Vibe Git Manager)
- Toàn bộ secret (`GITHUB_TOKEN`, `VERCEL_TOKEN`, `ADMIN_MASTER_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) được lưu trữ an toàn trong `.env.local` và không bị theo dõi bởi Git.
- Lịch sử Git hoàn toàn sạch, không có token lộ lọt.

### 2. Header Bảo Mật (Next.js Security Headers)
- Đã kích hoạt đầy đủ:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
  - `Content-Security-Policy (CSP)`: Giới hạn chặt chẽ `default-src 'self'`, `script-src 'self' 'unsafe-eval' 'unsafe-inline'`.

### 3. Phòng Chống Injection & XSS
- Dữ liệu điểm số và tên người chơi tại `/api/scores` được lọc qua hàm sanitize chống XSS HTML tags (`tests/api-routes.test.mjs`).
- Session Token của Admin được ký mã HMAC SHA-256 kèm timestamp hết hạn, chống giả mạo payload.

---

## 5. 🚀 Trạng Thái Kiểm Thử & Triển Khai Thực Tế

### Kết Quả Unit & Invariant Tests (44/44 Passed 100%)
```bash
> node --test tests/*.test.mjs

✔ Admin Auth: Valid HMAC token should verify successfully
✔ Admin Auth: Tampered signature must fail verification
✔ Admin Auth: Tampered payload must fail verification
✔ Admin Auth: Expired token must be rejected
✔ Admin Auth: Token signed with different secret must be rejected
✔ Admin Passcode: Exact match passes and incorrect passcodes fail
✔ Rate Limiter Logic: Blocks IP after exceeding max attempts
✔ Middleware Logic: Route protection and mutation gate matrix
✔ API: GET /api/daily should return today's daily puzzle
✔ API: GET /api/puzzles should support category and query filters
✔ API: GET and POST /api/scores should persist and sort leaderboard entries
✔ API: POST /api/scores should sanitize XSS tags and enforce input validation
✔ E-Commerce: Sample fashion puzzles must have valid voucher and product info
✔ DisjointSet: should merge pieces correctly and maintain groups
✔ Edge Generation: guarantees outer boundaries are flat and adjacent edges are complementary
✔ Camera Matrix: screenToWorld and worldToScreen are exact inverses across zooms and pans
✔ Magnetic Snap Invariant: World Space Euclidean distance remains invariant under any camera zoom
✔ Drag Interruption Invariant: Escape key and window blur cleanly roll back cluster positions
✔ Realtime Multiplayer Room Engine Invariants
✔ Custom Puzzle Sharing & Alignment Invariants
✔ Custom puzzle security: rejects private and loopback IP hosts
✔ Multiplayer Co-Op: cluster translation preserves relative distances between members
✔ Amazon Associates Tag: cuncute-20 verification
✔ Style Advisor Engine: US Market Generation with Detected Items
✔ Chrome Extension: Manifest V3 validation
ℹ tests 44 | suites 2 | pass 44 | fail 0
```

### Bằng Chứng Live URL Verification
- **Production Alias**: `https://cunfashion.com` -> `HTTP 200 OK`
- **Cun Style Advisor**: `https://cunfashion.com/style-advisor` -> `HTTP 200 OK`
- **Standalone Demo**: `https://cunfashion.com/cun-style-advisor.html` -> `HTTP 200 OK`
- **Vercel Deployment ID**: `dpl_HoHcDZcnZiFbsmzXNVWW9xFyQkkd`

## 6. 🛠️ Cập Nhật Fix Lỗi Layout & Đồng Bộ Hóa Giao Diện (Post-Deployment Hotline)
- **Nguyên nhân gốc (Root Cause) lỗi layout trên `cun-style-advisor.html`**:
  File HTML ban đầu dùng link external CDN `<script src="https://cdn.tailwindcss.com">` và `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/...">`. Do `next.config.mjs` có CSP header nghiêm ngặt (`script-src 'self'`), trình duyệt trên live domain `https://cunfashion.com` đã chặn toàn bộ script và style từ CDN bên ngoài, dẫn đến file HTML bị mất toàn bộ styling.
- **Biện pháp khắc phục triệt để**:
  1. Đã nhúng 100% **CSS nội bộ (self-contained inline CSS)** vào `public/cun-style-advisor.html`, loại bỏ hoàn toàn mọi phụ thuộc vào CDN bên ngoài. Trang web hiện hiển thị đẹp mắt, đầy đủ responsive và không bao giờ bị CSP chặn.
  2. Đồng bộ hóa 100% giao diện giữa `https://cunfashion.com/style-advisor` và `https://cunfashion.com/cun-style-advisor.html` về tông màu sáng thanh lịch, form 5 tiêu chí chuẩn mực từ Google Doc của Đại Ka, có sẵn nút nạp nhanh ảnh mẫu Blazer Đỏ, và bộ switcher linh hoạt `[ 🖥️ Wide ]` / `[ 📱 Mobile ]`.
  3. **Chuẩn hóa Supabase Leaderboard Schema (`/api/scores`)**: Tự động chuyển đổi các trường snake_case từ Supabase DB (`player_name`, `elapsed_seconds`, `piece_count`) sang chuẩn camelCase (`playerName`, `elapsedSeconds`, `pieceCount`) để hiển thị đầy đủ tên người chơi trên bảng xếp hạng mà không bị undefined.
  4. **Gia cố kiểm thử HMAC Signature**: Sửa đổi cơ chế test giả mạo signature để thay đổi byte dữ liệu thực tế thay vì byte padding, đảm bảo kiểm thử toàn vẹn 100% (44/44 tests passed).
- **Live Verification**: Toàn bộ hệ thống đều trả về **HTTP 200 OK**, kích thước đầy đủ, giao diện đồng nhất 1:1.

---

## 7. 🚀 Milestone 6.7: Triển Khai Live Production & Live Gemini 3.6 Flash Audit

> **Thời điểm xác minh**: 18/09/2026  
> **Vercel Production Deployment ID**: `dpl_5r4n4sherKMUEa9BzECtTTL8uJwk`  
> **Production Live URL**: [https://cunfashion.com](https://cunfashion.com)  
> **Style Advisor Direct URL**: [https://cunfashion.com/style-advisor](https://cunfashion.com/style-advisor)  
> **Vercel Direct URL**: [https://puzzle-tung-21phyzzgy-gosoniccapital-2747s-projects.vercel.app](https://puzzle-tung-21phyzzgy-gosoniccapital-2747s-projects.vercel.app)

### Bằng Chứng Kiểm Thử Trực Tiếp (Live Production HTTP & API Tests)

1. **Kiểm Tra Trực Tiếp Endpoint Web:**
   - `GET https://cunfashion.com` $\rightarrow$ **HTTP 200 OK**
   - `GET https://cunfashion.com/style-advisor` $\rightarrow$ **HTTP 200 OK**
   - `GET https://puzzle-tung-21phyzzgy-gosoniccapital-2747s-projects.vercel.app/style-advisor` $\rightarrow$ **HTTP 200 OK**

2. **Kiểm Tra Trực Tiếp API AI Phân Tích Ảnh Thật Trên Production:**
   - Request: `POST https://cunfashion.com/api/style-advisor/analyze`
   - Payload: Ảnh outfit Base64, occasion: `casual`, style: `classic`, market: `US`
   - Response Status: **HTTP 200 OK**
   - Kết quả phản hồi từ Google Gemini:
     - `success`: `true`
     - `source`: `"gemini-vision"` (Kích hoạt mô hình thực tế **`models/gemini-3.6-flash`**)
     - `headline`: `"Classic Camel Knit and Tailored Neutrals"`
     - `suggestedProducts`: 4 sản phẩm curated Amazon US
     - `tag`: Tự động gắn mã đối tác Amazon Associates **`cuncute-20`** trên 100% link sản phẩm!

3. **Bảo Mật Git & Token (Zero Secret Leak):**
   - File `.env.local` chứa credentials nhạy cảm tuyệt đối không bị commit vào Git.
   - `GITHUB_TOKEN` và `VERCEL_TOKEN` được bảo mật nghiêm ngặt.
   - Mã nguồn trên branch `feature/fullstack-puzzle-foundation` đã đồng bộ hoàn toàn với GitHub origin.


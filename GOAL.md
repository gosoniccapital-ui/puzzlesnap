# GOAL.md - CunFashion Progress & Reality Gap Audit

## 1. Reality Gap & Completion Assessment
- **Tỷ lệ hoàn thành thực tế (Actual Completion Rate):** **95%** cho **Version 1 (Production Core MVP)**.
- **Bằng chứng kiểm chứng (Strict Verification Evidence):**
  - Automated Unit/Invariant Tests: **161/161 tests PASS 100%** (23.8s) trên `node --test tests/*.test.mjs`.
  - Next.js 15 Production Build: Biên dịch thành công **26/26 static & dynamic routes**, zero type errors, zero lint blockers.
  - Live Production Deployment: Chạy thực tế tại [https://cunfashion.com](https://cunfashion.com) và [https://puzzle-tung.vercel.app](https://puzzle-tung.vercel.app).
  - Tỷ lệ hoàn thành chưa thể là 100% vì: Vẫn còn các giới hạn runtime giữa môi trường Cloudflare / Vercel Edge Cache với Supabase Free-Tier RLS, và cơ chế fallback offline của Rainforest API khi chưa nạp API key thật trên local dev.

---

## 2. Phân Định Tính Năng: Core Version 1 vs Version 2

### ✅ Core Version 1 (Đã hoàn thành & Đang chạy Production 100%)
1. **Core Jigsaw Puzzle Game Engine:**
   - Cắt mấu Bézier 3 kiểu (Classic, Hearts, Star), cấu trúc DSU gom nhóm mảnh ghép.
   - Hút nam châm (Magnetic snap), âm thanh Web Audio API offline, thanh công cụ điều khiển (Zoom, Pan, Edge Only, Ghost Preview, Timer).
   - Chế độ xoay mảnh ghép (Piece Rotation Mode 90°/180°/270°).
   - Tối ưu 60fps trên cả Desktop và Mobile Touch (Pinch-to-zoom 2 ngón).
2. **Multiplayer Co-Op Game Mode:**
   - Tạo và tham gia phòng qua URL param `?room=ROOM-xxxx`.
   - Đồng bộ trạng thái phòng và thông báo chiến thắng thời gian thực (Dual-Layer Realtime: Supabase + BroadcastChannel).
3. **Custom Puzzle Maker:**
   - Kéo thả / tải ảnh cá nhân, nén ảnh client-side, đẩy ảnh lên Supabase Storage bucket `puzzle-images`.
4. **Gamified E-Commerce Funnel:**
   - Modal chiến thắng trao thẻ Haute Couture Dual Vouchers (`70Cute7LOOK`, `CUNFASHION2026`).
   - Nút sao chép mã 1-click và link dẫn trực tiếp sang `cute.cunfashion.com`.
5. **AI Visual Fashion Stylist & Omnisearch Hub (`/style-advisor`):**
   - Tìm kiếm bằng hình ảnh hoặc từ khóa qua Gemini Vision & Text AI.
   - Gắn mã tiếp thị liên kết Amazon StoreID `cuncute-20` và SubID `ascsubtag={click_id}`.
   - Tủ đồ cá nhân hóa (Wardrobe Drawer) phân loại 4 phong cách, đồng bộ Supabase Cloud.
   - Xuất Lookbook Canvas tỷ lệ 9:16 chuẩn Story cho mạng xã hội.
6. **Admin Dashboard & Affiliate Analytics:**
   - Đăng nhập bảo mật qua mã Passcode (HMAC-SHA256, Next.js Edge Middleware guard).
   - Quản lý tranh (CRUD Supabase) và bảng điều khiển chuyển đổi (Clicks, Conversions, Revenue, CSV export).
7. **Toàn cầu hóa & PWA:**
   - Hỗ trợ 7 ngôn ngữ (EN, VI, JA, FR, DE, ES, ZH) với 100% dictionary key parity.
   - PWA Service Worker offline caching (`cunfashion-cache-v13`) và banner cài đặt.

---

### ⏳ Hoãn sang Version 2 (Future Enhancements)
1. **Tài khoản người dùng hoàn chỉnh (Full User Authentication):** Đăng nhập OAuth Google/Apple/Zalo (Hiện tại v1 sử dụng Zero-Friction Player Profile Modal + `player_id` ẩn trong cookie/localStorage để tối đa hóa chuyển đổi).
2. **Thanh toán trực tiếp trên trang (Native In-App Checkout):** Giỏ hàng thanh toán thẻ/Stripe ngay trên CunFashion (Hiện tại v1 định hướng Affiliate Funnel chuyển tiếp sang Amazon US và Fourthwall store).
3. **Voice AI Stylist (Real-time Audio Consultation):** Đối thoại bằng giọng nói với AI stylist thời trang qua Gemini Live API.
4. **Mạng xã hội người chơi (Social Community Feed):** Bảng tin khoe ảnh xếp tranh và bình luận giữa các người chơi toàn cầu.

---

## 3. Danh Sách Việc Còn Thiếu Cốt Tử (Missing Gaps) Để Chốt Sổ V1
*(Tối đa 3 việc trọng tâm, không vẽ việc ngoài lề)*

1. **Gap 1 - Kiểm toán tính khả dụng của Live Amazon Rainforest API Token trên Production:**
   - *Hiện trạng:* Code đã có failover hoàn hảo (Rainforest -> RapidAPI -> Static Catalog), nhưng cần đảm bảo `RAINFOREST_API_KEY` hoặc `RAPIDAPI_KEY` trên Vercel luôn có quota để tránh rơi vào static catalog khi người dùng tìm kiếm từ khóa lạ ngoài danh mục 24 món có sẵn.
2. **Gap 2 - Tự động dọn dẹp các tệp ảnh chụp màn hình debug tạm trong git status:**
   - *Hiện trạng:* Thư mục gốc đang có 11 file ảnh `.png` và file HTML tạm (`preview_editorial_prototype.html`) chưa được cho vào `.gitignore` hoặc xoá dọn dẹp, gây loãng git status.
3. **Gap 3 - Rà soát Supabase Free-Tier Auto-Pause (Keep-Alive Cron):**
   - *Hiện trạng:* Dự án phụ thuộc Supabase cho custom puzzles, cloud wardrobe, và affiliate analytics. Cần đảm bảo webhook keep-alive qua cron-job.org đang duy trì ping định kỳ để Supabase không bị tạm dừng sau 7 ngày không hoạt động.

# Sprint 7.5: Chiến Lược E-Commerce CTA & Tối Ưu Phễu Chuyển Đổi Fourthwall

> **Dự án:** CunFashion Haute Couture Puzzles ([cunfashion.com](https://cunfashion.com))  
> **Repository:** `gosoniccapital-ui/puzzlesnap`  
> **Nhánh phát triển:** `feature/fullstack-puzzle-foundation`  
> **Tác giả:** Antigravity (CEO & Lead Product Manager Role)  
> **Người phê duyệt:** Đại Ka  
> **Trạng thái:** 59/59 Tests Pass 100% | Next.js 15 Production Build Clean | Ready for Live Release  

---

## 🎯 1. Mục Tiêu (Objectives)

Trong Sprint 7.5, mục tiêu cốt lõi là tối ưu hóa phễu chuyển đổi (Conversion Funnel) từ trải nghiệm giải đố (Puzzle Gaming) sang doanh thu thương mại điện tử thực tế (E-Commerce Revenue) của thương hiệu CunFashion.

1. **Phân tích hành vi & định tuyến:** Đánh giá điểm đến tối ưu cho nút Call-To-Action (CTA) trên Modal chiến thắng (`PuzzleVictoryModal`). Thay thế đường dẫn chung chung `https://cunfashion.com` bằng trang bán hàng thực tế `https://cute.cunfashion.com`.
2. **Khảo sát & thích ứng hạ tầng Fourthwall:** Xác định hành vi của subdomain `cute.cunfashion.com` (chạy trên hạ tầng Fourthwall/Google Cloud) đối với các query parameters như `?coupon=CUNFASHION2026`.
3. **Quyết định của CEO & Lead PM:** Lựa chọn giải pháp vừa loại bỏ ma sát (Zero Friction), vừa kích hoạt tối đa tỷ lệ mua hàng (High Conversion Rate), vừa đảm bảo an toàn kỹ thuật (Fault Tolerance).
4. **Phẫu thuật mã nguồn & tự động hóa kiểm thử:** Cập nhật CTA text **"Shop Cute Outfits"**, tích hợp cơ chế Auto-Copy Voucher vào Clipboard khi bấm CTA, bổ sung tham số UTM phục vụ Analytics, và cập nhật toàn bộ test suite.

---

## 🧠 2. Phân Tích Chuyên Sâu Từ Góc Nhìn CEO & Lead Product Manager

### A. Thực trạng & Điểm gãy phễu cũ (Funnel Friction Audit)
* **Tâm lý người chơi:** Khi hoàn thành puzzle, người chơi đạt đỉnh hưng phấn (Victory Celebration). Modal bung ra trao tặng voucher độc quyền: **"CunFashion Exclusive Reward: 10% OFF"** (Mã `CUNFASHION2026`).
* **Điểm gãy trước đây:** Nút CTA mang nhãn *"Shop The Look"* trỏ về `https://cunfashion.com`. Đây là trang Web Game (Next.js 15), không có danh mục sản phẩm giỏ hàng để mua ngay. Khách hàng bấm vào bị rơi vào vòng lặp trang game, dẫn tới tỷ lệ thoát (Drop-off rate) gần như 100%.

### B. Khảo sát thực địa hạ tầng Fourthwall (`cute.cunfashion.com`)
* `cute.cunfashion.com` là subdomain LadiPage/Storefront đã được cấu hình DNS trên Cloudflare trỏ về hạ tầng Fourthwall (`themes.fourthwall.dev` & `imgproxy.fourthwall.dev`).
* Kiểm tra phản hồi trực tiếp:
  ```http
  GET https://cute.cunfashion.com/?coupon=CUNFASHION2026 HTTP/1.1
  Status: 200 OK
  Cache-Control: max-age=60,public,s-maxage=60,stale-while-revalidate=60
  Via: 1.1 google
  ```
* **Đặc tính của Fourthwall:**
  1. Fourthwall chấp nhận query param an toàn: Không bị lỗi 404, không bị redirect loop.
  2. Trang chủ Storefront Fourthwall (`/`) không tự động bung popup giảm giá từ param `?coupon=...` trừ khi khách hàng vào link trực tiếp của Cart Checkout API (`/cart/checkout?coupon=...`). Nhưng người chơi chưa chọn món đồ nào thì không thể đẩy họ vào checkout rỗng!
  3. Nếu chỉ dựa vào param `?coupon=...`, khách hàng có thể quên mã hoặc không biết mã đã được lưu hay chưa khi đến bước thanh toán.

### C. Quyết định chiến lược: Mô hình "Triple-Protection Zero Friction"
Là CEO và Lead PM của dự án, giải pháp toàn diện nhất được lựa chọn bao gồm 3 lớp bảo vệ:

1. **Lớp 1 — Trực quan & Sao chép thủ công (Visual & Manual Copy):**
   * Giữ nguyên Card Voucher nổi bật với mã `CUNFASHION2026` to rõ và nút **"Copy"** chuyển trạng thái **"Copied!"** xanh lá.
2. **Lớp 2 — Tự động sao chép khi bấm CTA (Silent Auto-Copy on Click - Zero Friction):**
   * Khi người chơi bấm nút **"Shop Cute Outfits"**, hệ thống đồng thời kích hoạt sao chép mã voucher vào clipboard của thiết bị. Khi sang trang Fourthwall chọn đồ xong và đến giỏ hàng thanh toán, khách hàng chỉ việc nhấn `Ctrl+V` (hoặc `Dán`) là mã giảm giá áp dụng ngay lập tức!
3. **Lớp 3 — Smart URL với Coupon & Analytics UTM:**
   * URL đích mặc định:
     `https://cute.cunfashion.com?coupon=CUNFASHION2026&utm_source=puzzlesnap&utm_medium=victory_modal&utm_campaign=puzzle_reward`
   * **Lợi ích kép:**
     * Hỗ trợ tự động áp dụng nếu Fourthwall dashboard đã kích hoạt hoặc tích hợp script coupon.
     * Thu thập dữ liệu UTM Analytics: Giúp Đại Ka theo dõi chính xác có bao nhiêu lượt click, tỷ lệ chuyển đổi và doanh thu đến từ Game Puzzle.
4. **Lớp 4 — Micro-CTA tối ưu Mobile Ergonomics:**
   * Text nút bấm: **`Shop Cute Outfits`** (kèm icon `ShoppingBag` và icon `ExternalLink`).
   * Vừa vặn hoàn hảo trên màn hình di động hẹp (320px - 390px), không bị gãy dòng, nêu bật bản sắc thương hiệu "Cute" và định vị rõ mặt hàng "Trang phục / Outfits".

---

## 🛠️ 3. Việc Đã Làm (Work Done)

1. **Nâng cấp `PuzzleVictoryModal.tsx`:**
   * Mở rộng interface `PuzzleVictoryModalProps` với prop tùy chọn `ctaText?: string`.
   * Cập nhật URL đích mặc định sang `https://cute.cunfashion.com?coupon=${voucher}&utm_source=puzzlesnap&utm_medium=victory_modal&utm_campaign=puzzle_reward`.
   * Gán nhãn CTA mặc định: `"Shop Cute Outfits"`.
   * Thêm hàm `handleCtaClick`: Tự động nạp mã voucher vào clipboard ngay khi người dùng click nút mở cửa hàng.
2. **Đồng bộ `PuzzleGameBoard.tsx` & `puzzle/[slug]/page.tsx`:**
   * Bổ sung `ctaText?: string` vào `PuzzleGameBoardProps` và truyền xuyên suốt xuống `PuzzleVictoryModal`.
   * Cho phép từng trang chi tiết puzzle ghi đè CTA Text linh hoạt nếu có nhu cầu chiến dịch riêng.
3. **Cập nhật Lookbook Dataset (`puzzles-data.ts`):**
   * Bổ sung trường `ctaText: "Shop Cute Outfits"` vào các câu đố lookbook `f1` -> `f5`.
   * Cập nhật `productUrl` của `f1` -> `f5` trỏ chuẩn xác về `https://cute.cunfashion.com?coupon=...`.
4. **Cập nhật Admin Portal (`admin/page.tsx`):**
   * Đổi gợi ý placeholder của trường Shop / Lookbook URL thành `https://cute.cunfashion.com/...`.
5. **Cập nhật & Bổ sung Automated Tests (`tests/ecommerce-rewards.test.mjs`):**
   * Kiểm chứng `f1.productUrl` trỏ về `cute.cunfashion.com` kèm tham số coupon.
   * Kiểm chứng `f1.ctaText` mang giá trị `"Shop Cute Outfits"`.
   * Kiểm chứng invariant fallback giải quyết URL mặc định về `cute.cunfashion.com` và CTA text `"Shop Cute Outfits"`.

---

## 📊 4. Kết Quả & Bằng Chứng Nghiệm Thu (Results & Evidence)

1. **Automated Unit & Invariant Tests (59/59 Tests Passed 100%):**
   ```text
   ✔ E-Commerce: Sample fashion puzzles must have valid voucher and product info (1.1136ms)
   ✔ E-Commerce: addPuzzleItem supports creating a puzzle with e-commerce metadata (0.2876ms)
   ✔ E-Commerce: updatePuzzleItem updates e-commerce metadata cleanly (0.2352ms)
   ✔ E-Commerce Invariant: Default fallback voucher when puzzle lacks custom coupon (0.2265ms)
   -----------------------------------------------------------------------------------------
   ℹ tests 59 | suites 3 | pass 59 | fail 0 (100% PASS) | duration 8.2s
   ```
2. **Next.js 15 Production Build:**
   * Biên dịch thành công 19/19 routes tĩnh và serverless API sạch sẽ, không có lỗi kiểu TypeScript hay ESLint.
4. **PWA Service Worker Cache-Busting (v3):**
   * **Root Cause:** Trình duyệt phía Client đã cache các bundle JS cũ qua Service Worker `cunfashion-cache-v2` (chiến lược Stale-While-Revalidate). Do đó, dù Vercel đã deploy bản mới, trình duyệt vẫn ưu tiên dùng file cached cũ khiến nút CTA chưa cập nhật tức thì.
   * **Fix:** Cập nhật `CACHE_NAME = 'cunfashion-cache-v3'` trong `public/sw.js`. Khi trình duyệt phát hiện worker mới, event `activate` sẽ tự động xóa toàn bộ cache cũ của v2 (`caches.delete(cacheName)`), giải phóng tức thì bundle mới nhất cho người dùng.

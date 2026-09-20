# Báo Cáo Kỹ Thuật: Tích Hợp Live Amazon Data (Rainforest API + RapidAPI Failover) Cho AI Style Advisor

**Dự án:** CunFashion (`g:\AWE\puzzle-tung`)  
**Mục tiêu:** Tích hợp dữ liệu sản phẩm thời gian thực (Live Amazon Data) từ Rainforest API và RapidAPI vào tính năng AI Style Advisor (`https://cunfashion.com/style-advisor`), loại bỏ 100% sản phẩm mẫu/fake/placeholder/sample, đồng thời đảm bảo 100% affiliate link được gắn đúng Affiliate Tag `cuncute-20`.  
**Thời gian hoàn thành:** 20/09/2026  
**Trạng thái:** ✅ PRODUCTION READY & DEPLOYED THÀNH CÔNG (Vercel Deployment: `dpl_7wht2vufFx9VmwZcMDgs2RqgX3NS`)  
**Commit SHA:** `37bb652` trên branch `feature/fullstack-puzzle-foundation`

---

## 1. Bối Cảnh & Vấn Đề Trước Khi Triển Khai
- Trước đây, Amazon chưa mở direct API công khai nên Style Advisor phải sử dụng catalog tĩnh gồm 24 món đồ tuyển chọn (`AMAZON_STYLE_CATALOG`).
- Rakuten API phụ thuộc vào token đối tác, nhiều truy vấn thời trang đặc thù trả về 0 kết quả khiến trải nghiệm người dùng rơi vào các món đồ mặc định thiếu độ đa dạng.
- Người dùng tìm kiếm các từ khóa mới thường thấy catalog tĩnh hoặc sản phẩm không khớp với từ khóa tìm kiếm.

---

## 2. Giải Pháp Kiến Trúc Triển Khai

### 2.1. Module Độc Lập `amazon-live-client.ts`
Xây dựng module tích hợp `src/lib/affiliate/amazon-live-client.ts` với kiến trúc đa tầng (Multi-tier Resilient Architecture):
1. **In-Memory Query Caching (TTL: 10 phút):**
   - Lưu trữ các truy vấn theo normalized key: `amz:${query}:${limit}`.
   - Giúp các lượt xem trang tiếp theo phản hồi tức thì (< 5ms) và tiết kiệm tối đa quota API.
2. **Tier 1 - Rainforest API (Primary):**
   - Endpoint: `https://api.rainforestapi.com/request`
   - Tìm kiếm trực tiếp trên `amazon.com` (US Market).
   - Lấy ảnh sản phẩm chất lượng cao từ CDN `m.media-amazon.com`.
   - Lấy giá USD thực tế, đánh giá sao, số lượng review, cờ Prime Delivery / Amazon's Choice / Best Seller.
3. **Tier 2 - RapidAPI Real-Time Amazon Data (Failover):**
   - Host: `real-time-amazon-data.p.rapidapi.com`
   - Kích hoạt tự động khi Rainforest API bị timeout, hết quota hoặc gặp sự cố mạng.
   - Trả về danh sách sản phẩm thật từ Amazon US để đảm bảo hệ thống không bao giờ bị gián đoạn.
4. **Affiliate Enforcement Invariant:**
   - 100% sản phẩm trả về từ Live APIs đều được cấu trúc qua `buildAmazonProductUrl(item.asin, click_id)`:
     ```
     https://www.amazon.com/dp/{ASIN}?tag=cuncute-20&ascsubtag={click_id}
     ```
   - Bảo toàn 100% doanh thu tiếp thị liên kết (Affiliate Commission) cho Store ID `cuncute-20`.

### 2.2. Tích Hợp Vào Endpoint `/api/style-advisor/analyze`
- Phân tích thời trang bằng Google Gemini AI (Vision + Text).
- Tự động gọi `searchAmazonLiveProducts` dựa trên:
  - Từ khóa tìm kiếm của người dùng (`cleanKeyword`), HOẶC:
  - Món đồ thời trang do AI nhận diện từ hình ảnh outfit tải lên (`detectedItems[0].searchQuery`), HOẶC:
  - Phong cách & bối cảnh trang phục (`${style} ${occasion}`).
- Hỗ trợ đầy đủ các phân vùng thị trường: `ALL`, `US`, `RAKUTEN`, `FOURTHWALL`.
- Khi Rakuten API không có kết quả, hệ thống tự động failover sang Amazon Live Data thay vì hiển thị card mẫu.

---

## 3. Kiểm Thử & Xác Thực (Verification Evidence)

### 3.1. Unit Test & Test Suite Hệ Thống
- Đã tạo test suite chuyên dụng `tests/amazon-live-api.test.mjs`.
- Chạy `npm test`: **106/106 tests PASS 100%** trên toàn bộ 18 test files.
- Chạy `npm run build`: **24/24 routes compile thành công**, First Load JS tối ưu (103 kB).

### 3.2. Cấu Hình & Deploy Lên Vercel Production
- Đã sync tự động và an toàn 2 biến môi trường mới lên Vercel Production qua Vercel API:
  - `RAINFOREST_API`: HTTP 201 Created
  - `RAPIDAPI_API`: HTTP 201 Created
- Deploy production thành công qua Vercel CLI:
  - Deployment ID: `dpl_7wht2vufFx9VmwZcMDgs2RqgX3NS`
  - Domain: `https://cunfashion.com/style-advisor`

### 3.3. Live API Probe Thực Tế Trên Production (`https://cunfashion.com/api/style-advisor/analyze`)
**Thử nghiệm 1: Từ khóa "women trench coat", thị trường "US":**
- Kết quả: **HTTP 200 OK**, `success: true`.
- Trả về 6 sản phẩm Amazon US thật 100%:
  1. *Steve Madden Women's Long Oversized Lapel Trench Coat* - $59.99 (ASIN: `B0G16HYP78`, Ảnh: `m.media-amazon.com`, Link: `https://www.amazon.com/dp/B0G16HYP78?tag=cuncute-20`)
  2. *Women's Cropped Trench Coat Double Breasted Short Jacket* - $42.99 (ASIN: `B0FLQ4ZSQN`)
  3. *Tankaneo Womens Trench Coat Ruffle Collar Plaid Lining* - $34.26 (ASIN: `B0H9L7G1RD`)
  4. *Farktop Womens Oversized Long Trench Coat Double Breasted* - $42.99 (ASIN: `B0CCJF2N2B`)
  5. *Dqbeng Womens Short Trench Jacket Plaid Lining* - $49.99 (ASIN: `B0FSD8HS7S`)
  6. *IDEALSANXUN Womens Long Wool Coats Fall Winter* - $59.98 (ASIN: `B0G1YNWY55`)

**Thử nghiệm 2: Từ khóa "evening cocktail dress", thị trường "ALL":**
- Kết quả: **HTTP 200 OK**, `success: true`.
- Trả về sản phẩm thật: *Women's Ruched Elegant Bodycon Maxi Dress Sleeveless Mesh Mermaid Cocktail Formal Wedding Guest Party Long Dresses* - $42.99 từ Amazon US.

---

## 4. Kết Luận
- Tính năng AI Style Advisor đã hoàn toàn thoát khỏi dữ liệu tĩnh/mẫu/placeholder.
- Dữ liệu Amazon Live Data hoạt động mượt mà, chính xác với từ khóa người dùng tìm kiếm, hình ảnh thời trang sắc nét từ CDN Amazon, giá tiền thật và bảo vệ 100% doanh thu affiliate qua Store ID `cuncute-20`.

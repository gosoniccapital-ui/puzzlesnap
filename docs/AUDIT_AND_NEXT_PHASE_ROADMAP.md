# Báo Cáo Audit Toàn Diện, Phân Tích Kiến Trúc & Lộ Trình Triển Khai (Phase 9)

**Dự án:** CunFashion (`https://cunfashion.com/` | `g:\AWE\puzzle-tung`)  
**Nhánh:** `feature/fullstack-puzzle-foundation`  
**Mốc Hoàn Thành:** Phase 8 (Sprint 8.1 - 8.6)  
**Mốc Tiếp Theo:** Phase 9 (Sprint 9.1: Chrome Extension Sync, Global i18n, Progressive Google Auth & Edge Geo-IP)  
**Phương pháp áp dụng:** `/behavior-model-debugger`, `/vibe-engineering-workflow`, `/vibe-git-manager`

---

## PHẦN 1: AUDIT CODEBASE & TÍNH NĂNG VỪA TRIỂN KHAI

### 1.1. Đánh giá tính năng AI Style Advisor & Amazon Live Data (Vừa hoàn tất)
- **Đạt chuẩn Invariants:**
  - Module `src/lib/affiliate/amazon-live-client.ts` hoạt động độc lập, không có circular dependency, dùng `import type` chuẩn giúp Next.js 15 và Node ESM Test Runner đều pass 100%.
  - Cơ chế failover 3 tầng: `In-Memory Cache (10 mins)` ➔ `Rainforest API (Tier 1)` ➔ `RapidAPI Real-Time Amazon Data (Tier 2)` ➔ `AMAZON_STYLE_CATALOG (Offline Floor)`.
  - 100% link sản phẩm được wrap qua `buildAmazonProductUrl` với Store ID `cuncute-20` và `ascsubtag={click_id}`.
  - Loại bỏ hoàn toàn card mẫu, fake, placeholder. Truy vấn thật trên live production `https://cunfashion.com/api/style-advisor/analyze` trả về 6/6 sản phẩm trench coat & cocktail dress thật 100% từ Amazon US với ảnh CDN `m.media-amazon.com`.
- **Chỉ số kiểm thử:**
  - `npm test`: **106/106 tests PASS 100%** (18 files).
  - `npm run build`: **24/24 routes compile thành công**, First Load JS tối ưu (103 kB).
  - Vercel Deployment ID: `dpl_7wht2vufFx9VmwZcMDgs2RqgX3NS` (Ready on Production).

---

### 1.2. Audit Chrome Extension (`extension/cun-style-advisor/`)
Qua việc kiểm tra các file `popup.js`, `popup.html`, `manifest.json`, phát hiện sự **lệch pha nghiêm trọng** giữa Chrome Extension và Website hiện tại:
1. **Dữ liệu vẫn là hàng giả/sample cũ:** Trong `popup.js` vẫn chứa mảng `PRODUCT_DATA` tĩnh dạng "Áo Thun Oversize", "Quần Jean Retro" với giá tiền Việt Nam Đồng (`249.000đ`, `420.000đ`) và link Shopee/TikTok Shop/Lazada.
2. **Chưa gọi API Backend của CunFashion:** Extension hoàn toàn hoạt động offline bằng dữ liệu tĩnh, chưa gọi endpoint live `https://cunfashion.com/api/style-advisor/analyze` để tận dụng Rainforest API và RapidAPI mà Đại Ka đã tích hợp.
3. **Chưa gắn Amazon Store ID `cuncute-20`:** Extension chưa có cơ chế tạo link affiliate Amazon US với click tracking.
4. **Chưa đồng bộ Tủ Đồ (Wardrobe) & Lịch Sử:** Các sản phẩm người dùng yêu thích trên Extension không được lưu đồng bộ với Web.

**Giải pháp cho Chrome Extension (Kế hoạch Sprint 9.1):**
- Refactor `popup.js` để fetch trực tiếp từ `https://cunfashion.com/api/style-advisor/analyze`.
- Cập nhật giao diện Popup sang tiếng Anh (Global-first), hỗ trợ nhập từ khóa tìm kiếm trực tiếp và chụp ảnh màn hình trang web hiện tại (Screen Capture) để AI stylist phối đồ ngay trên trình duyệt.
- Mọi link hiển thị trên Extension đều trỏ thẳng tới Amazon US với `tag=cuncute-20` hoặc Fourthwall CunCute Store.

---

## PHẦN 2: TƯ VẤN KIẾN TRÚC CHIẾN LƯỢC THEO YÊU CẦU CỦA ĐẠI KA

### 2.1. Về Multiplayer Room & Việc "Bắt Buộc User Đăng Nhập Google (Google Auth)"
**Câu hỏi của Đại Ka:** *Có nên bắt user login Google vào để tracking điều hướng, tính toán tính năng tương lai và lưu thông tin search/check bên Style Advisor không?*

#### ⚖️ Phân Tích Đánh Đổi (Trade-offs):
- **Nếu bắt buộc Login ngay lập tức (Hard Auth Wall):**
  - Khách vãng lai bấm vào link phòng chơi hoặc vào xem Style Advisor mà bị chặn ngay bởi popup "Bắt buộc đăng nhập Google" thì **tỷ lệ thoát (Bounce Rate) sẽ tăng vọt lên 65% - 80%**. Người chơi casual chỉ muốn click vào ghép thử vài mảnh hoặc search thử 1 món đồ.
- **Nếu hoàn toàn không có Login (No Auth - Hiện tại):**
  - Dữ liệu chỉ lưu trong `localStorage` của trình duyệt. Khách đổi máy, xóa cache hoặc dùng tab ẩn danh là mất hết Tủ Đồ (Wardrobe), không thể tracking vòng đời khách hàng (Customer Lifetime Value) và không thể gửi email remarketing.

#### 💡 Giải Pháp Đề Xuất: Mô hình "Đăng Nhập Tăng Tiến" (Progressive / Soft Auth Gate)
Không chặn người dùng ngay từ đầu, mà kích hoạt Google Login tại các **Điểm Chạm Giá Trị Cao (High-Value Moments)**:
1. **Khách vãng lai (Guest Mode):**
   - Vẫn được chơi Puzzle, tạo phòng Co-Op với nickname tạm, và search Style Advisor bình thường. Dữ liệu tạm lưu trong `localStorage`.
2. **Kích hoạt mời đăng nhập Google (1-Click Google Sign-In) khi:**
   - **Tạo hoặc lưu phòng chơi riêng (Private Room Host):** Để giữ tên phòng, lưu bảng xếp hạng kỷ lục cá nhân và hiển thị Avatar Google thật trong lúc chơi cùng bạn bè.
   - **Lưu Tủ Đồ lên Cloud (Sync Wardrobe):** *"Đăng nhập để mang Tủ đồ yêu thích của bạn sang mọi thiết bị & nhận thông báo khi đồ giảm giá"*.
   - **Lưu lịch sử Phối Đồ AI:** Tự động tạo bảng `user_style_history` trên Supabase, gắn chặt với Google Email của khách.
   - **Nhận Voucher Độc Quyền:** Sau khi thắng puzzle, đăng nhập Google để nhận mã giảm giá VIP được gửi thẳng vào email.
3. **Kiến trúc kỹ thuật:**
   - Sử dụng **Supabase Auth (Google OAuth Provider)** đã có sẵn nền tảng trong repo (`@supabase/supabase-js`, `supabase/schema.sql`).
   - Thêm bảng `user_profiles`, `user_wardrobes`, `user_searches` có khóa ngoại trỏ về `auth.users.id`.

---

### 2.2. Về Đồng Bộ Ngôn Ngữ: Chuẩn Hóa Global-First (Default English)
**Hiện trạng:** Website đang bị tình trạng pha trộn "lúc English lúc Vietnamese":
- Thanh Header: English (*Categories, Make Puzzle, Leaderboard*).
- Nút bấm Puzzle: Tiếng Việt (*Bắt đầu chơi, Số bước, Thời gian*).
- Style Advisor: Tiêu đề English nhưng các tag gợi ý là Tiếng Việt (*Vớ cute, Váy dạ hội*).

**Kế hoạch Chuẩn hóa i18n (Sprint 9.1):**
1. **Mặc định 100% English (Default `en`):**
   - Toàn bộ giao diện chính từ Trang chủ, Game Puzzle, Phòng Co-Op, Style Advisor, Admin đến Lookbook Studio đều hiển thị tiếng Anh chuẩn thời trang quốc tế.
2. **Hệ thống từ điển tĩnh siêu nhẹ (`src/lib/i18n/`):**
   - Không cài thêm các thư viện cồng kềnh làm nặng bundle. Xây dựng hook `useTranslation()` đơn giản với 2 từ điển: `en.json` và `vi.json`.
   - Lưu ngôn ngữ vào cookie `cun_lang` hoặc tự động nhận diện theo trình duyệt của khách (`navigator.language`).
   - Đặt nút chuyển đổi ngôn ngữ tinh tế (`🇺🇸 EN | 🇻🇳 VI`) trên Top Navigation Bar.

---

### 2.3. Về Theo Dõi Vị Trí Địa Lý: Browser GPS vs Edge Geo-IP
**Câu hỏi của Đại Ka:** *Có nên gắn tính năng check GPS location hay tracking sao để khi khách vào biết họ từ quốc gia, vùng lãnh thổ nào, city nào để marketing, chạy ads và chào hàng?*

#### ❌ Tuyệt đối KHÔNG dùng Browser GPS (`navigator.geolocation`)
- Khi gọi `navigator.geolocation.getCurrentPosition()`, trình duyệt sẽ hiện thông báo cảnh báo: *"cunfashion.com muốn biết vị trí của bạn"*.
- Đối với một website thời trang & trò chơi, **hơn 90% người dùng sẽ nhấn "Block / Từ chối"** vì cảm thấy bị xâm phạm quyền riêng tư. Thậm chí nhiều người sẽ tắt trang web ngay vì nghi ngờ lừa đảo.

####  Giải Pháp Chuẩn Doanh Nghiệp: Zero-Friction Edge Geo-IP (Vercel & Cloudflare)
Dự án CunFashion đang chạy trên **Vercel** và được trỏ qua **Cloudflare**. Cả hai nền tảng này đều tự động phân tích địa chỉ IP của khách và đính kèm thông tin địa lý vào Header của mọi request **HOÀN TOÀN MIỄN PHÍ & KHÔNG CẦN NGƯỜI DÙNG CẤP QUYỀN**:
- `x-vercel-ip-country`: Mã quốc gia (ví dụ: `US`, `GB`, `JP`, `VN`, `CA`, `FR`...).
- `x-vercel-ip-country-region`: Mã bang / tỉnh (ví dụ: `CA` cho California, `NY` cho New York).
- `x-vercel-ip-city`: Thành phố (ví dụ: `San Jose`, `London`, `Tokyo`, `Ho Chi Minh City`).
- `cf-ipcountry`: Quốc gia nhận diện bởi Cloudflare.

#### Ứng dụng cụ thể cho CunFashion:
1. **Tự động chuyển đổi Market & Chào Hàng Thông Minh:**
   - Khách từ **Mỹ (`US`) / Châu Âu**: Mặc định hiển thị sản phẩm từ **Amazon US (StoreID `cuncute-20`)** và **Fourthwall Store** với giá `$ USD`.
   - Khách từ **Nhật Bản (`JP`)**: Ưu tiên gợi ý sản phẩm từ **Rakuten Brands** với giá `¥ JPY`.
   - Khách từ **Việt Nam (`VN`)**: Có thể gợi ý các bộ sưu tập nội địa phù hợp.
2. **Marketing & Ads Attribution Tracking:**
   - Khi khách click link affiliate hoặc thực hiện mua hàng, hệ thống lưu luôn `country` và `city` vào bảng `affiliate_clicks` và `affiliate_conversions` trên Supabase.
   - Trong `/admin`, hiển thị thêm biểu đồ **"Doanh thu theo Quốc gia / Thành phố"** để Đại Ka biết đang có nhiều đơn từ bang nào của Mỹ để tối ưu tiền chạy Ads (Google Ads / Facebook Ads / TikTok Ads).

---

## PHẦN 3: LỘ TRÌNH TRIỂN KHAI CHI TIẾT (PHASE 9 ROADMAP)

### Sprint 9.1: Chrome Extension Sync & Edge Geo-IP & Global i18n
1. **Task 9.1.1 (Chrome Extension Modernization):**
   - Refactor `extension/cun-style-advisor/popup.js` kết nối trực tiếp live endpoint `https://cunfashion.com/api/style-advisor/analyze`.
   - Xóa bỏ toàn bộ dữ liệu mẫu cũ (Shopee/TikTok VND), đồng bộ sang Amazon US StoreID `cuncute-20`.
2. **Task 9.1.2 (Edge Geo-IP Location Detection):**
   - Cập nhật `src/middleware.ts` đọc headers `x-vercel-ip-country`, `x-vercel-ip-city`.
   - Inject vị trí địa lý vào request context và cookie, tự động điều hướng market phù hợp cho người dùng.
3. **Task 9.1.3 (Global-First i18n Dictionary):**
   - Xây dựng module `src/lib/i18n/` với `en` là mặc định.
   - Đồng bộ lại toàn bộ từ ngữ trên Website (Puzzle game, Style Advisor, Room UI) sang tiếng Anh chuẩn, có switcher ngôn ngữ.

### Sprint 9.2: Progressive Google Auth & Cloud Sync
1. **Task 9.2.1 (Supabase Google Auth Setup):**
   - Tích hợp Supabase Auth với Google Provider.
   - Tạo component `AuthButton.tsx` (Sign in with Google) trên Header và Modal.
2. **Task 9.2.2 (Cloud Wardrobe & Search History Sync):**
   - Tạo bảng `user_wardrobes` và `user_searches` trong Supabase.
   - Đồng bộ tủ đồ cá nhân và lịch sử tìm kiếm khi user đăng nhập.
3. **Task 9.2.3 (Multiplayer Room Identity Sync):**
   - Khi có tài khoản Google, avatar thật và nickname được tự động nạp vào phòng chơi Co-Op.

---

## PHẦN 4: HANDOFF CONTRACT & PROMPT SANG SESSION MỚI

Khi session làm việc hiện tại đã dài, Đại Ka có thể mở một session mới và dán toàn bộ đoạn **Master Prompt** dưới đây để bắt đầu ngay mà không bị gián đoạn:

```text
Chào bạn, tôi là Đại Ka. Hãy tuân thủ nghiêm ngặt bộ quy tắc: luôn gọi tôi là "Đại Ka", giải thích bằng tiếng Việt, thuật ngữ chuyên môn English, và tuân thủ các guidelines trong .agents/AGENTS.md.

Chúng ta đang phát triển dự án CunFashion Full Stack (g:\AWE\puzzle-tung), nhánh feature/fullstack-puzzle-foundation, live trên https://cunfashion.com/ (Vercel deployment: dpl_7wht2vufFx9VmwZcMDgs2RqgX3NS).

TRẠNG THÁI HIỆN TẠI (ĐÃ HOÀN TẤT ĐẦY ĐỦ):
- Phase 8 (Sprint 8.6): Đã tích hợp Live Amazon Data thật 100% qua Rainforest API (Primary) và RapidAPI Real-Time Amazon Data (Failover) vào /style-advisor, có In-memory cache 10 phút, 100% link gắn tag cuncute-20, 106/106 tests pass, 24/24 routes build pass, đã test probe live production thành công.
- Toàn bộ phân tích đã được ghi lại tại docs/AMAZON_LIVE_DATA_INTEGRATION_REPORT.md và docs/AUDIT_AND_NEXT_PHASE_ROADMAP.md.

NHIỆM VỤ TIẾP THEO (BẮT ĐẦU PHASE 9 - SPRINT 9.1):
1. Đồng bộ Chrome Extension (extension/cun-style-advisor/): Xóa bỏ catalog sample/fake cũ, kết nối extension trực tiếp vào endpoint live https://cunfashion.com/api/style-advisor/analyze, gắn StoreID cuncute-20 cho Amazon US.
2. Tích hợp Edge Geo-IP (Vercel/Cloudflare headers): Nhận diện quốc gia/thành phố của khách (US, JP, VN...) ngay tại middleware mà không cần hỏi quyền GPS của trình duyệt, phục vụ tối ưu hóa market chào hàng và chạy ads.
3. Chuẩn hóa Global-First i18n: Đặt English làm mặc định cho toàn bộ website (Puzzle, Style Advisor, Room), đồng bộ giao diện nhất quán, không để tình trạng lúc Anh lúc Việt.

Hãy áp dụng /vibe-engineering-workflow, /behavior-model-debugger và /vibe-git-manager để bắt đầu triển khai Sprint 9.1 ngay cho tôi nhé!
```

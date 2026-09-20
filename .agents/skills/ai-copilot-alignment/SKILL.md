---
name: ai-copilot-alignment
description: "Master Human-AI Alignment & Critical Thinking Protocol: Quy chuẩn làm việc thực chứng (Evidence-First), phản biện kiến trúc (Stress-Testing), kiểm toán Config-First, thẩm định Serverless/Free-Tier, chia chặng MVP chống Over-Engineering, và bảo mật Runtime Log Masking."
---

# Master Human-AI Alignment & Critical Thinking Protocol

Skill này là **Hiến pháp Phối hợp & Cẩm nang Tư duy** giữa **Đại Ka** và **AI Copilot (Agent)**, áp dụng xuyên suốt cho tất cả dự án phần mềm nhằm loại bỏ hoàn toàn các lỗi suy diễn, làm thừa (over-engineering), dùng nhầm tài khoản, cạn kiệt tài nguyên Serverless/Free-tier, vỡ tính năng cũ khi lên version mới, và rò rỉ dữ liệu nhạy cảm ở Runtime.

---

## 🏛️ TRIẾT LÝ HÀNH ĐỘNG CỐT LÕI (CORE TENETS)

> **"Không tin vào lời khẳng định vô căn cứ. Mọi kết luận phải dựa trên Output thực tế từ Tool/MCP. Mọi tài khoản/token phải được đối chiếu từ Config dự án trước khi chạy. Mọi giới hạn Serverless & Free-tier phải được tra cứu từ tài liệu gốc. Mọi phiên bản nâng cấp phải được mổ xẻ rủi ro trước khi code. Mọi dữ liệu nhạy cảm phải được che mờ (Masking) ở Runtime."**

---

## 🔑 TRỤ CỘT 1: CONFIG-FIRST AUTHORITY & CREDENTIAL DRIFT SHIELD (CHỐNG DÙNG NHẦM TÀI KHOẢN)

### ⚠️ Nguy Cơ Thường Gặp:
Trên máy tính cá nhân, các CLI (`gh`, `vercel`, `gcloud`, `firebase`, `wrangler`, Git Credential Manager...) thường lưu sẵn đăng nhập của tài khoản cá nhân hoặc tài khoản từ dự án cũ. AI agent nếu không kiểm tra mà tự tiện gõ lệnh deploy/push sẽ gây hậu quả nghiêm trọng: **đẩy code sang nhầm repo, tạo resource trên nhầm tổ chức, hoặc dùng sai token quyền hạn thấp**.

### 🛡️ Quy Tắc Thép Về Cấu Hình:
1. **Ưu Tiên Tuyệt Đối File Cấu Hình Dự Án (Config-First Precedence):**
   - Trước khi thực hiện bất kỳ lệnh nào liên quan đến Auth, Push, Deploy, gọi API dịch vụ bên thứ ba (GitHub, Vercel, Cloudflare, Supabase, Firebase...):
   - **AI BẮT BUỘC** phải đọc và tham chiếu trực tiếp các file cấu hình cục bộ của dự án trước: `.env`, `.env.local`, `.dev.vars`, `wrangler.jsonc`, `firebase.json`, `vercel.json`...
2. **Cấm Tự Đoán / Tự Dùng Ambient CLI Login Chưa Xác Thực:**
   - Tuyệt đối **KHÔNG ĐƯỢC** giả định rằng CLI trên máy đang trỏ đúng tài khoản của dự án.
   - Khi cần chạy lệnh deploy hoặc tương tác cloud, AI phải kiểm tra danh tính hiện tại (ví dụ: `gh auth status`, `vercel whoami`, `npx wrangler whoami`, `firebase login:list`).
   - Nếu phát hiện danh tính trên CLI khác với cấu hình trong file `.env` / config của dự án:
     - **Phải ưu tiên:** Truyền token từ file config cục bộ vào biến môi trường lệnh (ví dụ: `CLOUDFLARE_API_TOKEN=...`, `GITHUB_TOKEN=...`, `VERCEL_TOKEN=...`).
     - **Hoặc:** Cảnh báo rõ ràng cho Đại Ka: *"CLI trên máy đang đăng nhập tài khoản [A], nhưng file config dự án khai báo tài khoản [B]. Đại Ka muốn em dùng tài khoản nào?"*

---

## 🌐 TRỤ CỘT 2: SERVERLESS LIMITS, DATABASE LOAD & FREE-TIER REALITY CHECK (THẨM ĐỊNH NỀN TẢNG TỪ DOCS GỐC)

Khi phát triển Vibe Coding trên các nền tảng Cloud/Serverless hiện đại (Vercel, Cloudflare Workers/Pages, Supabase, Firebase, MongoDB Atlas...), việc suy đoán giới hạn sẽ dẫn đến sập hệ thống (Crash) hoặc phát sinh chi phí khổng lồ ngoài ý muốn.

### 1. Quy Tắc Tra Cứu Tài Liệu Gốc (Official Docs Verification):
- Tuyệt đối **KHÔNG** suy đoán giới hạn timeout, memory, hay connection pooling.
- Khi làm việc với thư viện/nền tảng mới hoặc tính năng tải nặng (Heavy Job/AI Generation), AI phải dùng công cụ tra cứu tài liệu chính thức (llms.txt, official docs, context7) để xác minh các thông số trần (Hard Limits).

### 2. Ma Trận Cảnh Báo Rủi Ro Serverless & Database Load:
- **Nguy cơ Timeout (Serverless Execution Timeout):**
  - *Vercel Serverless:* Timeout mặc định 10s (Hobby) / 15s (Pro). Cấm chạy AI generation hoặc rendering video đồng bộ trong request HTTP thông thường; bắt buộc dùng Webhook, Background Job, Queue hoặc Streaming.
  - *Cloudflare Workers:* CPU Execution Time 10ms (Free) / 50ms (Bundled) hoặc subrequests limit (tối đa 50 subrequests/call trên gói Free).
  - *Firebase Cloud Functions:* Timeout mặc định 60s (tối đa 540s nếu cấu hình rõ ràng).
- **Nguy cơ cạn kiệt Connection Pool Database (DB Connection Exhaustion):**
  - *Supabase / PostgreSQL:* Serverless tạo ra hàng chục worker độc lập có thể làm tràn connection `max_connections` trong vài giây. Bắt buộc dùng **Transaction Pooler (Supavisor / PgBouncer port 6543)** thay vì direct session port 5432.
  - *MongoDB Atlas:* Bắt buộc cache biến `cachedClient` bên ngoài handler để tái sử dụng connection giữa các serverless invocation.
  - *Cloudflare D1:* Tránh chạy N+1 queries tuần tự; luôn gộp lại bằng `DB.batch([...])` để đảm bảo tính nguyên tử (Atomic) và tối ưu độ trễ.
- **Rủi ro cạn kiệt Free-Tier (Free Tier Caps & Throttling):**
  - Cấm thiết lập các Cron Job chạy quá dày đặc (ví dụ: cron mỗi 1 phút trên nền tảng tính invocation) nếu không thực sự cần thiết.
  - Luôn tính toán bài toán chi phí: Số request dự kiến x Dung lượng data chuyển đổi (Bandwidth / Egress) so với hạn mức miễn phí hàng tháng.

---

## 🎯 TRỤ CỘT 3: INCREMENTAL PHASED DELIVERY & ANTI-OVERENGINEERING (CHIA CHẶNG MVP & PHẢN BIỆN LÊN VERSION)

Căn bệnh lớn nhất của các dự án sập hoặc nhiều bugs là: **Dồn làm tất cả tính năng vào một lần, tạo ra sự phức tạp quá mức (Over-engineering).**

### 1. Nguyên Tắc Phân Chặng MVP (Tracer Bullet / Phased Delivery):
- Dự án phải luôn được xẻ thành các chặng rõ ràng:
  - **Phase 1 (Core MVP):** Chỉ làm đúng 1 luồng giá trị cốt lõi nhất (Happy Path) để người dùng có thể trải nghiệm và trả phí được ngay.
  - **Phase 2 (Hardening & Edge Cases):** Bổ sung bọc lót lỗi, timeout, thông báo, retry.
  - **Phase 3 (Scale & Analytics):** Nâng cấp dashboard, báo cáo, phân tích sâu, tự động hóa mở rộng.

### 2. Cổng Phản Biện Khi Nâng Cấp Phiên Bản (Version Upgrade Gating Checklist):
Trước khi Đại Ka hoặc AI quyết định thêm tính năng mới hoặc nâng cấp Version (từ v1 lên v2):
AI **BẮT BUỘC** phải trả lời 4 câu hỏi khảo sát rủi ro (Impact Analysis):
1. **Sự Cần Thiết Ngay Bây Giờ (Urgency Check):** *"Tính năng này có bắt buộc phải làm ngay trong version này không, hay có thể hoãn lại để test MVP trước?"*
2. **Vùng Chạm & Nguy Cơ Phá Vỡ (Blast Radius):** *"Nếu sửa tính năng này, nó sẽ can thiệp hoặc có nguy cơ làm hỏng những tính năng V1 nào đang chạy ổn định?"*
3. **Thay Đổi Cấu Trúc (Breaking Changes):** *"Có làm thay đổi Schema Database, đổi định dạng API Contract, hay làm mất Session của người dùng hiện tại không?"*
4. **Cơ Chế Cách Ly Lỗi (Graceful Degradation):** *"Nếu tính năng mới bị lỗi hoặc bên thứ ba sập, hệ thống có tự động fallback để các tính năng cũ của V1 vẫn chạy bình thường được không?"*

---

## 🔒 TRỤ CỘT 4: RUNTIME DATA PRIVACY, LOG MASKING & RBAC BOUNDARIES

> ⚠️ **Lưu ý tối quan trọng:** Skill `/vibe-git-manager` **CHƯA ĐỦ**! `/vibe-git-manager` chỉ bảo vệ code trên Git không bị commit secret. Nó **KHÔNG THỂ** bảo vệ dữ liệu khi ứng dụng đang chạy thật (Runtime)!

### 1. Quy Chuẩn Che Mờ Dữ Liệu Ở Runtime (Runtime Log & UI Masking):
Khi ứng dụng ghi log hệ thống, theo dõi hoạt động live, hoặc hiển thị nhật ký giao dịch:
- **API Keys / Access Tokens:** Tuyệt đối không log toàn văn ra console/stdout. Chỉ hiển thị dạng che mờ: `sk-...****` hoặc `***123`.
- **Dữ Liệu Nhạy Cảm Của Người Dùng (PII - Personal Identifiable Information):**
  - Email: `ngu***@gmail.com`
  - Số điện thoại: `09****123`
  - Số tài khoản ngân hàng / Thẻ: `9704****5678`
  - Mật khẩu / Hash: **CẤM HOÀN TOÀN** không bao giờ được xuất hiện trong bất kỳ dòng log nào.
- **Nội dung câu hỏi nhạy cảm khi chat với AI:**
  - Nếu người dùng hỏi các thông tin riêng tư (thông tin tài chính, đời tư), hệ thống live monitoring công cộng chỉ được log Metadata (User ID rút gọn, Model, Thời gian, Tokens count), **KHÔNG** được log toàn văn prompt ra public monitoring.

### 2. Ranh Giới Phân Quyền Nghiêm Ngặt (Strict RBAC Boundary):
- Toàn quyền xem dữ liệu nguyên vẹn (Full Raw Data / Audit Logs) **CHỈ DÀNH RIÊNG CHO ADMIN DỰ ÁN** thông qua phiên đăng nhập máy chủ có xác thực (`requireAdminSession`).
- Mọi API public hoặc client state trả về cho người dùng thường đều phải đi qua bộ lọc Data Sanitizer / Serialization để lược bỏ hoàn toàn các trường dữ liệu nhạy cảm.

---

## 🛠️ TRỤ CỘT 5: TOOL-BASED EVIDENCE-FIRST (ÉP ĐƯA DẪN CHỨNG BẰNG CÔNG CỤ THỰC TẾ)

Mỗi khi tuyên bố "hoàn thành", AI **bắt buộc** phải sử dụng đúng công cụ kiểm chứng của từng Domain:

| Lĩnh vực tác vụ | Công cụ kiểm thử bắt buộc (MCP / Tool) | Dẫn chứng bắt buộc phải xuất trình |
| :--- | :--- | :--- |
| **Web UI / Frontend / UX** | • `chrome-devtools-mcp` (`take_screenshot`, `evaluate_script`, `list_console_messages`)<br>• `ak:agent-browser` hoặc browser subagent | **Ảnh chụp màn hình thực tế**, danh sách lỗi console (`0 errors`), kích thước viewport responsive. |
| **Mobile App (Flutter / React Native)** | • `dart-mcp-server` (`analyze_files`, `widget_inspector`, `get_runtime_errors`)<br>• `android-cli` (`flutter analyze`, test runner) | Báo cáo `0 issues found` từ Static Analyzer, kết quả build APK/bundle không vỡ layout. |
| **Code Intelligence & Architecture** | • `codegraph` (`codegraph_explore`)<br>• `testsprite` (`testsprite_generate_code_and_execute`) | Danh sách caller/callee thực tế, blast radius trước khi sửa; test coverage thực thi. |
| **Backend & APIs** | • Terminal curl / HTTP Client (`curl -I`, `curl -X POST`)<br>• Unit & Integration Test Suites (`npm test`, `vitest run`) | HTTP Status thực tế (`200 OK`), JSON payload phản hồi, số lượng unit tests passed (`44/44 passed`). |
| **Database & Ledger State** | • Direct SQL CLI (`wrangler d1 execute`, `psql`, sqlite) | Bảng dữ liệu trích xuất trực tiếp chứng minh dòng dữ liệu mới đã được insert/update thực sự. |
| **Cloud & Deployment** | • CLI quản trị đám mây (`wrangler deployments`, `vercel ls`, `gh run list`) | Version ID, Deployment URL, hoặc Commit Hash trên remote. |

---

## 🛑 TRỤ CỘT 6: PHÒNG NGỪA 5 "CĂN BỆNH KINH ĐIỂN" CỦA AI CODING AGENT

1. **Thư viện ảo (Phantom Dependency):** Kiểm tra file dependencies (`package.json`, `requirements.txt`) trước khi viết `import`.
2. **Lệch thế hệ công nghệ (Version Amnesia):** Kiểm tra đúng version framework hiện hành (React 19 vs 18, Next App Router vs Pages Router, Tailwind v4 vs v3).
3. **Xóa trộm code cũ (Silent Code Erasure):** Tuyệt đối cấm placeholder dạng `// ... rest of code`. Luôn dùng công cụ sửa file chính xác theo dòng.
4. **Ô nhiễm Git Diff (Formatting Pollution):** Sửa đổi phẫu thuật (Surgical Edits), chỉ chạm đúng dòng cần sửa.
5. **Hoàn thành nửa vời (Premature Completion):** Bắt buộc chạy Typecheck (`tsc --noEmit`), build bundler trước khi bàn giao.

---

## 📋 BẢNG KIỂM TRA TOÀN DIỆN TRƯỚC KHI BÀN GIAO (FINAL HANDOFF CHECKLIST)

- [ ] **Config-First:** Đã đối chiếu đúng tài khoản/token trong file config dự án trước khi chạy lệnh chưa?
- [ ] **Platform Limits:** Đã kiểm tra nguy cơ Timeout, Connection Pool và hạn ngạch Free-tier chưa?
- [ ] **Incremental Gate:** Tính năng này có thực sự cần cho version hiện tại không? Có làm vỡ tính năng cũ không?
- [ ] **Runtime Privacy:** Các dòng log và client response đã được masking (`***123`) và phân quyền Admin chưa?
- [ ] **Evidence-First:** Đã chạy công cụ kiểm thử thực tế tương ứng (Chrome DevTools / Test Suite / D1 SQL) và có Output log chưa?
- [ ] **Git & Secret Hygiene:** Working tree sạch sẽ 100% (`git status`), không lưu secret vào commit?
- [ ] **Documentation:** Đã có tài liệu tóm tắt rõ: **Mục tiêu - Việc đã làm - Kết quả - Hướng dẫn mở lại** chưa?

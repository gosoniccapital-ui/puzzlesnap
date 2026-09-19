---
name: vibe-git-manager
description: "Safe Git, Branching, PR và Secret Hygiene: kiểm tra policy của repository, bảo vệ staged changes, quét secrets theo nội dung và hướng dẫn rollback có xác nhận."
---

# Vibe Git Manager (Zero-Leak Git & Security Protocol)

Skill này hỗ trợ quản lý Git và giảm rủi ro lộ bí mật. `.gitignore` không thay thế content scan, review hoặc xử lý secret đã tồn tại trong Git history; không được cam kết “zero-leak” hay an toàn tuyệt đối.

---

## 🔒 1. Bộ Template `.gitignore` Chuẩn Bảo Mật & AI Portable

Khi khởi tạo hoặc audit một repository, Agent phải đọc `.gitignore`, policy CI và convention sẵn có trước. Chỉ bổ sung rule tối thiểu theo stack; không ghi đè template của dự án. Baseline tham khảo:

```gitignore
# ==========================================
# 1. BẢO MẬT & CHỐNG BOT QUÉT (TỐI QUAN TRỌNG)
# ==========================================
.env
.env.local
.env.*.local
*.pem
*.key
*.crt
*.p12
*serviceAccountKey*.json
*supabase*.env
credentials.json
client_secret*.json
id_rsa*
*.keystore
*.jks

# ==========================================
# 2. FILE BUILD & BINARY KHÔNG THUỘC RELEASE ASSET
# ==========================================
node_modules/
dist/
build/
out/
.next/
.turbo/
*.apk
*.aab
*.ipa
*.mp4
*.mov
*.avi
*.zip
*.tar.gz
*.7z
*.iso

# ==========================================
# 3. AI AGENTS TEMPORARY CACHE & LOGS
# ==========================================
.gemini/
.claude/
.scratch/tmp/
.agents/logs/
.agents/cache/
.agents/memory/

# ==========================================
# 4. CHỈ WHITELIST PATH ĐÃ ĐƯỢC REVIEW
# ==========================================
!.agents/
!.agents/skills/
!.agents/skills/**
!.agents/workflows/
!.agents/workflows/**
!.agents/AGENTS.md
!.agents/rules/
!.agents/rules/**
```

Không thêm `*firebase*.json` theo mặc định: nhiều dự án cần commit Firebase public configuration. Nếu thư mục `.agents/` bị ignore ở rule khác, chỉ unignore các file đã review và vẫn quét secrets trước commit.

---

## 🌿 2. Chiến Lược Phân Nhánh (Branching & PR Strategy)

Agent tự động đề xuất chiến lược tối ưu nhất:

1. **Small Tasks / Hotfix (Sửa nhỏ / rõ ràng):**
   - Đọc branch protection, CI và convention repository trước. Làm trên branch hiện tại chỉ khi policy cho phép; nếu không, tạo nhánh/PR theo policy đó.
   - Ghi lại **Rollback Anchor** (Commit hash trước khi sửa) vào `CONTEXT.md`.
2. **Large Feature / Risky Refactor (Tính năng lớn / Rủi ro cao):**
   - Tạo nhánh mới theo naming convention của repository.
   - Phát triển và commit từng vertical ticket.
   - Sau khi hoàn thành và chạy qua **Pre-Check Gate** ➜ Tạo PR hoặc Merge về nhánh chính.

---

## 🛡️ 3. Quét Bí Mật Trước Khi Commit (Pre-Commit Secret Scan)

Trước khi `git commit`, Agent **BẮT BUỘC** kiểm tra theo thứ tự:
1. `git status --short` và `git diff --cached --name-only` để xác định chính xác staged files.
2. Đọc `git diff --cached` trong phạm vi an toàn và chạy secret scanner được repository chấp thuận (ví dụ: gitleaks) khi sẵn có.
3. Dùng `git ls-files` khi cần xác định file nhạy cảm đã bị track từ trước. `.gitignore` không có tác dụng với file đã track.
4. Nếu phát hiện khả nghi: dừng commit, báo tên file đã được sanitize; không tự ý unstage, sửa `.gitignore`, xoá file hoặc rewrite history khi chưa có sự đồng ý rõ ràng.

---

## 🔄 4. Kịch Bản Rollback / Backup Khi Có Sự Cố (Zero-Risk Recovery)

- **Lưu mốc an toàn:** Trước khi bắt đầu task lớn, lưu hash commit: `git rev-parse --short HEAD` ghi vào `CONTEXT.md`.
- **Rollback ladder (luôn kiểm tra `git status` và diff trước):**
  1. Với commit đã publish: ưu tiên `git revert <commit>`.
  2. Với thay đổi local cần giữ: tạo backup branch hoặc stash có message sau khi được người dùng đồng ý.
  3. Chỉ dùng hard reset khi người dùng xác nhận rõ phạm vi dữ liệu được phép bỏ.
- **Lệnh destructive, chỉ dùng sau xác nhận rõ:**
  ```bash
  # Hoàn tác sạch về mốc an toàn
  git reset --hard <ROLLBACK_ANCHOR_HASH>
  ```
- **Khi muốn backup branch trước khi thử nghiệm mạo hiểm:**
  ```bash
  # Tạo backup snapshot nhanh
  git branch backup/pre-refactor-$(Get-Date -Format "yyyyMMdd-HHmmss")
  ```

---

## 🔑 5. Quản Lý Biến Môi Trường (Environment Variables)

- Mọi API Key, tokens và private configuration phải được khai báo trong:
  - `.env.local` (ưu tiên cho Next.js / frontend)
  - Hoặc `.env` (được đưa vào `.gitignore`).
- Tạo file mẫu `.env.example` (chỉ chứa tên biến không chứa giá trị thật) để commit lên GitHub cho người khác biết cách cấu hình.

---

## 🛡️ 6. Bộ 3 Nguyên Tắc Kỷ Luật Bất Biến (Identity & Credential Invariants - Anti-Assumption Gate)

Tuyệt đối không được suy đoán tài khoản hay danh tính của người dùng. Mọi Agent **BẮT BUỘC** tuân thủ:

1. **Config First, Never Assume (Kiểm tra file cấu hình trước):**
   - Khi gặp bất kỳ lỗi xác thực nào (`401`, `403`, `Permission Denied`, `Bad Credentials`), việc **ĐẦU TIÊN** phải làm là kiểm tra file cấu hình môi trường cục bộ (`.env.local`, `.env`) xem có chứa token hoặc key xác thực sẵn có không (ví dụ: `GITHUB_TOKEN`, `VERCEL_TOKEN`).
2. **Zero Guessing & Probe-First (Không suy diễn danh tính tài khoản):**
   - Tuyệt đối không suy diễn tài khoản đang đăng nhập từ output lỗi của công cụ hệ điều hành (như Windows Credential Manager).
   - Luôn dùng code kiểm chứng (probe) thực tế trên API của nhà cung cấp (`api.github.com/user`, `api.vercel.com/v2/user`) để xác định chính xác tài khoản đang được cấp quyền.
3. **Safe Authenticated Push (Đẩy mã nguồn an toàn & bảo vệ bí mật):**
   - Khi remote yêu cầu token, nạp token trực tiếp qua URL hoặc Authorization header trong phiên đẩy Git tạm thời, tuyệt đối không ghi token vào `.git/config`, không commit token vào Git history, và không in token ra màn hình terminal (Zero Secrets in Git).
4. **Strict Verification Before Done (Chỉ báo hoàn thành khi có bằng chứng thực tế):**
   - Không bao giờ báo hoàn thành nếu chưa chạy lệnh kiểm thử và kiểm tra mã phản hồi HTTP thực tế trên môi trường live. Mọi mốc hoàn thành đều phải được ghi nhận đầy đủ bằng chứng vào thư mục `docs/` và file `CONTEXT.md`.

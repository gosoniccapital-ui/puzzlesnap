# Báo Cáo Phân Tích Nguyên Nhân Gốc, Rút Kinh Nghiệm & Kế Hoạch Đẩy Mã Nguồn / Deploy Live (Sprint 8.2)

> **Dự án:** CunFashion Full Stack (`gosoniccapital-ui/puzzlesnap`)  
> **Nhánh:** `feature/fullstack-puzzle-foundation`  
> **Người thực hiện:** Antigravity AI Pair Programmer  
> **Người chỉ đạo:** Đại Ka  
> **Ngày lập:** 19/09/2026  

---

## 1. Mục Tiêu

1. **Khắc phục triệt để lỗi suy đoán sai về Git Credential:**
   - Sử dụng chính xác `GITHUB_TOKEN` của tài khoản `gosoniccapital-ui` đã được cấu hình trong `g:\AWE\puzzle-tung\.env.local` để đẩy commit `0e04956` lên GitHub remote an toàn.
2. **Triển khai Production lên Vercel:**
   - Sử dụng `VERCEL_TOKEN` của tài khoản `gosoniccapital-2747` trong `.env.local` để build và deploy live lên `https://cunfashion.com/`.
3. **Verify thực tế trên môi trường Live (Strict Verification):**
   - Probe các endpoints thực tế: `/style-advisor`, `/api/admin/analytics?format=csv`, PWA cache v10. Không báo hoàn thành nếu chưa kiểm chứng trực tiếp.
4. **Xây dựng quy tắc chống tái diễn (Invariant Rule for Identity & Credentials):**
   - Định nghĩa quy trình bắt buộc kiểm tra `.env.local` trước khi suy luận về bất kỳ lỗi phân quyền nào.

---

## 2. Phân Tích Nguyên Nhân Gốc (Root Cause Analysis)

### 🔴 Lỗi phát sinh:
Khi chạy lệnh `git push origin feature/fullstack-puzzle-foundation`, Git trên máy Windows mặc định gọi `git-credential-manager` và sử dụng tài khoản đã cached trong hệ điều hành là `newmylab`. GitHub trả về lỗi:
```text
remote: Permission to gosoniccapital-ui/puzzlesnap.git denied to newmylab.
fatal: unable to access 'https://github.com/gosoniccapital-ui/puzzlesnap.git/': The requested URL returned error: 403
```

### ❌ Sai lầm của Agent:
- Thay vì kiểm tra file cấu hình môi trường cục bộ (`.env.local`) để tìm kiếm token xác thực đã được cấp sẵn, Agent đã **tự suy đoán** rằng tài khoản máy tính của người dùng bị sai và yêu cầu người dùng tự xử lý.
- Đây là hành vi vi phạm nghiêm trọng **Karpathy Guideline #1 (Think Before Coding)** và **Guideline #7 (Anti-Hallucination: Do not guess, check local source and configuration first)**.

### 🔍 Xác thực thực tế từ `.env.local`:
Sau khi kiểm tra trực tiếp qua API:
1. `GITHUB_TOKEN` trong `.env.local`:
   - Xác thực qua `https://api.github.com/user` -> **User: `gosoniccapital-ui`** (Chủ sở hữu repository).
2. `VERCEL_TOKEN` trong `.env.local`:
   - Xác thực qua `https://api.vercel.com/v2/user` -> **User: `gosoniccapital-2747`** (Chủ sở hữu project Vercel).

---

## 3. Quy Trình Kỹ Thuật Xử Lý (Zero-Secrets & Safe Push Protocol)

### Bước 1: Push lên GitHub bằng `GITHUB_TOKEN` an toàn
- Sử dụng Node.js child_process thực thi `git push` truyền token trong URL authenticated động mà **không bao giờ lưu token vào `.git/config`** hoặc in ra terminal log.
- Cú pháp:
  `git push https://<GITHUB_TOKEN>@github.com/gosoniccapital-ui/puzzlesnap.git feature/fullstack-puzzle-foundation`
- Xác nhận trạng thái commit trên remote GitHub PR #1.

### Bước 2: Deploy Production lên Vercel bằng `VERCEL_TOKEN`
- Sử dụng `npx vercel deploy --prod --token <VERCEL_TOKEN> --yes` để đẩy build lên môi trường live.
- Thu thập Deployment ID và Production URL mới.

### Bước 3: Kiểm chứng Live Endpoints (Strict Verification Gate)
- Kiểm tra `https://cunfashion.com/style-advisor` trả về HTTP 200 OK.
- Kiểm tra `https://cunfashion.com/api/admin/analytics?format=csv` tải file CSV có UTF-8 BOM.
- Kiểm tra `https://cunfashion.com/sw.js` trả về cache version `cunfashion-cache-v10`.

---

## 4. Làm Sao Để Tránh Nhầm Lẫn / Suy Đoán Trong Tương Lai?

Để ngăn chặn 100% việc lặp lại sai lầm này, Agent cam kết tuân thủ các quy tắc bất biến sau:

1. **Quy Tắc "Config First, Never Assume" (Kiểm tra file cấu hình trước):**
   - Bất cứ khi nào gặp lỗi liên quan đến Authentication (401, 403, Permission Denied, Token Invalid), Agent **BẮT BUỘC** phải đọc và rà soát các file cấu hình cục bộ (`.env.local`, `.env`) trước khi đưa ra bất kỳ kết luận nào.
2. **Quy Tắc "Zero Guessing" (Không suy đoán thông tin danh tính):**
   - Tuyệt đối không suy diễn tài khoản đang đăng nhập, URL hay token. Luôn dùng code kiểm chứng (probe) thực tế trên API của nhà cung cấp (GitHub API `/user`, Vercel API `/v2/user`).
3. **Quy Tắc "Verify Before Done":**
   - Chỉ được báo DONE sau khi đã có bằng chứng xác thực trực tiếp (live HTTP status, git push output, vercel deployment link).

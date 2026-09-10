---
name: codegraph
description: "Local-first code intelligence & knowledge graph: symbol exploration, call hierarchy, caller/callee tracing, impact analysis, and fast MCP code navigation without grep exploration tax."
---

# CodeGraph Intelligence Protocol

Skill này hướng dẫn Agent và Developer cách khai thác công cụ **CodeGraph** (CLI v1.5.0 + MCP Server) để điều hướng, phân tích tác động và thấu hiểu mã nguồn của dự án một cách chính xác với chi phí token tối thiểu.

## 🎯 Khi Nào Sử Dụng?
- Cần định vị nhanh hàm, class, interface, type definition hoặc routes trong dự án.
- Cần truy vết luồng gọi hàm: Ai gọi hàm này? (`callers`) hoặc Hàm này gọi những hàm nào? (`callees`).
- Phân tích rủi ro trước khi refactor hoặc xóa code: Đổi hàm này sẽ ảnh hưởng tới những file nào? (`impact`).
- Tránh việc quét toàn bộ file bằng `grep` hoặc `find` gây tốn token và tràn context window.

## 🛠️ Công Cụ & Cách Gọi

### 1. Dùng MCP Tool (Ưu tiên trong phiên Agent)
- Gọi tool `call_mcp_tool`:
  - `ServerName`: `"codegraph"`
  - `ToolName`: `"codegraph_explore"`
  - `Arguments`: `{"query": "tên_symbol_hoặc_file"}`

### 2. Dùng Command Line (PowerShell / Terminal)
```bash
# Khởi tạo index cho dự án (chỉ cần chạy 1 lần khi có code mới)
codegraph init .

# Đồng bộ thay đổi mới nhất sau khi sửa mã nguồn
codegraph sync

# Kiểm tra trạng thái index
codegraph status

# Khai phá symbol và luồng gọi
codegraph explore "<symbol_name>"

# Tìm tất cả nơi gọi symbol
codegraph callers <symbol_name>

# Tìm tất cả dependencies mà symbol gọi
codegraph callees <symbol_name>

# Phân tích mức độ ảnh hưởng khi thay đổi symbol
codegraph impact <symbol_name>
```

## 🛡️ Lưu Trữ & Bảo Mật
- Dữ liệu index SQLite được lưu trong thư mục cục bộ `.codegraph/`.
- Thư mục `.codegraph/` đã được cấu hình trong `.gitignore` để không commit dữ liệu index thừa lên git.

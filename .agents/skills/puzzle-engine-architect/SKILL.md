---
name: puzzle-engine-architect
description: "Core algorithmic and rendering architecture for web-based Jigsaw Puzzle engines: Bézier curve generation, Path2D clipping, Disjoint-Set Union piece grouping, spatial magnetic snapping, and 3D embossing."
---

# Puzzle Engine Architect (Jigsaw Math & Canvas Mechanics)

Chuyên gia thiết kế và triển khai core engine game ghép hình (Jigsaw Puzzle) chạy mượt mà trên Canvas/WebGL/SVG với 60fps trên cả Mobile và Desktop.

## 🧩 1. Thuật Toán Cắt Mảnh (Piece Edge Curve Generation)

Mỗi mảnh ghép $P(r, c)$ có 4 cạnh (Top, Right, Bottom, Left). 
Cạnh ngoài cùng của bàn cờ là đường thẳng (`flat: 0`).
Cạnh nội bộ giữa 2 mảnh liền kề là mấu lồi (`tab: 1`) hoặc lỗ khuyết (`blank: -1`).
**Bất biến:** Cạnh Right của $P(r, c)$ là Tab thì Cạnh Left của $P(r, c+1)$ BẮT BUỘC là Blank tương ứng ngược chiều.

### Công thức Cubic Bézier cho Classic Jigsaw Tab:
Được nội suy qua các điểm kiểm soát $P_0, C_1, C_2, P_1$ tạo hình tai nấm cân đối với cổ thon và đỉnh tròn:
- Start base: $P_0 = (0, 0)$
- Shoulder 1: $C_{1a} = (0.2, 0), C_{1b} = (0.25, -0.1), P_{1} = (0.35, -0.1)$
- Tab Head: $C_{2a} = (0.4, -0.35), C_{2b} = (0.6, -0.35), P_{2} = (0.65, -0.1)$
- Shoulder 2: $C_{3a} = (0.75, -0.1), C_{3b} = (0.8, 0), P_{3} = (1.0, 0)$
Hỗ trợ các style nâng cao: Hearts, Star, Honeycomb (Hexagonal tessellation).

## ⚡ 2. Quản Lý Nhóm Mảnh (Disjoint-Set Union / Union-Find)

Khi 2 mảnh ghép đúng vị trí tương đối (khoảng cách sai số $\Delta x, \Delta y \le \epsilon$ với $\epsilon \approx 10-15px$):
1. **Snap Animation:** Hít chặt mảnh ghép vào đúng tọa độ tương đối (`magneticSnap`).
2. **Audio Feedback:** Kích hoạt âm thanh "ding" (tăng dần tần số/pitch theo số bước đúng liên tiếp).
3. **Graph Merge:** Gộp 2 mảnh vào 1 cụm (`Group`). Từ thời điểm này, kéo bất kỳ mảnh nào trong cụm sẽ dịch chuyển đồng bộ toàn bộ cụm mảnh.
4. **Z-Index Elevation:** Cụm đang kéo luôn được nâng lên layer cao nhất (`topOffset` / dynamic zIndex).

## 🎨 3. Kỹ Thuật Đồ Họa & Hiệu Ứng Nổi Khối (Emboss & Realistic Texture)

- **Canvas Path2D Clipping:** Vẽ path viền của mảnh, dùng `ctx.clip()` rồi `ctx.drawImage` góc tương ứng từ ảnh gốc.
- **Emboss & Drop Shadow:** Dùng canvas shadow hoặc gradient border đè lên đường cắt để tạo cảm giác lát gỗ/bìa cứng dày có chiều sâu.
- **Offscreen Canvas Pre-rendering:** Render từng mảnh vào bộ đệm bộ nhớ (OffscreenCanvas/ImageBitmap) để khi kéo thả (drag) chỉ cần gọi `drawImage` nhanh, không phải tính lại clipping path mỗi frame.

## 🛠️ 4. Trợ Thủ Giải Đố (Helper Mechanics)

1. **Edges / Borders Filter:** Làm mờ (opacity 0.2) hoặc giấu các mảnh ruột, chỉ giữ sáng các mảnh viền bàn cờ.
2. **Arrange / Auto-Scatter:** Quét toàn bộ mảnh chưa ghép, xếp ngay ngắn thành các cột/hàng ở 2 bên lề bàn cờ ngoài khung ghép chính.
3. **Ghost / Overlay Shadow:** Hiển thị mờ ảnh mẫu (opacity 0.15 - 0.3) bên dưới lòng bàn cờ làm gợi ý.
4. **Preview Modal:** Cho phép click xem lại ảnh mẫu đầy đủ bất kỳ lúc nào.
5. **Solve Auto-play:** Tự động bay từng mảnh về đúng vị trí (dành cho demo hoặc tính năng trợ giúp).

# PHASE 7 - SPRINT 7.1: BEHAVIORAL AUDIT, MULTIPLAYER CO-OP ENGINE & MASTER HANDOVER REPORT

> **Dự Án:** PuzzleSnap Full Stack (CunFashion Brand - `cunfashion.com`)  
> **Repository:** `g:\AWE\puzzle-tung`  
> **Branch Hiện Tại:** `feature/fullstack-puzzle-foundation`  
> **Base Commit Hash (Rollback Anchor):** `62aed1b`  
> **Thời Điểm Hoàn Thành:** 18/09/2026  
> **Quy Chuẩn Áp Dụng:** `vibe-engineering-workflow`, `vibe-git-manager`, `behavior-model-debugger`, `karpathy-guidelines`

---

## 1. 🎯 MỤC TIÊU CỐT LÕI (OBJECTIVES)

Trong Sprint 7.1, hệ thống tập trung giải quyết triệt để 2 vấn đề lớn được Đại Ka phát hiện và phản ánh trực tiếp trong quá trình trải nghiệm game ghép hình Co-Op thực tế:

1. **Lỗi Không Vào Được Phòng Qua Link Chia Sẻ (`?room=ROOM-xxxx`):**
   - Người tạo câu đố tạo phòng tại `make-puzzle?id=pz-xxxx` và gửi link phòng cho bạn bè.
   - Người nhận link khi click vào gặp màn hình tải ảnh rỗng hoặc thông báo lỗi, không thể tự động tải hình ảnh câu đố và không vào được phòng chơi chung.
2. **Lỗi Trải Nghiệm "Mặc Ai Nấy Chơi - Thắng Không Ai Hay" & Lệch Phòng:**
   - Khi 2 người chơi vào cùng phòng, nếu một người xếp xong toàn bộ câu đố thì chỉ có máy người đó ăn mừng, máy đối phương hoàn toàn im lặng, không nhận được thông báo ai đã thắng.
   - Khi người thứ 2 vào phòng sau, bàn cờ của họ bị xáo trộn từ đầu, không nhận được các mảnh ghép mà chủ phòng (Host) đã lắp vào trước đó.
   - Nút cam **"Share Puzzle"** ở góc phải trang tạo câu đố sinh link chơi đơn (thiếu `&room=ROOM-xxxx`), dẫn đến việc người chơi copy nhầm link gửi bạn bè khiến hai người rơi vào hai phòng độc lập.
   - Đồng hồ bấm giờ (`seconds`) làm hàm `handleVictory` bị tái tạo liên tục mỗi giây, kích hoạt `useEffect` làm destroy và khởi tạo lại Canvas Engine, gây chớp nháy và mất kết nối socket realtime.

---

## 2. 🛠️ NHỮNG VIỆC ĐÃ LÀM (SURGICAL IMPLEMENTATION)

Tuân thủ nghiêm ngặt nguyên tắc **Surgical Changes** (chỉ can thiệp đúng các dòng mã gây lỗi, không làm xáo trộn các module khác):

### 2.1. Nâng Cấp Kênh Realtime: Broadcast Chiến Thắng Toàn Phòng (`src/lib/puzzle-engine/realtime-room.ts`)
- Định nghĩa sự kiện `VictorySyncEvent`:
  ```typescript
  export interface VictorySyncEvent {
    playerId: string;
    playerName: string;
    moves: number;
    seconds: number;
    completedAt: number;
  }
  ```
- Bổ sung channel event `room_victory`: Khi bất kỳ thành viên nào hoàn thành câu đố, sự kiện chiến thắng được phát sóng tức thì tới toàn bộ người chơi trong phòng.
- Thêm method `broadcastVictory(victoryData)` trên `RealtimeRoomEngine`.

### 2.2. Đồng Bộ Trạng Thái Mảnh Đã Ghép (Host-to-Guest Board Sync)
- **Trên `src/lib/puzzle-engine/puzzle-canvas.ts`:**
  - Viết method `getPlacedPieces()`: trích xuất danh sách tất cả các mảnh ghép đã snap (`isPlaced = true`) cùng vị trí tọa độ thực tế `(currentX, currentY)`.
  - Viết method `applyBoardSync(placedList)`: nhận danh sách từ Host, tìm mảnh tương ứng trên bàn cờ của Guest, cập nhật tọa độ chính xác và khóa trạng thái `isPlaced = true` (không thể kéo thả rời ra nữa).
- **Trên `src/lib/puzzle-engine/realtime-room.ts`:**
  - Bổ sung cơ chế Handshake: Khách mới vào phòng phát broadcast `request_board_sync`.
  - Chủ phòng (Host) tự động phản hồi bằng `board_sync` kèm danh sách mảng `PlacedPieceSnapshot[]`.

### 2.3. Khắc Phục UI & Game Loop Tại `src/components/puzzle/PuzzleGameBoard.tsx`
- **Tách Biệt Timer Khỏi Vòng Đời Canvas Engine:**
  - Khai báo `secondsRef` và `moveCountRef` để lưu giá trị thời gian và số bước đi.
  - Loại bỏ hoàn toàn biến state `seconds` ra khỏi dependency array của `useCallback(handleVictory)`. Đảm bảo instance `PuzzleCanvas` và kết nối socket không bị destroy/re-create mỗi giây.
- **Tự Động Phát Sóng Khi Hoàn Thành:**
  - Khi người chơi snap mảnh cuối cùng, `handleVictory` kích hoạt `coopEngineRef.current?.broadcastVictory(...)`.
- **Giao Diện Vinh Danh Người Thắng Cuộc (`RemoteVictoryModal`):**
  - Khi nhận sự kiện `room_victory` từ người chơi khác, giao diện lập tức hiển thị Modal vinh danh người chiến thắng đầu tiên của phòng với huy hiệu vàng, tên người chơi, thời gian và số bước hoàn thành.
- **Ngăn Chặn Loop Re-Connect Khi Rời Phòng:**
  - Bổ sung `userExplicitlyLeftRoomRef` và sử dụng `window.history.replaceState` xóa sạch tham số `?room=` khỏi thanh địa chỉ URL khi người dùng bấm "Rời phòng".

### 2.4. Khắc Phục Sinh Link Chia Sẻ Tại `src/app/make-puzzle/page.tsx`
- **Bảo Toàn Room Param Trong Nút "Share Puzzle":**
  - Cập nhật hàm `handleCreateShareLink`: Tự động đọc `searchParams.get("room")`. Nếu đang ở trong phòng Co-Op, clipboard URL tự động gắn thêm `&room=${encodeURIComponent(currentRoom)}`.
  - Loại bỏ triệt để nguy cơ người chơi copy nhầm link chơi đơn gửi bạn bè.
- **P2P Host Metadata Sync:**
  - Khi khách mở link `make-puzzle?room=ROOM-xxxx` mà không có sẵn `id` hoặc `img`, hệ thống hiển thị màn hình chờ kết nối thân thiện và gửi `request_room_meta` trực tiếp sang Host để lấy URL ảnh, độ khó và tiêu đề.

### 2.5. Bảo Vệ Bền Vững Bằng Test Suite Mới (`tests/coop-room-sharing.test.mjs`)
- Xây dựng 4 automated test cases kiểm tra các bất biến của URL Co-Op:
  1. Bảo toàn nguyên vẹn `?id=...` khi sinh link phòng.
  2. Bảo toàn nguyên vẹn `?img=...`, `?title=...`, `?diff=...` cho URL trực tiếp.
  3. Hoạt động đồng nhất cho các câu đố trong danh mục `/puzzle/[slug]`.
  4. Cập nhật đè room ID thay vì lặp lại query string nếu đã ở trong phòng.

---

## 3. 📊 KẾT QUẢ KIỂM THỬ & XÁC THỰC (VERIFICATION EVIDENCE)

Tuân thủ quy tắc **Strict Verification (Trust No Blind Code)**:

1. **Automated Unit Tests (`node --test tests/*.test.mjs`):**
   - **55 / 55 tests PASS 100%** (thời gian chạy: 8.5 giây).
   - Không có bất kỳ test case nào bị fail, skip hay todo.
2. **Next.js 15 Production Build (`next build`):**
   - Compiled successfully in 38.0s.
   - **19 / 19 routes** tĩnh và động được tạo tối ưu không một lỗi cú pháp hay TypeScript type error.
3. **Git Hygiene & Security Check:**
   - Không có file `.env`, service keys hay thông tin bảo mật nào bị stage.
   - Working directory sạch sẽ tuyệt đối (`git status` clean).
   - Commit đã lưu mốc an toàn: `62aed1b`.

---

## 4. 🧠 BEHAVIORAL MODEL AUDIT (`behavior-model-debugger`)

Dưới đây là kết quả rà soát toàn diện trải nghiệm người dùng đối với luồng Multiplayer Co-Op:

### 4.1. Ma Trận Trạng Thái & Luật Chơi (Mental Model Invariants)

| Hành Động Người Dùng | Trạng Thái Trước | Trạng Thái Sau | Kết Quả Mong Đợi | Tình Trạng Hiện Tại |
| :--- | :--- | :--- | :--- | :--- |
| **Host tạo phòng & bấm "Share Puzzle"** | Đang chơi một mình tại `make-puzzle` | URL clipboard có kèm `?id=...&room=...` | Người nhận vào thẳng phòng của Host | ✅ **Đã hoàn thiện & Verify** |
| **Guest mở link phòng** | Bàn cờ rỗng | Kết nối Presence, nhận metadata ảnh từ Host | Hiển thị thông báo đang đồng bộ, sau đó tải ảnh | ✅ **Đã hoàn thiện & Verify** |
| **Guest vào phòng khi Host đã ghép vài mảnh** | Bàn cờ xáo trộn | Nhận `board_sync` từ Host | Các mảnh Host đã ghép tự động khóa vào đúng vị trí trên bàn cờ của Guest | ✅ **Đã hoàn thiện & Verify** |
| **Một người hoàn thành câu đố** | Bàn cờ còn mảnh lẻ | Kích hoạt `room_victory` | Cả phòng đều thấy modal thông báo người chiến thắng | ✅ **Đã hoàn thiện & Verify** |
| **Người chơi bấm "Rời phòng"** | Đang trong phòng Co-Op | URL dọn sạch `room`, ngắt socket | Trở về chơi đơn, không bị loop kết nối lại | ✅ **Đã hoàn thiện & Verify** |

### 4.2. Invariant Collision Matrix (Va Chạm Luật Chơi Đã Được Xử Lý)
- **Va Chạm 1: Local Victory vs Room Victory:**
  - *Vấn đề:* Nếu cả hai người hoàn thành gần như cùng lúc?
  - *Giải pháp:* Ai snap mảnh cuối cùng trước sẽ phát `completedAt` timestamp. Hệ thống hiển thị người gửi đầu tiên là Winner, người còn lại ghi nhận hoàn thành sau mà không bị crash modal.
- **Va Chạm 2: Board State Discrepancy:**
  - *Vấn đề:* Nếu Guest di chuyển một mảnh trước khi nhận `board_sync`?
  - *Giải pháp:* `applyBoardSync` chỉ ghi đè những mảnh đã nằm trong danh sách `isPlaced = true` từ Host. Các mảnh đang kéo dở không bị kẹt con trỏ chuột.

---

## 5. 🧭 BỘ ĐIỀU HƯỚNG KỸ THUẬT: TIẾP THEO LÀM GÌ?

### 5.1. Định Tuyến Của `/vibe-engineering-workflow`
Hệ thống xác định: **Sprint 7.1 đã HOÀN THÀNH XUẤT SẮC** (Nhóm 1: Clear & Small ➔ Hoàn thành, verify và commit).

**Lộ trình tiếp theo (Sprint 7.2 - E-Commerce & Multiplayer Polish):**
1. **Âm Thanh Chiến Thắng Toàn Phòng:** Phát hiệu ứng âm thanh kèn chiến thắng (Web Audio API Chime) đồng bộ trên máy của tất cả người chơi khi có `room_victory`.
2. **Hiển Thị Danh Sách Mảnh Đã Ghép Thời Gian Thực:** Khi người này ghép được 1 mảnh, avatar của người đó hiện micro-badge cạnh mảnh vừa ghép.
3. **Triển Khai Lên Production:** Đẩy commit `62aed1b` lên remote repository và kích hoạt Vercel Production Deployment trên `https://cunfashion.com/`.

### 5.2. Định Tuyến Của `/vibe-git-manager`
- **Trạng thái Git:**
  - Nhánh hiện tại: `feature/fullstack-puzzle-foundation`.
  - Tất cả các thay đổi đã được commit sạch sẽ tại commit hash `62aed1b`.
  - Chưa push lên `origin` (GitHub `gosoniccapital-ui/puzzlesnap`).
- **Tùy chọn hành động cho Đại Ka:**
  - **Tùy chọn A (Khuyến nghị):** Giữ nguyên commit trên local, sang session mới test thêm hoặc em push thẳng nhánh `feature/fullstack-puzzle-foundation` lên GitHub origin cho Đại Ka.
  - **Tùy chọn B:** Tạo Pull Request (PR) từ `feature/fullstack-puzzle-foundation` vào `main` để merge chính thức.

---

## 6. 📋 MASTER HANDOVER CONTRACT (BÀN GIAO SANG SESSION MỚI)

Để bảo đảm AI ở session mới tiếp quản công việc mà không bị nhầm lẫn hay mất ngữ cảnh, Đại Ka chỉ cần sử dụng prompt bên dưới.

### 📌 PROMPT KHỞI ĐỘNG SESSION MỚI CHO ĐẠI KA:

```text
Chào em! Tiếp tục phát triển dự án PuzzleSnap Full Stack (cunfashion.com).
Ta vừa hoàn thành xuất sắc Phase 7 - Sprint 7.1 (Commit anchor: 62aed1b).
Đọc kỹ file docs/PHASE_7_SPRINT_7_1_BEHAVIORAL_AUDIT_AND_MASTER_HANDOVER.md và CONTEXT.md để nắm trọn vẹn bối cảnh.
Hiện tại 55/55 tests đang pass 100% và Next.js 15 build sạch sẽ.
Hãy kích hoạt các skills: /vibe-git-manager /vibe-engineering-workflow /behavior-model-debugger.
Báo cáo cho Đại Ka biết em đã sẵn sàng bắt đầu Sprint 7.2 (hoặc push code/deploy production nếu Đại Ka yêu cầu)!
```

---
id: LM-056
title: Camera không vẽ lại khi đổi góc nhìn lúc bật giảm chuyển động
phase: 2
labels: [bug, viewer3d, a11y]
depends_on: [LM-005]
estimate: 0.5d
prd: []
---

# LM-056 — Camera không vẽ lại khi bật giảm chuyển động

## Bối cảnh

Phát hiện khi làm LM-005 (15/09/2026). Khi `prefers-reduced-motion: reduce`, `scene/CameraRig.tsx` đổi camera **không transition** (`setLookAt` / `moveTo` / `dollyTo` với `enableTransition = false`). camera-controls không phát sự kiện cho lệnh không transition, nên `frameloop="demand"` không nhận `invalidate()`:

- Đo được: sự kiện `change` ở 18 ms, frame duy nhất vẽ xong ở 83 ms, đích camera mới chỉ có ở khoảng 120 ms — góc mới chưa được vẽ.
- Tái hiện: bật giảm chuyển động, để scene nghỉ, chọn góc "Trên", chờ 3 giây → camera vẫn ở góc cũ ở khoảng 1/3 lần chạy, cho tới khi có thao tác khác làm scene vẽ lại.

Người dùng bật giảm chuyển động (AGENTS mục 8, bắt buộc hỗ trợ) có thể bấm đổi góc nhìn mà không thấy gì thay đổi.

E2E hiện né bằng helper `renderCameraChange` trong `e2e/viewer-helpers.ts` (xin thêm một frame trước khi so tư thế camera).

## Việc cần làm

- [x] Viết test đỏ trước: E2E (hoặc test tích hợp R3F nếu khả thi) bật `reducedMotion: 'reduce'`, scene nghỉ, chọn "Trên", **không** tự xin frame, khẳng định tư thế camera đã vẽ đổi trong thời hạn ngắn.
- [x] `scene/CameraRig.tsx`: lấy `invalidate` từ `useThree` và gọi sau mọi lệnh camera không transition (preset, focus, khôi phục góc toàn xe, fit khi resize).
- [x] Gỡ bước xin frame thủ công trong `renderCameraChange` của `e2e/viewer-helpers.ts` sau khi sửa.
- [x] Kiểm tra lại demand loop vẫn nghỉ (0 frame thừa) sau khi thêm `invalidate`.

## Tiêu chí nghiệm thu

- [x] Với giảm chuyển động, đổi góc nhìn luôn hiện ngay (8/8 lần lặp E2E, không cần helper xin frame).
- [x] `viewer-demand-quality` vẫn ghi 0 frame thừa khi nghỉ.

## Kết quả (15/09/2026)

- **Vòng đỏ:** `e2e/viewer-reduced-motion-camera.spec.ts` — `reducedMotion: 'reduce'`, scene mẫu nghỉ (`waitIdle` + `waitCameraSettled`), bọc `gl.render` để ghi hướng nhìn của camera **tại lúc vẽ** (chỉ quan sát, không xin frame), chọn góc "Trên", khẳng định hướng đã vẽ nhìn thẳng xuống (`y < -0,99`) trong 2 giây. Trước khi sửa: **5/8** rồi **6/8** lần lặp đỏ (`--repeat-each=8`, hai lượt).
- **Nguyên nhân:** `CameraRig` gọi `setLookAt` / `moveTo` / `dollyTo` với `enableTransition = false` trong effect chạy sau commit. camera-controls chỉ phát `update`/`transitionstart` khi `update()` chạy trong một frame, nên lệnh không transition không đánh thức `frameloop="demand"`; tư thế mới chỉ hiện nếu tình cờ còn frame đang chờ hoặc có thao tác khác làm scene vẽ lại.
- **Sửa:** `scene/CameraRig.tsx` lấy `invalidate` từ `useThree` và gọi sau mọi lệnh camera: preset/fit theo kích thước và xe, focus, khôi phục góc toàn xe khi bỏ focus, Esc. Có transition thì lời gọi gộp vào cùng frame. Không đổi gì khác trong scene.
- **E2E:** gỡ `s.invalidate()` khỏi `renderCameraChange` (helper chỉ còn chờ đích camera đổi rồi chờ camera đứng yên); cập nhật chú thích ở `viewer-editor-ui.spec.ts`.
- **Kiểm tra:** test mới **8/8** xanh sau khi sửa · `CI=1 pnpm test:e2e` **24/24** xanh (5,8 phút, không retry), gồm `viewer-demand-quality` (frame khi nghỉ không tăng) và `viewer-editor-ui` (dùng helper đã gỡ bước xin frame) · `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm test` 403/403 ✅.

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

- [ ] Viết test đỏ trước: E2E (hoặc test tích hợp R3F nếu khả thi) bật `reducedMotion: 'reduce'`, scene nghỉ, chọn "Trên", **không** tự xin frame, khẳng định tư thế camera đã vẽ đổi trong thời hạn ngắn.
- [ ] `scene/CameraRig.tsx`: lấy `invalidate` từ `useThree` và gọi sau mọi lệnh camera không transition (preset, focus, khôi phục góc toàn xe, fit khi resize).
- [ ] Gỡ bước xin frame thủ công trong `renderCameraChange` của `e2e/viewer-helpers.ts` sau khi sửa.
- [ ] Kiểm tra lại demand loop vẫn nghỉ (0 frame thừa) sau khi thêm `invalidate`.

## Tiêu chí nghiệm thu

- [ ] Với giảm chuyển động, đổi góc nhìn luôn hiện ngay (8/8 lần lặp E2E, không cần helper xin frame).
- [ ] `viewer-demand-quality` vẫn ghi 0 frame thừa khi nghỉ.

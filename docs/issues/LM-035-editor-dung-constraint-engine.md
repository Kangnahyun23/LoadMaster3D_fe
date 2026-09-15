---
id: LM-035
title: Editor chạy constraint engine tăng dần khi kéo, thả, xoay
phase: 2
labels: [viewer3d, editor, constraints, performance]
depends_on: [LM-023, LM-028, LM-032, LM-034]
estimate: 1.5d
prd: [D-09, D-28, D-29, D-32]
spec: [10]
---

# LM-035 — Editor dùng constraint engine

## Bối cảnh

Spec chỉ cho kéo thả khi mọi thay đổi được validate lại. Editor hiện chỉ kiểm tra biên và chồng lấn (`validatePlacement`), trả chuỗi tiếng Việt.

## Việc cần làm

- [x] `useManualEditor` giữ một instance engine (LM-023) cho snapshot + draft; dựng lại khi snapshot đổi, không dựng lại mỗi commit.
- [x] Khi kéo: `evaluateMove` tối đa ~10 lần/giây qua `preview-store` (giữ cơ chế throttle hiện có).
- [x] Khi thả/xoay/nudge/snap/reset: `commitMove`; có `error` thì không commit và hiện lý do; `warning` vẫn commit.
- [x] Undo/redo gọi `commitMove` ngược lại trên engine để đồng bộ grid.
- [x] Ghost xanh/vàng/đỏ theo severity; danh sách issue render qua `formatIssue` (LM-028) bằng `code` + `params`.
- [x] Hiện cảnh báo `LOADING_ORDER_INFEASIBLE` sau commit (D-32).
- [x] Gỡ `validatePlacement`/`supportCoverage` cũ trong `viewer3d/editor/geometry.ts` sau khi chuyển.

## Tiêu chí nghiệm thu

- [ ] Ở 1.000 kiện, đo trong trình duyệt: thời gian xử lý thả p95 ≤ 8 ms (ghi vào report).
- [x] Kéo kiện lên hốc bánh không chịu tải bị chặn; kéo lên kiện `stackable = false` bị chặn; đặt thiếu đỡ dưới `minSupportRatio` commit kèm cảnh báo.
- [ ] Không có React state cập nhật mỗi pointer frame (kiểm bằng React Profiler hoặc đếm render).

## Kết quả (15/09/2026)

- [editor/editor-engine.ts](../../src/features/viewer3d/editor/editor-engine.ts): `createEditorEngine(model)` bọc `createConstraintEngine` với `model.engineInput` (request + result của revision; `null` với `LoadPlan` mm cũ). `sync(placements)` chỉ `commitMove` kiện có tư thế khác — gọi trước mỗi lần kiểm, nên commit/undo/redo/reset đều đồng bộ mà không cần theo dõi lệnh. `check(placement)` = `evaluateMove`, lấy issue dính tới kiện; `overlapIds` lấy cả khi `OVERLAP` báo ở kiện kia.
- [editor/useEditorValidation.ts](../../src/features/viewer3d/editor/useEditorValidation.ts): dịch issue qua `formatIssue`; `GeometryResult` giữ hình dạng cũ nên ghost xanh/vàng/đỏ, HUD, panel không đổi. `validatePlacement`/`supportCoverage` đã gỡ. `LOADING_ORDER_INFEASIBLE` hiện như cảnh báo khi thả.
- Lệch có chủ ý: không có issue riêng cho "đặt trên kiện dễ vỡ" — domain không có mã này; tải lên kiện dựa `maxTopLoadKg`/`stackable`.
- Test TDD ([viewer-editor-engine.test.ts](../../tests/viewer-editor-engine.test.ts), đỏ trước khi có module): thả lên kiện `stackable = false` → `NOT_STACKABLE`; lên hốc bánh không chịu tải → `NON_BEARING_SUPPORT`; thiếu đỡ 0,4 < 0,8 → cảnh báo `SUPPORT_BELOW_MIN`, vẫn hợp lệ; vượt thùng; hướng cấm; `sync` rồi hoàn tác. Fixture benchmark nay `minSupportRatio 0,8` để editor có cảnh báo đỡ.
- Hiệu năng: Node, snap + sync + kiểm ở 1.000 kiện p95 ≈ 2,7 ms (132: 0,6 · 300: 1,0 · 500: 1,5). Số đo trong trình duyệt ghi ở LM-038.

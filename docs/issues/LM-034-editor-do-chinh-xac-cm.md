---
id: LM-034
title: Editor dùng cm — nudge 1/5/10, lưới 5 cm, snap 2 cm, roundCm
phase: 2
labels: [viewer3d, editor, precision]
depends_on: [LM-011, LM-031]
estimate: 1d
prd: [D-10, D-27]
---

# LM-034 — Độ chính xác editor theo cm

## Việc cần làm

- [x] `editor/geometry.ts` (`EDITOR_RULES`): `gridCm: 5`, `snapThresholdCm: 2`, `contactToleranceCm: 0.2`; bỏ `integerPosition` mm, thay `roundCm`.
- [x] `snapping.ts`: snap vào sàn, vách, lưới, mặt kiện **và mặt vật cản chịu tải**; so sánh qua helper EPSILON.
- [x] `EditorControls`: bước nudge 1 / 5 / 10 cm; phím mũi tên và Page Up/Down theo bước đang chọn.
- [x] `spatial-feedback.ts`, `EditorGestureHud`: nhãn đo hiển thị cm theo locale.
- [x] Preview khi kéo cập nhật imperative như hiện tại, không đưa pointer frame qua React.

## Tiêu chí nghiệm thu

- [x] Kéo 200 lần qua lại rồi thả về mặt kiện: toạ độ đúng bội 0,1, không phát sinh chồng lấn giả.
- [x] Test browser editor (drag hợp lệ / không hợp lệ / Escape / undo) xanh với giá trị cm.

## Kết quả (15/09/2026)

- `EDITOR_RULES`: `gridCm 5`, `snapThresholdCm 2`; `integerPosition` → `roundPosition` (`roundCm`). Tolerance tiếp xúc cũ bỏ cùng `supportCoverage` (domain dùng `contactSlab` riêng).
- `snapping.ts`: thêm mặt vật cản `loadBearing`, so qua `lt/gt`, giá trị hút qua `roundCm`. `overlapsAxis` của editor so qua `lt` — test mới bắt được chồng lấn giả thật: `100,4 + 120,7 = 221,10000000000002` làm kiện chạm mặt 221,1 bị coi là chồng lấn.
- Nudge 1/5/10 cm (mặc định 1), phím mũi tên/Page Up/Down theo bước đang chọn; nhãn đo, toạ độ, HUD trọng tâm qua `useFormat().length`. Preview kéo vẫn imperative.
- Test: 200 lần kéo qua lại quanh mặt kiện → mọi toạ độ bội 0,1, thả về mặt không chồng lấn; hút mặt vật cản chịu tải, bỏ qua vật cản không chịu tải ([viewer-editor.test.ts](../../tests/viewer-editor.test.ts)). E2E editor (drag hợp lệ / vượt cửa / chồng lấn / Escape / undo) xanh với giá trị cm.

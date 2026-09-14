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

- [ ] `editor/geometry.ts` (`EDITOR_RULES`): `gridCm: 5`, `snapThresholdCm: 2`, `contactToleranceCm: 0.2`; bỏ `integerPosition` mm, thay `roundCm`.
- [ ] `snapping.ts`: snap vào sàn, vách, lưới, mặt kiện **và mặt vật cản chịu tải**; so sánh qua helper EPSILON.
- [ ] `EditorControls`: bước nudge 1 / 5 / 10 cm; phím mũi tên và Page Up/Down theo bước đang chọn.
- [ ] `spatial-feedback.ts`, `EditorGestureHud`: nhãn đo hiển thị cm theo locale.
- [ ] Preview khi kéo cập nhật imperative như hiện tại, không đưa pointer frame qua React.

## Tiêu chí nghiệm thu

- [ ] Kéo 200 lần qua lại rồi thả về mặt kiện: toạ độ đúng bội 0,1, không phát sinh chồng lấn giả.
- [ ] Test browser editor (drag hợp lệ / không hợp lệ / Escape / undo) xanh với giá trị cm.

---
id: LM-073
title: E2E kéo kiện vào vật cản trong editor bị chặn
phase: 6
labels: [test, e2e, viewer3d]
depends_on: [LM-035, LM-072]
estimate: 0.5d
spec: [15]
---

# LM-073 — E2E chồng vật cản

## Bối cảnh

Nghiệm thu LM-072 ([docs/acceptance.md](../acceptance.md), Spec §15 dòng 12): vượt biên và chồng kiện đã có E2E
(`e2e/viewer-editor-ui.spec.ts`), còn chồng vật cản chỉ có test ở seam engine (`tests/viewer-editor-engine.test.ts`,
`src/domain/constraints/obstacles.test.ts`).

## Việc cần làm

- [x] Trong Planner chuyến seed (xe `VEHICLE-002` có hốc bánh), chế độ Chỉnh sửa: kéo hoặc nudge một kiện sang vị trí chồng hốc bánh.
- [x] Khẳng định trạng thái "Không thể đặt" kèm câu `OBSTACLE_OVERLAP` (qua `formatIssue`), vị trí kiện không đổi, không có lệnh mới trong lịch sử.

## Tiêu chí nghiệm thu

- [x] Test xanh trên CI; dòng 12 của `docs/acceptance.md` đổi sang ✅.

## Kết quả (19/09/2026)

`e2e/viewer-editor-obstacles.spec.ts`: mở Planner chuyến seed (`?debug&quality=low` để có cờ nghỉ), chọn kiện sàn sát mép trong hốc bánh
trái (tìm từ `seedScene()` lúc chạy: `z = 0`, `y = 25`, x giao hốc 420–530), bấm "Giảm Y": trạng thái "Không thể đặt" kèm câu
`OBSTACLE_OVERLAP` ("… chồng lấn vật cản OBS-001."), vị trí không đổi, "Hoàn tác" vẫn tắt (không có lệnh trong lịch sử). 1/1 xanh, 7,4 s.
Dùng nudge thay kéo chuột: bước 1 cm đi thẳng vào hốc, không va kiện khác nên lỗi chỉ có thể là vật cản.

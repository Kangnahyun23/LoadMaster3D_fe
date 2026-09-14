---
id: LM-015
title: Geometry — biên thùng, chồng lấn, thể tích
phase: 1
labels: [domain, geometry]
depends_on: [LM-011, LM-014]
estimate: 0.5d
prd: [D-27]
spec: [3, 7.1, 7.2]
---

# LM-015 — Biên thùng, chồng lấn, thể tích

## Việc cần làm

- [x] `src/domain/geometry/box.ts`: kiểu `Box = { xCm, yCm, zCm, lengthCm, widthCm, heightCm }`.
- [ ] Adapter từ `PackagePlacement` (`placedLengthCm`…) / `VehicleObstacle` sang `Box` → chuyển sang **LM-010** (type contract chưa có).
- [x] `volumeCm3(box)`; `vehicleBoundaryExcess(box, vehicle)` trả `{ beforeOrigin, beyondInterior }` theo từng trục, số thô đã `roundCm`, 0 khi nằm trong.
- [x] `overlaps(a, b)` đúng nghĩa Spec 7.2 (khoảng nửa mở `[x, x+l)`), dùng `lt/gt` EPSILON; chạm mặt **không** chồng lấn.
- [ ] `overlapArea2D`, `overlapVolume` → chuyển sang **LM-018** (nơi dùng đầu tiên: support ratio), LIFO dùng lại ở LM-020.

## Tiêu chí nghiệm thu

- [x] Test: A kết thúc x = 120, B bắt đầu x = 120 → không chồng lấn (Spec 3).
- [x] Test chồng lấn 0,1 cm → chồng lấn.
- [x] Placement vượt chiều cao 12,5 cm → `beyondInterior.zCm = 12.5`. Việc bọc thành mã `EXCEEDS_BOUNDARY` với `params` → **LM-014** (mô hình lỗi chưa có).
- [x] Không đổi `>` thành `>=` (test chặn hồi quy — đã kiểm bằng cách cố ý đổi `<` thành `<=`: test chạm mặt đỏ).

## Kết quả — 14/09/2026 (TDD)

- Seam: `@/domain/geometry` — `Box`, `volumeCm3`, `overlaps`, `vehicleBoundaryExcess`, `VehicleInterior` (cùng tên trường `inner*Cm` với `VehicleConfig` của Spec).
- 8 test: thể tích mẫu Spec 324.000 cm³; lấn 0,1 cm; chạm mặt X; chạm mặt X bị trôi dấu phẩy động; chồng trục Z chạm / lún 0,1 cm; vượt trần 12,5 cm (Spec 13); lùi vách trước 2 cm; chạm trần ở toạ độ bị trôi không vượt biên.
- Phát hiện khi làm TDD: công thức thô của Spec báo chồng lấn giả khi `100.4 + 120.7` trôi thành `221.10000000000002` → test đỏ trước, rồi mới thêm EPSILON.

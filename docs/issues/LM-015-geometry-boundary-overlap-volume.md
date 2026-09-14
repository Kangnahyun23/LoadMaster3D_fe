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

- [ ] `src/domain/geometry/box.ts`: kiểu `Box = { xCm, yCm, zCm, lengthCm, widthCm, heightCm }` và adapter từ `PackagePlacement` / `VehicleObstacle`.
- [ ] `volumeCm3(box)`, `withinVehicle(box, vehicle)` trả mức vượt theo từng trục (để có params "vượt chiều cao 12,5 cm").
- [ ] `overlaps(a, b)` đúng nghĩa Spec 7.2 (khoảng nửa mở `[x, x+l)`), dùng `lt/gt` EPSILON; chạm mặt **không** chồng lấn.
- [ ] `overlapArea2D`, `overlapVolume` dùng lại cho support và LIFO.

## Tiêu chí nghiệm thu

- [ ] Test: A kết thúc x = 120, B bắt đầu x = 120 → không chồng lấn (Spec 3).
- [ ] Test chồng lấn 0,1 cm → chồng lấn.
- [ ] Placement vượt chiều cao 12,5 cm → mã `EXCEEDS_BOUNDARY`, `params.axis = 'z'`, `params.overCm = 12.5`.
- [ ] Không đổi `>` thành `>=` (test chặn hồi quy).

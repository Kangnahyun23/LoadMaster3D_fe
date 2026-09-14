---
id: LM-017
title: Validation đầu vào — xe, vật cản, kiện, tải trọng, cửa
phase: 1
labels: [domain, validation]
depends_on: [LM-012, LM-013, LM-015]
estimate: 1d
prd: [D-23, D-28]
spec: [7.3, 7.4, 7.5, 9.2, 9.4]
---

# LM-017 — Validation đầu vào

## Bối cảnh

Validation summary ở Thiết lập tối ưu (Spec 9.4) gom lỗi của xe và kiện **trước khi** gọi service. Nút Tối ưu chỉ bị chặn bởi `severity = 'error'`.

## Việc cần làm

- [ ] `validateVehicle(vehicle)`: kích thước > 0, `maxPayloadKg > 0`, cửa ≤ thùng, vật cản nằm trong thùng, vật cản không chồng lấn nhau.
- [ ] `validatePackages(packages)`: quy tắc dữ liệu LM-010 ở mức nghiệp vụ, kèm `field` để UI nhảy tới ô lỗi.
- [ ] `checkDoorClearance(pkg, vehicle)`: có ít nhất một hướng trong `effectiveOrientations` thoả `w + clearance ≤ doorWidth` và `h + clearance ≤ doorHeight` → không thì `DOOR_TOO_SMALL` (error).
- [ ] `checkPayload(packages, vehicle)`: tổng `weightKg × quantity`; vượt → `PAYLOAD_EXCEEDED` **warning** kèm `totalKg`, `overKg`; tổng riêng `mustLoad` vượt → `MUST_LOAD_PAYLOAD_EXCEEDED` **error** (D-23).
- [ ] `validateRequest(request)` gộp tất cả, trả danh sách đã sắp theo severity.

## Tiêu chí nghiệm thu

- [ ] Test đủ ví dụ Spec mục 13: cửa 250 > thùng 240; không có hướng; 5.320 kg > 5.000 kg (warning, `overKg = 320`); kiện không qua cửa 220 × 230.
- [ ] Tổng mustLoad vượt tải → error; chỉ tổng chung vượt → warning.

---
id: LM-043
title: trips-api mở rộng — chuyến, điểm giao, kiện hàng qua Query
phase: 3
labels: [trips, data]
depends_on: [LM-026]
estimate: 0.5d
prd: [D-06, D-16]
---

# LM-043 — API chuyến và kiện

## Việc cần làm

- [ ] Mở rộng `features/trips/trips-api.ts`: `getTrip`, `updateTripStops`, `setTripVehicle`, `listPackages`, `savePackage`, `deletePackage`, `duplicatePackage`.
- [ ] Hook Query tương ứng; mutation invalidate chuyến, kiện và danh sách revision (vì `inputVersion` đổi).
- [ ] `TripDetailPage` ngừng import `trip-detail.mock.ts`, đọc theo `:tripId` thật.
- [ ] Gỡ `trip-detail.mock.ts` và kiểu `DeliveryStop`/`Vehicle` trùng lặp khi không còn nơi dùng.

## Tiêu chí nghiệm thu

- [ ] Mở hai chuyến khác nhau thấy dữ liệu khác nhau.
- [ ] Không component nào gọi `-api.ts` trực tiếp.

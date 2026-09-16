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

- [x] Mở rộng `features/trips/trips-api.ts`: `getTrip`, `updateTripStops`, `setTripVehicle`, `listPackages`, `savePackage`, `deletePackage`, `duplicatePackage`.
- [x] Hook Query tương ứng; mutation invalidate chuyến, kiện và danh sách revision (vì `inputVersion` đổi).
- [x] `TripDetailPage` ngừng import `trip-detail.mock.ts`, đọc theo `:tripId` thật.
- [x] Gỡ `trip-detail.mock.ts` và kiểu `DeliveryStop`/`Vehicle` trùng lặp khi không còn nơi dùng.

## Tiêu chí nghiệm thu

- [x] Mở hai chuyến khác nhau thấy dữ liệu khác nhau.
- [x] Không component nào gọi `-api.ts` trực tiếp.

## Kết quả (16/09/2026)

- [trips-api.ts](../../src/features/trips/trips-api.ts): `fetchTripDetail` (chuyến + xe đang gán), `fetchPackages`, `updateTripStops`, `removeTripStop`, `setTripVehicle`, `savePackage`, `deletePackage`, `duplicateTripPackage` — tất cả qua `@/lib/mock-db`. Hook và mutation trong [useTripsQuery.ts](../../src/features/trips/useTripsQuery.ts), mutation invalidate `['trips', tripId]` nên chuyến, kiện và revision cùng làm mới (`inputVersion` đổi → revision lỗi thời).
- `TripDetailPage` đọc `:tripId` thật: xe (cm), tóm tắt hàng hoá tính từ kiện, điểm giao, bảng kiện. Trạng thái đang tải và "không tìm thấy chuyến".
- Gỡ `OrdersTable` và phần `ORDERS`/`CARGO_SUMMARY`/`STOPS`/`DeliveryStop` của `trip-detail.mock.ts`; phần `TRIP`/`VEHICLE` còn lại chỉ phục vụ màn So sánh phương án, gỡ nốt ở LM-051.
- Danh sách chuyến (`fetchTrips`) vẫn là dữ liệu mẫu: kho chưa lưu trạng thái, ngày, tuyến của màn danh sách.

---
id: LM-081
title: Kho mock — vòng đời chuyến, ngày chạy, tài xế, tiến độ kho/giao, huỷ, khoá sửa, bảo dưỡng xe
phase: 6
labels: [data, mock-db]
depends_on: [LM-080]
estimate: 2d
prd: [D-45, D-46, D-47, D-53]
---

# LM-081 — Vòng đời chuyến trong kho mock

## Việc cần làm

- [ ] `Trip` thêm `scheduledDate` (`YYYY-MM-DD`), `driverId?`, `phase` (`planning | loading | loaded | delivering | completed | cancelled`),
      `loading?`, `delivery?`, `cancellation?`. `DeliveryStop` thêm `phone?`, `contactName?`.
- [ ] Hàm kho: `startLoading`, `recordLoadingStep` (`loaded` / `missing`), `completeLoading`, `startDelivery`, `recordUnload`,
      `reportDeliveryIssue` (`damaged | missing | refused | other` + ghi chú), `completeStop` (điểm cuối → `completed`), `cancelTrip` (lý do bắt buộc).
      Mỗi hàm kiểm pha hợp lệ, sai thì `TRIP_PHASE_INVALID`.
- [ ] Từ `loading` trở đi: sửa xe/điểm giao/kiện, thêm revision, Duyệt → `TRIP_LOCKED`. Sửa xe đang chạy chuyến → `VEHICLE_LOCKED`.
- [ ] Bảo dưỡng xe lưu ngoài `VehicleConfig` (D-04): `setVehicleMaintenance(id, on, note?)`, `listVehicleStates()`;
      tạo/đổi chuyến sang xe bảo dưỡng → `VEHICLE_IN_MAINTENANCE`.
- [ ] Hàm thuần `tripStatus(trip, revisions): TripStatus` thay logic trong `trip-list.ts` (pha, riêng `planning` suy từ revision).
- [ ] Mã lỗi mới có câu vi/en; `-api.ts` hiện có vẫn chạy.

## Tiêu chí nghiệm thu

- [ ] Unit test từng chuyển pha hợp lệ/không hợp lệ, khoá sửa, huỷ, bảo dưỡng; test cũ của kho vẫn xanh.

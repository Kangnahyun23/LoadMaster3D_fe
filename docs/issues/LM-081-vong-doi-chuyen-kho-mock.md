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

- [x] `Trip` thêm `scheduledDate` (`YYYY-MM-DD`), `driverId?`, `phase` (`planning | loading | loaded | delivering | completed | cancelled`),
      `loading?`, `delivery?`, `cancellation?`. `DeliveryStop` thêm `phone?`, `contactName?`.
- [x] Hàm kho: `startLoading`, `recordLoadingStep` (`loaded` / `missing`), `completeLoading`, `startDelivery`, `recordUnload`,
      `reportDeliveryIssue` (`damaged | missing | refused | other` + ghi chú), `completeStop` (điểm cuối → `completed`), `cancelTrip` (lý do bắt buộc).
      Mỗi hàm kiểm pha hợp lệ, sai thì `TRIP_PHASE_INVALID`.
- [x] Từ `loading` trở đi: sửa xe/điểm giao/kiện, thêm revision, Duyệt → `TRIP_LOCKED`. Sửa xe đang chạy chuyến → `VEHICLE_LOCKED`.
- [x] Bảo dưỡng xe lưu ngoài `VehicleConfig` (D-04): `setVehicleMaintenance(id, on, note?)`, `listVehicleStates()`;
      tạo/đổi chuyến sang xe bảo dưỡng → `VEHICLE_IN_MAINTENANCE`.
- [x] Hàm thuần `tripStatus(trip, revisions): TripStatus` thay logic trong `trip-list.ts` (pha, riêng `planning` suy từ revision).
- [x] Mã lỗi mới có câu vi/en; `-api.ts` hiện có vẫn chạy.

## Tiêu chí nghiệm thu

- [x] Unit test từng chuyển pha hợp lệ/không hợp lệ, khoá sửa, huỷ, bảo dưỡng; test cũ của kho vẫn xanh.

## Kết quả (19/09/2026)

`Trip` thêm `scheduledDate`, `driverId`, `phase`, `createdAt`, `loading`, `delivery`, `cancellation`; `DeliveryStop` thêm `phone`,
`contactName`. Kho tách thành module theo nhóm hàm (`db-vehicles`, `db-trips`, `db-revisions`, `db-operations`, `db-users`,
`db-audit`) dùng chung `DbContext`; `MockDb` ở `db-api.ts`. Hàm thuần dùng lại cho UI: `tripStatus`, `latestApproved`,
`plannedStops`, `missingIds`, `loadingRemaining`, `stopItemIds`, `isLockedPhase`, `isCancellablePhase`.

Luật: pha `loading`/`loaded` chỉ đổi tên/ngày/tài xế; sửa xe đang chạy → `VEHICLE_LOCKED`; xe bảo dưỡng → `VEHICLE_IN_MAINTENANCE`;
hoàn tất điểm giao cần mọi kiện đã dỡ hoặc có sự cố; kiện kho báo thiếu không phải dỡ (`INSTANCE_NOT_LOADED`). Sửa xe chỉ làm lỗi
thời chuyến đang lập kế hoạch (chuyến đã xong giữ lịch sử). 26 mã lỗi có câu vi/en ở nhánh `dataErrors` (`dataErrorMessage`).

Test: `lifecycle.test.ts` (9 ca: xếp/khoá/giao/kiện thiếu/huỷ/bảo dưỡng/tài xế/trạng thái), `data-error.test.ts` (mọi mã có câu, đủ tham số).

---
id: LM-040
title: vehicles-api + hook Query, danh sách Đội xe đọc từ mock repository
phase: 3
labels: [fleet, data]
depends_on: [LM-026, LM-027]
estimate: 1d
prd: [D-06, D-20]
spec: [9.2]
---

# LM-040 — Danh sách Đội xe qua Query

## Bối cảnh

`features/fleet/FleetPage.tsx` giữ dữ liệu bằng `useState` từ `vehicles.mock.ts` (mm, không có cửa/vật cản). AGENTS mục 9 yêu cầu chuyển sang `-api.ts` + Query khi nối dữ liệu.

## Việc cần làm

- [x] `features/fleet/vehicles-api.ts`: `listVehicles`, `getVehicle`, `createVehicle`, `updateVehicle`, `deleteVehicle` gọi mock repository.
- [x] Hook: `useVehiclesQuery`, `useVehicleQuery(id)`, `useSaveVehicleMutation`, `useDeleteVehicleMutation` (invalidate danh sách và chi tiết).
- [x] Bảng Đội xe: cột tên, kích thước trong thùng (cm), tải trọng (kg), cửa (cm), số vật cản; bấm dòng mở `/doi-xe/:vehicleId`; nút primary "Thêm xe" mở `/doi-xe/moi`.
- [x] Gỡ `VehicleFormDialog`, `vehicles.mock.ts`, `vehicle-form.schema.ts` cũ khi LM-041 xong.
- [x] Trạng thái rỗng, đang tải, lỗi; chuỗi qua `t()`.
- [x] Route `/doi-xe/moi`, `/doi-xe/:vehicleId` thêm vào `App.tsx` bằng `lazy()`.

## Tiêu chí nghiệm thu

- [x] Tạo xe ở trang chi tiết rồi quay lại thì danh sách có xe mới mà không tải lại trang.
- [x] Không còn `useState` giữ danh sách xe.

## Kết quả (16/09/2026)

**Lớp dữ liệu.** `features/fleet/vehicles-api.ts` là nơi duy nhất biết về kho: `fetchVehicles`, `fetchVehicle`,
`saveVehicle`, `deleteVehicle` gọi thẳng `getMockDb()`. Gộp `createVehicle` và `updateVehicle` thành một
`saveVehicle`: xe có `id` rỗng là xe mới, kho cấp mã `VEHICLE-NNN` — form chỉ có một nút Lưu nên không cần hai hàm ở
lớp trên. Hook trong `useVehiclesQuery.ts`: `useVehiclesQuery`, `useVehicleQuery(id)` (tắt khi `id` rỗng),
`useSaveVehicleMutation`, `useDeleteVehicleMutation`; cả hai mutation `invalidateQueries(['vehicles'])` và cập nhật
cache chi tiết, nên danh sách tự có xe mới khi quay lại.

**Danh sách.** `FleetPage.tsx` dựng lại: cột tên + mã, lòng thùng (cm), tải trọng (kg), cửa R × C (cm), số vật cản;
số format theo ngôn ngữ bằng `useFormat()` nên cột phải dựng trong component. Ba trạng thái đang tải / rỗng / lỗi
(có nút Thử lại gọi `refetch`). Bấm dòng mở `/doi-xe/:vehicleId`; nút primary "Thêm xe" chỉ hiện khi đã có xe (màn
rỗng đã có nút trong `EmptyState`). Chuỗi qua `t()`, nhánh `fleet` trong `vi.ts`/`en.ts`.

**Dọn code cũ.** Gỡ `VehicleFormDialog.tsx`, `VehicleFormDialog.dom.test.tsx`, `vehicle-form.schema.ts`,
`vehicles.mock.ts` (mất luôn type `FleetAxle`). `TripFormPage` còn cần mock mm nên phần dữ liệu nó dùng chuyển sang
`features/trips/trip-vehicles.mock.ts` (`TRIP_VEHICLES`) — mock một feature dùng thì nằm trong feature đó (AGENTS
mục 3); LM-043 sẽ thay bằng dữ liệu thật.

**Route.** `App.tsx` thêm `/doi-xe/moi` và `/doi-xe/:vehicleId`, cùng một `VehicleDetailPage` nạp bằng `lazy()`.

**Kiểm thử.** `vehicles-api.test.ts` (project unit) chạy qua seam api: danh sách seed, tạo → sửa → xoá theo mã kho cấp,
xoá xong đọc lại là `NOT_FOUND`. Ca nghiệm thu "tạo xe rồi quay lại thấy trong danh sách" nằm ở
`VehicleDetailPage.dom.test.tsx`.

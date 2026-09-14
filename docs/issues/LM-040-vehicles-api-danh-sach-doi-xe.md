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

- [ ] `features/fleet/vehicles-api.ts`: `listVehicles`, `getVehicle`, `createVehicle`, `updateVehicle`, `deleteVehicle` gọi mock repository.
- [ ] Hook: `useVehiclesQuery`, `useVehicleQuery(id)`, `useSaveVehicleMutation`, `useDeleteVehicleMutation` (invalidate danh sách và chi tiết).
- [ ] Bảng Đội xe: cột tên, kích thước trong thùng (cm), tải trọng (kg), cửa (cm), số vật cản; bấm dòng mở `/doi-xe/:vehicleId`; nút primary "Thêm xe" mở `/doi-xe/moi`.
- [ ] Gỡ `VehicleFormDialog`, `vehicles.mock.ts`, `vehicle-form.schema.ts` cũ khi LM-041 xong.
- [ ] Trạng thái rỗng, đang tải, lỗi; chuỗi qua `t()`.
- [ ] Route `/doi-xe/moi`, `/doi-xe/:vehicleId` thêm vào `App.tsx` bằng `lazy()`.

## Tiêu chí nghiệm thu

- [ ] Tạo xe ở trang chi tiết rồi quay lại thì danh sách có xe mới mà không tải lại trang.
- [ ] Không còn `useState` giữ danh sách xe.

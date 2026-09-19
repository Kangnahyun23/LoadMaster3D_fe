---
id: LM-089
title: Đội xe — trạng thái xe, bảo dưỡng, tìm/lọc/sắp xếp
phase: 6
labels: [fleet, dispatcher]
depends_on: [LM-083, LM-084, LM-085]
estimate: 1d
prd: [D-53, D-52]
---

# LM-089 — Đội xe

## Việc cần làm

- [x] Danh sách: cột trạng thái (Sẵn sàng / Đang chạy + mã chuyến / Bảo dưỡng), tìm, lọc trạng thái, sắp xếp, phân trang.
- [x] Chi tiết xe: bật/tắt bảo dưỡng kèm ghi chú (nút phụ); xe đang chạy chuyến thì banner khoá sửa (`VEHICLE_LOCKED`).
- [ ] Chọn xe ở form chuyến và thiết lập tối ưu: xe bảo dưỡng hiện nhưng không chọn được, có lý do. *(giao agent làm `features/trips`,
  `features/optimization`; kho đã từ chối `VEHICLE_IN_MAINTENANCE`.)*

## Tiêu chí nghiệm thu

- [x] DOM/E2E: trạng thái đổi theo chuyến đang chạy — E2E `fleet-status.spec.ts`: kho bắt đầu xếp chuyến chính thì VEHICLE-002 thành
  "Đang chạy" trên danh sách và trang xe khoá; đặt/kết thúc bảo dưỡng đổi trạng thái (DOM + E2E).
- [ ] DOM/E2E: đặt bảo dưỡng → không chọn được ở form chuyến *(thuộc agent làm form chuyến; nhánh này không sửa `features/trips`)*.

## Kết quả (19/09/2026)

### Đã làm

- **Danh sách `/doi-xe`** (`FleetPage.tsx`): `FilterBar` (tìm bỏ dấu theo tên xe có biển số, mã xe, chuyến đang chạy, ghi chú bảo dưỡng;
  lọc `trang-thai` = `san-sang` | `dang-chay` | `bao-duong`) + `DataTable` sắp xếp (tên — mặc định, trạng thái, lòng thùng, tải trọng) và
  phân trang 25/50/100, mọi trạng thái giữ trên URL (`useListUrlState`). Cột **Trạng thái** đứng sau tên: badge Sẵn sàng (success) /
  Đang chạy (cyan, chấm) kèm **liên kết mã chuyến** `/chuyen/:id` / Bảo dưỡng (warning) kèm ghi chú cắt bớt (`title` đủ câu). Tên xe là
  liên kết `/doi-xe/:id` để mở bằng bàn phím (dòng vẫn bấm chuột được; liên kết chặn lan cú bấm lên dòng).
- **Trang xe** (`VehicleDetailPage.tsx`): chờ cả cấu hình và trạng thái rồi mới dựng form (xe đang chạy không lộ ô nhập mở). Badge trạng
  thái cạnh tên; thông báo (`VehicleStateBanner.tsx`, `role="status"`):
  - Đang chạy: "Xe đang chạy chuyến TRIP-011: cấu hình bị khoá…" + liên kết "Xem chuyến TRIP-011"; form `readOnly` (không Lưu/Xoá,
    không bảo dưỡng) — cùng luật `VEHICLE_LOCKED` của kho.
  - Bảo dưỡng: từ lúc nào (giờ + ngày theo locale) và ghi chú.
  - Người có `fleet.edit`: nút phụ **"Đưa vào bảo dưỡng"** (hộp thoại `MaintenanceDialog.tsx`, react-hook-form + zod, ghi chú bắt buộc,
    tối đa 200 ký tự) / **"Kết thúc bảo dưỡng"**. Lỗi kho hiện qua `dataErrorMessage`. Quản lý chỉ thấy badge và thông báo.
- **Dữ liệu**: `vehicles-api.ts` thêm `fetchVehicleStates`, `saveVehicleMaintenance`; `useVehiclesQuery.ts` thêm `useVehicleStatesQuery`,
  `useVehicleStateQuery(id)` (key `['vehicles', 'states']`, `staleTime: 0` vì "Đang chạy" đổi theo pha chuyến do màn kho/tài xế ghi) và
  `useVehicleMaintenanceMutation` (vô hiệu hoá mọi query dưới `['vehicles']` — gồm danh sách xe của form chuyến — và `['dashboard']`).
- Hàm thuần `vehicle-status.ts`: `vehicleRows` (xe không có trạng thái = Sẵn sàng), `filterVehicleRows`, slug URL, thứ tự trạng thái.
- `VehicleForm` thêm ba chỗ trống `status` / `actions` / `notice`; hộp thoại bảo dưỡng dựng **ngoài** `<form>` xe trong cây React vì
  sự kiện submit của portal vẫn lan theo cây React và sẽ kích hoạt Lưu (có test).
- Từ điển: nhánh `fleet` thêm `columns.status`, `status.*`, `search`, `banner.*`, `maintenance.*` (vi/en).

### File

`src/features/fleet/{FleetPage,VehicleDetailPage,VehicleForm,VehicleStatusBadge,VehicleStateBanner,MaintenanceDialog}.tsx`,
`src/features/fleet/{vehicle-status,vehicles-api,useVehiclesQuery}.ts`, `src/lib/i18n/{vi,en}/fleet.ts`, `e2e/fleet-status.spec.ts` (mới),
`e2e/spec-flow.spec.ts` (một dòng: seed 8 xe nên xe mới là `VEHICLE-009`, hàng có cột trạng thái).

### Kiểm thử

- `src/features/fleet/vehicle-status.test.ts` (3): ghép trạng thái, slug lọc, tìm bỏ dấu theo tên/biển số/mã/chuyến.
- `src/features/fleet/FleetPage.dom.test.tsx` (3): badge + liên kết chuyến + ghi chú; lọc/tìm/sắp xếp trạng thái trên URL; mở từ URL lọc.
- `src/features/fleet/VehicleDetailPage.dom.test.tsx` (+3, tổng 6): bật bảo dưỡng (ghi chú bắt buộc, không kích hoạt Lưu) rồi kết thúc; xe
  đang chạy chỉ đọc kèm chuyến; quản lý không có nút bảo dưỡng.
- E2E `e2e/fleet-status.spec.ts` (2): bảo dưỡng bật/tắt đổi trạng thái trên danh sách và lọc; kho bắt đầu xếp → xe "Đang chạy" + khoá.
- `pnpm lint` ✓ · `pnpm exec tsc -b` ✓ · `pnpm test` 97 file / 611 test ✓ ·
  `E2E_PORT=5195 pnpm exec playwright test e2e/fleet-status.spec.ts e2e/fleet-vehicle-preview.spec.ts` 6/6 ✓.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 9 "Lớp dữ liệu", sau câu Đội xe LM-040: *Trạng thái xe (LM-089) đọc `useVehicleStatesQuery` (`['vehicles', 'states']`,
  `staleTime: 0` vì pha chuyến đổi ở màn khác); ghi bảo dưỡng vô hiệu hoá `['vehicles']`.*
- Mục 9 "Quy ước code", thêm: *Hộp thoại có `<form>` riêng không đặt trong `<form>` khác của cây React — portal không chặn sự kiện
  submit lan theo cây React (hộp bảo dưỡng ở trang xe nằm cạnh `VehicleForm`, không nằm trong).*

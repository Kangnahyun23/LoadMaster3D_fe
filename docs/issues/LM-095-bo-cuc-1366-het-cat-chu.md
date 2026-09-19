---
id: LM-095
title: Bố cục 1.366–1.600 px — hết cắt chữ ở chi tiết chuyến, chi tiết xe, Planner
phase: 6
labels: [layout, dispatcher]
depends_on: [LM-088, LM-089]
estimate: 1d
prd: [D-54]
---

# LM-095 — Hết chật

## Việc cần làm

- [x] Chi tiết chuyến: tên điểm giao và địa chỉ xuống tối đa 2 dòng; bảng kiện không cắt tên điểm giao; bố cục cột co giãn thay vì 320 + 320 cứng (U-1).
- [x] Chi tiết xe: bảng vật cản không cuộn ngang ở 1.366 px (ô nhập gọn hoặc dòng hai tầng) (U-2).
- [x] E2E ở 1.366 × 768 và 1.600 × 1.000: chi tiết chuyến, chi tiết xe, Planner, dashboard — không phần tử nào tràn ngang (`scrollWidth ≤ clientWidth`).

## Tiêu chí nghiệm thu

- [x] Ảnh trước/sau đính kèm kết quả issue; N-3 ở `acceptance.md` đóng.

## Kết quả (20/09/2026)

### Đã làm

- **Chi tiết chuyến** (`TripDetailPage.tsx`): bỏ hai cột cứng 320 + 320. Từ 1.280 px là lưới hai cột co giãn
  `minmax(272px, 1fr) | minmax(0, 3.2fr)`: cột thông tin (xe, thứ tự điểm giao, tóm tắt hàng, tiến trình) cạnh bảng kiện chiếm phần
  còn lại — ở 1.366 px ≈ 282 | 902 px, ở 1.600 px ≈ 338 | 1.082 px. Panel kiện là cột thứ ba 360 px khi mở (viền đủ bốn cạnh, dính
  khi cuộn); khi đó bảng kiện cuộn ngang trong khung của nó (`min-w-218`), cột Tên không co về 0 như trước (ảnh cũ: cột Tên rộng 0 px).
  Hẹp hơn 1.280 px thì mọi phần xếp một cột.
  - `StopCard`: tên và địa chỉ `line-clamp-2` (tối đa hai dòng), "38 kiện · 1.824 kg" xuống dòng dưới; bỏ icon ghim để địa chỉ đủ
    chỗ ở cột hẹp.
  - `PackagesTable`: hàng 48 px, padding ô 10 px; tên kiện và tên điểm giao tối đa hai dòng thay cho dấu ba chấm. Cột Điểm giao 22 %
    bề rộng bảng (≈ 198 px ở 1.366, 238 px ở 1.600), cột số thu gọn (mã 76, D × R × C 144, khối lượng 84, số lượng 72, hướng 64,
    lỗi 100), cột Tên nhận phần còn lại. Tiếng Anh: tiêu đề "Orientations" rút thành "Orient." cho vừa cột.
  - `CargoSummaryCard`: ba số lớn tự về hai cột khi cột hẹp, số và đơn vị không bẻ dòng ("16,6 / m³" trước đây).
    `VehicleCard`: tên xe chỉ xuống dòng trước biển số, không bẻ "60C-446.32" tại dấu gạch (`components/VehicleName.tsx`, dùng chung
    với danh sách chuyến và bảng điều khiển — LM-100 mục 9).
- **Chi tiết xe** (`ObstacleTable.tsx`): mỗi vật cản là hai tầng, cùng cột thì cùng trục — tầng trên Loại + X/Y/Z, tầng dưới
  "Chịu tải · Tải trên tối đa" + Dài/Rộng/Cao; ô cm 56 px kèm "cm". Bảng ≈ 710 px, vừa cột trái 762 px ở 1.366 px (trước 1.478 px,
  cuộn ngang cả ở 1.600 px). Mỗi vật cản là một `tbody` mang `aria-current` và bấm/focus để làm nổi trong xem trước 3D. Khung bảng
  thêm `relative`: trước đây ô ẩn định vị tuyệt đối của Select/Switch Radix thoát khỏi khung cuộn và kéo **cả trang** cuộn ngang
  (1.573 > 1.366 px).
- **Bảng điều khiển** (`RecentTripsTable.tsx`): mã chuyến xuống dòng dưới tên tuyến, tên xe tối đa hai dòng (trước: cắt ở cả 1.366 và
  1.600 px).
- **Planner**: đã vừa 1.366 px từ LM-094; E2E mới kiểm lại cả trang.

### Kiểm thử

- E2E mới `e2e/layout-1366.spec.ts` (2 test, desktop): ở 1.366 × 768 và 1.600 × 1.000 mở chi tiết chuyến `TRIP-2026-0914`, chi tiết
  xe `VEHICLE-002`, Planner, bảng điều khiển — trang không cuộn ngang, không vùng `overflow-x` nào đang cuộn, không phần tử có chữ nào
  `scrollWidth > clientWidth` (kể cả cắt bằng dấu ba chấm), phần tử `line-clamp` không bị cắt ở dòng cuối; không lỗi trình duyệt.
  Chạy trên code cũ: 34 chỗ cắt ở chi tiết chuyến (cả hai cỡ), trang chi tiết xe cuộn ngang 1.573 px, bảng vật cản cuộn 1.478 px,
  7 ô cắt ở bảng điều khiển; Planner đã sạch.
- `e2e/fleet-vehicle-preview.spec.ts`: vật cản đang làm nổi đọc qua `tbody[aria-current]` (4 test xanh).
- DOM test chuyến, đội xe, bảng điều khiển không phải sửa (25 file, 122 test xanh).

### Ảnh trước/sau

- Trước: `docs/screenshots/lm-095/before/{trip-detail,vehicle-detail}-{1366,1600}.png`.
- Sau: `docs/screenshots/lm-095/after/{trip-detail,vehicle-detail,planner,dashboard}-{1366,1600}.png`.
- Chụp lại: `E2E_SCREENSHOT_DIR=docs/screenshots/lm-095/after pnpm exec playwright test e2e/layout-1366.spec.ts`.

### Đóng nợ

- N-3 ở `docs/acceptance.md` đóng.

### Đề xuất sửa luật AGENTS

- Mục 5 "Bảng dữ liệu": *Ô chữ dài (tên kiện, tên điểm giao, tên xe) xuống tối đa hai dòng (`line-clamp-2`) trong hàng 48 px thay vì
  cắt bằng dấu ba chấm; cột chữ quan trọng nhận bề rộng theo tỷ lệ bảng (%) chứ không cố định px. Bảng có thể hẹp hơn tổng cột cố định
  thì đặt `min-w` cho bảng trong khung cuộn để cột co giãn không về 0.*
- Mục 5 (mới): *Khung `overflow-x-auto` chứa Select/Switch/Checkbox Radix phải `relative` — ô ẩn định vị tuyệt đối của Radix thoát khỏi
  khung cuộn và làm cả trang cuộn ngang.*

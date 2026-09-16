---
id: LM-070
title: i18n đợt 1 — dịch phần còn lại của nav và các màn luồng Spec
phase: 5
labels: [i18n]
depends_on: [LM-054]
estimate: 1.5d
prd: [D-08]
---

# LM-070 — i18n đợt 1 (phần còn lại)

## Bối cảnh

Màn mới ở phase 3 đã viết bằng `t()`. Còn chuỗi cứng trong các phần giữ lại của Dashboard, danh sách/chi tiết/form chuyến, Planner 3D (toolbar, HUD, inspector, timeline, editor, operations, dialog duyệt), NotFound.

## Việc cần làm

- [x] Quét chuỗi tiếng Việt cứng trong `app/`, `features/manager`, `features/trips`, `features/optimization`, `features/viewer3d`, `components/` và chuyển vào từ điển.
- [x] Nhãn aria, `title`, `sr-only` cũng dịch.
- [x] Ngoại lệ không dịch: badge **MOCK RESULT**; màn So sánh giữ thuật ngữ thuật toán theo AGENTS mục 6.
- [x] Kiểm tra tràn chữ tiếng Anh ở header 56/72px, nút 40/56px, chip, timeline, phone 390px.
- [x] Script/test phát hiện chuỗi có dấu tiếng Việt trong JSX ngoài từ điển.

## Tiêu chí nghiệm thu

- [x] `?lang=en` đi hết luồng Spec không còn chữ tiếng Việt (trừ tên riêng trong dữ liệu).
- [x] Ảnh chụp en ở desktop/tablet không tràn chữ.

## Kết quả (16/09/2026)

- Cổng `no-hardcoded-vietnamese.test.ts`: gỡ khối LM-070 khỏi `PENDING` (`viewer3d/`, `trips/`, `components/`, `app/App.tsx`,
  `lib/stops.ts`); 218 dòng vi phạm → 0. `ALLOWED` không thêm mục nào. Còn lại trong `PENDING` chỉ khối LM-071.
- Từ điển: thêm nhánh `status` (ngay sau `common`), `common.stop/stopWithName/packageAtStop/…`, `trips.detail/skeleton/vehicleCard`,
  và trong `viewer`: `camera`, `colorModes`, `debug`, `header`, `skeleton`, `toolbar`, `inspector`, `timeline`, `selectionLabel`,
  `position`, `selected`, `packageList`, `slice`, `legend`, `cues`, `hud`, `editor` (kèm `snapSources`, `guides`), thêm key ở
  `viewer.operations`. Câu vi giữ nguyên chữ; test/E2E tiếng Việt cũ không phải sửa câu.
- Module thuần trả mã thay vì câu: `snapPosition` trả `SnapSource { axis, kind, id }` (UI dịch qua `formatSnapSource`),
  `editorMeasurements` trả `label` là mã `MeasurementLabel`, `describeWhere` trả `{ layer, side }`, `CAMERA_PRESETS`/`COLOR_MODES`
  chỉ còn giá trị. `stopLabel()` của `lib/stops.ts` bỏ, thay bằng component `components/StopLabel.tsx` (hai trang tài liệu chỉ đổi lời gọi).
  `StatusBadge` đọc nhãn ở `status.<TripStatus>`. Test `tests/viewer-editor.test.ts`, `tests/viewer-scene-first.test.ts` so mã.
- Sửa kèm: tiêu đề bảng kiện ở Chi tiết chuyến dùng nhầm `trips.stops.count` ("6 điểm" cho 6 dòng kiện) → `trips.packages.lineCount`
  ("6 dòng kiện"). Đây là thay đổi chữ vi duy nhất.
- Tràn chữ en đã sửa (vi không đổi chữ): tab hộp thông tin Planner ở desktop chia theo nội dung (`xl:flex`) thay vì 5 cột đều
  ("Operations" bị cắt); nhóm Xếp/Dỡ ở thanh công cụ không co (`shrink-0`, phone 390 "Unloading" bị cắt); nhãn "Cửa sau · Hướng dỡ"
  xuống dòng trên phone; tiêu đề danh sách điểm giao được xuống dòng; đơn vị trên thẻ điểm giao dùng `trips.stops.packagesUnit`
  (en "pcs") để tên điểm không bị ép.
- E2E `e2e/i18n-en.spec.ts` (1440, 1024, 390): tạo chuyến tên tiếng Anh trong trang, đi Chi tiết chuyến → Thiết lập tối ưu → Planner
  (5 tab hộp thông tin, Dỡ hàng, Chỉnh sửa) bằng `?lang=en`; khẳng định không còn ký tự có dấu trong chữ hiển thị, `aria-label`,
  `title`, `placeholder`, `aria-valuetext`, `option` (trừ "Tiếng Việt" và tên người dùng demo), không cuộn ngang và không nhãn bị cắt
  ngoài chủ ý (danh sách/form chuyến chỉ desktop; Chi tiết chuyến/Thiết lập tối ưu trên phone chỉ kiểm chữ — màn điều phối là desktop).
  Ảnh chụp đính kèm báo cáo Playwright.
- Còn lại (ngoài phạm vi): Chi tiết chuyến ở 1440 px vẫn chật (tên điểm giao bị cắt, bảng kiện cuộn ngang) ở cả vi và en;
  select góc nhìn trên phone cắt chữ như bản vi. Chữ của `warehouse/`, `driver/`, `admin/`, `types/`, `design-system/` thuộc LM-071.
- Kiểm tra: `pnpm lint`, `pnpm build`, `pnpm test` (82 file, 520 test) xanh; `pnpm test:e2e` (`E2E_PORT=5203`): 52/53 qua; `warehouse.spec.ts` desktop lỗi một lần do lỗi R3F `onCreated` (`addEventListener` trên null lúc canvas gỡ sớm), chạy lại riêng 3 lần × 3 project đều qua — lỗi chập chờn, không liên quan chữ.

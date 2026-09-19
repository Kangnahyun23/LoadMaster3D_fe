---
id: LM-093
title: Nhập kiện từ CSV và .xlsx — file mẫu, xem trước, lỗi theo dòng
phase: 6
labels: [trips, import]
depends_on: [LM-088]
estimate: 1.5d
prd: [D-49]
spec: [9.3]
---

# LM-093 — Nhập kiện từ file

## Việc cần làm

- [x] Nút phụ "Nhập từ file" ở bảng kiện (chỉ khi được sửa chuyến). Hộp thoại: chọn file `.csv`/`.xlsx`, tải file mẫu (cả hai dạng).
- [x] Cột cố định theo tên trường `CargoPackage` (nhận cả tiêu đề vi/en), `allowedOrientations` dạng `LWH|WLH`.
- [x] Xem trước: từng dòng qua `packageSchema` + validation domain; lỗi hiện theo dòng bằng câu dịch từ mã. Mã trùng (trong file hoặc với kiện có sẵn) là lỗi dòng.
- [x] Nút "Nhập N dòng hợp lệ" (bỏ dòng lỗi, nói rõ số dòng bỏ). Kho: `importPackages` — một lần tăng `inputVersion`, một sự kiện nhật ký.
      (Không thêm hàm vào kho: `trips-api.ts` `importPackages` ghi bằng **một** `updateTrip(tripId, { packages: [...cũ, ...mới] })`.)
- [x] `read-excel-file` tải lười khi mở file .xlsx. AGENTS mục 2 thêm thư viện (đề xuất ở dưới — agent không sửa AGENTS).

## Tiêu chí nghiệm thu

- [x] Unit test phân tích CSV (dấu phẩy thập phân, BOM, dòng trống) và map lỗi; E2E nhập file mẫu có 1 dòng lỗi.

## Kết quả (19/09/2026)

### Đã làm

- **Nút và hộp thoại** (`PackagesTable` `onImport`, `PackageImportDialog`): "Nhập từ file" là nút phụ cạnh "Thêm kiện" (cả ở trạng thái
  chuyến chưa có kiện), chỉ có khi `editable` (quyền `trips.edit` và pha `planning`). Hộp thoại: chọn file (`accept` `.csv`/`.xlsx`),
  tải mẫu `.csv` (Blob, UTF-8 có BOM) và `.xlsx` (`write-excel-file/browser`, `import()` lười khi bấm) — mẫu dựng cho đúng chuyến: tiêu đề
  theo ngôn ngữ đang chọn, hai dòng ví dụ với mã kiện kế tiếp của chuyến và điểm giao có thật, nên nhập nguyên file mẫu ra hai kiện hợp lệ.
- **Đọc file** (`read-import-file.ts`): `.csv` bằng bộ tách tự viết `csv.ts` — bỏ BOM, đoán `,` hay `;` từ dòng tiêu đề (dòng chỉ có dấu
  phân cách không tính), ngoặc kép giữ dấu phân cách / xuống dòng / `""`, CRLF / LF / CR, dòng trống giữ để số dòng khớp Excel; `.xlsx`
  bằng `read-excel-file/browser` tải lười. Đuôi khác hoặc file hỏng: "Không đọc được file này…".
- **Cột** (`package-import-columns.ts`): 19 cột theo tên trường `CargoPackage`; dòng tiêu đề nhận tên trường, tiêu đề vi, tiêu đề en
  (từ điển `trips.import.columns`), không phân biệt dấu, hoa thường, phần đơn vị trong ngoặc. 8 cột bắt buộc (mã, tên, dài, rộng, cao,
  khối lượng, số lượng, điểm giao); cột khác vắng / ô trống lấy mặc định như kiện mới của form. Cột lạ bị bỏ qua và được liệt kê.
- **Đọc ô** (`import-cells.ts`): số kiểu Việt và kiểu Anh (`12,5`, `12.5`, `1.234,5`, `1,234.5`; một dấu duy nhất là dấu thập phân), tỷ lệ
  nhận `80%`, đúng/sai `true/false/có/không/yes/no/1/0/x`, hướng đặt `LWH|WLH` (nhận cả `,` `;` `/` khoảng trắng, chữ thường), mức dễ vỡ
  theo mã hoặc nhãn vi/en. Kích thước `roundCm`, khối lượng `roundKg` tại biên (D-03).
- **Xem trước** (`package-import.ts`, hàm thuần `previewImport`): lỗi cả file (rỗng, thiếu cột bắt buộc, cột trùng, > 2.000 dòng) hoặc
  từng dòng với lỗi dạng mã: ô bắt buộc trống, không phải số / có-không / mã hướng / mức dễ vỡ, mã lỗi của `cargoPackageSchema`, mã kiện
  trùng trong file (dòng đầu giữ) hoặc với kiện có sẵn, điểm giao không có trong chuyến, rồi kiểm tra domain `validatePackages` cùng kiện có
  sẵn (mã instance đụng nhau, `DUPLICATE_INSTANCE_ID`) và `checkDoorClearance` với xe đang gán. Câu (`package-import-messages.ts`): lỗi
  ràng buộc qua `formatIssue`, lỗi schema dùng câu của form kiện kèm tiêu đề cột ("Số lượng: Số lượng tối thiểu là 1."), câu riêng cho mã
  form không có (hướng lặp, giữ thẳng đứng, điểm giao nguyên).
- **Nhập** (`useImportPackagesMutation` → `trips-api.ts` `importPackages`): "Nhập N dòng hợp lệ" (tắt khi chưa có dòng hợp lệ), cạnh đó
  "Bỏ qua M dòng lỗi."; ghi một lần `updateTrip` — `inputVersion` tăng một lần, kho ghi một sự kiện `trip.updated` (`fields: packages`);
  toast "Đã nhập N dòng kiện" kèm số dòng bỏ. Lỗi kho hiện trong hộp thoại (`dataErrorMessage`). Xem trước tính lại theo kiện hiện có.

### File chính

`src/features/trips/`: `PackageImportDialog.tsx`, `PackageImportPreview.tsx`, `package-import.ts`, `package-import-columns.ts`,
`package-import-messages.ts`, `package-import-template.ts`, `import-cells.ts`, `csv.ts`, `read-import-file.ts`, `download-file.ts`,
`PackagesTable.tsx`, `TripDetailPage.tsx`, `trips-api.ts`, `useTripsQuery.ts`; từ điển `src/lib/i18n/{vi,en}/trips.ts` (nhánh
`trips.import`).

### Kiểm thử

- Unit: `csv.test.ts` (5: BOM, đoán `;`, ngoặc kép / xuống dòng trong ô, dòng trống, dòng chỉ có dấu phân cách), `import-cells.test.ts`
  (7: dấu phẩy / chấm thập phân, nhóm nghìn hai kiểu, chữ không phải số, phần trăm, có/không, hướng đặt, ô ngày), `package-import.test.ts`
  (7: CSV Excel tiếng Việt có BOM + `;` + dấu phẩy thập phân + dòng trống; tiêu đề en + tên trường + cột lạ; thiếu cột; câu lỗi theo cột;
  trùng mã trong file / với kiện có sẵn / điểm giao lạ; `DUPLICATE_INSTANCE_ID` và `DOOR_TOO_SMALL`; file mẫu vi/en `.csv` và `.xlsx`
  đọc lại ra đúng hai kiện hợp lệ — `.xlsx` đi qua `write-excel-file` + `read-excel-file` thật).
- DOM `PackageImportDialog.dom.test.tsx` (3): file có một dòng lỗi → câu lỗi theo dòng, chỉ dòng hợp lệ được ghi, `inputVersion` +1, đúng
  một sự kiện mới; thiếu cột → thông báo, không nhập được; file không phải `.csv`/`.xlsx`. `TripDetailPage.dom.test.tsx`: chuyến đang xếp và
  quản lý không có nút "Nhập từ file".
- E2E mới `e2e/package-import.spec.ts` (1, desktop): tải mẫu `.csv` của chuyến, thêm một dòng lỗi, `setInputFiles` với buffer → "Đọc được
  3 dòng: 2 hợp lệ, 1 lỗi.", nhập 2 dòng → bảng có `PKG-004`, `PKG-005`, `inputVersion` +1, một sự kiện `trip.updated`.
- `pnpm lint`, `pnpm exec tsc -b`, `pnpm build` xanh (hai thư viện Excel thành chunk riêng, chỉ tải khi bấm); `pnpm test` 103 file, 654
  test xanh. `E2E_PORT=5193 pnpm exec playwright test e2e/package-import.spec.ts e2e/trip-lifecycle.spec.ts e2e/rbac.spec.ts
  e2e/i18n-en.spec.ts e2e/spec-flow.spec.ts e2e/optimization-flow.spec.ts`: 20/20 xanh.

### Ghi chú

- Lần chạy E2E đầu tiên sau khi kéo nhánh có thể bị Vite tải lại trang một lần: bộ tối ưu phụ thuộc dùng cache cũ, gặp `import()` của
  `write-excel-file/browser` / `read-excel-file/browser` lúc chạy thì tối ưu lại và tải lại trang (mất kho in-memory giữa kịch bản). Chạy
  lại là xanh; CI cài mới nên quét thấy ngay từ đầu. Nếu muốn chắc chắn: `optimizeDeps.include` hai gói đó trong `vite.config.ts`.
- Cổng `no-hardcoded-vietnamese` tách chú thích bằng cách đếm dấu ngoặc: dấu `"` nằm trong biểu thức chính quy làm lệch trạng thái và báo
  nhầm chú thích phía sau. Viết `text.includes('"')` thay vì `/["…]/`.

### Đề xuất sửa luật AGENTS

- Mục 2, danh sách thư viện: `read-excel-file` (đọc `.xlsx` khi nhập kiện, `/browser`, `import()` lười) và `write-excel-file` (file mẫu
  nhập kiện, xuất báo cáo — `/browser`, `import()` lười).
- Mục 6 "Nút chưa hoạt động": "Nhập từ file" (LM-093) nay là nút thật ở bảng kiện, chỉ hiện khi được sửa chuyến.

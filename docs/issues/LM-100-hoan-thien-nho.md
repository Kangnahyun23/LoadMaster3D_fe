---
id: LM-100
title: Hoàn thiện nhỏ — tiêu đề tab, câu quảng cáo tải trục, cảnh báo rời form chuyến, E2E còn thiếu
phase: 6
labels: [polish]
depends_on: [LM-088]
estimate: 1d
prd: [D-20]
---

# LM-100 — Hoàn thiện nhỏ

## Việc cần làm

- [x] `document.title` theo màn ("Chuyến TRIP-… · LoadMaster"), dịch theo ngôn ngữ.
- [x] Màn đăng nhập bỏ câu "kiểm tra tải từng trục" (tính năng đang "Sẽ có sau").
- [x] Form chuyến cảnh báo rời trang khi còn thay đổi chưa lưu (như form xe).
- [x] E2E cho `/chuyen/:id/so-sanh` và 404.

## Tiêu chí nghiệm thu

- [x] Lint/build/test/E2E xanh.

## Kết quả (19/09/2026) — mục "Form chuyến cảnh báo rời trang"

Chỉ làm mục này (cùng đợt với LM-088); các mục còn lại của issue chưa làm.

- **Đã làm:** `TripFormPage` (tạo và sửa chuyến) dùng `useBlocker` như `fleet/VehicleForm.tsx`: form còn thay đổi chưa lưu
  (`formState.isDirty`) mà sang đường dẫn khác (nút Huỷ, nút quay lại, nav rail, Back của trình duyệt) thì hỏi "Rời trang khi chưa lưu?"
  bằng `ConfirmDialog` — "Ở lại" giữ nguyên chữ đang nhập, "Rời trang" (danger) đi tiếp. Đổi ngôn ngữ hay tham số cùng trang không hỏi.
  Lưu xong thì rời trang trong effect ở lần render sau, để hộp hỏi không chặn chính lần chuyển trang sau khi lưu. Chữ ở nhánh
  `trips.leave` (vi/en).
- **File chính:** `src/features/trips/TripFormPage.tsx`, `src/lib/i18n/{vi,en}/trips.ts`.
- **Kiểm thử:** `TripFormPage.dom.test.tsx` +2 (thay đổi chưa lưu: ở lại giữ chữ, xác nhận thì rời; form chưa đụng tới rời ngay, không
  hỏi) — tổng 8 test, chạy trên data router (`createMemoryRouter`; `useBlocker` cần data router). E2E tạo chuyến vẫn đi thẳng sang chi
  tiết sau khi lưu: `spec-flow` (luồng chính desktop, "switching to English mid-flow"), `trip-lifecycle` (tạo chuyến có ngày + tài xế) xanh.
- **Lệnh:** `pnpm lint`, `pnpm exec tsc -b`, `pnpm test` xanh.
- **Đề xuất:** `ConfirmDialog` nay dùng ở hai feature (đội xe, chuyến) — chuyển từ `features/fleet/` lên `src/components/` (AGENTS mục 3:
  dùng chung từ hai feature thì đưa lên `components/`). Agent này không sửa `features/fleet/**` nên chưa chuyển.

## Kết quả (20/09/2026)

Các mục còn lại của issue, cùng đợt với LM-095, và các việc tồn đọng giao kèm.

### Tiêu đề tab (`document.title`)

- Route trong `src/app/App.tsx` khai `handle: titled((t, source) => …)`; nhóm route cần quyền (`guarded`) mang `handle.permission`.
  Bảng route export `routes` để test dựng lại bằng `createMemoryRouter`.
- `src/app/route-title.ts`: `useRouteTitle()` đọc `useMatches()` — tên của route sâu nhất có khai, tham số lấy từ route lá (`:tripId`,
  `:vehicleId`) hoặc truy vấn (`?chuyen=`) — rồi đặt `"<tên màn> · LoadMaster"`. Gọi đúng một chỗ: `RouteOutlet` (đổi tên từ
  `SuspenseOutlet`), layout của mọi nhóm route — đăng nhập, khung có nav rail (`AppShell`), màn toàn màn hình, trang tài liệu; không trang
  nào tự đặt. Thiếu quyền của nhóm route thì tab là "Không có quyền truy cập · LoadMaster" (403 hiện thay màn đích). `NotFoundPage` nằm
  ngoài `RouteOutlet` nên tự đặt qua `useDocumentTitle` ("Không tìm thấy trang" / "Đã xảy ra lỗi").
- Ví dụ: "Chuyến TRIP-011 · LoadMaster", "Phương án TRIP-2026-0914 · LoadMaster", "Xe VEHICLE-002 · LoadMaster",
  "Xếp hàng TRIP-2026-0914 · LoadMaster" (`/kho?chuyen=`), "Giao hàng TRIP-010 · LoadMaster"; đổi sang English là "Trip TRIP-011 ·
  LoadMaster". Chữ ở nhánh từ điển mới `titles` (`src/lib/i18n/{vi,en}/titles.ts`).
- Màn 404: nút "Về màn chính" nay mở màn chính của vai trò (`ROLE_HOME`, như màn 403) thay vì `/` — tài xế bấm `/` từng rơi vào 403.

### Màn đăng nhập

- Bỏ `auth.showcase.axleLoad` ("Kiểm soát tải trọng từng trục…" — tải trục đang "Sẽ có sau", AGENTS mục 6). Thay bằng
  `auth.showcase.sharedPlan`: "Kho xếp và tài xế dỡ theo cùng một phương án 3D đã duyệt" / "The warehouse loads and drivers unload from
  the same approved 3D plan" — đúng với sản phẩm hiện tại (kho và tài xế chỉ đọc revision đã duyệt).

### E2E còn thiếu

- `e2e/plan-compare-404.spec.ts` (2 test, desktop): So sánh phương án của `TRIP-2026-0914` có 2 thẻ revision, thẻ nào cũng MOCK RESULT;
  chọn `REV-001` → "Mở REV-001 trong 3D" → Planner `?revision=REV-001` (còn nút Duyệt, tức đúng bản chưa duyệt), tiêu đề tab của cả hai
  màn. Đường dẫn lạ khi đăng nhập tài xế → 404, tab "Không tìm thấy trang · LoadMaster", "Về màn chính" → `/tai-xe`.

### Việc tồn đọng đã xử lý

- [x] **5. `ConfirmDialog`** chuyển `src/features/fleet/` → `src/components/ConfirmDialog.tsx` (dùng ở đội xe, chuyến, người dùng); sửa
  import ở `VehicleForm`, `TripFormPage`, `UsersPage` (UsersPage chỉ đổi import). `pending` = true thì nút huỷ `disabled`.
  DOM test mới `ConfirmDialog.dom.test.tsx` (2).
- [x] **6. `useListUrlState`** thêm `defaultPageSize` (vắng là 25): URL vắng `so-dong` là cỡ mặc định của màn, chọn đúng cỡ mặc định thì
  xoá tham số. `AuditLogPage` bỏ hook tự giữ `so-dong`, dùng `defaultPageSize: 50`. Sửa lỗi đua LM-088 ghi lại: setter không còn dùng
  `setSearchParams(fn)` (hàm nhận tham số của lần render trước) mà tính URL mới từ bản nháp mới nhất đã gửi (`useRef`, bỏ khi
  `location.search` đổi). DOM test +3 trong `useListUrlState.dom.test.tsx`: một lần bấm đổi hai bộ lọc (`tu` + `den`) thì cả hai lên URL
  (đã kiểm: test đỏ với code cũ, URL chỉ còn `?den=…`), cỡ mặc định 50 (25 ghi `so-dong=25`, 50 xoá tham số), không truyền thì 25.
- [x] **7. Nhãn loại sự cố giao** một nguồn `common.deliveryIssueKinds` (vi/en) cho báo sự cố và tổng kết của tài xế, tiến trình chuyến,
  nhật ký; bỏ `driver.issue.kinds`, `trips.progress.issueKinds`, `audit.log.issueKinds`. Câu giữ như màn tài xế và chi tiết chuyến; riêng
  nhật ký trước ghi "Khách từ chối nhận", nay "Khách từ chối" như hai màn kia (`audit-log.test.ts` sửa theo).
- [x] **8. Khung 3D kho** không còn vẽ kiện báo thiếu như đã xếp: `LoadingSessionView` truyền `missingIds` (từ `session.missing`) cho
  `PositionViewer`, `PositionViewer` đưa vào `deriveSceneSemantics` như kiện đã gỡ (`unloadedIds` — cùng cách khung 3D tài xế bỏ kiện
  thiếu): ẩn theo ID bằng buffer instance sẵn có, không tính trọng tâm, không thêm mesh hay draw call. `e2e/viewer-operations-ui.spec.ts`
  (test kho): báo thiếu kiện bước 2 → sang bước 3 còn 2 kiện đặc (bước 1 + kiện hiện tại) và 1 kiện mờ; với code cũ là 3 kiện đặc.
- [x] **9. Rà bằng Playwright** (script tạm, cùng phép đo của `layout-1366.spec.ts` + vùng chạm < 56 px ở màn cảm ứng + đếm nút
  primary): kho `/kho` và phiên xếp 1.024 × 768, tài xế `/tai-xe` và `/tai-xe/diem-giao?chuyen=TRIP-010` 390 × 844, bảng điều khiển,
  nhật ký, người dùng, đội xe, danh sách/tạo chuyến, thiết lập tối ưu, so sánh phương án ở 1.366 × 768.
  - Không màn nào cuộn ngang; mọi màn đúng một nút primary; màn kho và tài xế không có vùng chạm nào dưới 56 px.
  - Đã sửa: danh sách chuyến cắt mất biển số xe ("Hino XZU720 · 51D-4…") — tên xe tối đa hai dòng qua `VehicleName` dùng chung mới
    (`src/components/VehicleName.tsx`: chỉ xuống dòng trước biển số, dùng ở chi tiết chuyến, danh sách chuyến, bảng điều khiển); cột mã
    chuyến 156 → 136 px, tài xế 160 → 148 px nhường cho tên chuyến. Nhật ký cắt tên đối tượng và chi tiết — cột đối tượng 300 → 340 px
    (đủ tên tuyến dài nhất của seed), cột người làm 196 → 176 px, chi tiết tối đa hai dòng (giữ `title`). Chi tiết xe: nhãn "Chưa dùng
    trong tính toán" của bảng trục kéo dài hết bề ngang — nay ôm chữ. Màn kho: nhãn "Thứ tự tính lại ở FE" là từ vựng kỹ thuật (U-8, AGENTS
    mục 6) — nay "Thứ tự xếp tính lại khi duyệt" / "Loading order recalculated at approval".
  - Chưa sửa (ghi lại): danh sách chuyến ở 1.366 px vẫn cắt bằng dấu ba chấm tên tuyến dài (≈ 7/15 chuyến seed) và chuỗi điểm giao ở dòng
    phụ — cắt có chủ ý của bảng dày, đủ tên ở chi tiết chuyến; muốn hết cắt cần bỏ bớt cột hoặc cho tên hai dòng (hàng cao hơn 48 px).
    Ghi chú bảo dưỡng ở danh sách đội xe cắt sau ~130 px (có `title`, đủ câu ở trang xe). Ô ngày `<input type="date">` hiện
    `mm/dd/yyyy` theo locale trình duyệt (Chromium en-US của Playwright), không theo ngôn ngữ app.

### Kiểm thử

- Unit/DOM mới: `src/app/route-title.dom.test.tsx` (4: tiêu đề theo mã chuyến và đổi theo ngôn ngữ; đổi màn, mã trên truy vấn; 403 và
  404 kèm nút về màn chính đúng vai trò; màn đăng nhập), `src/components/ConfirmDialog.dom.test.tsx` (2), `useListUrlState.dom.test.tsx`
  (+3). `audit-log.test.ts` sửa theo nhãn sự cố dùng chung.
- `pnpm lint`, `pnpm exec tsc -b` xanh; `pnpm test` 119 file, 738 test xanh.
- E2E mới/đụng (desktop 1.600 × 1.000 trừ khi ghi khác): `layout-1366`, `plan-compare-404`, `viewer-operations-ui` (6, gồm tablet/phone),
  `warehouse` (4, gồm tablet), `warehouse-progress` (tablet), `driver-delivery` (phone), `trip-lifecycle`, `fleet-vehicle-preview`,
  `admin-users`, `admin-audit`, `manager-dashboard`, `rbac`, `i18n-en`, `spec-flow`. Lần cuối (`E2E_PORT=5197`, sau mọi thay đổi):
  `layout-1366` + `plan-compare-404` + `warehouse` + `manager-dashboard` + `trip-lifecycle` + `rbac` + `i18n-en` + `spec-flow` 24/24 xanh;
  `viewer-operations-ui` + `warehouse-progress` + `driver-delivery` + `admin-*` 15 test (13 xanh, 2 đỏ từ trước — dưới đây, đã sửa và
  chạy lại xanh); `fleet-vehicle-preview` 4/4.
- Hai spec đỏ từ trước, đã sửa ở spec: `admin-users` chờ tài xế mới về `/tai-xe/diem-giao` nhưng màn chính của tài xế là `/tai-xe` từ
  LM-087 (chờ hết 4 phút rồi đỏ); `admin-audit` phụ thuộc giờ chạy — seed ghi sự kiện "hôm nay" tới 16:00 giờ Việt Nam nên chạy buổi sáng
  thì sự kiện seed đứng trên lần đăng nhập vừa làm; nay cài đồng hồ trang về 23:30 hôm nay (`page.clock.install`, đồng hồ vẫn trôi).

### Đề xuất sửa luật AGENTS

- Mục 3, cây thư mục: `components/ConfirmDialog.tsx` (hộp xác nhận dùng chung: đội xe, chuyến, người dùng), `components/VehicleName.tsx`
  (tên xe không bẻ biển số), `app/route-title.ts` (tiêu đề tab).
- Mục 9 (mới, "Tiêu đề tab"): *Mỗi route trong `App.tsx` khai `handle: titled(...)` bằng chữ của nhánh `titles`; màn có mã thì kèm mã
  (tham số đường dẫn hoặc truy vấn). `useRouteTitle` chạy trong `RouteOutlet` của mọi nhóm route — trang không tự đặt `document.title`;
  màn nằm ngoài `RouteOutlet` (404/lỗi router) dùng `useDocumentTitle`. Thêm màn mới thì thêm tiêu đề.*
- Mục 9 "Dữ liệu dùng chung": *Màn danh sách chọn cỡ trang mặc định bằng `useListUrlState({ defaultPageSize })`, không tự giữ `so-dong`.*
- Mục 6 i18n: *Nhãn một mã nghiệp vụ dùng ở nhiều màn (loại sự cố giao: `common.deliveryIssueKinds`) khai một lần, không chép vào nhánh
  của từng màn.*
- Mục 7 "Operations": *Kho truyền kiện báo thiếu (`missingIds`) cho `PositionViewer`; kiện thiếu vẽ như kiện đã gỡ (`unloadedIds` của
  `deriveSceneSemantics`), như khung 3D tài xế.*

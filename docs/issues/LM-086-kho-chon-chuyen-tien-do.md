---
id: LM-086
title: Kho — chọn chuyến, ghi tiến độ và kiện thiếu vào kho, xếp xong chuyển trạng thái
phase: 6
labels: [warehouse, touch]
depends_on: [LM-083, LM-084]
estimate: 1.5d
prd: [D-45, D-46, D-47]
---

# LM-086 — Kho

## Việc cần làm

- [x] `/kho`: danh sách chuyến đã duyệt chờ xếp và đang xếp (ngày, xe, số kiện, tiến độ), nút 56 px "Bắt đầu xếp" / "Tiếp tục (x/y)".
      Bản duyệt lỗi thời: hiện cảnh báo, không cho bắt đầu, nói chờ điều phối duyệt lại. Rỗng: trạng thái rỗng thật.
- [x] `/kho?chuyen=`: vào lần đầu → `startLoading`; xác nhận → `recordLoadingStep(loaded)`; "Kiện này không có ở kho" → hộp xác nhận → `missing`;
      bước cuối → `completeLoading`. Mở lại trong phiên thì tiếp tục ở kiện chưa ghi đầu tiên.
- [x] Màn xếp xong: số kiện đã xếp, danh sách kiện thiếu, nút về danh sách.
- [x] Thoát: ở danh sách là đăng xuất (màn chính của kho); trong phiên là về danh sách.
- [x] Từ điển nhánh `warehouse`; không từ vựng kỹ thuật mới.

## Tiêu chí nghiệm thu

- [x] E2E tablet: đăng nhập kho → chọn chuyến chính → xếp 2 kiện, báo thiếu 1 → rời màn → vào lại tiếp tục đúng bước;
      điều phối thấy chuyến "Đang xếp hàng" và kiện thiếu (E2E kiểm trong kho dùng chung; hiển thị ở màn chuyến là LM-088, xem dưới).

## Kết quả (19/09/2026)

- `/kho` (`WarehousePage` → `WarehouseTripsPage`): danh sách từ `warehouseTripRows` — đang xếp trước, rồi đã duyệt chờ xếp, cuối cùng
  chuyến có bản duyệt lỗi thời (thẻ cảnh báo "chờ điều phối viên duyệt lại", không có nút); cùng nhóm thì ngày chạy sớm trước. Chuyến lỗi
  thời mà chưa từng được duyệt không hiện (không có gì để xếp). Thẻ cỡ cảm ứng: mã chuyến 22 px, badge trạng thái 16 px, tuyến, ngày chạy,
  xe (có biển số), số kiện, tiến độ `x/y` kèm "thiếu n", thanh tiến độ khi đang xếp; nút 56 px "Bắt đầu xếp" / "Tiếp tục (x/y)". Một nút
  primary mỗi màn: chuyến nên làm trước (đang xếp dở, không thì chuyến chờ xếp đầu tiên), còn lại secondary. Rỗng → trạng thái rỗng thật.
- `/kho?chuyen=` (`LoadingStepPage`): `warehouseSession` suy việc cần làm từ pha + revision. Đã duyệt → tự `startLoading` một lần (ref
  chặn lần chạy thứ hai của StrictMode; bị từ chối vì máy khác vừa bắt đầu thì lần đọc lại vẫn đưa vào phiên) rồi vào phiên; đang xếp →
  kiện chưa có kết quả đầu tiên theo `loadingOrder` của bản duyệt **đã chốt lúc bắt đầu** (`loading.revisionId`); đã xếp xong (kể cả khi
  xe đã đi giao) → màn Xếp xong; bản duyệt lỗi thời → "Chờ điều phối viên duyệt lại", không gọi `startLoading`; chưa có bản duyệt, đã huỷ
  (kèm lý do) hoặc lỗi kho (`dataErrorMessage`) → nói lý do, nút 56 px về danh sách.
- Xác nhận → `recordLoadingStep(loaded)`; lớp phủ "Đã xếp" giữ tối thiểu 1,2 s **và** tới khi kho ghi + đọc lại xong, nên không lộ lại
  kiện vừa xác nhận; kiện cuối thì lớp phủ nói "Đang hoàn tất xếp hàng…". "Kiện này không có ở kho" → hộp xác nhận (56 px) → `missing`
  + toast "Đã ghi thiếu …". Kiện cuối có kết quả thì `warehouse-api.recordLoadingStep` gọi luôn `completeLoading`; lần hoàn tất đó lỗi
  thì màn hiện nút "Hoàn tất xếp hàng" để thử lại (không báo xong giả). Ghi lỗi → toast lỗi của kho, kiện hiện tại giữ nguyên.
- Màn Xếp xong (`LoadingFinished`): "Đã xếp x / y kiện", danh sách kiện thiếu (mã, tên, điểm giao), nút primary về danh sách.
- Thoát: danh sách truyền `screenHome="/kho"` → nhân viên kho đăng xuất; mọi màn của phiên truyền `screenHome = /kho?chuyen=…`
  (`loadingSessionPath`) → `exitAction` trả `/kho`; điều phối/quản trị về `/chuyen/<mã>` (`contextual`). `exit.ts`, `ExitControl.tsx`
  chỉ sửa chú thích; `exit.test.ts` thêm ca phiên kho.
- Dữ liệu: `warehouse-api.ts` (`fetchWarehouseTrips`, `fetchWarehouseTrip`, `startLoading`, `recordLoadingStep`, `completeLoading`) →
  `useWarehouseQueries.ts`. Mọi ghi invalidate `['warehouse']`, `['trips']`, `['dashboard']`, `['vehicles']` trong `onSettled` và trả
  promise: mutation chỉ xong khi màn đã đọc lại. Scene 3D dựng lại chỉ khi phương án đổi (`useSessionModel`, nhờ structural sharing).
  Ô 3D: khung giữ chỗ nằm đúng ô của khung 3D nên lúc tải xong bố cục không nhảy.
- Từ điển `warehouse` (vi/en): thêm `list`, `missingDialog`, `finished` mới, câu lỗi thời/huỷ/bắt đầu; bỏ key không còn dùng (`skipped`,
  `emptyDescription`, `toTrips`, `loadErrorDescription`, `stale`, `finished.backToTrip`). Không thêm từ vựng kỹ thuật; giữ "Thứ tự tính
  lại ở FE" (D-32).
- Dùng chung: `StatusBadge` nhận `className` (bản 16 px cho màn cảm ứng); `src/lib/calendar-date.ts` đổi ngày chạy `YYYY-MM-DD` thành
  `Date` giữa trưa giờ máy — `format.date('2026-09-14')` trực tiếp là nửa đêm UTC, máy múi giờ âm sẽ hiện ngày hôm trước. LM-087 dùng lại.
- Gỡ: `select-plan.ts` (+ test), `useWarehousePlanQuery.ts`, `useLoadingSession.dom.test.tsx` (hook cũ giữ bước trong state; logic nay ở
  `loading-session.ts` + test màn).

File chính: `src/features/warehouse/{WarehousePage,WarehouseTripsPage,WarehouseTripCard,LoadingStepPage,LoadingSessionView,LoadingFinished,
MissingPackageDialog,WarehouseEmpty,StepHeader,PlanNotices,ConfirmedOverlay}.tsx`, `{warehouse-trips,loading-session,warehouse-api,
useWarehouseQueries,useLoadingSession,useSessionModel}.ts`, `src/lib/i18n/{vi,en}/warehouse.ts`, `src/app/App.tsx` (route `/kho`),
`src/components/StatusBadge.tsx`, `src/lib/calendar-date.ts`, `e2e/warehouse-progress.spec.ts`.

Kiểm thử: unit `warehouse-trips.test.ts` (4), `loading-session.test.ts` (6), `exit.test.ts` (+1); DOM `WarehouseTripsPage.dom.test.tsx` (3),
`LoadingStepPage.dom.test.tsx` (7, viết lại). E2E mới `warehouse-progress.spec.ts` (tablet: chọn chuyến chính → xếp 2, báo thiếu 1 → thoát về
danh sách → "Tiếp tục (3/132)" → đúng bước 4; kho: `dang_xep_hang`, kiện thiếu đúng kiện vừa báo). Sửa `warehouse.spec.ts` (danh sách tiếng
Anh + phiên, trạng thái rỗng về `/kho`), đoạn `/kho` của `viewer-operations-ui.spec.ts`, `viewer-ui.spec.ts`.

Kiểm tra: `pnpm lint` ✅ · `tsc -b` ✅ · `pnpm test` 583/584 — 1 lỗi hết giờ có sẵn ở `trips/TripFormPage.dom.test.tsx` (đỏ cả trên
`074949a` khi máy tải nặng, chạy riêng xanh; không thuộc issue này) · E2E cổng 5297 (5191 đang do dev server của worktree khác giữ):
`warehouse-progress` + `warehouse` 5/5 ✅, đoạn `/kho` của `viewer-operations-ui` và `viewer-ui` ✅. `spec-flow` đỏ ở bước Đội xe có sẵn từ
LM-083 (chờ `VEHICLE-005`, seed 8 xe nên xe mới là `VEHICLE-009`); sửa tạm dòng đó thì cả hai luồng desktop/tablet, gồm bước cuối
`/kho?chuyen=TRIP-015` qua phiên mới, đều xanh — không commit sửa đó.

Còn lại / đề xuất luật:
- "Điều phối thấy Đang xếp hàng và kiện thiếu" ở giao diện thuộc LM-088: `trips/trip-list.ts` hiện chỉ có 4 trạng thái lập kế hoạch.
- Khung 3D của kho vẫn vẽ kiện đã báo thiếu ở chỗ của nó trong phương án (như đã xếp). Muốn làm mờ thì `PositionViewer` cần nhận tập kiện
  thiếu — chưa làm, ngoài phạm vi viewer.
- Đề xuất sửa AGENTS mục 7 "Foundation engine", câu về kho: nay `/kho` là danh sách chuyến (LM-086), `/kho?chuyen=` là phiên xếp theo bản
  duyệt chốt lúc bắt đầu, tiến độ/kiện thiếu ghi vào kho; bản duyệt lỗi thời **không** vào phiên (chờ duyệt lại) thay vì "vẫn hiện kèm cảnh
  báo"; không còn "không có `?chuyen` thì chuyến đầu tiên có bản duyệt". Mục 1: nhân viên kho trong phiên thoát là về danh sách `/kho`.

---
id: LM-087
title: Tài xế — chuyến của tôi, ghi dỡ hàng, gọi khách, báo sự cố, tổng kết chuyến
phase: 6
labels: [driver, touch, phone]
depends_on: [LM-083, LM-084]
estimate: 1.5d
prd: [D-45, D-46, D-47]
---

# LM-087 — Tài xế

## Việc cần làm

- [x] `/tai-xe`: "Chuyến của tôi" (tài xế chỉ thấy chuyến gán cho mình; quản trị thấy tất cả): đã xếp xong / đang giao dùng được;
      chuyến kho chưa xếp xong hiện nhưng không bấm được, nói lý do; chuyến hoàn thành gần đây ở nhóm riêng.
- [x] `/tai-xe/diem-giao?chuyen=`: "Bắt đầu giao" → `startDelivery`; đánh dấu dỡ → `recordUnload`; nút Gọi (`tel:`) khi điểm có SĐT;
      "Báo sự cố" cho kiện (hỏng / thiếu / khách từ chối / khác + ghi chú) → `reportDeliveryIssue`; hoàn tất điểm khi mọi kiện đã dỡ hoặc có sự cố.
- [x] Điểm cuối → màn **Tổng kết chuyến**: số điểm, kiện đã giao, sự cố, thời gian bắt đầu–kết thúc; nút về danh sách.
- [x] Dòng kiện đã dỡ phân biệt rõ (nền + icon), không chỉ khác viền (U-7).
- [x] Thoát: danh sách là đăng xuất; trong chuyến là về danh sách. Mở lại trong phiên tiếp tục đúng điểm.

## Tiêu chí nghiệm thu

- [x] E2E phone: tài xế demo giao hết chuyến đã xếp xong, báo một sự cố, thấy tổng kết; điều phối thấy "Hoàn thành" và sự cố
      (E2E kiểm trong kho dùng chung; hiển thị ở màn chuyến là LM-088).
- [ ] Thử trên điện thoại thật ở LM-101.

## Kết quả (19/09/2026)

- `/tai-xe` = "Chuyến của tôi" (`MyTripsPage`, route mới trong nhóm `guarded('driver.operate', …)`; `/tai-xe/*` lạ và
  `/tai-xe/diem-giao` thiếu `?chuyen` về `/tai-xe`). `myTrips` chia ba nhóm: **Sẵn sàng giao** (đang giao trước, rồi đã xếp xong),
  **Kho đang chuẩn bị** (đang xếp trước, rồi đã duyệt — không có nút, nói "Kho chưa bắt đầu xếp" / "Kho đang xếp x/y kiện — chưa giao
  được"), **Đã hoàn thành gần đây** (5 chuyến mới nhất theo giờ giao xong, nút "Xem tổng kết"). Chuyến nháp/đã tối ưu/lỗi thời/huỷ không
  hiện. Thẻ: mã chuyến 22 px, badge 16 px, tuyến, ngày chạy · số điểm · số kiện trên xe (trừ kiện kho báo thiếu), xe trên dòng riêng (biển
  số không bị ngắt); một nút primary (chuyến nên giao trước). Tài xế chỉ thấy chuyến `driverId` = mình, quản trị thấy mọi chuyến:
  `driver-api` đọc người đăng nhập từ phiên của kho như server; mở bằng URL chuyến của tài xế khác → `NOT_FOUND` như chuyến không tồn tại.
- `/tai-xe/diem-giao?chuyen=` (`DriverStopPage` → `DeliveryStopView`): phương án là bản kho đã xếp (`loading.revisionId`), kho chưa
  xếp thì bản duyệt mới nhất. Theo pha: kho chưa xếp xong → **xem trước** điểm 1, không có nút đánh dấu, không có nút chính, thông báo
  "chưa bắt đầu giao được"; đã xếp xong → nút chính "Bắt đầu giao" (`startDelivery`); đang giao → điểm chưa hoàn tất đầu tiên, nút tròn
  56 px đánh dấu / bỏ đánh dấu đã dỡ (`recordUnload`), "Báo sự cố", "Hoàn tất điểm giao" chỉ bật khi mọi kiện đã dỡ hoặc có sự cố (dòng
  dưới danh sách nói còn mấy kiện) và không còn lượt đánh dấu nào đang ghi; hoàn thành → **Tổng kết chuyến**; huỷ / chưa có bản duyệt /
  lỗi kho → nói lý do, nút về danh sách.
- Danh sách kiện của điểm dùng `stopDeliveries` (thứ tự `unloadingOrder`) trừ kiện kho báo thiếu; điểm có kiện thiếu hiện dòng "Kho báo
  thiếu n kiện…". Khung 3D "Xem vị trí hàng" coi kiện đã dỡ ở mọi điểm và kiện kho báo thiếu là không còn trên xe.
- Dòng kiện (U-7): đã dỡ → nền xanh nhạt + dòng "Đã dỡ" có dấu kiểm; có sự cố → nền vàng nhạt + "Sự cố: <loại>" có biểu tượng cảnh
  báo; nút tròn giữ như cũ. `DeliveryItemRow` giữ API cũ (`item`, `done`, `onToggle`) cho trang `/thanh-phan`.
- Thẻ điểm giao: tên, địa chỉ, "người nhận · số điện thoại"; nút **Gọi** (`tel:` bỏ khoảng trắng, chỉ khi điểm có số) cạnh nút Chỉ
  đường, cả hai 56 px secondary.
- "Báo sự cố" (`ReportIssueDialog`, react-hook-form + zod `issue-form.schema.ts`): chọn kiện (chọn sẵn kiện chưa dỡ, chưa có sự cố
  đầu tiên), bốn loại là bốn ô bấm 56 px (radio thật), ghi chú tối đa 300 ký tự; "Khác" bắt buộc ghi chú; lỗi là mã, UI dịch. Hộp
  thoại rộng tối đa bề ngang màn trừ lề 24 px (khung 640 px của `DialogContent` không co trên điện thoại).
- Tổng kết (`TripSummary`): số điểm, kiện đã giao, số sự cố (số 28 px), giờ bắt đầu – kết thúc · ngày; danh sách sự cố (loại, kiện ·
  điểm, tên kiện, ghi chú); nút chính về danh sách. Mọi số từ `deliverySummary` trên tiến độ trong kho.
- Tiến độ đọc/ghi qua `driver-api.ts` → `useDriverQueries.ts` (khoá dưới `['trips', 'driver', …]`), không `useState` giữ dữ liệu
  nghiệp vụ; mở lại là đúng điểm. Đánh dấu dỡ cập nhật lạc quan vào cache (`withUnload`) — chỉ lượt ghi cuối còn chạy mới đọc lại kho,
  để bấm liên tiếp nhiều kiện không bị nháy; ghi khác invalidate `['trips']`, `['dashboard']`, `['vehicles']` trong `onSettled`. Toast
  chỉ nói việc kho đã ghi ("Đã hoàn tất điểm giao n", "Đã ghi sự cố cho …").
- Thoát: danh sách truyền `screenHome="/tai-xe"` → tài xế đăng xuất; các màn trong chuyến truyền `/tai-xe/diem-giao` + `contextual
  "/tai-xe"` → tài xế và quản trị về danh sách. `ROLE_HOME.driver` = `/tai-xe`; mục nav "Tài xế" trỏ `/tai-xe`.
- Đường benchmark giữ nguyên: `?debug&packages=N` trên màn điểm giao vẫn thay khung 3D bằng fixture (nay kèm `chuyen=`).
- Từ điển `driver` (vi/en): thêm `list`, `notice`, `issue`, `tripSummary`, `call`, `contact`, `start`…; bỏ key không dùng
  (`emptyDescription`, `loadErrorDescription`, `incompleteDescription`). Câu số nhiều tiếng Việt hai dạng giống nhau (`Intl.PluralRules('vi')`
  luôn chọn `other`).
- Gỡ: `useDriverPlanQuery.ts`, `pickDriverPlan` (+ 2 test) trong `driver-plan.ts`.

File chính: `src/features/driver/{MyTripsPage,MyTripCard,DriverStopPage,DeliveryStopView,DriverStopHeader,StopContactCard,DeliveryItemRow,
ReportIssueDialog,TripSummary,DriverNotice}.tsx`, `{my-trips,delivery-progress,issue-form.schema,driver-api,useDriverQueries,useDeliveryStop,
driver-plan}.ts`, `src/lib/i18n/{vi,en}/driver.ts`. Dùng chung đã đụng: `src/app/App.tsx` (route `/tai-xe`), `src/app/NavRail.tsx`,
`src/features/auth/{landing,exit}.ts` (+ test), `LoginPage.dom.test.tsx`, `RequirePermission.dom.test.tsx`, `e2e/rbac.spec.ts`.

Kiểm thử: unit `my-trips.test.ts` (4), `delivery-progress.test.ts` (6), `driver-plan.test.ts` (2, bỏ 2 test của `pickDriverPlan`),
`landing.test.ts`/`exit.test.ts` sửa theo `/tai-xe`; DOM `MyTripsPage.dom.test.tsx` (3), `DriverStopPage.dom.test.tsx` (7, viết lại: về
danh sách khi thiếu `?chuyen`, xem trước + Gọi/Chỉ đường, chuyến của tài xế khác, kiện kho báo thiếu, giao trọn chuyến hai thùng → tổng kết,
mở lại đúng điểm, bản duyệt lỗi thời). E2E mới `driver-delivery.spec.ts` (phone: tài xế demo mở `TRIP-010` → Bắt đầu giao → báo "Khách
từ chối" 1 kiện, dỡ 209 kiện, hoàn tất 3 điểm → Tổng kết 3 điểm / 209 kiện / 1 sự cố, không tràn chữ ở 390 px; kho: `hoan_thanh`, đúng một
sự cố → về danh sách thấy chuyến ở nhóm hoàn thành). Sửa `driver-approved-plan.spec.ts` (xem trước chuyến chính, tiếng Anh qua danh sách →
chuyến → bắt đầu giao), đoạn tài xế của `viewer-operations-ui`, `viewer-scene-first-ui`, `viewer-visuals`, `viewer-ui`, và `rbac.spec.ts`.

`viewer-operations-ui` (touch): kịch bản đi từ màn tài xế sang Planner nên đăng nhập quản trị viên — với tài khoản tài xế, từ LM-084 nửa
Planner của test này là 403 (đỏ sẵn trên `074949a`).

Kiểm tra: `pnpm lint` ✅ · `tsc -b` ✅ · `pnpm test` 597/597 ✅ (lượt trước 596/597: `trips/TripFormPage.dom.test.tsx` hết giờ 5 s khi máy
tải nặng — có sẵn, không thuộc issue này) · E2E cổng 5297 (5191 do dev server của worktree khác giữ): `warehouse`, `warehouse-progress`,
`driver-approved-plan`, `driver-delivery`, `rbac`, `viewer-operations-ui`, `viewer-scene-first-ui`, `viewer-visuals`, `viewer-ui` — 28/30
lượt đầu, 2 lượt đỏ là test touch nói trên; sau khi đổi sang quản trị viên 2/2 ✅.

Còn lại / đề xuất luật:
- "Điều phối thấy Hoàn thành và sự cố" ở giao diện thuộc LM-088 (E2E hiện kiểm trong kho).
- Kho mock không kiểm người ghi có phải tài xế của chuyến không (`recordUnload`… nhận mọi phiên); FE chỉ chặn ở đọc (`driver-api`). Backend
  thật phải kiểm (D-41).
- Đề xuất sửa AGENTS mục 1: tài xế đăng nhập mở `/tai-xe` ("Chuyến của tôi"); nhân viên kho / tài xế **ở màn danh sách** thoát là đăng
  xuất, **trong phiên / trong chuyến** thoát là về danh sách. Mục 7 "Foundation engine": tài xế đọc qua `driver-api.ts` →
  `useDriverTripQuery` → `adaptResult`, phương án là bản kho đã xếp (chưa xếp thì bản duyệt mới nhất), chỉ chuyến của mình; kiện kho báo
  thiếu không nằm trong danh sách dỡ và mô phỏng. Mục 6 i18n: câu số nhiều tiếng Việt phải có hai dạng giống hệt nhau.

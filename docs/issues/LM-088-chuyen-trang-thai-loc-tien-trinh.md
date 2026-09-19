---
id: LM-088
title: Chuyến — ngày chạy, tài xế, 7 trạng thái, lọc; tiến trình, khoá sửa, huỷ ở chi tiết
phase: 6
labels: [trips, dispatcher]
depends_on: [LM-083, LM-084, LM-085]
estimate: 2d
prd: [D-45, D-46, D-47, D-52]
---

# LM-088 — Chuyến

## Việc cần làm

- [x] Danh sách: cột ngày chạy, mã, tên + tuyến, xe, tài xế, số kiện, lấp đầy, trạng thái (`tripStatus`); tìm, lọc trạng thái/khoảng ngày/xe/tài xế,
      sắp xếp, phân trang, giữ trên URL (LM-085). Mặc định mới nhất trước.
- [x] Form tạo/sửa: ngày chạy, tài xế (người dùng tài xế đang hoạt động), SĐT và người liên hệ từng điểm giao; xe bảo dưỡng không chọn được.
- [x] Chi tiết: badge trạng thái ở header; thẻ **Tiến trình** (tạo → tối ưu → duyệt → xếp x/y → xếp xong → giao điểm k/n → hoàn thành, kèm giờ và người);
      danh sách kiện thiếu ở kho và sự cố giao; tài xế hiện cạnh xe.
- [x] Khoá: pha khác `planning` thì banner nói lý do, ẩn/khóa kéo thả, thêm/sửa/xoá kiện, đổi xe, Chạy tối ưu; Thiết lập tối ưu và Planner cũng khoá.
      (Planner 3D do issue khác làm — ở đây chỉ Chi tiết chuyến, Thiết lập tối ưu, So sánh phương án.)
- [x] Huỷ chuyến (trước khi giao): mục trong menu thao tác, hộp thoại lý do bắt buộc, nút danger.

## Tiêu chí nghiệm thu

- [x] E2E: tạo chuyến có ngày + tài xế → lọc ra được; huỷ chuyến có lý do → trạng thái "Đã huỷ", nhật ký có sự kiện.

## Kết quả (19/09/2026)

### Đã làm

- **Danh sách `/chuyen`** (`TripListPage`, `trip-list-columns.tsx`, `trip-list.ts`): 8 cột — ngày chạy, mã (liên kết, mở được bằng bàn phím),
  tên + tuyến, xe, tài xế ("Chưa gán"), số kiện, lấp đầy, trạng thái `tripStatus` (pha vận hành, riêng `planning` suy từ revision).
  `FilterBar` + `useListUrlState`: tìm bỏ dấu trên mã/tên/tuyến/xe/tài xế; lọc trạng thái (9 trạng thái theo vòng đời), khoảng ngày chạy,
  xe, tài xế (có "Chưa gán" = `tai-xe=chua-gan`); lựa chọn xe/tài xế lấy từ chính các chuyến, sắp theo chữ cái tiếng Việt. Mặc định ngày
  chạy mới nhất trước; sắp xếp được ngày, mã, tên, xe, tài xế, số kiện, lấp đầy; phân trang 25/50/100. Khung bảng cuộn ngang khi hẹp hơn
  1.140 px (màn điều phối là màn desktop). Hàm lọc thuần `filterTripRows`, `tripFilterOptions`.
- **Form tạo/sửa** (`TripFormPage`, `TripStopsFields`, `trip-form.schema.ts`): ngày chạy bắt buộc (mặc định hôm nay giờ Việt Nam), tài xế
  (người dùng vai trò tài xế đang hoạt động + "Chưa gán"; tài xế đang gán mà bị khoá vẫn hiện, không chọn lại được), số điện thoại + người
  liên hệ mỗi điểm giao (để trống thì không lưu chuỗi rỗng). Ô chọn xe hiện xe bảo dưỡng kèm lý do nhưng không chọn được
  (`SelectOption.disabled`, `listVehicleStates`). Sửa: đổi được chữ của điểm giao hiện có; pha `loading`/`loaded` khoá xe và điểm giao
  (banner nói lý do), vẫn sửa tên, ngày, tài xế; pha sau đó không mở form. Lỗi kho hiện câu `dataErrorMessage`.
- **Chi tiết `/chuyen/:tripId`**: header (`TripDetailHeader`) có badge trạng thái, tên, ngày chạy, menu **Thao tác** (`TripActionsMenu`:
  Sửa thông tin chuyến, Huỷ chuyến — chỉ với quyền `trips.edit`, mục nào pha không cho thì ẩn) và đúng một nút primary: "Chạy tối ưu" khi
  còn lập kế hoạch và được chạy tối ưu, còn lại "Xem phương án 3D" khi đã có phương án. Thẻ xe có tài xế + số điện thoại. Thẻ **Tiến trình**
  (`TripProgressCard`, hàm thuần `tripProgress`): 7 mốc kèm giờ và tên người làm (tiến độ của chuyến + nhật ký `listEvents({ targetId })`
  + `listUsers`), "Đã xếp x / y kiện · thiếu n kiện", "Đã giao k / n điểm", chuyến huỷ dừng ở mốc "Đã huỷ" kèm lý do; bên dưới là kiện
  kho báo thiếu (`missingPackages`) và sự cố giao (loại, điểm, kiện, ghi chú, giờ, người báo).
- **Khoá** (D-45): `editable = can('trips.edit') && phase === 'planning'` điều khiển kéo thả điểm giao, thêm/sửa/xoá/nhân bản kiện, "Đổi xe";
  `TripLockBanner` (`src/components/`, dùng ở Chi tiết chuyến và Thiết lập tối ưu) nói lý do theo pha, chuyến huỷ nói giờ + lý do.
  Thiết lập tối ưu: banner, ô chọn xe và nút Tối ưu tắt; ô chọn xe bỏ được xe bảo dưỡng như form chuyến. So sánh phương án: chuyến đã
  khoá thì không còn lối "Chạy thêm phương án" / "Thiết lập tối ưu".
- **Huỷ chuyến** (`CancelTripDialog`): react-hook-form + zod, lý do bắt buộc (≤ 300 ký tự), nút danger; kho từ chối thì câu lỗi hiện trong
  hộp thoại. Menu thả xuống `modal={false}` để hộp thoại mở từ mục menu không để lại `pointer-events: none`; đóng hộp thoại trả tiêu điểm
  về nút Thao tác. Hộp thoại gắn ngoài phần menu ẩn/hiện để mutation còn sống tới khi huỷ xong.
- Sửa lỗi phát hiện khi làm: kéo thả điểm giao (`StopList`) từng bỏ mất số điện thoại và người liên hệ của điểm giao; trạng thái rỗng của
  bảng kiện có nút primary thứ hai trên màn (đổi sang nút phụ).

### File chính

`src/features/trips/`: `trip-list.ts`, `trip-list-columns.tsx`, `TripListPage.tsx`, `TripListSkeleton.tsx`, `trip-dates.ts`,
`trip-form.schema.ts`, `TripFormPage.tsx`, `TripStopsFields.tsx`, `TripDetailPage.tsx`, `TripDetailHeader.tsx`, `TripActionsMenu.tsx`,
`CancelTripDialog.tsx`, `TripProgressCard.tsx`, `trip-progress.ts`, `VehicleCard.tsx`, `StopList.tsx`, `PackagesTable.tsx`,
`PlanComparisonPage.tsx`, `trips-api.ts`, `useTripsQuery.ts`; `src/features/optimization/`: `optimization-api.ts`,
`OptimizationSetupPage.tsx`, `SetupContextPanels.tsx`; `src/components/TripLockBanner.tsx`, `src/components/ui/SelectField.tsx`
(`SelectOption.disabled`); từ điển `src/lib/i18n/{vi,en}/trips.ts` (nhánh `trips`: `list`, `create`, `vehicleCard`, `detail`, `cancel`,
`progress`, `skeleton`).

### Kiểm thử

- Unit: `trip-list.test.ts` (9: trạng thái theo pha, tài xế, tìm bỏ dấu qua tên/tuyến/tài xế/xe, lọc trạng thái/ngày/xe/tài xế/chưa gán,
  lựa chọn bộ lọc), `trip-progress.test.ts` (6: nháp, đang xếp x/y, hoàn thành có kiện thiếu, đang giao k/n, huỷ từ seed và huỷ lúc chạy).
- DOM: `TripListPage.dom.test.tsx` (3), `TripDetailPage.dom.test.tsx` (5: chuyến đang xếp bị khoá, huỷ có lý do + nhật ký, sự cố giao,
  kiện thiếu, quản lý chỉ đọc một nút primary), `TripFormPage.dom.test.tsx` (6, nay dùng data router), `OptimizationSetupPage.dom.test.tsx`
  (+2: chuyến đang xếp bị khoá, xe bảo dưỡng không chọn được).
- E2E mới `e2e/trip-lifecycle.spec.ts` (2, desktop): tạo chuyến có ngày + tài xế → lọc theo tài xế + ngày và tìm bỏ dấu ra đúng chuyến;
  huỷ chuyến có lý do → "Đã huỷ", sự kiện `trip.cancelled` đọc qua `listEvents`. `e2e/spec-flow.spec.ts`: xe tạo mới là `VEHICLE-009`
  (seed 8 xe từ LM-083 — spec đỏ từ trước issue này).
- `pnpm lint`, `pnpm exec tsc -b`, `pnpm build` xanh; `pnpm test` 98 file, 627 test xanh.
  `E2E_PORT=5193 pnpm exec playwright test e2e/trip-lifecycle.spec.ts e2e/rbac.spec.ts e2e/spec-flow.spec.ts e2e/optimization-flow.spec.ts
  e2e/i18n-en.spec.ts e2e/warehouse.spec.ts` xanh.

### Ghi chú cho người điều phối

- `useListUrlState` (LM-085): hai lần đổi bộ lọc liền nhau trước khi màn render lại làm mất lần đầu — `setSearchParams(fn)` của React
  Router nhận tham số của lần render trước, router đổi URL trong transition. Người dùng thật không đủ nhanh để gặp; E2E phải chờ URL giữa hai
  bộ lọc. Đề xuất sửa trong hook: đọc tham số hiện tại từ `router.state.location` (hoặc gộp thay đổi) thay vì từ giá trị lúc render.

### Đề xuất sửa luật AGENTS

- Mục 3, cây thư mục: `components/TripLockBanner.tsx` (banner lý do khoá chuyến, dùng ở Chi tiết chuyến và Thiết lập tối ưu).
- Mục 9 "Dữ liệu dùng chung": *Chi tiết chuyến chỉ cho sửa khi `can('trips.edit') && phase === 'planning'`; form sửa chuyến mở ở `planning`,
  `loading`, `loaded` (hai pha sau khoá xe và điểm giao). Hộp thoại mở từ mục `DropdownMenu` dùng `modal={false}` cho menu.*

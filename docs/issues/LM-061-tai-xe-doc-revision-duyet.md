---
id: LM-061
title: Màn tài xế đọc revision đã duyệt, làm theo unloadingOrder
phase: 4
labels: [driver, data]
depends_on: [LM-030, LM-036, LM-050]
estimate: 1d
prd: [D-13, D-14]
---

# LM-061 — Tài xế đọc kết quả đã duyệt

## Bối cảnh

`features/driver/driver.mock.ts` dựng từ `LOAD_PLAN` + `suggestedUnloadOrder` của viewer3d; `DriverCargoViewer` lazy-load Three khi mở "Xem vị trí hàng".

## Việc cần làm

- [x] `features/driver/driver-api.ts` + hook: điểm giao hiện tại, danh sách kiện của điểm (theo `unloadingOrder`), thông tin điểm giao lấy từ chuyến.
- [x] `DriverCargoViewer` dùng view model LM-030 và kiểm tra LIFO domain; `LIFO_BLOCKED` hiện rõ kiện chặn.
- [x] Giữ Three chỉ tải khi mở "Xem vị trí hàng"; mô phỏng không đánh dấu đã giao.
- [x] Đơn vị cm/kg theo locale; nút 56px, chữ ≥ 16px.
- [x] Gỡ `driver.mock.ts` và kiểu `DeliveryStop` trùng lặp.
- [x] Tab chưa có màn trong `DriverTabBar`: gỡ hoặc làm thật (D-20). *(Đã gỡ ở LM-053.)*

## Tiêu chí nghiệm thu

- [x] Thứ tự dỡ ở màn tài xế trùng `unloadingOrder` của revision approved.
- [x] E2E phone 390×844: không tải chunk Three trước khi bấm "Xem vị trí hàng".

## Kết quả (16/09/2026)

Đường dữ liệu: `@/lib/mock-db` → `driver-api.ts` (`fetchDriverPlan`) → `useDriverPlanQuery` (khoá `['trips', 'driver', { tripId }]`,
`staleTime: 0` để thấy bản vừa Duyệt) → `DriverStopPage`.

- **Chọn chuyến và revision** (`driver-plan.ts`, `pickDriverPlan`): `?chuyen=<tripId>` nếu có, không thì chuyến đầu tiên theo thứ tự kho
  có revision đã duyệt; revision là bản có `approvedAt` mới nhất. `?chuyen` chưa có bản duyệt không rơi sang chuyến khác. Không có gì →
  `EmptyState` "Chưa có phương án đã duyệt", nói điều phối viên cần duyệt trước, link về danh sách chuyến. Bản duyệt lỗi thời vẫn hiện,
  kèm `role="alert"` cảnh báo.
- **Điểm giao và kiện** (`stopDeliveries`): tên, địa chỉ từ `trip.stops` (số = vị trí + 1 = `deliveryStop`); kiện của điểm sắp bằng
  `unloadSequence` (= `unloadingOrder` của kết quả). Dòng kiện hiện mã instance, "Dỡ thứ N", tên kiện, khối lượng qua `useFormat`, vùng
  (một phần ba sát vách trước / giữa / gần cửa theo tâm x) và lớp (sàn / tâm dưới nửa chiều cao / trên) — so qua `lt` của domain.
- **Phiên giao** (`useDeliveryStop`): bắt đầu ở điểm 1, chỉ giữ trong phiên (không lưu, không đồng bộ). "Hoàn tất điểm giao": còn kiện
  → cảnh báo; đủ → toast "Đã dỡ đủ kiện tại điểm giao N" + "Chuyển sang điểm giao N+1." và chuyển điểm thật; điểm cuối → "Đây là điểm
  giao cuối của chuyến." Gỡ huy hiệu "3 thao tác chờ đồng bộ", nút gọi `tel:` (chuyến không có số điện thoại) và trạng thái "khách từ
  chối" (không có thao tác nào tạo ra nó) — đều là dữ liệu bịa của mock cũ.
- **`DriverCargoViewer`** nhận `ViewerSceneModel` từ `adaptResult` (cm); `?debug&packages=N` dùng `createBenchmarkInput` thay
  `createBenchmarkPlan`. Mô phỏng dỡ theo `unloadingOrder` (nhãn "Thứ tự dỡ", không "gợi ý"); LIFO dùng chung `createLifoIndex` của
  `useUnloadPlayback` cho scene semantics — `LIFO_BLOCKED` dừng mô phỏng, tô kiện chắn và liệt kê trong `BlockerPanel`. Chuỗi của
  viewer chuyển qua `t()` (nhánh `driver.cargo`). Three vẫn lazy-load trong `Dialog` chỉ khi mở.
- Gỡ `driver.mock.ts` (kèm kiểu `DeliveryStop` trùng với `@/lib/mock-db`). Không đụng `lib/load-plan.mock.ts`, `types/load-plan.ts`,
  `adaptLoadPlan`, `createBenchmarkPlan` (kho còn dùng, LM-062). Trang `/thanh-phan` cập nhật mẫu dòng kiện.
- i18n: nhánh `driver` vi/en.

Test:

- `src/features/driver/driver-plan.test.ts` (4, TDD): chọn chuyến/revision, `?chuyen` không rơi sang chuyến khác, điểm giao + thứ tự
  dỡ + vùng/lớp.
- `src/features/driver/DriverStopPage.dom.test.tsx` (4, kho dùng chung thật): thứ tự dòng = `unloadingOrder` bản duyệt, một nút
  primary, không thanh tab; hoàn tất cảnh báo rồi chuyển sang điểm 2; `?chuyen` chưa duyệt → trạng thái rỗng; bản lỗi thời có cảnh báo.
- `e2e/driver-approved-plan.spec.ts`: phone 390×844 — thứ tự dòng khớp `unloadingOrder` đọc từ kho trong trang, không request Three
  trước "Xem vị trí hàng", nút 56px, khung 3D ghi "Thứ tự dỡ" không "gợi ý"; desktop — Duyệt ở Planner rồi đổi route phía client, màn
  tài xế đọc bản duyệt mới. Suite cũ (`viewer-operations-ui` "driver loads Three.js only on demand", `viewer-visuals`,
  `viewer-scene-first-ui`, `viewer-ui`) giữ nguyên.

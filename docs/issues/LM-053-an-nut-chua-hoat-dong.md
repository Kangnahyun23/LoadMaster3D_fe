---
id: LM-053
title: Ẩn mọi nút chưa hoạt động, gỡ notifyPendingFeature
phase: 3
labels: [ux, spec-compliance]
depends_on: [LM-003]
estimate: 0.5d
prd: [D-20]
spec: [9.3]
---

# LM-053 — Ẩn nút chưa hoạt động

## Việc cần làm

- [x] Tìm mọi lời gọi `notifyPendingFeature` và nút không có `onClick` (đã thấy: "Nhập từ Excel" ở danh sách/chi tiết chuyến, "Xuất báo cáo" và bộ lọc Dashboard, "Thêm đơn hàng", nút Cài đặt ở `NavRail`, menu thêm của `StopCard`, các nút lý do trong `OptimizationErrorDialog`, tab chưa có màn của `DriverTabBar`, "Ghi nhận sai lệch" ở kho).
- [x] Nút có chức năng thật trong PRD thì nối; không có thì gỡ khỏi UI.
- [x] "Lưu nháp" ở chi tiết chuyến đang báo thành công giả → nối mutation thật hoặc gỡ.
- [x] Xoá `lib/pending-feature.ts` khi không còn nơi dùng; cập nhật AGENTS mục 6.
- [x] Ngoại lệ duy nhất: nhãn "Sẽ có sau" không bấm được ở tải trục (LM-037).

## Tiêu chí nghiệm thu

- [x] Tìm `notifyPendingFeature` trong `src/` không còn kết quả.
- [ ] E2E bấm lần lượt mọi nút hiển thị trên các màn luồng Spec: mỗi nút đều gây thay đổi nhìn thấy được.

## Kết quả (16/09/2026)

Quét toàn `src/` (trừ `features/viewer3d` và các file màn danh sách/form chuyến đang được viết lại song song).

Đã gỡ:

- **Nút Cài đặt ở `NavRail`** — không có `onClick`, không có màn cài đặt. Gỡ cả key `nav.settings` của từ điển vi/en.
- **"Ghi nhận sai lệch" ở màn kho** (`LoadingStepPage`, `useLoadingSession.reportDeviation`) — chỉ hiện toast
  "Đã ghi nhận… Điều phối viên sẽ thấy" nhưng không lưu gì: thành công giả.
- **Thanh tab đáy màn tài xế** (`DriverTabBar.tsx`, xoá file) — "Chuyến", "Kiện hàng", "Tài khoản" đều trỏ về
  `/tai-xe/:tab` và mở lại đúng màn điểm giao. Route `/tai-xe/*` nay chuyển về `/tai-xe/diem-giao`. Gỡ luôn mẫu
  tab bar ở trang `/thanh-phan`.

Đã sửa câu cho đúng việc đã làm:

- "Kiện này không có ở kho" giữ nút (thật sự bỏ qua bước), toast đổi thành "Đã bỏ qua {mã}" — "Chuyển sang bước
  kế tiếp.", không còn "được đánh dấu" khi không có nơi ghi.
- "Hoàn tất điểm giao" (tài xế) toast đổi thành "Đã dỡ đủ kiện tại điểm giao {n}", bỏ "Sẽ đồng bộ khi có mạng.
  Chuyển sang điểm kế tiếp." vì không có đồng bộ và không chuyển điểm.

Đã kiểm, không cần sửa: menu thêm của `StopCard` (chỉ còn nút xoá có chức năng), `OptimizationErrorDialog`
(đã gỡ nút lý do ở LM-048), bảng điều khiển quản lý (không còn nút xuất/lọc sau LM-052), chi tiết chuyến
(không có "Lưu nháp"/"Nhập từ Excel"/"Thêm đơn hàng"), nút gọi `tel:` và chỉ đường Google Maps của tài xế (link thật).
Admin `UsersPage` giữ state cục bộ theo AGENTS mục 9. Nhãn "Sẽ có sau" của tải trục giữ nguyên.

Danh sách chuyến và form chuyến (người điều phối, commit `23964cc`): gỡ "Nhập từ Excel" và `lib/pending-feature.ts`;
`TripListPage` đọc kho qua `trip-list.ts` (tên, xe, điểm giao, số kiện, tỷ lệ thể tích của revision Planner mở,
trạng thái Nháp / Đã tối ưu / Đã duyệt / Cần xem lại — không còn ngày và trạng thái giao bịa); `TripFormPage` tạo chuyến
(tên, xe, điểm giao) và sửa tên/xe bằng mutation thật thay cho toast thành công giả. Gỡ `trip-list.mock.ts`,
`trip-vehicles.mock.ts`. Test: `trip-list.test.ts` (4), `TripFormPage.dom.test.tsx` (2).

Test: `src/app/NavRail.dom.test.tsx`, `src/features/warehouse/useLoadingSession.dom.test.tsx`,
`src/features/driver/DriverStopPage.dom.test.tsx` (viết đỏ trước, xanh sau). Tiêu chí E2E "bấm lần lượt mọi nút"
chưa làm như một suite quét nút riêng: luồng Spec E2E (LM-054) bấm các nút chính của từng màn.

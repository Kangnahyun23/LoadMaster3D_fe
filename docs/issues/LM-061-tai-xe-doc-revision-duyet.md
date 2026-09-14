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

- [ ] `features/driver/driver-api.ts` + hook: điểm giao hiện tại, danh sách kiện của điểm (theo `unloadingOrder`), thông tin điểm giao lấy từ chuyến.
- [ ] `DriverCargoViewer` dùng view model LM-030 và kiểm tra LIFO domain; `LIFO_BLOCKED` hiện rõ kiện chặn.
- [ ] Giữ Three chỉ tải khi mở "Xem vị trí hàng"; mô phỏng không đánh dấu đã giao.
- [ ] Đơn vị cm/kg theo locale; nút 56px, chữ ≥ 16px.
- [ ] Gỡ `driver.mock.ts` và kiểu `DeliveryStop` trùng lặp.
- [ ] Tab chưa có màn trong `DriverTabBar`: gỡ hoặc làm thật (D-20).

## Tiêu chí nghiệm thu

- [ ] Thứ tự dỡ ở màn tài xế trùng `unloadingOrder` của revision approved.
- [ ] E2E phone 390×844: không tải chunk Three trước khi bấm "Xem vị trí hàng".

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

- [ ] Tìm mọi lời gọi `notifyPendingFeature` và nút không có `onClick` (đã thấy: "Nhập từ Excel" ở danh sách/chi tiết chuyến, "Xuất báo cáo" và bộ lọc Dashboard, "Thêm đơn hàng", nút Cài đặt ở `NavRail`, menu thêm của `StopCard`, các nút lý do trong `OptimizationErrorDialog`, tab chưa có màn của `DriverTabBar`, "Ghi nhận sai lệch" ở kho).
- [ ] Nút có chức năng thật trong PRD thì nối; không có thì gỡ khỏi UI.
- [ ] "Lưu nháp" ở chi tiết chuyến đang báo thành công giả → nối mutation thật hoặc gỡ.
- [ ] Xoá `lib/pending-feature.ts` khi không còn nơi dùng; cập nhật AGENTS mục 6.
- [ ] Ngoại lệ duy nhất: nhãn "Sẽ có sau" không bấm được ở tải trục (LM-037).

## Tiêu chí nghiệm thu

- [ ] Tìm `notifyPendingFeature` trong `src/` không còn kết quả.
- [ ] E2E bấm lần lượt mọi nút hiển thị trên các màn luồng Spec: mỗi nút đều gây thay đổi nhìn thấy được.

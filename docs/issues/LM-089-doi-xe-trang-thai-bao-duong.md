---
id: LM-089
title: Đội xe — trạng thái xe, bảo dưỡng, tìm/lọc/sắp xếp
phase: 6
labels: [fleet, dispatcher]
depends_on: [LM-083, LM-084, LM-085]
estimate: 1d
prd: [D-53, D-52]
---

# LM-089 — Đội xe

## Việc cần làm

- [ ] Danh sách: cột trạng thái (Sẵn sàng / Đang chạy + mã chuyến / Bảo dưỡng), tìm, lọc trạng thái, sắp xếp, phân trang.
- [ ] Chi tiết xe: bật/tắt bảo dưỡng kèm ghi chú (nút phụ); xe đang chạy chuyến thì banner khoá sửa (`VEHICLE_LOCKED`).
- [ ] Chọn xe ở form chuyến và thiết lập tối ưu: xe bảo dưỡng hiện nhưng không chọn được, có lý do.

## Tiêu chí nghiệm thu

- [ ] DOM/E2E: đặt bảo dưỡng → không chọn được ở form chuyến; trạng thái đổi theo chuyến đang giao.

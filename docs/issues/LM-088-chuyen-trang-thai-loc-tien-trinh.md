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

- [ ] Danh sách: cột ngày chạy, mã, tên + tuyến, xe, tài xế, số kiện, lấp đầy, trạng thái (`tripStatus`); tìm, lọc trạng thái/khoảng ngày/xe/tài xế,
      sắp xếp, phân trang, giữ trên URL (LM-085). Mặc định mới nhất trước.
- [ ] Form tạo/sửa: ngày chạy, tài xế (người dùng tài xế đang hoạt động), SĐT và người liên hệ từng điểm giao; xe bảo dưỡng không chọn được.
- [ ] Chi tiết: badge trạng thái ở header; thẻ **Tiến trình** (tạo → tối ưu → duyệt → xếp x/y → xếp xong → giao điểm k/n → hoàn thành, kèm giờ và người);
      danh sách kiện thiếu ở kho và sự cố giao; tài xế hiện cạnh xe.
- [ ] Khoá: pha khác `planning` thì banner nói lý do, ẩn/khóa kéo thả, thêm/sửa/xoá kiện, đổi xe, Chạy tối ưu; Thiết lập tối ưu và Planner cũng khoá.
- [ ] Huỷ chuyến (trước khi giao): mục trong menu thao tác, hộp thoại lý do bắt buộc, nút danger.

## Tiêu chí nghiệm thu

- [ ] E2E: tạo chuyến có ngày + tài xế → lọc ra được; huỷ chuyến có lý do → trạng thái "Đã huỷ", nhật ký có sự kiện.

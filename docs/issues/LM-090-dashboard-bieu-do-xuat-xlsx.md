---
id: LM-090
title: Bảng điều khiển — lọc kỳ, KPI theo kỳ, 3 biểu đồ, xuất .xlsx
phase: 6
labels: [manager, charts, export]
depends_on: [LM-083, LM-084]
estimate: 2d
prd: [D-48]
---

# LM-090 — Dashboard

## Việc cần làm

- [ ] Lọc kỳ: 7 ngày / 30 ngày / tháng này / tuỳ chọn; giữ trên URL.
- [ ] KPI theo kỳ, mỗi ô có dòng nói nguồn: số chuyến (hoàn thành / tổng), lấp đầy thể tích trung bình (bản đã duyệt), khối lượng đã giao,
      tỷ lệ kiện giao không sự cố, xe đang chạy hôm nay.
- [ ] 3 biểu đồ recharts (chunk riêng): lấp đầy theo ngày, chuyến theo trạng thái, khối lượng theo xe. Màu từ token; có bảng số thay thế cho
      trình đọc màn hình; kỳ không có dữ liệu thì trạng thái rỗng, không vẽ trục trống.
- [ ] Bảng chuyến gần đây trong kỳ (dẫn tới chi tiết chuyến / Planner).
- [ ] Xuất .xlsx (`write-excel-file`, tải lười): sheet Tổng quan, Chuyến, Theo xe; tên file có kỳ. Quyền `reports.export`.
- [ ] Một nút primary: điều phối "Tạo kế hoạch xếp"; quản lý (không có quyền tạo) "Xuất báo cáo".
- [ ] AGENTS mục 2 và 6 cập nhật luật biểu đồ (D-48).

## Tiêu chí nghiệm thu

- [ ] Unit test tổng hợp theo kỳ bằng số tính tay; DOM test đổi kỳ; E2E xuất file có đúng sheet.

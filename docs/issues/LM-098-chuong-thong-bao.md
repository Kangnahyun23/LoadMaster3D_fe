---
id: LM-098
title: Chuông thông báo trong app theo vai trò
phase: 6
labels: [notifications]
depends_on: [LM-082, LM-084]
estimate: 1d
prd: [D-55]
---

# LM-098 — Thông báo

## Việc cần làm

- [ ] Nút chuông ở nav rail, số chưa đọc; popover danh sách sự kiện nhật ký liên quan vai trò
      (điều phối: xếp xong, kiện thiếu, sự cố giao, hoàn thành; quản lý: hoàn thành, huỷ; quản trị: sự kiện người dùng).
- [ ] Bấm thông báo mở đối tượng; "Đánh dấu đã đọc" giữ trong phiên. Không toast giả, không hứa đồng bộ.

## Tiêu chí nghiệm thu

- [ ] E2E: kho báo thiếu kiện → điều phối thấy thông báo mới dẫn tới chi tiết chuyến.

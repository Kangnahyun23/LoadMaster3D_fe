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

- [ ] `/tai-xe`: "Chuyến của tôi" (tài xế chỉ thấy chuyến gán cho mình; quản trị thấy tất cả): đã xếp xong / đang giao dùng được;
      chuyến kho chưa xếp xong hiện nhưng không bấm được, nói lý do; chuyến hoàn thành gần đây ở nhóm riêng.
- [ ] `/tai-xe/diem-giao?chuyen=`: "Bắt đầu giao" → `startDelivery`; đánh dấu dỡ → `recordUnload`; nút Gọi (`tel:`) khi điểm có SĐT;
      "Báo sự cố" cho kiện (hỏng / thiếu / khách từ chối / khác + ghi chú) → `reportDeliveryIssue`; hoàn tất điểm khi mọi kiện đã dỡ hoặc có sự cố.
- [ ] Điểm cuối → màn **Tổng kết chuyến**: số điểm, kiện đã giao, sự cố, thời gian bắt đầu–kết thúc; nút về danh sách.
- [ ] Dòng kiện đã dỡ phân biệt rõ (nền + icon), không chỉ khác viền (U-7).
- [ ] Thoát: danh sách là đăng xuất; trong chuyến là về danh sách. Mở lại trong phiên tiếp tục đúng điểm.

## Tiêu chí nghiệm thu

- [ ] E2E phone: tài xế demo giao hết chuyến đã xếp xong, báo một sự cố, thấy tổng kết; điều phối thấy "Hoàn thành" và sự cố.
- [ ] Thử trên điện thoại thật ở LM-101.

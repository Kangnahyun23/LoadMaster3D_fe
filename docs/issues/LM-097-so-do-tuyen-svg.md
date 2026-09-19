---
id: LM-097
title: Sơ đồ tuyến SVG ở chi tiết chuyến
phase: 6
labels: [trips, svg]
depends_on: [LM-088]
estimate: 0.5d
prd: [D-50]
---

# LM-097 — Sơ đồ tuyến

## Việc cần làm

- [ ] `RouteDiagram` SVG: kho xuất phát → điểm 1 → … theo màu điểm giao (luôn kèm số), số kiện và khối lượng mỗi điểm;
      điểm đã giao có dấu hoàn tất khi chuyến đang giao/hoàn thành. Không địa lý, không thư viện bản đồ.
- [ ] Đặt ở chi tiết chuyến; co theo chiều rộng, cuộn ngang khi > 6 điểm.

## Tiêu chí nghiệm thu

- [ ] DOM test: đúng số điểm, nhãn truy cập đọc được thứ tự và trạng thái.

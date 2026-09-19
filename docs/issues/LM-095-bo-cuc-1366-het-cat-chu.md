---
id: LM-095
title: Bố cục 1.366–1.600 px — hết cắt chữ ở chi tiết chuyến, chi tiết xe, Planner
phase: 6
labels: [layout, dispatcher]
depends_on: [LM-088, LM-089]
estimate: 1d
prd: [D-54]
---

# LM-095 — Hết chật

## Việc cần làm

- [ ] Chi tiết chuyến: tên điểm giao và địa chỉ xuống tối đa 2 dòng; bảng kiện không cắt tên điểm giao; bố cục cột co giãn thay vì 320 + 320 cứng (U-1).
- [ ] Chi tiết xe: bảng vật cản không cuộn ngang ở 1.366 px (ô nhập gọn hoặc dòng hai tầng) (U-2).
- [ ] E2E ở 1.366 × 768 và 1.600 × 1.000: chi tiết chuyến, chi tiết xe, Planner, dashboard — không phần tử nào tràn ngang (`scrollWidth ≤ clientWidth`).

## Tiêu chí nghiệm thu

- [ ] Ảnh trước/sau đính kèm kết quả issue; N-3 ở `acceptance.md` đóng.

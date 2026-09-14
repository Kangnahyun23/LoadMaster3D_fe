---
id: LM-046
title: Đổi thứ tự điểm giao cập nhật deliveryStop của kiện
phase: 3
labels: [trips]
depends_on: [LM-043]
estimate: 0.5d
prd: [D-16]
---

# LM-046 — Điểm giao và deliveryStop

## Việc cần làm

- [ ] `StopList` (dnd-kit) lưu thứ tự qua `updateTripStops` thay state cục bộ; vẫn kéo thả được bằng bàn phím.
- [ ] Kiện lưu tham chiếu điểm giao ổn định (ID điểm giao) trong dữ liệu chuyến; `deliveryStop` (số 1-based theo thứ tự) được suy ra khi dựng `OptimizationRequest`, nên đổi thứ tự không phải sửa từng kiện.
- [ ] Xoá điểm giao còn kiện → chặn và hiện số kiện bị ảnh hưởng.
- [ ] Đổi thứ tự tăng `inputVersion` (revision cũ thành lỗi thời).

## Tiêu chí nghiệm thu

- [ ] Đổi điểm 2 ↔ 3 rồi mở Thiết lập tối ưu: request có `deliveryStop` mới đúng.
- [ ] Màu điểm giao trong bảng kiện theo thứ tự mới.

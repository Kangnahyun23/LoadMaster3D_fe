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

- [x] `StopList` (dnd-kit) lưu thứ tự qua `updateTripStops` thay state cục bộ; vẫn kéo thả được bằng bàn phím.
- [x] Kiện lưu tham chiếu điểm giao ổn định (ID điểm giao) trong dữ liệu chuyến; `deliveryStop` (số 1-based theo thứ tự) được suy ra khi dựng `OptimizationRequest`, nên đổi thứ tự không phải sửa từng kiện.
- [x] Xoá điểm giao còn kiện → chặn và hiện số kiện bị ảnh hưởng.
- [x] Đổi thứ tự tăng `inputVersion` (revision cũ thành lỗi thời).

## Tiêu chí nghiệm thu

- [x] Đổi điểm 2 ↔ 3 rồi mở Thiết lập tối ưu: request có `deliveryStop` mới đúng.
- [x] Màu điểm giao trong bảng kiện theo thứ tự mới.

## Kết quả (16/09/2026)

- `StopList` nhận điểm giao từ chuyến, thả xong lưu ngay qua `useTripStopsMutation`; kéo bằng bàn phím giữ nguyên (dnd-kit).
- **Lệch có chủ ý:** kiện không giữ ID điểm giao. `CargoPackage` của Spec chỉ có `deliveryStop` là số; thêm trường ngoài contract sẽ lệch Spec, nên thứ tự điểm giao là nguồn chuẩn và [trip-packages.ts](../../src/features/trips/trip-packages.ts) đánh số lại kiện ngay khi đổi thứ tự (test `trip-packages.test.ts`). Người dùng thấy kết quả như nhau: đổi điểm 2 ↔ 3 thì kiện theo đúng điểm cũ của nó.
- Xoá điểm giao còn kiện bị chặn, toast báo số kiện bị ảnh hưởng; xoá được thì các điểm sau được đánh số lại.
- Đổi thứ tự làm `packages` đổi → kho tăng `inputVersion` → revision cũ thành lỗi thời (D-31).
- Màu điểm giao trong bảng kiện lấy theo số thứ tự mới ngay sau khi lưu.

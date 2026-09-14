---
id: LM-045
title: Panel form kiện — thêm, sửa, xoá, nhân bản, tự đồng bộ trường xung đột
phase: 3
labels: [trips, form]
depends_on: [LM-012, LM-044]
estimate: 1.5d
prd: [D-25, D-33, D-35]
spec: [6, 7.5, 9.3]
---

# LM-045 — Panel form kiện

## Việc cần làm

- [ ] Chọn dòng mở panel phải (desktop) / sheet dưới (tablet, nút 56px). "Thêm kiện" mở panel trống.
- [ ] Form RHF + `cargoPackageSchema`: tên, dài/rộng/cao (cm), khối lượng (kg), số lượng, 6 hướng dạng checkbox kèm hình minh hoạ SVG đẳng cự nhỏ (tái dùng `lib/isometric.ts`), `keepUpright`, mức dễ vỡ, `stackable`, `maxTopLoadKg`, `maxStackCount`, `minSupportRatio` (nhập %, lưu 0..1), điểm giao (Select từ danh sách điểm giao của chuyến), độ ưu tiên, `mustLoad`, ghi chú.
- [ ] Đọc giá trị bằng `useWatch`, không `form.watch()`.
- [ ] Tự đồng bộ (D-25): bật `keepUpright` → bỏ chọn và khoá `LHW/WHL/HLW/HWL`, hiện dòng "Đã bỏ 2 hướng nằm nghiêng"; tắt `stackable` → `maxTopLoadKg = 0`, khoá ô.
- [ ] Hiện ngay lỗi `DOOR_TOO_SMALL` với xe của chuyến.
- [ ] Nhân bản: tạo `packageId` mới (`nextPackageId`), mở panel bản sao. Xoá: dialog xác nhận.
- [ ] Lưu qua mutation; panel đóng hoặc giữ mở "Lưu và thêm tiếp".

## Tiêu chí nghiệm thu

- [ ] Test RTL: bật `keepUpright` khi đang chọn `HLW` → `HLW` bị bỏ và có thông báo; tắt `stackable` → `maxTopLoadKg` về 0.
- [ ] Sửa kiện sau khi đã tối ưu → revision hiện tại hiện "Lỗi thời" (LM-050).

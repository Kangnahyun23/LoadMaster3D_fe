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

- [x] Chọn dòng mở panel phải (desktop) / sheet dưới (tablet, nút 56px). "Thêm kiện" mở panel trống.
- [x] Form RHF + `cargoPackageSchema`: tên, dài/rộng/cao (cm), khối lượng (kg), số lượng, 6 hướng dạng checkbox kèm hình minh hoạ SVG đẳng cự nhỏ (tái dùng `lib/isometric.ts`), `keepUpright`, mức dễ vỡ, `stackable`, `maxTopLoadKg`, `maxStackCount`, `minSupportRatio` (nhập %, lưu 0..1), điểm giao (Select từ danh sách điểm giao của chuyến), độ ưu tiên, `mustLoad`, ghi chú.
- [x] Đọc giá trị bằng `useWatch`, không `form.watch()`.
- [x] Tự đồng bộ (D-25): bật `keepUpright` → bỏ chọn và khoá `LHW/WHL/HLW/HWL`, hiện dòng "Đã bỏ 2 hướng nằm nghiêng"; tắt `stackable` → `maxTopLoadKg = 0`, khoá ô.
- [x] Hiện ngay lỗi `DOOR_TOO_SMALL` với xe của chuyến.
- [x] Nhân bản: tạo `packageId` mới (`nextPackageId`), mở panel bản sao. Xoá: dialog xác nhận.
- [x] Lưu qua mutation; panel đóng hoặc giữ mở "Lưu và thêm tiếp".

## Tiêu chí nghiệm thu

- [x] Test RTL: bật `keepUpright` khi đang chọn `HLW` → `HLW` bị bỏ và có thông báo; tắt `stackable` → `maxTopLoadKg` về 0.
- [ ] Sửa kiện sau khi đã tối ưu → revision hiện tại hiện "Lỗi thời" (LM-050).

## Kết quả (16/09/2026)

- [PackageFormPanel.tsx](../../src/features/trips/PackageFormPanel.tsx) + [PackageFormFields.tsx](../../src/features/trips/PackageFormFields.tsx): panel phải trên desktop, tấm dưới (nút 56px) trên tablet/điện thoại. RHF + `cargoPackageSchema`, giá trị đọc bằng `useWatch`.
- Tự đồng bộ D-25 nằm ở **event handler**, không ở effect (oxlint `react(set-state-in-effect)`): bật `keepUpright` bỏ hướng nằm nghiêng đang chọn, khoá ô và báo "Đã bỏ {n} hướng nằm nghiêng"; tắt `stackable` đưa `maxTopLoadKg` về 0 và khoá ô.
- `DOOR_TOO_SMALL` hiện ngay khi giá trị đang nhập parse được, câu qua `formatIssue`.
- Nhân bản (`nextPackageId`) mở panel bản sao; xoá có dialog xác nhận; "Lưu và thêm tiếp" mở kiện trống mã kế tiếp.
- Test RTL [PackageFormPanel.dom.test.tsx](../../src/features/trips/PackageFormPanel.dom.test.tsx): hai quy tắc D-25, lỗi cửa, lưu thành công. `src/test/setup-dom.ts` thêm bản giả `ResizeObserver` và vài API layout cho Radix trong jsdom.
- Tiêu chí "sửa kiện sau khi tối ưu → revision lỗi thời" do `inputVersion` của kho lo; banner lỗi thời hiện ở LM-050.

---
id: LM-041
title: Trang chi tiết xe — form cấu hình, bảng vật cản, trục xe, validation
phase: 3
labels: [fleet, form]
depends_on: [LM-017, LM-028, LM-040]
estimate: 2d
prd: [D-17, D-38]
spec: [9.2, 13]
---

# LM-041 — Trang chi tiết xe

## Việc cần làm

- [ ] `features/fleet/VehicleDetailPage.tsx` cho `/doi-xe/moi` và `/doi-xe/:vehicleId`; header 72px, một nút primary "Lưu".
- [ ] Form RHF + `vehicleConfigSchema`: tên, dài/rộng/cao trong thùng (cm), tải trọng tối đa (kg), rộng/cao cửa (cm), clearance (cm). `Input numeric` có hậu tố đơn vị, bước 0,1 cm / 0,01 kg; giá trị qua `roundCm` khi lưu.
  - zod 4 không cho `.omit('id')` trên schema có refinement → form tạo mới dùng id tạm hoặc schema form riêng dựng từ các khối trường của `src/domain/models`.
  - Lỗi nhiều trường (cửa ≤ thùng, vật cản trong thùng) chỉ xuất hiện khi các trường liên quan hợp lệ (`abort` trong schema); nếu cần hiện sớm hơn thì dùng `when` của zod.
  - Schema chỉ đòi `name` là chuỗi; bắt buộc không rỗng là quy tắc của form.
- [ ] Bảng vật cản (`useFieldArray`, số dòng nhỏ): loại (Select 4 loại), x/y/z, dài/rộng/cao (cm), chịu tải (Switch), tải tối đa (kg, chỉ bật khi chịu tải). Thêm, sửa, xoá.
- [ ] Bảng trục xe tuỳ chọn: tên, vị trí X (cm), tải rỗng, tải tối đa (kg), nhãn "Chưa dùng trong tính toán".
- [ ] Lỗi hiển thị tại field và trong validation summary đầu form (qua `formatIssue`), không dùng `alert`.
- [ ] Rời trang khi form đang sửa: hỏi xác nhận (dialog của repo).
- [ ] File ≤ 250 dòng: tách `VehicleSpecFields`, `ObstacleTable`, `AxleTable`, `VehicleValidationSummary`.

## Tiêu chí nghiệm thu

- [ ] Nhập cửa 250 cm với thùng rộng 240 cm → lỗi đúng câu Spec ở ô cửa.
- [ ] Vật cản vượt ra ngoài thùng hoặc chồng vật cản khác → lỗi tại dòng vật cản.
- [ ] Test RTL cho hai ca trên và cho lưu thành công.

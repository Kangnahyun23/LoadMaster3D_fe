---
id: LM-054
title: E2E luồng Spec đầu cuối trên desktop và tablet
phase: 3
labels: [test, e2e]
depends_on: [LM-042, LM-045, LM-046, LM-048, LM-050, LM-051, LM-052, LM-053]
estimate: 1d
prd: [D-39]
spec: [15, 16]
---

# LM-054 — E2E luồng Spec

## Kịch bản

- [ ] **Đầy đủ:** Dashboard → Tạo kế hoạch xếp → tạo chuyến → tạo xe "Truck 6m" có hốc bánh → thêm kiện `PKG-001` (quantity 4) + nhân bản → Thiết lập tối ưu → Tối ưu → Planner có MOCK RESULT, 4+ kiện, utilization → click kiện thấy cm/kg → Duyệt → mở `/kho` thấy bước đầu tiên.
- [ ] **Lỗi dữ liệu:** kiện không có hướng → nút Tối ưu disabled, summary nhảy tới ô.
- [ ] **Kết quả một phần:** kiện vượt thùng → Planner liệt kê chưa xếp với lý do.
- [ ] **Lỗi service:** `?mo-phong=loi` → dialog lỗi, Thử lại.
- [ ] **Lỗi thời:** sửa kiện sau khi tối ưu → Duyệt bị chặn.
- [ ] **Ngôn ngữ:** chuyển en giữa luồng, dữ liệu form giữ nguyên, số format kiểu en.
- [ ] Chạy trên project `desktop` và `tablet` (vùng chạm 56px).

## Tiêu chí nghiệm thu

- [ ] Toàn bộ kịch bản xanh trên CI.
- [ ] Mỗi dòng checklist Spec mục 15 có ít nhất một assertion trỏ tới (ghi chú ID dòng trong test).

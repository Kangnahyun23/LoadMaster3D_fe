---
id: LM-052
title: Dashboard — KPI theo Spec, job gần nhất, kế hoạch gần đây
phase: 3
labels: [manager, data]
depends_on: [LM-026, LM-040]
estimate: 1d
prd: [D-05, D-20]
spec: [9.1]
---

# LM-052 — Dashboard

## Việc cần làm

- [ ] `features/manager/dashboard-api.ts` + hook: số xe, tổng số kiện, tổng khối lượng (kg), job gần nhất, 5 kế hoạch gần đây — tính từ mock repository, không gõ cứng.
- [ ] KpiTile cho 3 số đầu; thẻ job gần nhất (chuyến, phương pháp, trạng thái, utilization, thời gian chạy, MOCK RESULT); bảng kế hoạch gần đây dẫn tới Planner.
- [ ] Nút primary duy nhất **Tạo kế hoạch xếp** → `/chuyen/moi`.
- [ ] Biểu đồ hiện có (`FillRateChart`, `AlgorithmChart`, `PlanVsActualTable`): giữ nếu dữ liệu tính được từ revision; nếu không có nguồn thật thì gỡ (không trình bày số giả như thật).
- [ ] Ẩn bộ lọc và "Xuất báo cáo" chưa hoạt động (D-20).
- [ ] Sửa format số tự nối chuỗi (`toFixed().replace`) sang `useFormat()`.

## Tiêu chí nghiệm thu

- [ ] Tạo thêm kiện rồi quay về Dashboard: tổng số kiện và khối lượng cập nhật.
- [ ] Dashboard không có số nào không truy được về dữ liệu repository.

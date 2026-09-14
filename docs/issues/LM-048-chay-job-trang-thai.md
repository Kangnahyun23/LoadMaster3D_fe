---
id: LM-048
title: Chạy job — tiến trình, huỷ, lỗi service, kết quả một phần, xác nhận bỏ draft
phase: 3
labels: [optimization, states]
depends_on: [LM-025, LM-047]
estimate: 1d
prd: [D-12, D-30, D-31]
spec: [9.4, 16]
---

# LM-048 — Chạy job và các trạng thái

## Việc cần làm

- [ ] `useRunOptimizationMutation` gọi `WorkerOptimizationService` qua `optimization-api.ts`; lưu revision vào mock repository khi xong.
- [ ] Trạng thái đang chạy: dialog tiến trình (số kiện đã xếp / tổng, thời gian), nút Huỷ; tái dùng/chỉnh `OptimizationDialog` hiện có, đổi "Vòng tối ưu" thành tiến trình thật và bỏ số gõ cứng "8.240 kg / 18,4 m³".
- [ ] Lỗi service (`?mo-phong=loi` hoặc exception): tái dùng `OptimizationErrorDialog`, có Thử lại; gỡ các nút lý do không hoạt động.
- [ ] `status: 'FAILED'`: hiện danh sách lỗi đầu vào.
- [ ] Thành công: điều hướng `/chuyen/:tripId/phuong-an?revision=<jobId>`; nếu có kiện chưa xếp thì toast "Kết quả một phần: X kiện chưa xếp".
- [ ] Chuyến có revision chưa duyệt kèm draft chỉnh tay → dialog xác nhận bỏ draft trước khi chạy.
- [ ] Gỡ `useOptimizationJob` giả lập bằng `setInterval` và `GenerationSparkline` nếu không còn dữ liệu thật.

## Tiêu chí nghiệm thu

- [ ] E2E đủ 4 trạng thái: loading, service-error, success, partial-result.
- [ ] Huỷ trả về màn thiết lập, không tạo revision.

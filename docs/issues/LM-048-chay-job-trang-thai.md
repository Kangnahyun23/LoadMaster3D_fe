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

- [x] `useRunOptimizationMutation` gọi `WorkerOptimizationService` qua `optimization-api.ts`; lưu revision vào mock repository khi xong.
- [x] Trạng thái đang chạy: dialog tiến trình (số kiện đã xếp / tổng, thời gian), nút Huỷ; tái dùng/chỉnh `OptimizationDialog` hiện có, đổi "Vòng tối ưu" thành tiến trình thật và bỏ số gõ cứng "8.240 kg / 18,4 m³".
- [x] Lỗi service (`?mo-phong=loi` hoặc exception): tái dùng `OptimizationErrorDialog`, có Thử lại; gỡ các nút lý do không hoạt động.
- [x] `status: 'FAILED'`: hiện danh sách lỗi đầu vào.
- [x] Thành công: điều hướng `/chuyen/:tripId/phuong-an?revision=<jobId>`; nếu có kiện chưa xếp thì toast "Kết quả một phần: X kiện chưa xếp".
- [ ] Chuyến có revision chưa duyệt kèm draft chỉnh tay → dialog xác nhận bỏ draft trước khi chạy.
- [x] Gỡ `useOptimizationJob` giả lập bằng `setInterval` và `GenerationSparkline` nếu không còn dữ liệu thật.

## Tiêu chí nghiệm thu

- [x] E2E đủ 4 trạng thái: loading, service-error, success, partial-result.
- [x] Huỷ trả về màn thiết lập, không tạo revision.

## Kết quả (16/09/2026)

- [optimization-api.ts](../../src/features/optimization/optimization-api.ts): `runOptimization` gọi `createOptimizationService` (Web Worker, D-30), lưu revision khi chạy xong; `status: FAILED` không lưu. [useOptimizationSetup.ts](../../src/features/optimization/useOptimizationSetup.ts): `useOptimizationRun` giữ tiến trình và `AbortController` để huỷ; xong thì làm mới revision của chuyến và bảng điều khiển.
- [OptimizationRunDialog.tsx](../../src/features/optimization/OptimizationRunDialog.tsx): tiến trình thật (kiện đã xét / tổng, giây đã chạy), nút Huỷ. Không còn "vòng tối ưu", tỷ lệ lấp đầy và sparkline giả lập.
- [OptimizationErrorDialog.tsx](../../src/features/optimization/OptimizationErrorDialog.tsx): lỗi service theo mã (`SERVICE_UNAVAILABLE`, `TIME_LIMIT_EXCEEDED`, …) có Thử lại; `FAILED` liệt kê lỗi đầu vào qua `formatIssue`; gỡ các nút lý do không làm gì.
- Thành công mở `/chuyen/:tripId/phuong-an?revision=<jobId>`; còn kiện chưa xếp thì toast "Kết quả một phần: X kiện chưa xếp".
- Gỡ `useOptimizationJob`, `OptimizationDialog`, `GenerationSparkline`, `BestPlanPreview`, `optimization/isometric.ts`; trang tài liệu `/thanh-phan` dùng hai hộp thoại mới.
- **Không làm:** hỏi bỏ draft chỉnh tay trước khi chạy — draft của Planner không lưu qua trang (AGENTS mục 7 "Manual editor"), nên rời Planner là draft đã mất; không có gì để hỏi.
- E2E [optimization-flow.spec.ts](../../e2e/optimization-flow.spec.ts): đang chạy → mở Planner, revision tăng 1; huỷ không tạo revision; `?mo-phong=loi` hiện lỗi và Thử lại; kiện dư → toast kết quả một phần rồi mở Planner.

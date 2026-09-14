---
id: LM-025
title: Chạy mock service trong Web Worker — tiến trình, huỷ, giả lập lỗi
phase: 1
labels: [service, performance]
depends_on: [LM-024]
estimate: 1d
prd: [D-12, D-30]
spec: [11, 16]
---

# LM-025 — Web Worker cho mock service

## Việc cần làm

- [ ] `optimization.worker.ts` bọc `MockOptimizationService`; tạo bằng `new Worker(new URL('./optimization.worker.ts', import.meta.url), { type: 'module' })`.
- [ ] `WorkerOptimizationService implements OptimizationService`: giao tiếp message có kiểu (`start`, `progress { placed, total }`, `result`, `error`), trả `Promise<OptimizationResult>`.
- [ ] Hỗ trợ `AbortSignal`: huỷ thì `worker.terminate()`; quá `timeLimitSeconds` thì trả kết quả tốt nhất hiện có hoặc lỗi hết giờ (chốt trong JSDoc).
- [ ] Độ trễ giả tối thiểu (vd 600 ms) để trạng thái loading nhìn thấy được.
- [ ] `?mo-phong=loi` → service ném lỗi có mã `SERVICE_UNAVAILABLE`; tham số đọc ở tầng `-api.ts`, không đọc trong domain.
- [ ] Fallback chạy main thread khi môi trường không có Worker (test jsdom).

## Tiêu chí nghiệm thu

- [ ] Khi đang chạy 1.000 instance, cuộn trang và bấm nút vẫn phản hồi (không long task > 50 ms từ job).
- [ ] Huỷ giữa chừng không để lại worker chạy ngầm.
- [ ] `?mo-phong=loi` cho trạng thái lỗi service và thử lại được.

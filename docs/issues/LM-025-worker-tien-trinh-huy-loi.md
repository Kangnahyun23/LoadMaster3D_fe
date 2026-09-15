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

- [x] `optimization.worker.ts` bọc `MockOptimizationService`; tạo bằng `new Worker(new URL('./optimization.worker.ts', import.meta.url), { type: 'module' })`.
- [x] `WorkerOptimizationService implements OptimizationService`: giao tiếp message có kiểu (`start`, `progress { placed, total }`, `result`, `error`), trả `Promise<OptimizationResult>`.
- [x] Hỗ trợ `AbortSignal`: huỷ thì `worker.terminate()`; quá `timeLimitSeconds` thì trả kết quả tốt nhất hiện có hoặc lỗi hết giờ (chốt trong JSDoc).
- [x] Độ trễ giả tối thiểu (vd 600 ms) để trạng thái loading nhìn thấy được.
- [ ] `?mo-phong=loi` → service ném lỗi có mã `SERVICE_UNAVAILABLE`; tham số đọc ở tầng `-api.ts`, không đọc trong domain.
- [x] Fallback chạy main thread khi môi trường không có Worker (test jsdom).

## Tiêu chí nghiệm thu

- [ ] Khi đang chạy 1.000 instance, cuộn trang và bấm nút vẫn phản hồi (không long task > 50 ms từ job).
- [x] Huỷ giữa chừng không để lại worker chạy ngầm.
- [ ] `?mo-phong=loi` cho trạng thái lỗi service và thử lại được.

## Kết quả (15/09/2026)

Seam `@/services/optimization`, `worker-service.test.ts` 9 test (worker giả, fake timers) + một lượt kiểm trên Chromium thật.

**API**

| Export | Việc |
|---|---|
| `WorkerOptimizationService({ createWorker?, minimumLatencyMs = 600, clock? })` | chạy mock trong worker; message có kiểu `start` → `progress` / `result` / `error` |
| `handleWorkerRequest(message, post)` | việc của worker, tách khỏi `self` để test; `optimization.worker.ts` chỉ nối `self.onmessage` |
| `UnavailableOptimizationService` | chờ như gọi thật rồi reject `SERVICE_UNAVAILABLE` (demo lỗi D-12) |
| `createOptimizationService({ simulateFailure? })` | Worker khi có, chạy trên luồng gọi khi không (jsdom, test), service lỗi khi `simulateFailure` |
| `OptimizationServiceError` | `code`: `SERVICE_UNAVAILABLE`, `TIME_LIMIT_EXCEEDED`, `MOCK_FAILED`, `WORKER_CRASHED` |

**Quyết định**

- **Hết `timeLimitSeconds` → reject `TIME_LIMIT_EXCEEDED`** (chốt trong JSDoc): mock tính một mạch trong worker nên không có "kết quả tốt nhất hiện có" để trả.
- Mỗi lần gọi một worker riêng; mọi đường kết thúc (xong, lỗi, huỷ, hết giờ) đều `terminate` đúng một lần, kết quả đến trễ bị bỏ qua.
- Huỷ → reject với `signal.reason` (không bọc thành mã riêng: UI phân biệt huỷ bằng chính signal của nó).
- Độ trễ tối thiểu 600 ms tính từ lúc gọi: kết quả về sớm vẫn chờ đủ.
- `?mo-phong=loi` **không** đọc trong service: tầng `-api.ts` (LM-048) đọc URL rồi truyền `simulateFailure`.
- `optimization.worker.ts` ép `self` qua kiểu tối thiểu (tsconfig app dùng lib DOM, thêm lib WebWorker sẽ trùng khai báo).

**Test**

- Worker giả: chuyển tiếp tiến trình, trả kết quả và dừng worker; chờ đủ độ trễ tối thiểu (499 ms chưa xong, 500 ms xong); huỷ; hết giờ; lỗi mock / worker hỏng;
  service lỗi; chọn service theo môi trường. Đỏ dưới 3 đột biến: bỏ độ trễ tối thiểu, bỏ `terminate` khi huỷ, bỏ giới hạn thời gian.
  Đột biến "bỏ `terminate` khi huỷ" ban đầu **lọt** vì kết quả đến trễ sau đó tự dừng worker — test đổi sang kiểm worker đã dừng ngay khi huỷ.
- `handleWorkerRequest` gửi tiến trình tới đủ số instance rồi đúng kết quả của hàm thuần.

**Kiểm trên trình duyệt thật** (spec Playwright tạm, không commit; Chromium, Vite dev server): `createOptimizationService()` chọn `WorkerOptimizationService`;
job 1.000 instance `COMPLETED`, 1.000 kiện, 40 lần báo tiến trình, 601 ms (độ trễ tối thiểu); trong lúc chạy timer 10 ms trên main thread vẫn chạy 54 nhịp và
**không có long task** (`PerformanceObserver` `longtask`).

**Chuyển tiếp**

- **LM-048:** `-api.ts` gọi `createOptimizationService({ simulateFailure: đọc ?mo-phong=loi })`, truyền `signal` và `onProgress`; E2E cuộn trang / bấm nút khi đang
  tối ưu 1.000 kiện và thử lại sau lỗi service (tiêu chí nghiệm thu còn lại cần UI).

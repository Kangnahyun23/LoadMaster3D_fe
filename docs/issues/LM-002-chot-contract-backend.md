---
id: LM-002
title: Chốt contract OptimizationRequest/Result với nhóm backend
phase: 0
labels: [contract, blocked-external]
depends_on: []
estimate: theo dõi
prd: [D-02, D-04, D-28, D-31, D-36]
spec: [6, 11]
---

# LM-002 — Chốt contract với nhóm backend

## Bối cảnh

FE làm theo type Spec mục 6 nhưng contract chưa chốt (D-02). Một số quyết định FE ảnh hưởng tới backend và cần xác nhận. Issue này **không chặn** phase 1–3 vì hình dạng payload nằm sau `src/services/optimization` và các file `-api.ts`.

## Câu hỏi cần trả lời

- [ ] FE gọi thẳng FastAPI hay đi qua Spring Boot? Ai sở hữu `OptimizationRequest/Result`?
- [ ] Chạy job đồng bộ hay bất đồng bộ (tạo job → WebSocket/polling tiến trình → lấy kết quả)?
- [ ] Tên điểm giao, thông tin chuyến, revision (`jobId`) và trạng thái duyệt có nằm trong contract không?
- [ ] `constraintWarnings: string[]` có đổi sang mã lỗi có cấu trúc `{ code, severity, params }` (D-28) không?
- [ ] Ngưỡng trọng tâm D-36 (10% ngang, 50% cao) có được nghiệp vụ xác nhận không?
- [ ] Khi nào backend trả tải trục đáng tin cậy?

## Tiêu chí nghiệm thu

- [ ] Có file contract (OpenAPI hoặc JSON Schema) được hai bên duyệt.
- [ ] Nếu contract khác Spec: cập nhật `docs/prd.md` mục 5 và mở issue điều chỉnh `src/domain/models` và `src/services/optimization`.

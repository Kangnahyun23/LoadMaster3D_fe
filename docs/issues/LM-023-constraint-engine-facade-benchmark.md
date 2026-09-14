---
id: LM-023
title: Constraint engine — facade toàn bộ + tăng dần, benchmark làm cổng CI
phase: 1
labels: [domain, constraints, performance]
depends_on: [LM-016, LM-017, LM-018, LM-019, LM-020, LM-021, LM-022]
estimate: 1.5d
prd: [D-09, D-24, D-29]
spec: [7, 14]
---

# LM-023 — Constraint engine facade

## Việc cần làm

- [ ] `createConstraintEngine(vehicle, packages, placements, settings)` giữ grid + đồ thị đỡ + cache issue.
- [ ] `evaluateAll() → { issues, byInstanceId, supportRatioById, loadById }`.
- [ ] `evaluateMove(id, candidate: { position, orientation })` không đổi trạng thái — dùng cho preview khi kéo; `commitMove(id, candidate)` cập nhật grid và tính lại cục bộ (kiện bị kéo, cột đỡ ở vị trí cũ và mới, hành lang LIFO liên quan).
- [ ] `approvalBlockers(result)` gom: còn `error`, kiện `mustLoad` trong `unplacedPackages` (`MUST_LOAD_UNPLACED`, D-24), revision lỗi thời (nhận cờ từ ngoài).
- [ ] Benchmark Vitest (`*.bench.ts`) với fixture tất định 132 / 500 / 1.000 kiện; một test đọc kết quả bench và **fail** khi vượt ngân sách.

## Ngân sách (D-29)

| Thao tác | 1.000 kiện | Ngưỡng CI |
|---|---|---|
| `evaluateAll` | p95 ≤ 50 ms | fail khi p95 > 75 ms (dự phòng máy CI chậm) |
| `evaluateMove` / `commitMove` | p95 ≤ 8 ms | fail khi p95 > 12 ms |

## Tiêu chí nghiệm thu

- [ ] Sau 500 lần `commitMove` ngẫu nhiên tất định, `evaluateAll()` trên engine mới dựng từ đầu cho **cùng** tập issue.
- [ ] Benchmark đạt ngân sách trên máy dev; số đo ghi vào `docs/benchmarks/constraint-engine-<ngày>.json`.

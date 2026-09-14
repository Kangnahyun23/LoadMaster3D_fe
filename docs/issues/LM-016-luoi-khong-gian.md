---
id: LM-016
title: Lưới không gian X–Y cho truy vấn láng giềng
phase: 1
labels: [domain, performance]
depends_on: [LM-015]
estimate: 1d
prd: [D-29]
---

# LM-016 — Lưới không gian X–Y

## Bối cảnh

Chồng lấn, tìm kiện đỡ, truyền tải và LIFO đều cần tìm kiện lân cận. Quét thẳng là O(N²) ở 1.000 kiện và không đạt ngân sách một lần thả p95 ≤ 8 ms.

## Việc cần làm

- [ ] `src/domain/geometry/spatial-grid.ts`: lưới đều theo X–Y, kích thước ô mặc định theo trung vị footprint (có thể cấu hình).
- [ ] API: `buildGrid(boxes)`, `queryAabb(box)` (ứng viên chồng lấn), `queryBelow(box)`, `queryAbove(box)`, `queryRearCorridor(box, doorX)`; `update(id, box)` và `remove(id)` cho editor.
- [ ] Kết quả trả ID, không trả tham chiếu có thể bị sửa.
- [ ] Không phụ thuộc React/Three.

## Tiêu chí nghiệm thu

- [ ] Test đối chiếu: với fixture ngẫu nhiên tất định 1.000 kiện, tập ứng viên của grid chứa đủ mọi cặp mà quét thẳng tìm ra (không bỏ sót).
- [ ] Benchmark `queryAabb` 1.000 lần trên 1.000 kiện < 5 ms (máy dev) — ghi số vào report.

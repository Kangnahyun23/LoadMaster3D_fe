---
id: LM-021
title: Metrics — tỷ lệ thể tích, tải trọng, trọng tâm và ngưỡng cảnh báo
phase: 1
labels: [domain, metrics]
depends_on: [LM-012, LM-015]
estimate: 0.5d
prd: [D-36]
spec: [7.9, 8, 11]
---

# LM-021 — Metrics và trọng tâm

## Việc cần làm

- [ ] `src/domain/metrics/`: `computeMetrics(vehicle, placements, packageById, unplaced, runtimeMs) → OptimizationResult['metrics']` — thể tích xe, thể tích dùng, `%`, payload dùng, `%`, số đã/chưa xếp, trọng tâm.
- [ ] Thể tích xe **có trừ** vật cản hay không: chốt và ghi JSDoc (đề xuất: tổng thể tích trong thùng, theo đúng Spec `totalVehicleVolumeCm3`).
- [ ] `centerOfGravity` theo công thức Spec 7.9.
- [ ] `COG_THRESHOLDS = { lateralRatio: 0.10, heightRatio: 0.50 }` một chỗ duy nhất; `checkCenterOfGravity` → `COG_LATERAL` / `COG_HIGH` (warning) kèm `params`.

## Tiêu chí nghiệm thu

- [ ] Metrics của fixture tính tay khớp đến 0,01.
- [ ] Không có số metric nào gõ cứng trong mock hay UI.
- [ ] Trọng tâm lệch 11% chiều rộng → `COG_LATERAL`; lệch 9% → không cảnh báo.

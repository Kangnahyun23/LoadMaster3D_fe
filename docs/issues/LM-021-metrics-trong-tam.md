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

- [x] `src/domain/metrics/`: `computeMetrics(...) → OptimizationResult['metrics']` — thể tích xe, thể tích dùng, `%`, payload dùng, `%`, số đã/chưa xếp, trọng tâm.
- [x] Thể tích xe **có trừ** vật cản hay không: chốt và ghi JSDoc (đề xuất: tổng thể tích trong thùng, theo đúng Spec `totalVehicleVolumeCm3`).
- [x] `centerOfGravity` theo công thức Spec 7.9.
- [x] `COG_THRESHOLDS = { lateralRatio: 0.10, heightRatio: 0.50 }` một chỗ duy nhất; `checkCenterOfGravity` → `COG_LATERAL` / `COG_HIGH` (warning) kèm `params`.

## Tiêu chí nghiệm thu

- [x] Metrics của fixture tính tay khớp đến 0,01.
- [ ] Không có số metric nào gõ cứng trong mock hay UI. *(mock dùng `computeMetrics` ở LM-024; UI cũ chuyển ở phase 2–3)*
- [x] Trọng tâm lệch 11% chiều rộng → `COG_LATERAL`; lệch 9% → không cảnh báo.

## Kết quả (15/09/2026)

Seam `@/domain/metrics`, TDD 9 vòng, 15 test (`metrics.test.ts`, `center-of-gravity.test.ts`).

- **Chữ ký đã điều chỉnh:** `computeMetrics({ vehicle, placements, weightByInstanceId, unplacedCount, runtimeMs })`.
  Placement không mang khối lượng nên nhận `Map` khối lượng theo `packageInstanceId` (dựng từ
  `expandPackages` của LM-013) thay cho `packageById`; chưa xếp chỉ cần số lượng.
- **Thiếu khối lượng của một placement là lỗi lập trình** → `throw` kèm mã instance, không coi là 0 kg
  (0 kg làm payload và trọng tâm sai mà không ai thấy).
- **Thể tích xe không trừ vật cản** — test dùng xe mẫu Spec có hốc bánh xe 120 × 30 × 45 cm vẫn ra 36.000.000 cm³.
- **Phần trăm nhân trước rồi chia:** `324000 / 36e6 * 100 = 0.8999…`, `324000 * 100 / 36e6 = 0.9` (kiểm bằng Node).
- **Trọng tâm** có trọng số theo khối lượng; không có kiện thì **vắng trường** `centerOfGravityCm` (không trả `NaN`).
  Test có trọng số (30 kg + 10 kg → x 150, y 60) được chứng minh đỏ khi đổi thành trung bình không trọng số.
- **Ngưỡng D-36:** lệch ngang so với đường giữa `innerWidthCm / 2`, lấy trị tuyệt đối; đúng bằng ngưỡng không cảnh báo.
  So sánh bằng `gt` trên số chưa làm tròn (`|146.4 − 120| = 26.400000000000006`); `params` qua `roundCm`.
- `checkCenterOfGravity` nhận `Pick<VehicleConfig, 'innerWidthCm' | 'innerHeightCm'>` và một điểm đã có;
  constraint engine (LM-023) tự bỏ qua khi chưa có trọng tâm.

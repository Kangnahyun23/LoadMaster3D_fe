---
id: LM-010
title: Domain models theo Spec + zod schema
phase: 1
labels: [domain]
depends_on: [LM-004]
estimate: 1d
prd: [D-04, D-19, D-25]
spec: [6]
---

# LM-010 — Domain models theo Spec + zod schema

## Bối cảnh

Contract của Spec mục 6 là nguồn duy nhất cho hình dạng dữ liệu (D-04). Hiện `src/types/load-plan.ts` dùng mm và mô hình khác; file đó sẽ bị thay dần ở phase 2–4.

## Việc cần làm

- [ ] `src/domain/models/`: `OrientationCode`, `FragilityLevel`, `VehicleConfig`, `VehicleObstacle`, `VehicleAxle`, `CargoPackage`, `PackagePlacement`, `UnplacedPackage`, `OptimizationRequest`, `OptimizationResult` — đúng tên trường Spec, không thêm trường.
- [ ] Zod schema tương ứng (`vehicleConfigSchema`, `cargoPackageSchema`, `optimizationRequestSchema`, `optimizationResultSchema`) dùng cho form và kiểm tra dữ liệu vào từ API.
- [ ] Quy tắc dữ liệu Spec: `minSupportRatio ∈ [0,1]`; `stackable = false ⇒ maxTopLoadKg = 0`; `quantity ≥ 1` (số nguyên); `allowedOrientations` không rỗng; `keepUpright ⇒ allowedOrientations ⊆ {LWH, WLH}` (D-25: schema **từ chối**, form mới là nơi tự đồng bộ).
- [ ] Mọi kích thước > 0; số phải hữu hạn.
- [ ] Không import React/Three trong `src/domain`.
- [ ] Adapter `placementToBox(PackagePlacement)` và `obstacleToBox(VehicleObstacle)` sang `Box` của `@/domain/geometry` (chuyển từ LM-015).

## Tiêu chí nghiệm thu

- [ ] Fixture mẫu Spec mục 12 (vehicle, package, placement) parse thành công.
- [ ] Test từ chối đủ các ca: `quantity = 0`, `minSupportRatio = 1.2`, `stackable=false` với `maxTopLoadKg=90`, `keepUpright` với `HLW`, `allowedOrientations = []`.

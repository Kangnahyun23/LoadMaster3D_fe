---
id: LM-030
title: View model 3D từ OptimizationResult + CargoPackage + chuyến
phase: 2
labels: [viewer3d, data]
depends_on: [LM-024, LM-026]
estimate: 1.5d
prd: [D-03, D-04]
---

# LM-030 — View model cho engine 3D

## Bối cảnh

Engine hiện nhận `LoadPlan` (mm, `Placement` gộp thông tin kiện). Contract Spec tách `PackagePlacement` và `CargoPackage`. D-04: FE tự ghép view model, contract không thêm trường.

## Việc cần làm

- [ ] `src/features/viewer3d/scene-input.ts`: `ScenePlacement = PackagePlacement + { packageId, name, weightKg, deliveryStop, stopName, fragilityLevel, stackable, pinned? }` ghép từ result + `packageIdByInstanceId` + chuyến.
- [ ] `adaptResult(result, trip, vehicle) → ViewerSceneModel` thay `adaptLoadPlan`; giữ bất biến (freeze), lookup theo ID, `baseDimensionsById` từ `CargoPackage`.
- [ ] Xác định trường `packaging` (carton/pallet/crate) cho atlas bề mặt: không có trong Spec → mặc định một kiểu trung tính, hoặc suy từ tên kiện? Chốt: **một kiểu trung tính**, giữ atlas cho lúc contract có trường.
- [ ] Màu theo `don-hang` không còn nguồn `orderId` → đổi thành "Theo kiện gốc" (`packageId`) hoặc gỡ chế độ; cập nhật `COLOR_MODES`.
- [ ] Draft patch vẫn theo `packageInstanceId`; `PlacementPatch.position` dùng cm.

## Tiêu chí nghiệm thu

- [ ] Planner mở `?revision=<jobId>` của chuyến seed hiển thị đủ kiện, đúng màu điểm giao.
- [ ] Test: không trường nào của `PackagePlacement` bị sửa sau `adaptResult`.

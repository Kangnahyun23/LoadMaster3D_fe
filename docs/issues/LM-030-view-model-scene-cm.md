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

- [x] `src/features/viewer3d/scene-input.ts`: `ScenePlacement = PackagePlacement + { packageId, name, weightKg, deliveryStop, stopName, fragilityLevel, stackable, pinned? }` ghép từ result + `packageIdByInstanceId` + chuyến.
- [x] `adaptResult(result, trip, vehicle) → ViewerSceneModel` thay `adaptLoadPlan`; giữ bất biến (freeze), lookup theo ID, `baseDimensionsById` từ `CargoPackage`.
- [x] Xác định trường `packaging` (carton/pallet/crate) cho atlas bề mặt: không có trong Spec → mặc định một kiểu trung tính, hoặc suy từ tên kiện? Chốt: **một kiểu trung tính**, giữ atlas cho lúc contract có trường.
- [x] Màu theo `don-hang` không còn nguồn `orderId` → đổi thành "Theo kiện gốc" (`packageId`) hoặc gỡ chế độ; cập nhật `COLOR_MODES`.
- [x] Draft patch vẫn theo `packageInstanceId`; `PlacementPatch.position` dùng cm.

## Tiêu chí nghiệm thu

- [x] Planner mở `?revision=<jobId>` của chuyến seed hiển thị đủ kiện, đúng màu điểm giao.
- [x] Test: không trường nào của `PackagePlacement` bị sửa sau `adaptResult`.

## Kết quả (15/09/2026)

Làm cùng LM-031 và LM-037 (đổi kiểu placement kéo theo toàn engine). Test: [scene-input.test.ts](../../src/features/viewer3d/scene-input.test.ts) (TDD, đỏ trước khi có module).

- [scene-input.ts](../../src/features/viewer3d/scene-input.ts): `ScenePlacement` (cm, `position {x,y,z}`, `packageId`, `name`, `stop`, `step = loadingOrder`, `unloadingOrder`, `orientation` mã Spec, `fragilityLevel`, `stackable`), `ViewerSceneModel` (vehicle là `VehicleConfig`, `baseDimensionsById` từ `CargoPackage`, `orientationRulesById`, `isMockResult`, `ordersRecomputed`), `adaptResult({ trip, revision })` bất biến, `adaptLoadPlan` cho kho/tài xế (mm → cm một lần), `orientedSize`.
- **Lệch tên trường so với issue:** giữ `position {x,y,z}` + `lengthCm/widthCm/heightCm` thay vì `xCm`/`placedLengthCm`: editor duyệt theo trục (`position[axis]`), đổi tên chỉ thêm churn. Chỉ nằm trong `viewer3d`; contract không đổi.
- Planner đọc revision qua [viewer-api.ts](../../src/features/viewer3d/viewer-api.ts) + [usePlanSourceQuery.ts](../../src/features/viewer3d/usePlanSourceQuery.ts): mặc định revision đã duyệt mới nhất, `?revision=<jobId>` chọn theo job; chuyến không có revision hiện trạng thái rỗng. Header có **MOCK RESULT**.
- `packaging`: một kiểu trung tính (`carton`), panel kiện bỏ badge bao bì (không có dữ liệu). Chế độ màu "Theo đơn hàng" → **"Theo kiện gốc"** (`kien-goc`, theo `packageId`).
- Kiện chưa xếp hiện lý do qua `t('viewer.unplacedReasons.<reasonCode>')`.

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

- [x] `src/domain/models/`: `OrientationCode`, `FragilityLevel`, `VehicleConfig`, `VehicleObstacle`, `VehicleAxle`, `CargoPackage`, `PackagePlacement`, `UnplacedPackage`, `OptimizationRequest`, `OptimizationResult` — đúng tên trường Spec, không thêm trường.
- [x] Zod schema tương ứng (`vehicleConfigSchema`, `cargoPackageSchema`, `optimizationRequestSchema`, `optimizationResultSchema`) dùng cho form và kiểm tra dữ liệu vào từ API.
- [x] Quy tắc dữ liệu Spec: `minSupportRatio ∈ [0,1]`; `stackable = false ⇒ maxTopLoadKg = 0`; `quantity ≥ 1` (số nguyên); `allowedOrientations` không rỗng; `keepUpright ⇒ allowedOrientations ⊆ {LWH, WLH}` (D-25: schema **từ chối**, form mới là nơi tự đồng bộ).
- [x] Mọi kích thước > 0; số phải hữu hạn.
- [x] Không import React/Three trong `src/domain`.
- [x] Adapter `placementToBox(PackagePlacement)` và `obstacleToBox(VehicleObstacle)` sang `Box` của `@/domain/geometry` (chuyển từ LM-015).

## Tiêu chí nghiệm thu

- [x] Fixture mẫu Spec mục 12 (vehicle, package, placement) parse thành công.
- [x] Test từ chối đủ các ca: `quantity = 0`, `minSupportRatio = 1.2`, `stackable=false` với `maxTopLoadKg=90`, `keepUpright` với `HLW`, `allowedOrientations = []`.

## Kết quả — 15/09/2026 (TDD)

**Seam.** Test chỉ import từ `@/domain/models` ([index.ts](../../src/domain/models/index.ts)), cộng dữ liệu mẫu [src/domain/fixtures/spec-samples.ts](../../src/domain/fixtures/spec-samples.ts) (`SPEC_TRUCK_6M`, `SPEC_CARTON_A`, `SPEC_CARTON_A_PLACEMENT`, có kiểu, dùng lại cho LM-024 và LM-026). API công khai:

- 10 type của Spec mục 6, sinh bằng `z.infer` từ schema.
- `vehicleConfigSchema`, `cargoPackageSchema`, `optimizationRequestSchema`, `optimizationResultSchema`, thêm `packagePlacementSchema`.
- `placementToBox` (dùng `placed*Cm`), `obstacleToBox`.
- `MODEL_ISSUE_CODES` và kiểu `ModelIssueCode`.

**Hợp đồng type.** [spec-contract.test.ts](../../src/domain/models/spec-contract.test.ts) chép nguyên văn khối type Spec mục 6 và so bằng `expectTypeOf(...).toEqualTypeOf`. Phép so chạy lúc `tsc -b` (nằm trong `pnpm build`). Đã thử thêm một trường tuỳ chọn thừa vào schema: build đỏ.

**Mã lỗi (D-28).** Message của mọi issue zod là một mã, không phải câu chữ. Test so mã cùng `path`. Quy ước tên là `<phạm vi>.<chủ thể>.<quy tắc>`:

- phạm vi là thực thể phát lỗi, hoặc `common` cho lỗi kiểu dữ liệu;
- chủ thể là tên trường, hoặc tên nhóm (`dimension`, `door`, `obstacle`) khi nhiều trường dùng chung một quy tắc; lúc đó `path` chỉ ra đúng trường.

Có 34 mã, liệt kê trong [issue-codes.ts](../../src/domain/models/issue-codes.ts):

| Phạm vi | Mã |
|---|---|
| common | `common.number.invalid` (gồm NaN, ±Infinity), `common.string.invalid`, `common.boolean.invalid`, `common.enum.invalid`, `common.array.invalid`, `common.object.invalid` |
| vehicle | `vehicle.dimension.positive`, `vehicle.maxPayloadKg.positive`, `vehicle.clearanceCm.nonNegative`, `vehicle.floorMaxLoadKg.nonNegative`, `vehicle.floorPressureLimitKgPerCm2.nonNegative`, `vehicle.door.exceedsInner` (path `doorWidthCm` / `doorHeightCm`), `vehicle.obstacle.outsideInterior` (path `obstacles[i]`) |
| obstacle | `obstacle.dimension.positive`, `obstacle.maxTopLoadKg.nonNegative`, `obstacle.maxTopLoadKg.notLoadBearing` |
| axle | `axle.emptyLoadKg.nonNegative`, `axle.maxLoadKg.nonNegative` |
| package | `package.dimension.positive`, `package.weightKg.nonNegative`, `package.quantity.integer`, `package.quantity.min`, `package.allowedOrientations.empty`, `package.allowedOrientations.duplicate` (path `allowedOrientations[i]`), `package.keepUpright.orientation` (path `allowedOrientations[i]`), `package.maxTopLoadKg.nonNegative`, `package.maxTopLoadKg.notStackable`, `package.maxStackCount.integer`, `package.maxStackCount.min`, `package.minSupportRatio.range`, `package.deliveryStop.integer`, `package.deliveryStop.min` |
| placement | `placement.dimension.positive`, `placement.supportRatio.range` |

**Quyết định đã chốt khi làm**

- Trường ngoài hợp đồng bị **bỏ** khi parse: không giữ lại, cũng không từ chối (D-04; contract còn mở theo D-02).
- Kiểm tra trên từng trường dùng `abort`. Refinement nhiều trường (cửa ≤ thùng, vật cản trong thùng, keepUpright, stackable) chỉ chạy khi các trường đều hợp lệ, nên không sinh lỗi kéo theo. Ví dụ: rộng trong thùng = 0 chỉ báo một lỗi. Hệ quả là lỗi cửa hoặc vật cản chỉ hiện sau khi sửa xong lỗi trường; nếu form cần hiện sớm hơn thì LM-041 dùng `when` của zod.
- Vật cản `loadBearing = false` mà khai `maxTopLoadKg > 0` là dữ liệu mâu thuẫn, nên bị từ chối (`obstacle.maxTopLoadKg.notLoadBearing`). Khai 0 kg hoặc bỏ trống thì hợp lệ.
- Số thực so qua `gt`/`lt` EPSILON. Kiểm tra vật cản trong thùng dùng lại `vehicleBoundaryExcess` qua `obstacleToBox`, không tính lại biên.
- Toạ độ, `priority`, `timeLimitSeconds`, `randomSeed`, `loadingOrder`/`unloadingOrder` và toàn bộ metrics chỉ bắt buộc là số hữu hạn.
- Tập hướng đứng `{LWH, WLH}` là hằng nội bộ của schema.

**Test.** 39 test mới trong 6 file: vehicle 14, package 16, optimization 5, box-adapters 2, issue-codes 1, spec-contract 1. Có 36 vòng red → green. 3 test chặn hồi quy đã được chứng minh đỏ bằng cách cố ý làm hỏng code rồi khôi phục:

- bỏ trường thừa (đổi sang `looseObject`);
- vật cản sát vách bị trôi (đổi sang so biên thô);
- mã `common.object.invalid` (đổi mã).

Ngoài ra đã thử bỏ `abort`: test "rộng trong thùng = 0" đỏ với cả lỗi cửa lẫn lỗi vật cản kéo theo. Đã thử so tỷ lệ bằng `>=`/`<=` thô: tỷ lệ trôi 1,0000000000000002 bị từ chối oan.

**Kiểm chứng số bằng máy trước khi viết test**

- `199.8 + 30.3 = 230.10000000000002`: hốc bánh sát vách phải trong thùng rộng 230,1 cm.
- `(38 × 60.3 + 22.1 × 60.3) / (60.1 × 60.3) = 1.0000000000000002`: đáy kiện được đỡ kín.
- Hai giả định ban đầu sai, đã bỏ: vách số nguyên (600/240/250) cộng bước 0,1 cm **không** gây trôi; `250 − 2 × 5.05` cho đúng `239.9`.

**Chuyển sang issue khác**

- Tổng tải trọng, kiện qua cửa theo hướng, vật cản chồng lấn nhau, danh sách `packages` rỗng → **LM-017**.
- `id`/`name` rỗng → form **LM-041**/**LM-045** hoặc **LM-017**. Schema hiện chỉ đòi kiểu chuỗi.
- Tham số cho câu thông báo (ví dụ 250 cm / 240 cm) → **LM-014**/**LM-017**. Schema chỉ mang mã và `path`; câu chữ thuộc **LM-028**.
- Placement hợp lệ theo biên, chồng lấn, vật cản và độ đỡ → **LM-018**/**LM-023**. Trùng ID instance → **LM-013**.
- Nghĩa của vật cản chịu tải mà thiếu `maxTopLoadKg` (không giới hạn hay chặn) → **LM-018**/**LM-019**.
- Đưa `UPRIGHT_ORIENTATIONS`/`isUpright` ra dùng chung và cho schema dùng lại → **LM-012**.
- Tự đồng bộ `keepUpright` và `stackable` trong form → **LM-045**.
- Trường tuỳ chọn gửi `null` hiện bị từ chối (`common.*.invalid`) → chốt với backend ở **LM-002**.
- zod 4 không cho `.omit()` trên schema có refinement → form tạo xe mới (**LM-041**) cần schema riêng hoặc id tạm.

**Kiểm tra**

- `pnpm test`: 92/92 ✅ (53 cũ + 39 mới).
- `pnpm lint`: ✅, 216 file, 0 chẩn đoán.
- `pnpm build`: ✅. Cảnh báo chunk > 500 kB đã có từ trước.

Máy đang thiếu RAM vì dev server của phiên khác, nên trong vòng TDD có lúc worker Vitest bị crash do hết bộ nhớ. Khi đó chạy lại với `--pool=threads --maxWorkers=1`. Lần chạy `pnpm test` cuối dùng cấu hình mặc định.

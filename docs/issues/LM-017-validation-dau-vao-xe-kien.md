---
id: LM-017
title: Validation đầu vào — xe, vật cản, kiện, tải trọng, cửa
phase: 1
labels: [domain, validation]
depends_on: [LM-012, LM-013, LM-015]
estimate: 1d
prd: [D-23, D-28]
spec: [7.3, 7.4, 7.5, 9.2, 9.4]
---

# LM-017 — Validation đầu vào

## Bối cảnh

Validation summary ở Thiết lập tối ưu (Spec 9.4) gom lỗi của xe và kiện **trước khi** gọi service. Nút Tối ưu chỉ bị chặn bởi `severity = 'error'`.

## Việc cần làm

- [x] `validateVehicle(vehicle)`: kích thước > 0, `maxPayloadKg > 0`, cửa ≤ thùng, vật cản nằm trong thùng, vật cản không chồng lấn nhau.
- [x] `validatePackages(packages)`: quy tắc dữ liệu LM-010 ở mức nghiệp vụ, kèm `field` để UI nhảy tới ô lỗi.
- [x] `checkDoorClearance(pkg, vehicle)`: có ít nhất một hướng trong `effectiveOrientations` thoả `w + clearance ≤ doorWidth` và `h + clearance ≤ doorHeight` → không thì `DOOR_TOO_SMALL` (error).
- [x] `checkPayload(packages, vehicle)`: tổng `weightKg × quantity`; vượt → `PAYLOAD_EXCEEDED` **warning** kèm `totalKg`, `overKg`; tổng riêng `mustLoad` vượt → `MUST_LOAD_PAYLOAD_EXCEEDED` **error** (D-23).
- [x] `validateRequest(request)` gộp tất cả, trả danh sách đã sắp theo severity.

## Tiêu chí nghiệm thu

- [x] Test đủ ví dụ Spec mục 13: cửa 250 > thùng 240; không có hướng; 5.320 kg > 5.000 kg (warning, `overKg = 320`); kiện không qua cửa 220 × 230.
- [x] Tổng mustLoad vượt tải → error; chỉ tổng chung vượt → warning.

## Kết quả — 15/09/2026 (TDD)

**Seam:** `@/domain/constraints` ([index.ts](../../src/domain/constraints/index.ts)) — test chỉ import từ đây, cùng fixture Spec mục 12 và kiểu của `@/domain/models`. Code nằm trong file mới để không đụng LM-018 đang làm song song: [validate-vehicle.ts](../../src/domain/constraints/validate-vehicle.ts), [vehicle-obstacles.ts](../../src/domain/constraints/vehicle-obstacles.ts) (nội bộ), [validate-packages.ts](../../src/domain/constraints/validate-packages.ts), [door.ts](../../src/domain/constraints/door.ts), [payload.ts](../../src/domain/constraints/payload.ts), [validate-request.ts](../../src/domain/constraints/validate-request.ts); `index.ts` chỉ thêm dòng export.

**API**

- `validateVehicle(vehicle: VehicleConfig): ConstraintIssue[]`
- `validatePackages(packages: readonly CargoPackage[]): ConstraintIssue[]`
- `checkDoorClearance(pkg: CargoPackage, vehicle: VehicleConfig): ConstraintIssue<'DOOR_TOO_SMALL'>[]`
- `checkPayload(packages: readonly CargoPackage[], vehicle: VehicleConfig): ConstraintIssue[]`
- `validateRequest(request: OptimizationRequest): ConstraintIssue[]` — xe → kiện → qua cửa từng kiện → tải trọng, rồi sắp ổn định theo mức `error → blockApproval → warning`; cùng mức giữ nguyên thứ tự đó.

**Mã, mức và tham số** — đúng danh mục và mức mặc định của LM-014, không thêm mã:

| Quy tắc | Mã | Mức | `field` / định danh |
|---|---|---|---|
| Lòng thùng, tải trọng, cửa ≤ 0 (Spec 9.2, §13) | `DIMENSION_NOT_POSITIVE` `{ entity: 'vehicle' }` | error | `innerLengthCm`, `innerWidthCm`, `innerHeightCm`, `maxPayloadKg`, `doorWidthCm`, `doorHeightCm` (thứ tự form) |
| Cửa lớn hơn lòng thùng (§13: 250 > 240) | `DOOR_EXCEEDS_INNER` `{ axis: 'y' \| 'z', doorCm, innerCm }` | error | `doorWidthCm` / `doorHeightCm` |
| Kích thước vật cản ≤ 0 | `DIMENSION_NOT_POSITIVE` `{ entity: 'obstacle', obstacleId }` | error | `obstacles.<i>.lengthCm` … |
| Vật cản ra ngoài lòng thùng | `EXCEEDS_BOUNDARY` `{ axis, side, overCm }` — mỗi vách một issue | error | `obstacles.<i>`, `relatedIds: [mã vật cản của dòng]` |
| Hai vật cản chồng lấn | `OBSTACLE_OVERLAP` `{ obstacleId: vật cản dòng trước }` — mỗi cặp một lần, ở dòng sau | error | `obstacles.<i>`, `relatedIds: [mã vật cản của dòng]` |
| Kích thước kiện ≤ 0 | `DIMENSION_NOT_POSITIVE` `{ entity: 'package', packageId }` | error | `lengthCm`, `widthCm`, `heightCm` |
| Không còn hướng dùng được (§13: PKG-001) | `NO_ALLOWED_ORIENTATION` `{ packageId }` | error | `allowedOrientations` |
| Trùng ID trong request (D-33) | `DUPLICATE_INSTANCE_ID` của `expandPackages`, giữ nguyên | error | không có `field` |
| Không qua cửa (§13: PKG-003, cửa 220 × 230) | `DOOR_TOO_SMALL` `{ packageId, doorWidthCm, doorHeightCm }` | error | không có `field` |
| Tổng mọi kiện vượt tải (§13: 5.320 > 5.000) | `PAYLOAD_EXCEEDED` `{ totalKg, maxPayloadKg, overKg }` | warning | — |
| Riêng tổng kiện `mustLoad` vượt tải | `MUST_LOAD_PAYLOAD_EXCEEDED` (tham số như trên, tổng của kiện `mustLoad`) | error | — |

**Quyết định**

1. **`field`** là đường dẫn trong form của chính thực thể, cú pháp react-hook-form (`innerLengthCm`, `obstacles.0.lengthCm`), khớp bảng Spec §13 của LM-014. Kiện được xác định bằng `params.packageId`, dòng vật cản bằng chỉ số trong `field`. Lỗi cả dòng vật cản (vượt thùng, chồng lấn) chỉ tới dòng `obstacles.<i>` — đúng "lỗi tại dòng vật cản" của LM-041.
2. **`maxPayloadKg ≤ 0` dùng `DIMENSION_NOT_POSITIVE`** với `field: 'maxPayloadKg'`: danh mục LM-014 không có mã riêng cho tải trọng; LM-028 lấy nhãn và đơn vị (kg) theo `field`.
3. **Vật cản ra ngoài thùng dùng `EXCEEDS_BOUNDARY`**, lượng vượt lấy từ `vehicleBoundaryExcess` của geometry, cùng thứ tự vách với `boundaryIssues` của kiện. Tham số của mã này không có chỗ cho mã vật cản, nên mã vật cản của dòng đi trong `relatedIds`.
4. **Hai vật cản chồng lấn dùng `OBSTACLE_OVERLAP`**: `params.obstacleId` luôn là vật cản **bị chồng lấn** (cùng nghĩa với kiện chồng vật cản ở LM-018), `relatedIds[0]` là vật cản của dòng. Câu hiển thị vì vậy có một khuôn: "{kiện hoặc vật cản} chồng lấn vật cản {obstacleId}". So từng cặp (O(n²)) vì mỗi xe chỉ vài vật cản; chạm mặt không phải chồng lấn (`overlaps` có EPSILON).
5. **Không kéo theo lỗi** (như `abort` của schema LM-010): không so cửa với cạnh lòng thùng ≤ 0; không đo vật cản khi lòng thùng có cạnh ≤ 0; vật cản có kích thước ≤ 0 không tham gia so chồng lấn (hộp rỗng vẫn "chồng lấn" theo công thức Spec 7.2); không báo `DOOR_TOO_SMALL` khi cửa có cạnh ≤ 0 hoặc kiện không còn hướng nào; không báo tải khi `maxPayloadKg ≤ 0`. NaN (ô số bị xoá) được coi là không lớn hơn 0.
6. **`NO_ALLOWED_ORIENTATION` theo `effectiveOrientations`**: danh sách trống, hoặc `keepUpright` loại hết hướng nằm, đều là không có hướng — cùng quy tắc service dùng khi thử hướng (LM-024).
7. **Tải trọng:** hai điều kiện độc lập, nên khi kiện `mustLoad` vượt tải có cả lỗi (tổng `mustLoad`) lẫn cảnh báo (tổng chung). Tổng làm tròn `roundKg` một lần rồi mới so (`gt`) và trừ, nên số so sánh đúng bằng số báo ra; `overKg` cũng qua `roundKg`.
8. **Qua cửa:** kiện đi vào theo trục X nên chỉ xét rộng (Y) và cao (Z) theo hướng, cộng `clearanceCm` cho cả hai, so qua EPSILON. `DOOR_TOO_SMALL` không có `field` vì sửa được bằng nhiều ô (hướng, kích thước) hoặc đổi xe.
9. **Quy tắc chưa có mã trong danh mục** (quantity nguyên ≥ 1, `minSupportRatio ∈ [0, 1]`, `stackable` ↔ `maxTopLoadKg`, `keepUpright` ↔ hướng nằm, khối lượng và clearance không âm) để `cargoPackageSchema` / `vehicleConfigSchema` chặn tại biên nhập liệu; validation này giả định dữ liệu đã đúng kiểu.

**Test:** 33 test mới, tất cả ở seam — `payload` 6, `door` 8, `validate-packages` 5, `validate-vehicle` 11, `validate-request` 3 ([payload.test.ts](../../src/domain/constraints/payload.test.ts), [door.test.ts](../../src/domain/constraints/door.test.ts), [validate-packages.test.ts](../../src/domain/constraints/validate-packages.test.ts), [validate-vehicle.test.ts](../../src/domain/constraints/validate-vehicle.test.ts), [validate-request.test.ts](../../src/domain/constraints/validate-request.test.ts)). Mỗi câu Spec §13 của LM-017 có test riêng mang đúng issue trong bảng LM-014.

- 31 vòng đỏ → xanh, đỏ đúng lý do (thiếu hàm, thiếu trục z, thiếu clearance, còn dùng `allowedOrientations`, tham số còn trôi số thực, lỗi kéo theo…).
- 2 test xanh ngay khi viết vì `gt` đã dùng theo luật (tải vừa khít 5.000 kg nhưng tổng trôi `5000.000000000001`; kiện vừa khít cửa 220,1 × 230,1 với clearance 0,3 cm). Đã chứng minh đỏ được bằng cách tạm đổi từng phép so sang `>` thô (4 lần), rồi khôi phục.
- 2 phần phụ trong test đã đỏ ở phần chính cũng được chứng minh như vậy: cửa khít lòng thùng trôi `221.10000000000002` (đổi `gt` sang `>`), vật cản chạm mặt ở `100.4 + 120.7` (đổi `overlaps` sang phép so thô của Spec).
- Mọi số thực trong test đã chạy thử bằng Node trước khi viết: `2660.1 + 2660.2 = 5320.299999999999` (vượt `320.2999999999993` → `roundKg` 320,3), `1365.4 × 3 + 903.8 = 5000.000000000001`, `219.8 + 0.3 = 220.10000000000002`, `229.8 + 0.3 = 230.10000000000002`.

**Kiểm tra:** `pnpm lint` ✅ (0 chẩn đoán, 259 file) · `pnpm test` ✅ 200/200 (167 cũ + 33 mới) · `pnpm build` ✅.

**Để lại cho issue sau**

- **LM-028:** câu vi/en cho các mã trên; `DIMENSION_NOT_POSITIVE` lấy nhãn và đơn vị theo `field` (kể cả `maxPayloadKg` → kg); issue dòng vật cản không có `packageInstanceId` thì chủ ngữ là `relatedIds[0]`; `issueField` đọc `field` dạng react-hook-form.
- **LM-041 / LM-045 / LM-047:** trang xe hiện lỗi `obstacles.<i>` tại dòng; panel kiện gọi `checkDoorClearance` với xe của chuyến; summary nhóm Xe / Kiện / Tải trọng từ `validateRequest`, nút Tối ưu tắt khi còn `error`.
- **LM-024:** service chạy `optimizationRequestSchema` trước `validateRequest` để chặn các quy tắc chưa có mã (quyết định 9) và `settings` (ví dụ `timeLimitSeconds`), rồi trả `FAILED` khi còn `error`.
- **LM-023:** facade engine có thể gọi lại `validateRequest` cho phần đầu vào; chưa đo hiệu năng riêng (vật cản O(n²) với n nhỏ, `expandPackages` O(tổng quantity)).
- **LM-002:** lỗi đầu vào của xe/kiện là validation phía FE, không đi qua `constraintWarnings` của placement.
- Đường đưa hàng qua cửa đầy đủ (không chỉ mặt cắt) thuộc backend nâng cao (Spec 7.4).

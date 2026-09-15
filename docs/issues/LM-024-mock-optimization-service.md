---
id: LM-024
title: OptimizationService interface + MockOptimizationService (shelf packing)
phase: 1
labels: [service, mock]
depends_on: [LM-013, LM-017, LM-021, LM-022, LM-023]
estimate: 2d
prd: [D-11, D-23, D-33]
spec: [11, 12]
---

# LM-024 — MockOptimizationService

## Việc cần làm

- [x] `src/services/optimization/OptimizationService.ts`: interface đúng Spec mục 11.
- [x] `MockOptimizationService.ts` (thuần, chạy được cả trong worker và test):
  - [x] Validate request (LM-017); còn error → `status: 'FAILED'`.
  - [x] Mở rộng quantity (LM-013).
  - [x] Sắp: `mustLoad` trước, `priority` cao, `deliveryStop` lớn (giao muộn) trước, thể tích lớn trước, ID — tất định; `randomSeed` chỉ dùng để phá hoà.
  - [x] Shelf/row packing từ vách trong (x = 0) ra cửa: hàng theo Y, tầng theo Z; thử lần lượt `effectiveOrientations`; bỏ vị trí chồng vật cản; kiểm tra qua cửa, xếp chồng, support qua constraint engine.
  - [x] Hết tải → `OVER_PAYLOAD`; không qua cửa → `DOOR_TOO_SMALL`; không có hướng → `NO_ALLOWED_ORIENTATION`; vi phạm xếp chồng → `STACKING_VIOLATION`; hết chỗ → `NO_SPACE`.
  - [x] Placement qua `roundCm`; `loadingOrder`/`unloadingOrder` từ LM-022; `supportRatio`, `constraintWarnings` từ engine; metrics từ LM-021; `isMockResult: true`, `method: 'MOCK'`, `jobId` tất định theo seed + hash input.
- [x] Không có tên `AIService`, không có chữ "AI optimized".

## Tiêu chí nghiệm thu

- [x] Fixture Spec mục 12 cho kết quả `COMPLETED`, mọi placement qua `evaluateAll()` không có error.
- [x] Property test (500 input ngẫu nhiên tất định): không placement nào vượt biên, chồng lấn nhau hoặc chồng vật cản; `placedCount + unplacedCount = số instance`.
- [x] Cùng request + seed → kết quả giống hệt.
- [x] 1.000 instance chạy xong < 1 s trên máy dev (ghi số).

## Kết quả (15/09/2026)

Seam `@/services/optimization`: `mock-optimization.test.ts` 12 test, `mock-optimization.property.test.ts` 1 test (500 request), `mock-optimization.bench.ts`.

**API**

| Export | Việc |
|---|---|
| `OptimizationService` | `optimize(request, options?)` — đúng chữ ký Spec mục 11, tham số thứ hai tuỳ chọn: `signal`, `onProgress({ placed, total })` cho LM-025 |
| `runMockOptimization(request, { clock?, onProgress? })` | hàm thuần, tất định; chạy được trong worker và test |
| `MockOptimizationService` | bọc hàm thuần trên luồng gọi (test, đường lui khi không có Worker); `signal` đã huỷ → reject |

**Quyết định**

- **`FAILED`** khi request sai schema LM-010 (không có instance, `unplacedPackages` rỗng) hoặc còn `error` của `validateRequest` ngoài lỗi riêng từng kiện
  (xe, vật cản, riêng kiện `mustLoad` vượt tải, trùng mã) — mọi instance `UNKNOWN`. Contract không có trường `warnings` nên kết quả `FAILED` không mang mã
  lỗi: UI phải chạy `validateRequest` trước (LM-048).
- **Lỗi riêng từng kiện** (`DOOR_TOO_SMALL`, `NO_ALLOWED_ORIENTATION`) không làm hỏng job: mọi instance của kiện đó chưa xếp với lý do tương ứng.
  `NO_ALLOWED_ORIENTATION` thực tế bị schema chặn trước (danh sách rỗng, `keepUpright` + hướng nằm) nên chỉ còn đường `FAILED`.
- **`message` = `reasonCode`:** service không sinh câu hiển thị (AGENTS mục 6); UI dịch `reasonCode`.
- **Thứ tự chọn kiện lên xe (D-23):** `mustLoad` → `priority` cao → điểm giao muộn → thể tích lớn → hoà thì băm FNV-1a theo `randomSeed` → mã; tải trọng
  được dành theo thứ tự này trước khi đặt chỗ (phần vượt → `OVER_PAYLOAD`). **Thứ tự đặt chỗ:** khi `enforceLifo`, điểm giao muộn vào sâu trước rồi mới tới
  thứ tự chọn; không bật thì theo đúng thứ tự chọn. *(Sửa khi làm LM-026: bản đầu đặt chỗ theo `priority` trước điểm giao, chuyến seed thật ra 67
  `LIFO_BLOCKED`.)* `jobId` = `MOCK-<seed>-<FNV-1a của request>`.
- **Xếp kệ** (`shelf-packer.ts`): vách theo X từ vách trong ra cửa, cột theo Y, chồng theo Z; kiện chỉ chồng lên kiện đỉnh cột khi đáy nằm gọn trong đáy
  kiện đó — tỷ lệ đỡ luôn 1 và tải dồn đúng một cột, nên mô hình tải của bộ xếp khớp engine. Kiểm `stackable`, `maxTopLoadKg`, `maxStackCount` của cả
  cột; nhảy qua vật cản theo Y; vách đã qua không quay lại. `prioritizeLowCenterOfGravity` → mở cột trên sàn trước khi xếp chồng.
  Không đặt được: `STACKING_VIOLATION` khi có chỗ trên đỉnh cột nhưng phạm luật xếp chồng, ngược lại `NO_SPACE`; vượt tải trọng xe → `OVER_PAYLOAD`
  (kiện nhẹ hơn phía sau vẫn được thử). Không dùng `LIFO_VIOLATION`: LIFO còn lại là cảnh báo trong `constraintWarnings`.
- **Phần còn lại lấy từ domain:** `loadingOrder`/`unloadingOrder` = `recomputeOrders` (LM-022); `supportRatio` và `constraintWarnings` (mã issue của kiện, không lặp)
  từ engine LM-023; metrics từ `computeMetrics` (LM-021). `runtimeMs` đo bằng `clock` tiêm vào.

**Test**

- Mẫu Spec §12: `COMPLETED`, 4 kiện, engine không có lỗi; vị trí tính tay (cột đầu nhảy qua hốc bánh xe sang y = 30, chồng 3 tầng vì `maxStackCount` 3,
  thùng thứ tư mở cột y = 90), metrics (3,6% thể tích, 120 kg, trọng tâm 60 / 75 / 56,25) và thứ tự xếp/dỡ khớp dự đoán. Cùng request + seed → giống hệt;
  seed khác → `jobId` khác.
- Từng `reasonCode` (`DOOR_TOO_SMALL`, `OVER_PAYLOAD`, `NO_SPACE`, `STACKING_VIOLATION`) và hai đường `FAILED`; đỏ dưới 3 đột biến (luôn `NO_SPACE`,
  bỏ kiểm tải trọng, không `FAILED` khi request lỗi).
- Property 500 request ngẫu nhiên tất định hợp lệ schema (vật cản chịu/không chịu tải, `keepUpright`, không xếp chồng, giới hạn tầng/tải): kết quả qua
  `optimizationResultSchema`, đủ số instance, không vượt tải, engine không có `EXCEEDS_BOUNDARY`, `OVERLAP`, `OBSTACLE_OVERLAP`, `NON_BEARING_SUPPORT`,
  `SUPPORT_BELOW_MIN`, `TOP_LOAD_EXCEEDED`, `NOT_STACKABLE`, `STACK_COUNT_EXCEEDED`, `ORIENTATION_*`, `LOADING_ORDER_INFEASIBLE`; mỗi 50 request chạy lại
  giống hệt; > 400 request `COMPLETED` và > 5.000 kiện được xếp. Đỏ khi bỏ kiểm vật cản trên đỉnh cột hoặc bỏ `maxStackCount`.

**Hiệu năng:** 1.000 thùng 40 × 30 × 25 cm (5 điểm giao) — xếp đủ 1.000, lấp 83,3% thể tích; `runMockOptimization` trung bình **49 ms**, p99 54 ms
(Ryzen 7 5800H). Bench fail khi p95 > 1 s (1,5 s khi có `CI`).

**Chuyển tiếp:** LM-025 bọc `runMockOptimization` trong worker (tiến trình qua `onProgress`, huỷ bằng `terminate`); LM-026 dùng service để seed chuyến
đã tối ưu và đã duyệt.

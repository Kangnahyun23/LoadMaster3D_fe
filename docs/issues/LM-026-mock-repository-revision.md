---
id: LM-026
title: Mock repository in-memory — xe, chuyến, kiện, revision, duyệt + seed
phase: 1
labels: [data, mock]
depends_on: [LM-010, LM-024]
estimate: 1.5d
prd: [D-06, D-14, D-31]
---

# LM-026 — Mock repository và revision

## Bối cảnh

D-06: dữ liệu dùng chung đi qua mock repository → `-api.ts` → TanStack Query. D-31: kết quả là revision bất biến. D-14: kho và tài xế đọc bản đã duyệt.

## Việc cần làm

- [x] `src/lib/mock-db/` (dùng chung ≥ 2 feature): store in-memory có hàm CRUD bất đồng bộ + độ trễ giả; không phụ thuộc React.
- [x] Bộ sưu tập: `vehicles` (VehicleConfig), `trips` (điểm giao, `vehicleId`, danh sách `CargoPackage`, `inputVersion` tăng mỗi khi xe/kiện đổi), `revisions` (`{ jobId, tripId, request, result, inputVersion, createdAt, draftPatches?, approvedAt?, manuallyEdited, ordersRecomputed }`).
- [x] `isStale(revision, trip) = revision.inputVersion !== trip.inputVersion` (cũng tăng khi xe gắn với chuyến bị sửa).
- [x] `approveRevision(jobId, patches)` tạo revision approved **mới** (áp draft, tính lại thứ tự LM-022, giữ `isMockResult`), không sửa revision nguồn. *(nhận mã revision thay `jobId` — xem Kết quả)*
- [x] Seed: xe mẫu Spec "Truck 6m" + 2–3 xe khác; một chuyến mẫu có ~130 kiện đã tối ưu và đã duyệt (thay `LOAD_PLAN` mm) để `/kho`, `/tai-xe` có dữ liệu ngay. *(màn `/kho`, `/tai-xe` chuyển sang đọc revision ở LM-060/LM-061)*
- [x] Dữ liệu tên người/địa điểm tiếng Việt thật, không Lorem.

## Tiêu chí nghiệm thu

- [x] Test: sửa kiện sau khi tối ưu → revision cũ `isStale`; duyệt tạo revision mới, revision nguồn không đổi.
- [x] Seed được sinh tất định (chạy lại cho cùng ID).

## Kết quả (15/09/2026)

Phần 1 của issue: kho, revision, Duyệt và seed xe/chuyến. Seam `@/lib/mock-db` ([index.ts](../../src/lib/mock-db/index.ts)), TDD, 28 test
trong 5 file `src/lib/mock-db/*.test.ts`, chỉ import từ seam và từ các seam domain. Dữ liệu test dùng chung: [src/test/mock-db-samples.ts](../../src/test/mock-db-samples.ts)
(chuyến hai thùng Carton A trên Truck 6m và kết quả tối ưu dựng tay, metrics tính tay).

**API**

| Hàm | Việc |
|---|---|
| `createMockDb({ latencyMs? })` | kho mới đã nạp seed, dữ liệu riêng từng kho; mọi hàm chờ `latencyMs` (mặc định 0) |
| `getMockDb()` | kho dùng chung cho các `-api.ts`, tạo ở lần gọi đầu, độ trễ 300 ms |
| `listVehicles` · `getVehicle` · `createVehicle` · `updateVehicle` · `deleteVehicle` | xe (`VehicleConfig`); tạo thì kho cấp mã, sửa thì thay toàn bộ cấu hình |
| `listTrips` · `getTrip` · `createTrip` · `updateTrip(id, changes)` | chuyến `{ id, name, vehicleId, stops, packages, inputVersion }`; `changes` chỉ gồm trường gửi lên |
| `listRevisions(tripId)` · `getRevision` · `addRevision({ tripId, request, result })` | revision theo thứ tự tạo; không có hàm sửa hay xoá revision |
| `approveRevision(revisionId, patches)` | tạo revision approved mới, revision nguồn giữ nguyên |
| `isStale(revision, trip)` | `revision.inputVersion !== trip.inputVersion` |
| `MockDbError` | `code` + `params` theo mã; `message` chỉ cho log |

**Quyết định**

- **Mã revision riêng.** `approveRevision` nhận `Revision.id` (`REV-NNN`) chứ không nhận `jobId`: revision approved dùng chung `jobId` với
  revision nguồn, và LM-024 sinh `jobId` tất định theo seed + input nên chạy lại cùng request cũng trùng `jobId`.
- **Mã sinh tất định.** `VEHICLE-NNN`, `TRIP-NNN`, `REV-NNN` = số lớn nhất trong các mã cùng dạng + 1. Mã seed `TRIP-2026-0914` khác dạng nên
  không bị tính và không bao giờ trùng mã sinh ra.
- **Mã lỗi** (UI dịch, kho không trả câu): `NOT_FOUND { collection, id }`, `VEHICLE_IN_USE { vehicleId, tripIds }`,
  `REVISION_STALE { revisionId }`, `REVISION_NOT_COMPLETED { revisionId }`, `PATCH_UNKNOWN_INSTANCE { packageInstanceId }`.
- **Sao chép cả khi đọc lẫn khi ghi** (`structuredClone`): sửa object nhận về, hoặc object đã gửi vào, không đổi dữ liệu trong kho.
- **`inputVersion`** bắt đầu từ 1 và tăng 1 khi:
  - `updateTrip` đổi `vehicleId`;
  - `updateTrip` đổi **nội dung** `packages`. So nội dung không phụ thuộc thứ tự khoá, nên lưu lại form không đổi gì thì revision vẫn còn hiệu lực;
  - `updateVehicle` đổi nội dung xe: tăng ở mọi chuyến dùng xe đó.

  Đổi tên chuyến hay danh sách điểm giao không tăng. `id` và `inputVersion` trong `changes`, ví dụ khi trải một bản sao cũ của chuyến, bị bỏ qua.
- **Toàn vẹn tham chiếu.** Chuyến phải trỏ tới xe có thật (`NOT_FOUND` của `vehicles`). Không xoá được xe còn chuyến dùng. Chưa có `deleteTrip`
  vì chưa issue nào cần.
- **Duyệt.** Kiểm theo thứ tự: revision tồn tại → không lỗi thời → `COMPLETED`. Sau đó dựng kết quả mới:
  1. áp từng patch bằng `applyPose`, kích thước lấy từ instance của `expandPackages(request.packages)`;
  2. dựng `createPlacementLayout` + `createStackGraph` trên placement **đã áp draft**; profile xếp chồng và điểm giao lấy từ instance;
  3. `recomputeOrders` rồi `computeMetrics`.

  Placement giữ thứ tự của kết quả nguồn. Giữ nguyên `runtimeMs`, `isMockResult`, `unplacedPackages`; `unplacedCount` đếm lại từ
  `unplacedPackages`. Dùng xe trong `request` (ảnh chụp lúc tối ưu); vì đã chặn lỗi thời, xe đó trùng xe hiện tại.
  Revision approved có `createdAt = approvedAt`, `sourceRevisionId`, `draftPatches` là các patch của lần Duyệt đó, `ordersRecomputed: true`.
  `manuallyEdited = nguồn.manuallyEdited || patches.length > 0`, để duyệt lại một bản đã chỉnh tay mà không có patch mới vẫn là đã chỉnh tay.
  Duyệt lại chính kết quả approved cho cùng kết quả (có test). Bị từ chối thì không lưu gì.
- **Patch cho kiện không có placement** (mã lạ hoặc kiện nằm trong `unplacedPackages`) → `PATCH_UNKNOWN_INSTANCE`. Editor không tạo placement
  cho kiện chưa xếp (AGENTS mục 7).
- **Seed** ([seed-vehicles.ts](../../src/lib/mock-db/seed-vehicles.ts), [seed-trip.ts](../../src/lib/mock-db/seed-trip.ts)). Mỗi kho gọi hàm dựng
  mới nên kho này không đụng dữ liệu kho khác.
  - Xe: `VEHICLE-001` là Truck 6m của Spec, giữ nguyên; `VEHICLE-002` Hyundai HD210 · 60C-446.32; `VEHICLE-003` Isuzu NQR 550 · 51C-284.19,
    có hai hốc bánh; `VEHICLE-004` Hino FC9J đông lạnh · 51C-190.07, có dàn lạnh và `clearanceCm` 2.
  - Chuyến `TRIP-2026-0914` trên HD210 với 4 điểm giao thật (tên, địa chỉ như `trip-detail.mock.ts`): 6 dòng kiện, 132 instance, 5.844 kg,
    16,55 m³. `maxTopLoadKg` mỗi dòng đủ đỡ cột `maxStackCount` kiện cùng loại. Mọi xe và kiện qua `vehicleConfigSchema`/`cargoPackageSchema`.

**Test và vòng đỏ → xanh**

- Đỏ vì chưa có hàm hoặc hành vi, rồi xanh: seed xe; đọc theo mã + `NOT_FOUND`; bản sao khi đọc (sửa `maxPayloadKg` lọt vào kho); độ trễ (promise
  xong trước 300 ms); ghi xe; seed chuyến; `VEHICLE_IN_USE`; ghi chuyến; `addRevision` + `isStale`; sửa xe hoặc đổi xe làm lỗi thời;
  khung revision approved; áp draft + thứ tự; metrics; ba mã từ chối; `getMockDb`; revision của chuyến không tồn tại; cờ chỉnh tay khi duyệt lại.
- Bản cài tối thiểu "tăng `inputVersion` mỗi khi có `packages`" làm đỏ test cập nhật chuyến (trải bản sao không đổi vẫn tăng version). Từ đó
  đổi sang so nội dung.
- Test xanh ngay, được chứng minh bằng đột biến rồi hoàn lại:

  | Đột biến | Test đỏ |
  |---|---|
  | lưu object gốc, không sao chép | `heightCm` sửa sau khi tạo lọt vào kho |
  | `Math.random()` trong tên chuyến seed | seed tất định |
  | bảng xe dùng chung giữa các kho | xe bị xoá ở kho kia |
  | trộn `{ ...current, ...changes }` | `id`/`inputVersion` bị ghi đè |
  | `JSON.stringify` thường | thứ tự khoá khác làm lỗi thời |
  | luôn tăng version khi lưu xe | lưu xe y nguyên cũng làm lỗi thời |
  | tăng mọi chuyến | chuyến seed dùng xe khác lên version 2 |
  | dựng đồ thị đỡ từ placement nguồn | thứ tự không đổi chỗ |
  | ép `isMockResult: true` | kết quả không phải mock thành mock |
  | `manuallyEdited` luôn `true` | duyệt không draft thành đã chỉnh tay |
  | ghi đè placement nguồn tại chỗ | revision nguồn đổi |
- Kỳ vọng tính tay, số thực chạy qua Node trước. Nâng `PKG-001-01` (điểm 3) lên `PKG-002-01` (điểm 1) và xoay WLH, x = 240,04:
  - placement: x làm tròn 240, kích thước 60 × 120 × 45;
  - thứ tự xếp đổi thành `PKG-002-01` trước, dỡ `PKG-001-01` trước. Điểm 3 vẫn xếp hạng trước, nên chỉ quan hệ đỡ quyết định thứ tự;
  - trọng tâm (240; 30; 22,5) → (285; 45; 45).

**Hoãn lại**

- ~~**Revision seed "đã tối ưu và đã duyệt"**~~ và ~~**tính lại `supportRatio` / `constraintWarnings` khi Duyệt**~~ — đã làm khi gộp, xem dưới.
- **Chưa làm:** hook TanStack Query, `-api.ts` và UI; chưa thay `src/lib/load-plan.mock.ts` (LM-060 → LM-062).

**Chuyển tiếp**

- **LM-040, LM-043:** `-api.ts` gọi `getMockDb()`. Mutation xe/kiện phải invalidate cả danh sách revision, vì `inputVersion` đổi.
- **LM-046:** đổi thứ tự điểm giao đổi `deliveryStop` nên phải tăng `inputVersion`; hiện `stops` không tăng.
- **LM-048:** `addRevision` đóng dấu `inputVersion` lúc lưu. Nếu cho sửa xe/kiện trong lúc chạy tối ưu, phải truyền version lúc dựng request.
  Route `?revision=` nên dùng `Revision.id`, vì `jobId` có thể trùng (D-38).
- **LM-050:** dịch 5 mã `MockDbError`; `approvalBlockers` dùng `isStale`.

## Gộp vào `feat/spec-mvp` và phần hoãn (15/09/2026, người điều phối)

Cherry-pick `2f42ed7` → `2050a7b`, không xung đột. Sau đó làm nốt hai phần hoãn theo TDD:

- **Duyệt tính lại `supportRatio` / `constraintWarnings` bằng engine LM-023:** helper domain `annotatePlacements` (mock service LM-024 dùng chung). Test nhấc
  thùng đổi kỳ vọng: đáy 60 × 120 cm chỉ tiếp xúc 60 × 60 cm → `supportRatio` 0,5, `['SUPPORT_BELOW_MIN']` (đỏ trước khi sửa).
- **Seed revision đã tối ưu + đã duyệt** (`seed-revisions.ts`): `runMockOptimization` cho `TRIP-2026-0914` với `randomSeed` 20260914 và đồng hồ cố định
  (`runtimeMs` 0) → `REV-001`; `approvedResult` không patch → `REV-002` (`approvedAt` 2026-09-14T02:00Z). Tính một lần, nhân bản cho mỗi kho. Mã revision
  tạo mới bắt đầu từ `REV-003` (3 test đổi kỳ vọng mã).
- **Lỗi thật tìm được:** bản seed "đã duyệt" đầu tiên có **67 `LIFO_BLOCKED`** nên chính `approvalBlockers` không cho duyệt — mock (LM-024) đặt chỗ theo
  `priority` trước điểm giao. Sửa ở LM-024: `priority` chỉ chọn kiện lên xe (dành tải trọng trước), khi `enforceLifo` đặt chỗ theo điểm giao muộn trước.
  Seed giờ: 132/132 kiện, không issue, `canApprove` = true (40,8% thể tích, 61,5% tải). Test seed mới khoá điều này (đỏ khi bỏ thứ tự LIFO).


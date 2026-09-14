---
id: LM-012
title: Orientation 6 mã, keepUpright và kích thước theo hướng
phase: 1
labels: [domain, geometry]
depends_on: [LM-010]
estimate: 0.5d
prd: [D-09, D-25]
spec: [6, 7.5]
---

# LM-012 — Orientation 6 mã

## Việc cần làm

- [x] `src/domain/geometry/orientation.ts`: `orientDimensions(pkg, code) → { placedLengthCm, placedWidthCm, placedHeightCm }` cho `LWH, LHW, WLH, WHL, HLW, HWL` (chữ thứ nhất → trục X, thứ hai → Y, thứ ba → Z).
- [x] `UPRIGHT_ORIENTATIONS = ['LWH', 'WLH']`; `isUpright(code)`. Thay hằng nội bộ cùng tên trong `src/domain/models/package.ts` (LM-010) bằng bản dùng chung này.
- [x] `effectiveOrientations(pkg)` = `allowedOrientations` giao với upright khi `keepUpright`.
- [x] `nextOrientation(pkg, current)` cho editor: vòng qua `effectiveOrientations`, bỏ qua hướng trùng kích thước (kiện vuông).
- [x] `matchesOrientation(placement, pkg)`: kích thước placement khớp hướng đã chọn (có EPSILON).

## Tiêu chí nghiệm thu

- [x] Test đủ 6 hướng trên kiện 120 × 60 × 45.
- [x] `nextOrientation` với `["LWH","WLH"]` luân phiên đúng; kiện 60 × 60 × 45 không tạo bước xoay vô nghĩa.
- [ ] Placement có kích thước không khớp orientation bị báo mã `ORIENTATION_MISMATCH`. Phần phát hiện đã xong: `matchesOrientation` trả `false`, có test. Việc phát mã → **LM-014** (mô hình lỗi chưa có) và **LM-023** (engine gọi cho từng placement).

## Kết quả — 15/09/2026 (TDD)

**Seam.** Test chỉ import từ `@/domain/geometry` ([index.ts](../../src/domain/geometry/index.ts)), cộng dữ liệu mẫu `SPEC_CARTON_A` và `SPEC_CARTON_A_PLACEMENT` của [spec-samples.ts](../../src/domain/fixtures/spec-samples.ts). Code ở [orientation.ts](../../src/domain/geometry/orientation.ts). API công khai:

- `ORIENTATION_CODES` (6 mã theo thứ tự Spec) và kiểu `OrientationCode`.
- `orientDimensions(dimensions, code)`: chữ thứ nhất → X, thứ hai → Y, thứ ba → Z.
- `UPRIGHT_ORIENTATIONS = ['LWH', 'WLH']` và `isUpright(code)`.
- `effectiveOrientations(pkg)`: `allowedOrientations` bỏ hướng nằm khi `keepUpright`, giữ thứ tự của kiện.
- `nextOrientation(pkg, current)` và `matchesOrientation(placement, pkg)`.
- Kiểu tham số theo cấu trúc: `PackageDimensions`, `PlacedDimensions`, `OrientationRules`, `OrientedPlacement`.

**Sáu hướng của Carton A 120 × 60 × 45 cm.** Viết tay từ định nghĩa, không tính lại trong test:

| Mã | X (dài) | Y (rộng) | Z (cao) |
|---|---|---|---|
| LWH | 120 | 60 | 45 |
| LHW | 120 | 45 | 60 |
| WLH | 60 | 120 | 45 |
| WHL | 60 | 45 | 120 |
| HLW | 45 | 120 | 60 |
| HWL | 45 | 60 | 120 |

Ba cạnh đều khác nhau, nên nhầm hai trục bất kỳ cũng làm test đỏ.

**Quyết định đã chốt khi làm**

- Geometry không import `@/domain/models`, kể cả `import type`, vì models đã import geometry. Tham số dùng kiểu cấu trúc; `CargoPackage` và `PackagePlacement` truyền thẳng vào được.
- Danh sách 6 mã chuyển sang geometry (`ORIENTATION_CODES`). `orientationCodeSchema` dựng bằng `oneOf(ORIENTATION_CODES)`, nên danh sách chỉ nằm ở một nơi. Kiểu `OrientationCode` mà models xuất ra không đổi. Hằng này không có test riêng; `spec-contract.test.ts` chặn hồi quy lúc build.
- Schema kiện dùng `isUpright` thay hằng nội bộ. Đã thử làm hỏng `isUpright` (coi `HLW` là hướng đứng): test LM-010 "keepUpright với HLW" đỏ cùng 2 test mới. Sau đó khôi phục.
- `nextOrientation` chỉ so kích thước với hướng hiện tại, vì hàm thuần không nhớ lịch sử. Mỗi lần xoay luôn đổi kích thước. Tuy vậy, kiện 60 × 60 × 45 cho phép cả 6 hướng vẫn có thể quay lại một hình dạng đã gặp (LWH → LHW → WLH).
- Hướng hiện tại nằm ngoài `effectiveOrientations` là dữ liệu sai luật, ví dụ Carton A đang ở `HLW`. Khi đó xoay đưa kiện về hướng cho phép đầu tiên có kích thước khác, không bao giờ thử hướng bị cấm.
- Không còn hướng nào khác kích thước (kể cả danh sách rỗng) thì hàm trả lại `current`. Editor có thể so `next === current` để biết không xoay được.
- Kích thước so qua `eq` (EPSILON), cả khi bỏ qua bước xoay trùng kích thước lẫn khi so placement.

**Test.** 12 test mới trong [orientation.test.ts](../../src/domain/geometry/orientation.test.ts): `orientDimensions` 1, tập hướng đứng 1, `effectiveOrientations` 2, `nextOrientation` 5, `matchesOrientation` 3. Có 10 vòng red → green.

Ba chỗ được kiểm thêm bằng cách cố ý làm hỏng code rồi khôi phục, vì lần đỏ đầu chưa chứng minh đủ:

- đổi chỗ kết quả `HLW`/`HWL` (lần đỏ đầu chỉ do thiếu hàm);
- tập hướng đứng thành `LWH, HLW` (như trên);
- lọc theo thứ tự chuẩn thay vì thứ tự của kiện (lần đỏ đầu chưa đụng tới thứ tự).

2 test xanh ngay đã được chứng minh đỏ được:

- xoay ra khỏi hướng không cho phép: thêm nhánh "không có trong danh sách thì giữ nguyên" → đỏ;
- kích thước trôi dấu phẩy động: so `===` thay `eq` → đỏ.

**Kiểm chứng số bằng máy trước khi viết test**

- `221.1 − 100.4 = 120.69999999999999`: kiện dài 120,7 cm trải từ x = 100,4 tới 221,1. Giá trị này khác `120.7` khi so `===` nhưng nằm trong EPSILON.
- `|120.6 − 120.7|` lớn hơn EPSILON: placement thiếu 0,1 cm là không khớp.

**Chuyển sang issue khác**

- Phát mã `ORIENTATION_MISMATCH` → **LM-014** (mã, `ConstraintIssue`) và **LM-023** (`evaluateAll` gọi `matchesOrientation` với kiện gốc tìm qua `packageIdByInstanceId` của **LM-013**).
- Placement dùng hướng ngoài `effectiveOrientations` (ví dụ nằm nghiêng khi `keepUpright`) chưa có mã nào trong danh sách LM-014 → chốt ở **LM-014**/**LM-023**.
- Thay `Orientation = 0 | 1 | 2` và `orientDimensions`/`canonicalDimensions` (mm) trong viewer3d; nút xoay và phím R gọi `nextOrientation` → **LM-032**.
- Checkbox 6 hướng lấy từ `ORIENTATION_CODES`, khoá hướng nằm bằng `isUpright` → **LM-045**.
- Kiểm tra qua cửa theo `effectiveOrientations` + `orientDimensions` → **LM-017**. Mock xếp thử lần lượt `effectiveOrientations` → **LM-024**.
- AGENTS.md mục 3 chưa ghi "hướng đặt" trong mô tả `geometry/`. Để người điều phối sửa lúc gộp, tránh sửa file chung khi các issue chạy song song.

**Kiểm tra**

- `pnpm test`: 128/128 ✅ (116 cũ + 12 mới). Chạy với `--maxWorkers=2` vì máy thiếu RAM.
- `pnpm lint`: ✅, 229 file, 0 chẩn đoán.
- `pnpm build`: ✅. Cảnh báo chunk > 500 kB đã có từ trước.

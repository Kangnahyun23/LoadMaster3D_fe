---
id: LM-014
title: Mô hình lỗi — mã lỗi + tham số, không trả câu chữ
phase: 1
labels: [domain, i18n-ready]
depends_on: [LM-010]
estimate: 0.5d
prd: [D-28]
spec: [13]
---

# LM-014 — Mô hình lỗi có cấu trúc

## Bối cảnh

Editor hiện trả chuỗi tiếng Việt cứng ("Vượt cửa sau", "Chồng lấn …"). Giao diện phải chuyển vi/en và format số theo locale, nên domain chỉ được trả dữ liệu.

## Việc cần làm

- [x] `src/domain/constraints/issues.ts`: `ConstraintIssue = { code, severity: 'error' | 'warning' | 'blockApproval', packageInstanceId?, relatedIds?, field?, params }`.
- [x] Danh mục mã có kiểu (union), tối thiểu phủ Spec mục 13: `DIMENSION_NOT_POSITIVE`, `DOOR_EXCEEDS_INNER`, `NO_ALLOWED_ORIENTATION`, `PAYLOAD_EXCEEDED`, `MUST_LOAD_PAYLOAD_EXCEEDED`, `DOOR_TOO_SMALL`, `EXCEEDS_BOUNDARY`, `OVERLAP`, `OBSTACLE_OVERLAP`, `NON_BEARING_SUPPORT`, `SUPPORT_BELOW_MIN`, `TOP_LOAD_EXCEEDED`, `NOT_STACKABLE`, `STACK_COUNT_EXCEEDED`, `LIFO_BLOCKED`, `LIFO_PARTIAL`, `COG_LATERAL`, `COG_HIGH`, `MUST_LOAD_UNPLACED`, `LOADING_ORDER_INFEASIBLE`, `DUPLICATE_INSTANCE_ID`, `ORIENTATION_MISMATCH`.
- [x] Tham số là số thô theo đơn vị domain (cm, kg, tỷ lệ 0..1) — UI format.
- [x] Hàm `toContractWarnings(issues) → string[]` (mảng mã) và ngược lại cho `constraintWarnings`.
- [x] Bọc `vehicleBoundaryExcess` (LM-015, đã có) thành `EXCEEDS_BOUNDARY` với `params.axis`, `params.side` (`beforeOrigin` / `beyondInterior`), `params.overCm`.

## Tiêu chí nghiệm thu

- [x] Mỗi câu trong Spec mục 13 ánh xạ được sang một mã + params (bảng trong comment hoặc test).
- [x] Không có chuỗi hiển thị nào trong `src/domain`.

## Kết quả — 15/09/2026 (TDD)

Agent làm phần đầu (boundary, contract warnings, bảng Spec §13, 8 mã) rồi dừng giữa vòng red của test kiểu vì hết giới hạn phiên. Người điều phối chép phần đó sang `feat/spec-mvp` và làm tiếp.

**Seam:** `@/domain/constraints` ([index.ts](../../src/domain/constraints/index.ts)).

**API**

- `CONSTRAINT_CODES` (22 mã) và kiểu `ConstraintCode`, `ConstraintSeverity`, `ConstraintParams`, `ConstraintIssue<Code>` — union phân biệt theo `code`, nên `params` có kiểu đúng theo từng mã.
- `boundaryIssues(placement, vehicle)`: một `EXCEEDS_BOUNDARY` cho mỗi mặt bị vượt, xếp theo trục x, y, z và phía gốc trước.
- `toContractWarnings(issues)`: mảng mã không lặp, giữ thứ tự xuất hiện; `fromContractWarnings(strings)`: `{ kind: 'known', code }` hoặc `{ kind: 'unknown', raw }` cho chuỗi ngoài danh mục (không ném lỗi).

**Tham số và mức mặc định**

| Mã | Tham số | Mức |
|---|---|---|
| `DIMENSION_NOT_POSITIVE` | `entity` + id | error |
| `DOOR_EXCEEDS_INNER` | `axis`, `doorCm`, `innerCm` | error |
| `NO_ALLOWED_ORIENTATION` | `packageId` | error |
| `PAYLOAD_EXCEEDED` | `totalKg`, `maxPayloadKg`, `overKg` | warning (D-23) |
| `MUST_LOAD_PAYLOAD_EXCEEDED` | như trên | error (D-23) |
| `DOOR_TOO_SMALL` | `packageId`, `doorWidthCm`, `doorHeightCm` | error |
| `EXCEEDS_BOUNDARY` | `axis`, `side`, `overCm` | error |
| `OVERLAP` | — (`relatedIds`) | error |
| `OBSTACLE_OVERLAP` / `NON_BEARING_SUPPORT` | `obstacleId` | error |
| `SUPPORT_BELOW_MIN` | `ratio`, `required` | warning |
| `TOP_LOAD_EXCEEDED` | `loadKg`, `maxKg` | error |
| `NOT_STACKABLE` | — (`relatedIds`) | error |
| `STACK_COUNT_EXCEEDED` | `layers`, `maxStackCount` | error |
| `LIFO_BLOCKED` | `coverage` | error khi `enforceLifo`, warning khi không (D-26) |
| `LIFO_PARTIAL` | `coverage` | warning |
| `COG_LATERAL` | `offsetCm`, `limitCm` | warning (D-36) |
| `COG_HIGH` | `heightCm`, `limitCm` | warning (D-36) |
| `MUST_LOAD_UNPLACED` | `packageId` | blockApproval (D-24) |
| `LOADING_ORDER_INFEASIBLE` | — (`relatedIds`) | warning (D-32) |
| `DUPLICATE_INSTANCE_ID` | `occurrences` | error |
| `ORIENTATION_MISMATCH` | `orientation` | error |

Mức ở bảng là quy ước để các issue LM-017 → LM-023 dùng thống nhất; kiểu vẫn cho phép mọi mức vì LIFO đổi mức theo thiết lập.

**Mã hoá `constraintWarnings` (contract còn mở, D-02):** chỉ ghi mã trần, không lặp — tham số (ví dụ 0,62 / 0,80) và `relatedIds` **không** qua được contract. Chuỗi lạ từ backend (câu tiếng Anh, mã FE chưa biết, cả `constructor`) trả về dạng `unknown` đúng vị trí. Cần chốt với backend ở **LM-002**.

**Spec §13:** 8 câu có bảng ánh xạ trong [spec-messages.test.ts](../../src/domain/constraints/spec-messages.test.ts), tham số lấy nguyên từ câu. 3 câu đầu (kích thước ≤ 0, cửa lớn hơn thùng, không có hướng) còn có "bản sao" ở mã schema LM-010 (`vehicle.dimension.positive`, `vehicle.door.exceedsInner`, `package.allowedOrientations.empty`) — schema báo từng ô nhập, `ConstraintIssue` báo cùng quy tắc kèm số liệu cho validation summary.

**LM-013 thống nhất kiểu:** `DuplicateInstanceIdIssue` giờ là `ConstraintIssue<'DUPLICATE_INSTANCE_ID'>`; test kiểu khẳng định `ExpandedPackages['issues'][number]` đúng bằng kiểu dùng chung.

**Test:** 9 test chạy (boundary 3, contract warnings 4, Spec §13 2) + test kiểu trong [issues.test-d.ts](../../src/domain/constraints/issues.test-d.ts) chạy qua `tsc -b`: danh mục đúng 22 mã (đỏ khi mới có 8 → xanh sau khi bổ sung) và kiểu lỗi LM-013 (đỏ khi còn kiểu tạm → xanh sau khi thay).

**Kiểm tra:** `tsc -b` ✅ · Vitest domain 99/99 ✅ · tìm chuỗi tiếng Việt trong `src/domain` (ngoài test): chỉ còn chú thích và tên benchmark.

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

- [ ] `src/domain/constraints/issues.ts`: `ConstraintIssue = { code, severity: 'error' | 'warning' | 'blockApproval', packageInstanceId?, relatedIds?, field?, params }`.
- [ ] Danh mục mã có kiểu (union), tối thiểu phủ Spec mục 13: `DIMENSION_NOT_POSITIVE`, `DOOR_EXCEEDS_INNER`, `NO_ALLOWED_ORIENTATION`, `PAYLOAD_EXCEEDED`, `MUST_LOAD_PAYLOAD_EXCEEDED`, `DOOR_TOO_SMALL`, `EXCEEDS_BOUNDARY`, `OVERLAP`, `OBSTACLE_OVERLAP`, `NON_BEARING_SUPPORT`, `SUPPORT_BELOW_MIN`, `TOP_LOAD_EXCEEDED`, `NOT_STACKABLE`, `STACK_COUNT_EXCEEDED`, `LIFO_BLOCKED`, `LIFO_PARTIAL`, `COG_LATERAL`, `COG_HIGH`, `MUST_LOAD_UNPLACED`, `LOADING_ORDER_INFEASIBLE`, `DUPLICATE_INSTANCE_ID`, `ORIENTATION_MISMATCH`.
- [ ] Tham số là số thô theo đơn vị domain (cm, kg, tỷ lệ 0..1) — UI format.
- [ ] Hàm `toContractWarnings(issues) → string[]` (mảng mã) và ngược lại cho `constraintWarnings`.

## Tiêu chí nghiệm thu

- [ ] Mỗi câu trong Spec mục 13 ánh xạ được sang một mã + params (bảng trong comment hoặc test).
- [ ] Không có chuỗi hiển thị nào trong `src/domain`.

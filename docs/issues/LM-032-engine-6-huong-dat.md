---
id: LM-032
title: Engine và editor hỗ trợ 6 hướng đặt, xoay theo allowedOrientations
phase: 2
labels: [viewer3d, editor, geometry]
depends_on: [LM-012, LM-031]
estimate: 1d
prd: [D-09]
spec: [7.5]
---

# LM-032 — 6 hướng đặt trong engine

## Việc cần làm

- [x] Thay `Orientation = 0 | 1 | 2`, `ORIENTATION_LABELS`, `orientDimensions`, `canonicalDimensions` trong `viewer-scene-model.ts` bằng helper domain LM-012 (kích thước gốc lấy từ `CargoPackage`, không đảo ngược từ kích thước đã xoay).
- [x] `editor/useManualEditor.ts`: nút xoay và phím R gọi `nextOrientation`; hướng bị cấm không bao giờ được thử.
- [x] `EditorPanel` / `SelectedPackagePanel`: hiển thị mã hướng hiện tại và danh sách hướng cho phép.
- [x] Gỡ test 9 cặp nguồn/đích 0/1/2, thay bằng test 6 hướng.

## Tiêu chí nghiệm thu

- [x] Kiện `keepUpright` không thể xoay nằm nghiêng bằng bất kỳ đường nào (nút, phím R, undo/redo).
- [x] Xoay giữ góc vị trí; xoay gây lỗi bị chặn và hiện lý do.

## Kết quả (15/09/2026)

- Làm cùng LM-031: `Orientation 0|1|2`, `ORIENTATION_LABELS` (viewer3d), `canonicalDimensions`, `viewer-scene-model.ts` đã gỡ; xoay áp mã đích lên `baseDimensionsById` từ `CargoPackage` (`orientedSize` → `orientDimensions` của domain).
- Nút xoay trong `EditorControls` chỉ gồm `effectiveOrientations` của kiện; phím R gọi `nextOrientation`. Hướng không cho phép không có đường thử nào; nếu có (dữ liệu lỗi) engine trả `ORIENTATION_NOT_ALLOWED` và chặn (LM-035, test `tests/viewer-editor-engine.test.ts`). Undo/redo chỉ khôi phục patch đã từng commit hợp lệ.
- `SelectedPackagePanel`: mã hướng hiện tại + "Hướng được phép: …" và "Giữ thẳng đứng" qua từ điển (`viewer.orientation.*`).
- Test 6 × 6 cặp nguồn/đích thay test 9 cặp 0/1/2 ([viewer-foundation.test.ts](../../tests/viewer-foundation.test.ts)). E2E editor bấm nút `WLH` (bị chặn) / `HWL`.

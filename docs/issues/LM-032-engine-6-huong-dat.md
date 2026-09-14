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

- [ ] Thay `Orientation = 0 | 1 | 2`, `ORIENTATION_LABELS`, `orientDimensions`, `canonicalDimensions` trong `viewer-scene-model.ts` bằng helper domain LM-012 (kích thước gốc lấy từ `CargoPackage`, không đảo ngược từ kích thước đã xoay).
- [ ] `editor/useManualEditor.ts`: nút xoay và phím R gọi `nextOrientation`; hướng bị cấm không bao giờ được thử.
- [ ] `EditorPanel` / `SelectedPackagePanel`: hiển thị mã hướng hiện tại và danh sách hướng cho phép.
- [ ] Gỡ test 9 cặp nguồn/đích 0/1/2, thay bằng test 6 hướng.

## Tiêu chí nghiệm thu

- [ ] Kiện `keepUpright` không thể xoay nằm nghiêng bằng bất kỳ đường nào (nút, phím R, undo/redo).
- [ ] Xoay giữ góc vị trí; xoay gây lỗi bị chặn và hiện lý do.

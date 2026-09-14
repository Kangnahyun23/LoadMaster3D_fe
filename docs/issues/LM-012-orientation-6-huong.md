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

- [ ] `src/domain/geometry/orientation.ts`: `orientDimensions(pkg, code) → { placedLengthCm, placedWidthCm, placedHeightCm }` cho `LWH, LHW, WLH, WHL, HLW, HWL` (chữ thứ nhất → trục X, thứ hai → Y, thứ ba → Z).
- [ ] `UPRIGHT_ORIENTATIONS = ['LWH', 'WLH']`; `isUpright(code)`.
- [ ] `effectiveOrientations(pkg)` = `allowedOrientations` giao với upright khi `keepUpright`.
- [ ] `nextOrientation(pkg, current)` cho editor: vòng qua `effectiveOrientations`, bỏ qua hướng trùng kích thước (kiện vuông).
- [ ] `matchesOrientation(placement, pkg)`: kích thước placement khớp hướng đã chọn (có EPSILON).

## Tiêu chí nghiệm thu

- [ ] Test đủ 6 hướng trên kiện 120 × 60 × 45.
- [ ] `nextOrientation` với `["LWH","WLH"]` luân phiên đúng; kiện 60 × 60 × 45 không tạo bước xoay vô nghĩa.
- [ ] Placement có kích thước không khớp orientation bị báo mã `ORIENTATION_MISMATCH`.

---
id: LM-060
title: Màn kho đọc revision đã duyệt, làm theo loadingOrder
phase: 4
labels: [warehouse, data]
depends_on: [LM-030, LM-050]
estimate: 1d
prd: [D-14]
---

# LM-060 — Kho đọc kết quả đã duyệt

## Bối cảnh

`features/warehouse/LoadingStepPage.tsx` đọc `LOAD_PLAN` (mm) hoặc benchmark plan của viewer3d; `useLoadingSession` giữ bước hiện tại.

## Việc cần làm

- [ ] `features/warehouse/warehouse-api.ts` + hook: lấy revision approved mới nhất của chuyến được giao cho kho (seed LM-026). Chưa có bản duyệt → trạng thái rỗng giải thích.
- [ ] Bước theo `loadingOrder`; `PositionViewer` nhận view model LM-030.
- [ ] `describe-step.ts`, `PackageInstructionCard`, `OrientationFigure`: khoảng cách cm theo locale, hướng đặt 6 mã (hình SVG đúng mã), vật cản gần nhất nếu kiện nằm cạnh.
- [ ] Nhãn "Thứ tự tính lại ở FE" nếu revision `ordersRecomputed`.
- [ ] Gỡ import `viewer3d/benchmark.mock` khỏi `warehouse`.
- [ ] Ẩn "Ghi nhận sai lệch" / "Kiện này không có ở kho" nếu vẫn chưa có chức năng (D-20).

## Tiêu chí nghiệm thu

- [ ] Duyệt revision ở Planner rồi mở `/kho`: bước 1 là kiện có `loadingOrder = 1`.
- [ ] Chữ ≥ 16px, nút 56px, lối thoát nhìn thấy được (AGENTS mục 10) vẫn giữ.

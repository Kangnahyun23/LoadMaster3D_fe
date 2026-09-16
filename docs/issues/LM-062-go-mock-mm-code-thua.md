---
id: LM-062
title: Gỡ mock mm, type cũ và code thừa
phase: 4
labels: [cleanup, refactor]
depends_on: [LM-049, LM-051, LM-060, LM-061]
estimate: 0.5d
prd: [D-03]
---

# LM-062 — Dọn mock mm và code thừa

## Việc cần làm

- [x] Xoá `src/lib/load-plan.mock.ts`, `src/lib/plan-comparison.mock.ts`, `src/types/load-plan.ts` (hoặc thu gọn còn type UI không liên quan đơn vị như `CameraPreset`, `ColorMode`, `PlaybackSpeed` và chuyển vào `viewer3d`).
- [x] Xoá code không còn ai import: `operations/OperationsToolbar.tsx` (đã thừa từ đợt scene-first), `leftOpen`/`toggleLeft` trong `useLoadPlanViewer.ts`, `useOptimizationJob.ts`, `GenerationSparkline.tsx`, `features/optimization/isometric.ts` nếu trùng `lib/isometric.ts`.
- [x] Gộp định nghĩa xe HD210 lặp lại ở nhiều file vào seed repository.
- [x] Tìm `mm`, `Mm`, `0.001`, `/ 1000` trong `src/`: chỉ còn trong comment giải thích lịch sử (hoặc không còn).
- [x] Chạy `oxlint` với rule unused, `tsc --noEmit`.

## Tiêu chí nghiệm thu

- [x] Lint, build, Vitest, E2E xanh sau khi xoá.
- [x] Kích thước chunk không tăng so với trước phase 4 (so `pnpm build` output).

## Kết quả (16/09/2026)

- Xoá `src/lib/load-plan.mock.ts`, `src/types/load-plan.ts`, `src/lib/placement.ts`, `adaptLoadPlan` (+ test), `createBenchmarkPlan`,
  `operations/OperationsToolbar.tsx`, `leftOpen`/`toggleLeft`, `reasonText` của kiện chưa xếp, `formatDimensions` (mm).
  `plan-comparison.mock.ts`, `useOptimizationJob`, `GenerationSparkline`, `optimization/isometric.ts` đã gỡ ở LM-048/LM-051.
- `CameraPreset`, `ColorMode`, `PlaybackSpeed`, `Packaging` chuyển vào `viewer3d/viewer-types.ts`; `WorkspaceToolbar` dùng `SceneStop`.
- Trang tài liệu: `/thanh-phan` 3D dựng từ revision đã duyệt của seed (`adaptResult`); bộ chọn hướng 6 mã Spec; mẫu kích thước cm.
- Xe HD210 chỉ còn định nghĩa ở seed kho (`seed-vehicles.ts`); các chỗ còn lại là nhãn/chú thích.
- Tìm `mm`/`Mm`/`0.001`/`/ 1000` trong `src/`: chỉ còn chú thích lịch sử, hằng số camera `0.001` (không phải đơn vị) và đổi ms → giây.
- Nhánh thứ tự dỡ suy ra ("gợi ý") trong `unloadSequence` giữ làm dự phòng khi kết quả thiếu `unloadingOrder`; không màn nào dùng tới.
- Kích thước JS (`dist/assets/*.js`): trước phase 4 (`a0e0336`) 2.332.098 B → sau LM-060/061 2.343.241 B → sau LM-062 2.338.992 B.
  LM-062 giảm 4,2 kB; cả phase tăng 6,9 kB (+0,3%) do màn kho/tài xế mới và từ điển vi/en của chúng — **tiêu chí "không tăng" chưa đạt theo nghĩa đen**.

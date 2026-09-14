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

- [ ] Xoá `src/lib/load-plan.mock.ts`, `src/lib/plan-comparison.mock.ts`, `src/types/load-plan.ts` (hoặc thu gọn còn type UI không liên quan đơn vị như `CameraPreset`, `ColorMode`, `PlaybackSpeed` và chuyển vào `viewer3d`).
- [ ] Xoá code không còn ai import: `operations/OperationsToolbar.tsx` (đã thừa từ đợt scene-first), `leftOpen`/`toggleLeft` trong `useLoadPlanViewer.ts`, `useOptimizationJob.ts`, `GenerationSparkline.tsx`, `features/optimization/isometric.ts` nếu trùng `lib/isometric.ts`.
- [ ] Gộp định nghĩa xe HD210 lặp lại ở nhiều file vào seed repository.
- [ ] Tìm `mm`, `Mm`, `0.001`, `/ 1000` trong `src/`: chỉ còn trong comment giải thích lịch sử (hoặc không còn).
- [ ] Chạy `oxlint` với rule unused, `tsc --noEmit`.

## Tiêu chí nghiệm thu

- [ ] Lint, build, Vitest, E2E xanh sau khi xoá.
- [ ] Kích thước chunk không tăng so với trước phase 4 (so `pnpm build` output).

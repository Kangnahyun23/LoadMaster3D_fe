---
id: LM-036
title: Timeline dùng loadingOrder/unloadingOrder; blocker dùng kiểm tra LIFO domain
phase: 2
labels: [viewer3d, operations]
depends_on: [LM-020, LM-030]
estimate: 1d
prd: [D-13, D-26]
spec: [7.11, 9.5]
---

# LM-036 — Timeline và LIFO

## Việc cần làm

- [ ] `useLoadPlanViewer`: `step` theo `loadingOrder` (thay `placement.step`).
- [ ] `useUnloadPlayback`: thứ tự theo `unloadingOrder` của result (thay `suggestedUnloadOrder`); gỡ chữ "gợi ý" khỏi nhãn khi thứ tự đến từ service, giữ nhãn "tính lại ở FE" khi revision có `ordersRecomputed`.
- [ ] Blocker khi phát dỡ: dùng `checkLifo` (LM-020) — `LIFO_BLOCKED` dừng mô phỏng và giữ target; `LIFO_PARTIAL` chỉ đánh dấu.
- [ ] `ExtractionCorridor` giữ phần vẽ hành lang, dữ liệu blocker lấy từ domain.
- [ ] *(Chuyển từ LM-020)* Thay `potentialBlockers` bằng `lifoIssues` của `@/domain/constraints` (tên thật của `checkLifo`) khi engine đã sang cm (LM-031). Khác biệt cần xử lý: domain chỉ tính kiện giao **muộn hơn** và nằm hẳn sau mặt sau (`x ≥ x_A + dài_A`), còn `potentialBlockers` lúc phát dỡ lấy cả kiện cùng điểm giao và mọi kiện có phần vượt mặt sau; `relatedIds` theo thứ tự layout nên callout `blockers[0]` phải tự sắp theo x; kiện đã dỡ gỡ khỏi lưới bằng `layout.grid.remove`.
- [ ] Panel chi tiết kiện hiện riêng "Thứ tự xếp" và "Thứ tự dỡ" (Spec 7.11).
- [ ] Gỡ `suggestedUnloadOrder`, `potentialBlockers`, `accessibilitySummary` khỏi `operations-model.ts` khi không còn nơi dùng.

## Tiêu chí nghiệm thu

- [ ] Phát xếp và phát dỡ đi đúng thứ tự trong result seed.
- [ ] Browser suite operations (loading/unloading, blocker, focus điểm giao) xanh.

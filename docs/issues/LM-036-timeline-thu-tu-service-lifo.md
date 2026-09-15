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

- [x] `useLoadPlanViewer`: `step` theo `loadingOrder` (thay `placement.step`).
- [x] `useUnloadPlayback`: thứ tự theo `unloadingOrder` của result (thay `suggestedUnloadOrder`); gỡ chữ "gợi ý" khỏi nhãn khi thứ tự đến từ service, giữ nhãn "tính lại ở FE" khi revision có `ordersRecomputed`.
- [x] Blocker khi phát dỡ: dùng `checkLifo` (LM-020) — `LIFO_BLOCKED` dừng mô phỏng và giữ target; `LIFO_PARTIAL` chỉ đánh dấu.
- [x] `ExtractionCorridor` giữ phần vẽ hành lang, dữ liệu blocker lấy từ domain.
- [x] *(Chuyển từ LM-020)* Thay `potentialBlockers` bằng `lifoIssues` của `@/domain/constraints` (tên thật của `checkLifo`) khi engine đã sang cm (LM-031). Khác biệt cần xử lý: domain chỉ tính kiện giao **muộn hơn** và nằm hẳn sau mặt sau (`x ≥ x_A + dài_A`), còn `potentialBlockers` lúc phát dỡ lấy cả kiện cùng điểm giao và mọi kiện có phần vượt mặt sau; `relatedIds` theo thứ tự layout nên callout `blockers[0]` phải tự sắp theo x; kiện đã dỡ gỡ khỏi lưới bằng `layout.grid.remove`.
- [x] Panel chi tiết kiện hiện riêng "Thứ tự xếp" và "Thứ tự dỡ" (Spec 7.11).
- [x] Gỡ `suggestedUnloadOrder`, `potentialBlockers`, `accessibilitySummary` khỏi `operations-model.ts` khi không còn nơi dùng.

## Tiêu chí nghiệm thu

- [x] Phát xếp và phát dỡ đi đúng thứ tự trong result seed.
- [x] Browser suite operations (loading/unloading, blocker, focus điểm giao) xanh.

## Kết quả (15/09/2026)

- [operations/unloading.ts](../../src/features/viewer3d/operations/unloading.ts) (mới, thuần):
  - `unloadSequence` sắp theo `unloadingOrder` của kết quả (`fromResult = true`). Phương án mm cũ của tài xế có `unloadingOrder = 0` nên dùng thứ tự suy ra như trước (stop tăng, cao trước, gần cửa trước), nhãn giữ chữ "gợi ý"; `driver.mock.ts` dùng cùng hàm.
  - `createLifoIndex` bọc `createPlacementLayout` + `lifoIssues` của domain. Kiện đã dỡ hoặc đang ẩn được gỡ khỏi lưới bằng `grid.remove` và thêm lại khi tua lùi. `blockers` sắp theo x. `corridor` trả mọi kiện còn lại trên hành lang thẳng, chỉ dùng cho hình ảnh.
  - `countLifoIssues` phục vụ Duyệt.
- `useLoadPlanViewer`: `step` đã là `loadingOrder` từ `adaptResult` (LM-030), không phải sửa. `useUnloadPlayback` chạy theo `unloadSequence`: `LIFO_BLOCKED` dừng mô phỏng và giữ target, `LIFO_PARTIAL` đi tiếp. `scene-semantics` lấy blocker từ domain (`lifo`, `blockers`) và dùng lại chỉ mục của mô phỏng. `deriveSceneSemantics` bỏ tham số `vehicle`.
- Khác `potentialBlockers` cũ:
  - kiện cùng điểm giao hoặc giao sớm hơn không còn là blocker;
  - `UnloadMotion` vẫn làm mờ tại chỗ khi hành lang còn bất kỳ kiện nào, để không trượt xuyên kiện.
- UI qua từ điển `viewer.operations.*`:
  - "Thứ tự dỡ" / "Đã dỡ" / "Dỡ hàng", thêm "gợi ý" khi thứ tự do FE suy ra; câu "tính lại ở FE" khi `ordersRecomputed`.
  - `BlockerPanel` ghi che kín / che {coverage}.
  - Callout hành lang.
  - Panel kiện có riêng "Thứ tự xếp" và "Thứ tự dỡ".
  - Duyệt báo số kiện `LIFO_BLOCKED`/`LIFO_PARTIAL` ("kiểm tra LIFO"), không khẳng định dỡ được thực tế.
- Gỡ `suggestedUnloadOrder`, `potentialBlockers`, `accessibilitySummary` khỏi `operations-model.ts`.
- Dữ liệu: seed đã duyệt không có ca LIFO nào. Fixture benchmark đổi điểm giao của đúng một cặp kiện: tầng trên cột cuối điểm 3 ↔ cột kề phía cửa; số kiện mỗi điểm giữ nguyên. `unloadingOrder` của benchmark theo (điểm giao tăng, từ cửa vào), nên có đúng một ca `LIFO_BLOCKED` (kiện điểm 2 dỡ thứ 500 trên 1.000).
- Test:
  - `tests/viewer-unloading.test.ts` (8 test, số kiểm tay: che kín 1, che nửa 0,5, sắp theo x, gỡ/thêm lại lưới, fallback, đếm Duyệt, seed 0 ca, benchmark 1 ca).
  - `useUnloadPlayback.dom.test.tsx` (4 test: đúng thứ tự, dừng khi che kín, đi tiếp khi che một phần, kiện chắn đã dỡ).
  - Cập nhật `tests/viewer-operations.test.ts`.
  - E2E operations tính ca chặn bằng `unloadSequence` + `createLifoIndex`, kiểm câu tạm dừng, panel "Kiện chắn lối dỡ" và câu Duyệt LIFO.
  - E2E scene-first kiểm phát xếp bước 47 và 3 bước dỡ đầu khớp thứ tự của revision seed, kèm câu "tính lại ở FE".

---
id: LM-035
title: Editor chạy constraint engine tăng dần khi kéo, thả, xoay
phase: 2
labels: [viewer3d, editor, constraints, performance]
depends_on: [LM-023, LM-028, LM-032, LM-034]
estimate: 1.5d
prd: [D-09, D-28, D-29, D-32]
spec: [10]
---

# LM-035 — Editor dùng constraint engine

## Bối cảnh

Spec chỉ cho kéo thả khi mọi thay đổi được validate lại. Editor hiện chỉ kiểm tra biên và chồng lấn (`validatePlacement`), trả chuỗi tiếng Việt.

## Việc cần làm

- [ ] `useManualEditor` giữ một instance engine (LM-023) cho snapshot + draft; dựng lại khi snapshot đổi, không dựng lại mỗi commit.
- [ ] Khi kéo: `evaluateMove` tối đa ~10 lần/giây qua `preview-store` (giữ cơ chế throttle hiện có).
- [ ] Khi thả/xoay/nudge/snap/reset: `commitMove`; có `error` thì không commit và hiện lý do; `warning` vẫn commit.
- [ ] Undo/redo gọi `commitMove` ngược lại trên engine để đồng bộ grid.
- [ ] Ghost xanh/vàng/đỏ theo severity; danh sách issue render qua `formatIssue` (LM-028) bằng `code` + `params`.
- [ ] Hiện cảnh báo `LOADING_ORDER_INFEASIBLE` sau commit (D-32).
- [ ] Gỡ `validatePlacement`/`supportCoverage` cũ trong `viewer3d/editor/geometry.ts` sau khi chuyển.

## Tiêu chí nghiệm thu

- [ ] Ở 1.000 kiện, đo trong trình duyệt: thời gian xử lý thả p95 ≤ 8 ms (ghi vào report).
- [ ] Kéo kiện lên hốc bánh không chịu tải bị chặn; kéo lên kiện `stackable = false` bị chặn; đặt thiếu đỡ dưới `minSupportRatio` commit kèm cảnh báo.
- [ ] Không có React state cập nhật mỗi pointer frame (kiểm bằng React Profiler hoặc đếm render).

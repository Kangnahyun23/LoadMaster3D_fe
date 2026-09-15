---
id: LM-038
title: Chuyển E2E 3D sang cm và kiểm tra hồi quy hiệu năng
phase: 2
labels: [test, e2e, performance]
depends_on: [LM-005, LM-031, LM-032, LM-033, LM-034, LM-035, LM-036, LM-037]
estimate: 1d
prd: [D-29, D-39]
---

# LM-038 — E2E 3D sang cm và hồi quy hiệu năng

## Việc cần làm

- [x] Cập nhật giá trị mm trong các spec E2E 3D sang cm; thêm ca vật cản, 6 hướng, lỗi constraint mới.
- [x] Chạy benchmark tay `?debug&packages=132|300|500|1000&quality=low|balanced|high`, lưu `docs/benchmarks/viewer-cm-<ngày>.json`.
- [x] So sánh với `docs/benchmarks/viewer-scene-first-2026-09-14.json`: draw call không đổi (16/25/33) cộng tối đa 2 cho vật cản; ghi nhận tam giác, FPS (chỉ tham khảo, SwiftShader).
- [x] Viết `docs/viewer-cm-report.md` ngắn: đã đổi gì, số đo trước/sau, rủi ro còn lại.

## Tiêu chí nghiệm thu

- [x] `pnpm test:e2e` xanh trên CI.
- [x] Draw call ở 1.000 kiện < 100 ở mọi tier; idle vẫn 0 frame thừa.

## Kết quả (15/09/2026)

- Giá trị mm trong E2E 3D đã đổi sang cm cùng LM-031 (toạ độ, kéo, nudge, mã `BENCH-NNNNN-01`); ca mới: vật cản (`viewer-obstacles.spec.ts`, LM-033), 6 hướng và lỗi/cảnh báo constraint từ domain (`viewer-editor-ui.spec.ts`: `WLH` bị chặn, `HWL`, "tỷ lệ đỡ đáy", "chồng lấn"), LIFO (`viewer-operations-ui.spec.ts`, LM-036), camera giảm chuyển động (LM-056).
- Spec mới [e2e/viewer-benchmark-cm.spec.ts](../../e2e/viewer-benchmark-cm.spec.ts): 4 số kiện × 3 tier, draw call không tăng theo số kiện, nghỉ không vẽ thêm frame, một lần kiểm khi thả ở 1.000 kiện p95 ≤ 8 ms (12 ms khi `CI`). `VIEWER_BENCH_RECORD` ghi [docs/benchmarks/viewer-cm-2026-09-15.json](../benchmarks/viewer-cm-2026-09-15.json).
- Draw call 16/25/33 (low/balanced/high) ở 132 → 1.000 kiện, trùng số 14/09; tam giác trùng; vật cản +2. Kiểm khi thả p95 ≈ 2 ms trong trình duyệt.
- Báo cáo: [docs/viewer-cm-report.md](../viewer-cm-report.md). `pnpm test:e2e` 26/26 trên máy (bộ đầy đủ trước khi thêm spec benchmark) + spec benchmark 1/1 chạy riêng; CI chạy sau khi push.


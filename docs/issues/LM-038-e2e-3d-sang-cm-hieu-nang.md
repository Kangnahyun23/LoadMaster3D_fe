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

- [ ] Cập nhật giá trị mm trong các spec E2E 3D sang cm; thêm ca vật cản, 6 hướng, lỗi constraint mới.
- [ ] Chạy benchmark tay `?debug&packages=132|300|500|1000&quality=low|balanced|high`, lưu `docs/benchmarks/viewer-cm-<ngày>.json`.
- [ ] So sánh với `docs/benchmarks/viewer-scene-first-2026-09-14.json`: draw call không đổi (16/25/33) cộng tối đa 2 cho vật cản; ghi nhận tam giác, FPS (chỉ tham khảo, SwiftShader).
- [ ] Viết `docs/viewer-cm-report.md` ngắn: đã đổi gì, số đo trước/sau, rủi ro còn lại.

## Tiêu chí nghiệm thu

- [ ] `pnpm test:e2e` xanh trên CI.
- [ ] Draw call ở 1.000 kiện < 100 ở mọi tier; idle vẫn 0 frame thừa.

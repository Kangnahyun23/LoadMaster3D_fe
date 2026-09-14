---
id: LM-072
title: Nghiệm thu theo Spec mục 15 + PRD mục 12, cập nhật tài liệu bàn giao
phase: 5
labels: [qa, docs]
depends_on: [LM-062, LM-071]
estimate: 0.5d
prd: [D-22]
spec: [15]
---

# LM-072 — Nghiệm thu và bàn giao

## Việc cần làm

- [ ] Bảng đối chiếu từng dòng Spec mục 15 và PRD mục 12 → test/ảnh chứng minh (đường dẫn E2E, unit test, benchmark).
- [ ] Benchmark cuối: constraint engine (D-29), viewer 132/500/1.000 kiện ở 3 tier; lưu `docs/benchmarks/`.
- [ ] Bộ ảnh chụp mới: Dashboard, chi tiết xe, bảng kiện, thiết lập tối ưu, Planner (thành công / một phần / lỗi thời), kho, tài xế — cả vi và en.
- [ ] Cập nhật `handoff.md`, AGENTS.md, `docs/prd.md` (đánh dấu quyết định đã hiện thực, câu hỏi còn mở).
- [ ] Liệt kê nợ kỹ thuật và phần chờ backend (LM-002).

## Tiêu chí nghiệm thu

- [ ] Mọi dòng checklist có bằng chứng; dòng chưa đạt có issue theo dõi.
- [ ] CI xanh trên commit nghiệm thu.

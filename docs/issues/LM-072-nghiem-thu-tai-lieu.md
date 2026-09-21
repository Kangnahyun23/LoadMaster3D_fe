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

- [x] Bảng đối chiếu từng dòng Spec mục 15 và PRD mục 12 → test/ảnh chứng minh (đường dẫn E2E, unit test, benchmark).
- [x] Benchmark cuối: constraint engine (D-29), viewer 132/500/1.000 kiện ở 3 tier; lưu `docs/benchmarks/`.
- [x] Bộ ảnh chụp mới: Dashboard, chi tiết xe, bảng kiện, thiết lập tối ưu, Planner (thành công / một phần / lỗi thời), kho, tài xế — cả vi và en.
- [x] Cập nhật `handoff.md`, AGENTS.md, `docs/prd.md` (đánh dấu quyết định đã hiện thực, câu hỏi còn mở).
- [x] Liệt kê nợ kỹ thuật và phần chờ backend (LM-002).

## Tiêu chí nghiệm thu

- [x] Mọi dòng checklist có bằng chứng; dòng chưa đạt có issue theo dõi.
- [x] CI xanh trên commit nghiệm thu.

## Kết quả (16/09/2026)

- [docs/acceptance.md](../acceptance.md): 17 dòng Spec §15 + 7 dòng PRD §12, mỗi dòng trỏ tới test. 23 dòng đạt; dòng 12
  (chồng vật cản) đạt ở seam engine, thiếu E2E → [LM-073](LM-073-e2e-keo-kien-vao-vat-can.md). Bảng nợ N-1 → N-10.
- Benchmark: [constraint-engine-2026-09-16.json](../benchmarks/constraint-engine-2026-09-16.json) (1.000 kiện p95 30,8 ms / 50;
  move 1,8 ms / 8), [viewer-2026-09-16.json](../benchmarks/viewer-2026-09-16.json) (low 132/300/500/1.000: 16 draw call,
  60/60/60/42 FPS; 1.000 balanced/high: 25/33 draw call). Script viewer đo tier low cho mọi cỡ và balanced/high ở 1.000 kiện,
  không đo balanced/high ở 132/500 như issue ghi — mức 1.000 là trường hợp nặng nhất.
- Ảnh: `tests/handoff-screenshots.mjs` (chạy tay) → [docs/screenshots/handoff/](../screenshots/handoff/), 9 màn × vi/en
  (bảng điều khiển, chi tiết xe, bảng kiện, thiết lập tối ưu, Planner thành công / một phần / lỗi thời, kho tablet, tài xế điện thoại).
- Viết lại [handoff.md](../handoff.md); PRD đổi trạng thái và tick mục 12; AGENTS mục 6 ghi cổng chuỗi cứng.
- E2E cục bộ gặp hai lỗi ngẫu nhiên không tái hiện khi chạy riêng (ghi ở handoff mục 4); CI là nơi xác nhận.

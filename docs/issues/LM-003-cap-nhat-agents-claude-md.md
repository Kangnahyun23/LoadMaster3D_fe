---
id: LM-003
title: Cập nhật AGENTS.md và CLAUDE.md theo PRD
phase: 0
labels: [docs, rules]
depends_on: [LM-001]
estimate: 0.5d
prd: [D-03, D-06, D-07, D-15, D-19, D-20, D-27, D-28, D-29, D-30, D-39]
---

# LM-003 — Cập nhật AGENTS.md và CLAUDE.md theo PRD

## Bối cảnh

AGENTS.md là "luật sống": code và luật không được lệch nhau. Nhiều quyết định PRD đổi luật hiện có. CLAUDE.md đang là bản cũ hơn AGENTS.md (thiếu phần foundation/editor/operations và mục 12).

## Việc cần làm

- [ ] Mục 1: luồng MVP theo Spec, nhãn MOCK RESULT.
- [ ] Mục 2: thêm Vitest, React Testing Library, `@playwright/test`; ghi rõ không dùng Zustand/Redux.
- [ ] Mục 3: thêm `src/domain/{models,geometry,constraints,metrics}` và `src/services/optimization/`; cấm import React/Three trong hai thư mục này.
- [ ] Mục 4 và 6: đơn vị cm/kg/cm³; `roundCm` bội 0,1 cm; so sánh qua helper EPSILON; format số theo locale.
- [ ] Mục 6 "Nút chưa nối backend": đổi thành ẩn nút chưa hoạt động, ngoại lệ nhãn "Sẽ có sau" không bấm được (D-20).
- [ ] Mục 7: engine dùng cm (`SCENE_SCALE = 0.01`), 6 hướng đặt, vật cản; editor chạy constraint engine; ngân sách D-29; mock service trong Web Worker.
- [ ] Mục 9: domain trả mã lỗi + tham số; i18n bằng từ điển typed; ngôn ngữ lưu `sessionStorage` và `?lang`.
- [ ] Mục 12: lệnh kiểm tra mới (`pnpm test`, `pnpm test:e2e`, CI).
- [ ] Đồng bộ CLAUDE.md với AGENTS.md (hoặc để CLAUDE.md chỉ trỏ tới AGENTS.md).

## Tiêu chí nghiệm thu

- [ ] Không còn câu nào trong AGENTS.md mâu thuẫn với `docs/prd.md` mục 5.
- [ ] Mục đã đổi được đánh dấu *(đã điều chỉnh)* kèm lý do.

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

- [x] Mục 1: luồng MVP theo Spec, nhãn MOCK RESULT.
- [x] Mục 2: thêm Vitest, React Testing Library, `@playwright/test`; ghi rõ không dùng Zustand/Redux.
- [x] Mục 3: thêm `src/domain/{models,geometry,constraints,metrics}` và `src/services/optimization/`; cấm import React/Three trong hai thư mục này.
- [x] Mục 4 và 6: đơn vị cm/kg/cm³; `roundCm` bội 0,1 cm; so sánh qua helper EPSILON; format số theo locale.
- [x] Mục 6 "Nút chưa nối backend": đổi thành ẩn nút chưa hoạt động, ngoại lệ nhãn "Sẽ có sau" không bấm được (D-20).
- [x] Mục 7: engine dùng cm (`SCENE_SCALE = 0.01`), 6 hướng đặt, vật cản; editor chạy constraint engine; ngân sách D-29; mock service trong Web Worker.
- [x] Mục 9: domain trả mã lỗi + tham số; i18n bằng từ điển typed; ngôn ngữ lưu `sessionStorage` và `?lang`.
- [x] Mục 12: lệnh kiểm tra mới (`pnpm test`, `pnpm test:e2e`, CI).
- [x] Đồng bộ CLAUDE.md với AGENTS.md (hoặc để CLAUDE.md chỉ trỏ tới AGENTS.md).

## Tiêu chí nghiệm thu

- [x] Không còn câu nào trong AGENTS.md mâu thuẫn với `docs/prd.md` mục 5.
- [x] Mục đã đổi được đánh dấu *(đã điều chỉnh)* kèm lý do.

## Kết quả — 15/09/2026

**AGENTS.md**

- Mục 1: thêm "MVP theo Build Spec" — phần bắt buộc/được điều chỉnh, Spec thắng khi mâu thuẫn, MOCK RESULT, vi/en.
- Mục 2: khối "Kiểm thử" (Vitest 5, RTL, Playwright); "Không dùng" thêm Zustand và thư viện i18n.
- Mục 3: cây thư mục thêm `lib/i18n`, `domain/{geometry,models,constraints,metrics,fixtures}`, `services/optimization`, `test/`, `tests/`, `e2e/`; luật `src/domain` + `src/services` không import React/Three/router.
- Mục 6: "Đơn vị nghiệp vụ" *(đã điều chỉnh)* mm → cm/kg, `roundCm`/`roundKg` tại biên, so sánh qua `eq/lt/gt` EPSILON kèm ví dụ đã gặp, **trạng thái chuyển đổi** (domain đã cm, engine/kho/tài xế còn mm tới LM-031/060/061/062) để luật không nói sai về code hiện tại; bảng format vi-VN/en-US; mục "i18n vi/en"; "Nút chưa hoạt động" *(đã điều chỉnh)* thay luật `notifyPendingFeature`.
- Mục 7: thêm "Tích hợp Spec vào engine" ghi rõ là **đích** theo issue LM-025, LM-030 → LM-037 (cm, 6 hướng, vật cản, editor + constraint engine, ngân sách D-29, LIFO, tải trục "Sẽ có sau", worker). Các mục mô tả code hiện tại giữ nguyên tới khi issue tương ứng sửa.
- Mục 9: "Dữ liệu dùng chung và tối ưu" (mock repository → `-api.ts` → Query, `OptimizationService`, revision bất biến, `?mo-phong=loi`); "Kiểm thử" (project unit/dom, seam, TDD, bench, e2e).
- Mục 12: quy tắc làm song song bằng worktree; lệnh xác nhận cuối task thêm `pnpm test`; mỗi task ghi issue + nhật ký `docs/progress.md`.

**CLAUDE.md**: thay bản sao cũ bằng lệnh import `@AGENTS.md` (Claude Code nạp nội dung AGENTS.md vào ngữ cảnh), để luật chỉ còn một nguồn.

**Lưu ý:** mục 7 "Tích hợp Spec vào engine" và dòng "trạng thái chuyển đổi" ở mục 6 phải được sửa lại mỗi khi một issue phase 2–4 hoàn tất.

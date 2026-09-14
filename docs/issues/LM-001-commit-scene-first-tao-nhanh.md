---
id: LM-001
title: Commit đợt scene-first lên main và tạo nhánh feat/spec-mvp
phase: 0
labels: [git, chore]
depends_on: []
estimate: 0.5d
prd: [D-21]
---

# LM-001 — Commit đợt scene-first lên main và tạo nhánh feat/spec-mvp

## Bối cảnh

Working tree đang có đợt scene-first chưa commit: 28 file sửa và nhiều file mới (component, test, ảnh, báo cáo benchmark, `handoff.md`). Tích hợp Spec sẽ đổi đơn vị và domain, nên phải chốt trạng thái hiện tại trước để có điểm quay lại.

## Việc cần làm

- [x] Chạy `pnpm lint`, `pnpm build`, `node --experimental-strip-types --test tests/*.test.ts`, ghi lại kết quả.
- [x] Bảo đảm file untracked cần giữ được thêm: `src/features/viewer3d/**` mới, `tests/viewer-scene-first*`, `docs/benchmarks/*`, `docs/screenshots/scene-first/`, `docs/viewer-scene-first-report.md`, `handoff.md`.
- [x] Không commit `.claude/settings.json` nếu chỉ còn `{"enabledPlugins": {}}`.
- [x] Commit code theo Conventional Commits, ví dụ `feat(viewer3d): scene-first workspace and spatial editor feedback`.
- [x] Commit riêng tài liệu: `docs/prd.md`, `docs/issues/`, `LoadMaster_FE_MVP_Build_Spec.md` (dọn ký tự escape `\#`, `\-`, `\~` trước).
- [x] Tạo nhánh `feat/spec-mvp` từ `main`.

## Tiêu chí nghiệm thu

- [x] `git status` sạch trên `main` sau commit (chỉ còn `.claude/` cố ý không commit).
- [x] Lint, build và 37 test TypeScript xanh tại commit đó.
- [x] Nhánh `feat/spec-mvp` trỏ tới commit mới nhất của `main`.

## Kết quả — 14/09/2026

- Commit code: `d737f93` · commit tài liệu: xem `git log` trên `main` (`docs: add build spec, PRD, issue breakdown and progress log`).
- Lint ✅ · build ✅ (cảnh báo chunk > 500 kB có từ trước) · 37/37 test TypeScript ✅. Suite trình duyệt chưa chạy (chờ LM-005).

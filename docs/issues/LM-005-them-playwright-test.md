---
id: LM-005
title: Đưa Playwright vào repo, chuyển suite trình duyệt sang @playwright/test
phase: 0
labels: [tooling, test, e2e]
depends_on: [LM-001]
estimate: 1.5d
prd: [D-39]
---

# LM-005 — Đưa Playwright vào repo

## Bối cảnh

7 suite `tests/viewer-*.mjs` dùng Playwright cài ngoài repo qua `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, `VIEWER_TEST_URL` và helper riêng `viewer-browser-helpers.mjs`. Không chạy được trên CI.

## Việc cần làm

- [ ] `pnpm add -D @playwright/test`; `playwright.config.ts` có `webServer` khởi động app tại cổng cố định.
- [ ] Chuyển `viewer-ui`, `viewer-editor-ui`, `viewer-operations-ui`, `viewer-visuals`, `viewer-demand-quality`, `viewer-scene-first-ui` sang `e2e/*.spec.ts`; đăng nhập demo thành fixture.
- [ ] Giữ `viewer-benchmark` là script chạy tay, cập nhật cách gọi, không đưa vào CI.
- [ ] Project `desktop` 1600×1000, `tablet` 820×1180, `phone` 390×844 cho suite cần.
- [ ] Script `test:e2e`, `test:e2e:ui`; thêm `test-results/`, `playwright-report/` vào `.gitignore`.
- [ ] Phase này giữ giá trị mm; chuyển sang cm ở LM-038.

## Tiêu chí nghiệm thu

- [ ] `pnpm test:e2e` xanh trên máy local, không cần biến môi trường ngoài.
- [ ] Không còn file `.mjs` trùng chức năng trong `tests/`.

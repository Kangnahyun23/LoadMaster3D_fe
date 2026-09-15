---
id: LM-006
title: GitHub Actions — lint, typecheck, Vitest, build, E2E
phase: 0
labels: [ci, tooling]
depends_on: [LM-004, LM-005]
estimate: 0.5d
prd: [D-39]
---

# LM-006 — GitHub Actions CI

## Việc cần làm

- [x] `.github/workflows/ci.yml` chạy trên push và pull request vào `main`, `feat/**`.
- [x] Node 22, pnpm 11.2.2, cache store pnpm, `pnpm install --frozen-lockfile`.
- [x] Job `lint` (`pnpm lint`), `typecheck` (`tsc -b`), `unit` (`pnpm test`), `build` (`pnpm build`, upload `dist`), `e2e` (cài Chromium, `pnpm test:e2e`, upload report khi lỗi). Ngưỡng benchmark domain sẽ thêm vào job `unit` ở LM-023.
- [x] Không chạy benchmark FPS 3D trên CI (SwiftShader không đại diện thiết bị thật, AGENTS mục 7).

## Tiêu chí nghiệm thu

- [x] `feat/spec-mvp` hiện đủ 5 check xanh — run `34949580777` (push, 15/09/2026): Build, Lint, Unit, Typecheck xanh trong ~30 s; E2E xanh sau 8 phút 16 giây.
- [x] Cố ý làm hỏng một test thì đúng job đó đỏ — nhánh tạm `feat/ci-verify-red` (sai kỳ vọng trong `src/lib/utils.test.ts`), run `34950525027`: **chỉ Unit tests (Vitest) đỏ** ở bước `pnpm test`; Lint, Typecheck, Build xanh; E2E được huỷ chủ động để tiết kiệm phút CI. Đã xoá nhánh tạm trên remote.

## Kết quả — 15/09/2026

- [.github/workflows/ci.yml](../../.github/workflows/ci.yml): 5 job `lint`, `typecheck`, `unit`, `build`, `e2e` trên `ubuntu-latest`.
  - `pnpm/action-setup@v4` đọc phiên bản pnpm từ `packageManager` (11.2.2); `actions/setup-node@v4` Node 22 với `cache: pnpm`.
  - `typecheck` chạy `pnpm exec tsc -b` — kiểm cả app, config Vite/Vitest/Playwright, `e2e/` và các file `*.test-d.ts`.
  - `build` upload `dist` (giữ 7 ngày).
  - `e2e` chạy sau `lint` + `typecheck`, cài `pnpm exec playwright install --with-deps chromium` (đúng phiên bản `@playwright/test` trong lockfile), `CI=true` nên Playwright bật server Vite mới, retries 1, `forbidOnly`; upload `playwright-report` + `test-results` khi lỗi; timeout job 45 phút.
  - `concurrency` huỷ lượt cũ cùng nhánh; `permissions: contents: read`.
- Cú pháp YAML không kiểm được tại máy; lần push đầu (15/09/2026) GitHub nhận workflow và chạy đủ 5 job.
- Workflow chỉ chạy khi push/PR vào `main` hoặc `feat/**`: nhánh tên khác (ví dụ `ci/...`) không có CI.
- Khác máy dev: runner Linux không cần `E2E_PORT`; Chromium Linux headless vẫn dùng SwiftShader nên các test đo frame/idle giữ nguyên ngưỡng.

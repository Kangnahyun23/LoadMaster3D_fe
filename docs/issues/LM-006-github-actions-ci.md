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

- [ ] `.github/workflows/ci.yml` chạy trên push và pull request vào `main`, `feat/**`.
- [ ] Node 22, pnpm 11.2.2, cache store pnpm, `pnpm install --frozen-lockfile`.
- [ ] Job `lint` (`pnpm lint`), `typecheck` (`tsc -b`), `unit` (`pnpm test`, gồm benchmark domain có ngưỡng ở LM-023), `build` (`pnpm build`, upload `dist`), `e2e` (cài Chromium, `pnpm test:e2e`, upload report khi lỗi).
- [ ] Không chạy benchmark FPS 3D trên CI (SwiftShader không đại diện thiết bị thật, AGENTS mục 7).

## Tiêu chí nghiệm thu

- [ ] Pull request thử trên `feat/spec-mvp` hiện đủ 5 check xanh.
- [ ] Cố ý làm hỏng một test thì đúng job đó đỏ.

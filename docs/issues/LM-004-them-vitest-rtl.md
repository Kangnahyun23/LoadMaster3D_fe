---
id: LM-004
title: Thêm Vitest + React Testing Library, chuyển test node --test
phase: 0
labels: [tooling, test]
depends_on: [LM-001]
estimate: 1d
prd: [D-15]
spec: [5, 14, 15]
---

# LM-004 — Thêm Vitest + React Testing Library

## Bối cảnh

Repo chạy 37 test bằng `node --experimental-strip-types --test tests/*.test.ts`; một số file import tương đối có đuôi `.ts` chỉ để chạy được không cần alias. Spec yêu cầu unit test cho pure function và gợi ý Vitest + RTL.

## Việc cần làm

- [x] `pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom` (thêm `@testing-library/dom` là peer của jest-dom).
- [x] Cấu hình Vitest dùng alias `@/`; môi trường `node` cho domain, `jsdom` cho `*.dom.test.tsx`.
- [x] Script `test`, `test:watch`, `test:bench`.
- [x] Chuyển `viewer-foundation`, `viewer-editor`, `viewer-operations`, `viewer-scene-first` sang Vitest, giữ đủ số ca.
- [x] Bỏ đuôi `.ts` trong import tương đối chỉ phục vụ `node --test` (`viewer-draft.ts`, `draft-history.ts`, `editor/geometry.ts`…).
- [x] Một test RTL mẫu cho form hiện có (ví dụ `VehicleFormDialog` báo lỗi khi bỏ trống).

## Tiêu chí nghiệm thu

- [x] `pnpm test` chạy đủ 37 test cũ + test mẫu, tất cả xanh.
- [x] `pnpm lint` và `pnpm build` xanh; Vitest không lọt vào bundle production.

## Kết quả — 14/09/2026

- **Phiên bản khoá trong lockfile:** vitest 5.0.0, @testing-library/react 16.3.3, @testing-library/user-event 14.6.7, @testing-library/jest-dom 7.0.1, @testing-library/dom 10.4.1, jsdom 30.0.1.
- **Cấu hình** [vitest.config.ts](../../vitest.config.ts): `mergeConfig` với `vite.config.ts` (dùng chung alias), hai project `test.projects`:
  - `unit` — môi trường node, `tests/**/*.test.ts`, `src/**/*.test.ts`.
  - `dom` — jsdom, `src/**/*.dom.test.tsx`, setup [src/test/setup-dom.ts](../../src/test/setup-dom.ts) (matcher jest-dom + `cleanup` sau mỗi test vì không bật `globals`).
  - Benchmark: `tests/**/*.bench.ts`, `src/**/*.bench.ts`.
- **Script:** `pnpm test` (`vitest run`), `pnpm test:watch`, `pnpm test:bench` (`--passWithNoTests` vì chưa có file bench; LM-023 sẽ thêm).
- **Chuyển test:** codemod dựa trên AST TypeScript (không dùng regex) đổi 171 lời gọi `assert.*` sang `expect`: `equal → toBe`, `notEqual → not.toBe`, `deepEqual → toStrictEqual` (giữ độ chặt của `node:assert/strict`), `ok → toBeTruthy`, `throws → toThrow`. Import đổi sang alias `@/`.
- **Bỏ đuôi `.ts`** trong 8 file `src/features/viewer3d/**`; `editor/geometry.ts` đổi `'../../../lib/format.ts'` thành `'@/lib/format'`.
- **Test RTL mẫu** [VehicleFormDialog.dom.test.tsx](../../src/features/fleet/VehicleFormDialog.dom.test.tsx): gửi form trống hiện lỗi và không lưu; form hợp lệ gọi `onSubmit` và đóng hộp thoại.
- **Kiểm tra:** `pnpm test` 39/39 (37 cũ + 2 RTL) · `pnpm lint` ✅ · `pnpm build` ✅, `dist/` không chứa code test.
- `handoff.md` đổi lệnh chạy test sang `pnpm test`.

## Lưu ý cho issue sau

- `VehicleFormDialog` sẽ bị gỡ ở LM-040/LM-041; khi đó chuyển test RTL mẫu sang form chi tiết xe mới.
- Thư mục `src/test/` là nơi đặt setup test dùng chung — cần ghi vào AGENTS.md mục 3 ở LM-003.
- `node --experimental-strip-types --test` không còn chạy được các file test (đã import `vitest`).

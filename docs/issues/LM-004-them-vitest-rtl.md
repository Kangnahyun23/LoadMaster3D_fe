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

- [ ] `pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`.
- [ ] Cấu hình Vitest dùng alias `@/`; môi trường `node` cho domain, `jsdom` cho `*.dom.test.tsx`.
- [ ] Script `test`, `test:watch`, `test:bench`.
- [ ] Chuyển `viewer-foundation`, `viewer-editor`, `viewer-operations`, `viewer-scene-first` sang Vitest, giữ đủ số ca.
- [ ] Bỏ đuôi `.ts` trong import tương đối chỉ phục vụ `node --test` (`viewer-draft.ts`, `draft-history.ts`, `editor/geometry.ts`…).
- [ ] Một test RTL mẫu cho form hiện có (ví dụ `VehicleFormDialog` báo lỗi khi bỏ trống).

## Tiêu chí nghiệm thu

- [ ] `pnpm test` chạy đủ 37 test cũ + test mẫu, tất cả xanh.
- [ ] `pnpm lint` và `pnpm build` xanh; Vitest không lọt vào bundle production.

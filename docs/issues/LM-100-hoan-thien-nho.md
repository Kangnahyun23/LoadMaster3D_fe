---
id: LM-100
title: Hoàn thiện nhỏ — tiêu đề tab, câu quảng cáo tải trục, cảnh báo rời form chuyến, E2E còn thiếu
phase: 6
labels: [polish]
depends_on: [LM-088]
estimate: 1d
prd: [D-20]
---

# LM-100 — Hoàn thiện nhỏ

## Việc cần làm

- [ ] `document.title` theo màn ("Chuyến TRIP-… · LoadMaster"), dịch theo ngôn ngữ.
- [ ] Màn đăng nhập bỏ câu "kiểm tra tải từng trục" (tính năng đang "Sẽ có sau").
- [x] Form chuyến cảnh báo rời trang khi còn thay đổi chưa lưu (như form xe).
- [ ] E2E cho `/chuyen/:id/so-sanh` và 404.

## Tiêu chí nghiệm thu

- [ ] Lint/build/test/E2E xanh.

## Kết quả (19/09/2026) — mục "Form chuyến cảnh báo rời trang"

Chỉ làm mục này (cùng đợt với LM-088); các mục còn lại của issue chưa làm.

- **Đã làm:** `TripFormPage` (tạo và sửa chuyến) dùng `useBlocker` như `fleet/VehicleForm.tsx`: form còn thay đổi chưa lưu
  (`formState.isDirty`) mà sang đường dẫn khác (nút Huỷ, nút quay lại, nav rail, Back của trình duyệt) thì hỏi "Rời trang khi chưa lưu?"
  bằng `ConfirmDialog` — "Ở lại" giữ nguyên chữ đang nhập, "Rời trang" (danger) đi tiếp. Đổi ngôn ngữ hay tham số cùng trang không hỏi.
  Lưu xong thì rời trang trong effect ở lần render sau, để hộp hỏi không chặn chính lần chuyển trang sau khi lưu. Chữ ở nhánh
  `trips.leave` (vi/en).
- **File chính:** `src/features/trips/TripFormPage.tsx`, `src/lib/i18n/{vi,en}/trips.ts`.
- **Kiểm thử:** `TripFormPage.dom.test.tsx` +2 (thay đổi chưa lưu: ở lại giữ chữ, xác nhận thì rời; form chưa đụng tới rời ngay, không
  hỏi) — tổng 8 test, chạy trên data router (`createMemoryRouter`; `useBlocker` cần data router). E2E tạo chuyến vẫn đi thẳng sang chi
  tiết sau khi lưu: `spec-flow` (luồng chính desktop, "switching to English mid-flow"), `trip-lifecycle` (tạo chuyến có ngày + tài xế) xanh.
- **Lệnh:** `pnpm lint`, `pnpm exec tsc -b`, `pnpm test` xanh.
- **Đề xuất:** `ConfirmDialog` nay dùng ở hai feature (đội xe, chuyến) — chuyển từ `features/fleet/` lên `src/components/` (AGENTS mục 3:
  dùng chung từ hai feature thì đưa lên `components/`). Agent này không sửa `features/fleet/**` nên chưa chuyển.

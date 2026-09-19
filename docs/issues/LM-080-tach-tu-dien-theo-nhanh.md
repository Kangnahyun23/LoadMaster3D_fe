---
id: LM-080
title: Tách từ điển i18n thành file theo nhánh để làm song song
phase: 6
labels: [i18n, infra]
depends_on: []
estimate: 0.5d
prd: [D-07, D-56]
---

# LM-080 — Tách từ điển theo nhánh

## Bối cảnh

`src/lib/i18n/vi.ts` (1.477 dòng) và `en.ts` (1.434 dòng) là hai file duy nhất mọi issue giao diện đều sửa. Đợt 6 làm 7 issue màn
song song (D-56): để nguyên thì mọi nhánh xung đột ở cùng hai file.

## Việc cần làm

- [x] Mỗi nhánh cấp 1 của từ điển (`language`, `nav`, `roles`, `auth`, `notFound`, `common`, `status`, `manager`, `driver`, `fleet`,
      `issues`, `optimization`, `trips`, `warehouse`, `viewer`, `fields`, `admin`, `designSystem`) thành một file trong
      `src/lib/i18n/vi/` và `src/lib/i18n/en/`; `vi.ts`/`en.ts` chỉ ghép. **Không đổi key, không đổi câu.**
- [x] Bản `en` mỗi nhánh vẫn `satisfies Dictionary<typeof viBranch>`: thiếu/thừa key báo lỗi ngay ở file nhánh.
- [x] Cổng `no-hardcoded-vietnamese` loại trừ thư mục từ điển mới.
- [x] AGENTS mục 3, 6, 11: đường dẫn từ điển mới; issue thêm nhánh mới thì thêm file nhánh + một dòng ghép.

## Tiêu chí nghiệm thu

- [x] `tsc -b`, `pnpm test` xanh; số key vi/en trước và sau bằng nhau (test so tập key với bản ghép).

## Kết quả (19/09/2026)

18 nhánh tách bằng script một lần: `src/lib/i18n/vi/<nhánh>.ts` (`as const`) và `en/<nhánh>.ts`
(`satisfies Dictionary<typeof source>` — thiếu/thừa key báo lỗi ngay ở file nhánh). `vi.ts`/`en.ts` chỉ còn import + ghép.
Nhánh chưa có chú thích (language, nav, roles, auth, notFound, common, viewer) được thêm chú thích nói màn phục vụ.

**Kiểm tra nội dung:** dump JSON `{ vi, en }` trước và sau khi tách, so từng byte: **giống hệt**.
Cổng `no-hardcoded-vietnamese` loại trừ `src/lib/i18n/(vi|en)/`. Lint bỏ qua `docs/**` (script chụp ảnh lưu trữ của gói bàn giao).

`tsc -b` ✅ · `pnpm lint` ✅ · `pnpm test` 545/545 ✅.

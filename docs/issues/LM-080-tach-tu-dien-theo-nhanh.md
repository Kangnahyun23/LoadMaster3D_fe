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

- [ ] Mỗi nhánh cấp 1 của từ điển (`language`, `nav`, `roles`, `auth`, `notFound`, `common`, `status`, `manager`, `driver`, `fleet`,
      `issues`, `optimization`, `trips`, `warehouse`, `viewer`, `fields`, `admin`, `designSystem`) thành một file trong
      `src/lib/i18n/vi/` và `src/lib/i18n/en/`; `vi.ts`/`en.ts` chỉ ghép. **Không đổi key, không đổi câu.**
- [ ] Bản `en` mỗi nhánh vẫn `satisfies Dictionary<typeof viBranch>`: thiếu/thừa key báo lỗi ngay ở file nhánh.
- [ ] Cổng `no-hardcoded-vietnamese` loại trừ thư mục từ điển mới.
- [ ] AGENTS mục 3, 6, 11: đường dẫn từ điển mới; issue thêm nhánh mới thì thêm file nhánh + một dòng ghép.

## Tiêu chí nghiệm thu

- [ ] `tsc -b`, `pnpm test` xanh; số key vi/en trước và sau bằng nhau (test so tập key với bản ghép).

---
id: LM-027
title: Hạ tầng i18n vi/en — từ điển typed, nút chuyển, format theo locale
phase: 1
labels: [i18n, infra]
depends_on: [LM-004]
estimate: 1.5d
prd: [D-07, D-08]
---

# LM-027 — Hạ tầng i18n

## Bối cảnh

Toàn app đang hardcode tiếng Việt; `lib/format.ts` cố định `vi-VN`. D-07 chốt tự viết, không thêm dependency. Làm sớm để mọi màn mới ở phase 2–3 dùng từ điển ngay.

## Việc cần làm

- [ ] `src/lib/i18n/`: `Locale = 'vi' | 'en'`; từ điển `vi.ts` là nguồn chuẩn, `en.ts` khai báo `satisfies Dictionary<typeof vi>` để **thiếu key là lỗi TypeScript** lúc build.
- [ ] `I18nProvider` + `useT()` trả `t(key, params)`; key có kiểu (gợi ý tự động), tham số có kiểu; hỗ trợ số nhiều đơn giản (`one` / `other`).
- [ ] Ngôn ngữ đọc theo thứ tự `?lang` → `sessionStorage` → mặc định `vi`; đổi ngôn ngữ ghi `sessionStorage`, cập nhật `<html lang>`. Không dùng `localStorage`.
- [ ] `lib/format.ts` nhận locale (`vi-VN` / `en-US`): `formatLength(cm)`, `formatWeight(kg)`, `formatVolume(cm3)`, `formatPercent`, `formatRatio`, `formatDimensions`, ngày, giờ. Hook `useFormat()`.
- [ ] `LanguageSwitch`: trong nav rail (desktop) và header các màn toàn màn hình; nút đạt vùng chạm 44/56px; `aria-label` rõ.
- [ ] Đổi ngôn ngữ không remount route, không mất dữ liệu form (kiểm bằng test RTL).
- [ ] Chuyển trước chuỗi của nav rail, trang đăng nhập, 404 làm mẫu.

## Tiêu chí nghiệm thu

- [ ] Xoá một key trong `en.ts` thì `pnpm build` báo lỗi.
- [ ] `?lang=en` mở trang đăng nhập bằng tiếng Anh; số `5,320 kg` ở en, `5.320 kg` ở vi.
- [ ] Test RTL: đang nhập form, đổi ngôn ngữ, giá trị còn nguyên.

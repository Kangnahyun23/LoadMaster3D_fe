---
id: LM-055
title: Sửa cn() (tailwind-merge) bỏ mất màu chữ khi gặp class cỡ chữ tuỳ chỉnh
phase: 0
labels: [bug, ui, a11y]
depends_on: [LM-004]
estimate: 0.5d
prd: [D-20]
---

# LM-055 — `cn()` bỏ mất màu chữ khi gặp class cỡ chữ tuỳ chỉnh

## Bối cảnh

Phát hiện khi làm LM-027 (15/09/2026), đã kiểm chứng lại bằng `tailwind-merge` của repo:

| Đầu vào `twMerge(...)` | Kết quả |
|---|---|
| `bg-primary text-white h-10 px-4 text-body` | `bg-primary h-10 px-4 text-body` — **mất `text-white`** |
| `border border-border bg-bg text-text h-14 px-5 text-body-lg` | `border border-border bg-bg h-14 px-5 text-body-lg` — **mất `text-text`** |
| `text-caption text-primary-hover` | `text-primary-hover` — **mất cỡ chữ** |

`src/lib/utils.ts` gọi `twMerge` mặc định. tailwind-merge không biết các token cỡ chữ của `@theme` trong `src/index.css` (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-caption`, `text-micro` nếu có) nên xếp chúng vào nhóm **màu chữ** và loại class màu đứng trước. Hệ quả: nút primary/danger render không có `text-white` (chữ thừa hưởng màu tối trên nền xanh/đỏ → vi phạm tương phản AGENTS mục 10), nút secondary/ghost mất `text-text`, `SegmentedControl` cỡ md mất cỡ chữ. `LanguageSwitch` (LM-027) đã phải né bằng cách đặt cỡ chữ ở khung ngoài.

## Việc cần làm

- [x] Chốt seam test với người dùng (TDD): `cn()` qua `@/lib/utils` (unit) và `Button` các variant qua RTL (dom).
- [x] `src/lib/utils.ts`: `extendTailwindMerge` khai báo theme `text` gồm mọi token cỡ chữ trong `@theme` (đọc từ `src/index.css`: `display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `caption`).
- [x] Rà các chỗ đã né lỗi: chỉ có `LanguageSwitch` — bỏ chú thích đã lỗi thời, giữ bố cục.
- [x] Ghi quy tắc thêm token cỡ chữ vào AGENTS.md mục 4.

## Tiêu chí nghiệm thu

- [x] Ba ví dụ trong bảng giữ nguyên cả màu chữ lẫn cỡ chữ.
- [x] Nút primary và danger render có `text-white`; secondary và ghost có `text-text`.
- [x] `pnpm test`, `pnpm lint`, `pnpm build` xanh. Ảnh chụp `/thanh-phan` chưa kiểm — chờ E2E của LM-005.

## Kết quả — 15/09/2026 (TDD)

- Vòng 1 RED → GREEN: `cn('bg-primary text-white', 'h-10 px-4 text-body')` trả thiếu `text-white` → khai báo `THEME_FONT_SIZES` qua `extendTailwindMerge({ extend: { theme: { text: [...] } } })` (nhóm `font-size` của tailwind-merge 3.6 đọc theme key `text`).
- 4 test chặn: `cn` giữ cỡ chữ khi màu đứng sau; cỡ chữ sau vẫn thay cỡ chữ trước; `Button` primary/danger giữ `text-white` ở cỡ md và touch; secondary/ghost giữ `text-text`. Đã chứng minh: bỏ `body-lg`, `body`, `caption` khỏi cấu hình → 4/5 test đỏ (test cỡ chữ-thay-cỡ chữ vẫn xanh vì chặn lỗi khác), rồi khôi phục.
- Kiểm tra: `pnpm test` 121/121 ✅ · `pnpm lint` ✅ · `pnpm build` ✅.
- `text-micro` (11px) vẫn chưa có trong `@theme` — code còn `text-[11px]` rải rác (lệch luật mục 4); để issue riêng nếu nhóm muốn thêm token.

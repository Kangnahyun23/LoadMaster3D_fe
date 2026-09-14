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

- [ ] Chốt seam test với người dùng (TDD): đề xuất render `Button` các variant qua RTL và kiểm class/màu, cộng một test đơn vị cho `cn` với bảng ví dụ ở trên.
- [ ] `src/lib/utils.ts`: dùng `extendTailwindMerge` khai báo nhóm `font-size` gồm mọi token cỡ chữ trong `@theme` (đọc đúng danh sách từ `src/index.css`, không đoán).
- [ ] Rà các chỗ đã né lỗi (ví dụ cỡ chữ đặt ở khung trong `LanguageSwitch`) — giữ hoặc đơn giản hoá sau khi sửa.
- [ ] Nếu thêm token cỡ chữ mới vào `@theme` sau này thì phải thêm vào cấu hình merge: ghi quy tắc này vào AGENTS.md mục 4.

## Tiêu chí nghiệm thu

- [ ] Ba ví dụ trong bảng giữ nguyên cả màu chữ lẫn cỡ chữ.
- [ ] Nút primary và danger render có `text-white`; secondary và ghost có `text-text`.
- [ ] `pnpm test`, `pnpm lint`, `pnpm build` xanh; ảnh chụp nút ở `/thanh-phan` đúng màu (kiểm tay hoặc E2E sau LM-005).

---
id: LM-071
title: i18n đợt 2 — kho, tài xế, người dùng, đăng nhập, design system
phase: 5
labels: [i18n]
depends_on: [LM-070, LM-060, LM-061]
estimate: 1.5d
prd: [D-08]
---

# LM-071 — i18n đợt 2

## Việc cần làm

- [ ] Dịch `features/warehouse`, `features/driver`, `features/admin`, `features/auth` (phần còn lại), `app/design-system` (`/kieu-dang`, `/thanh-phan`).
- [ ] Nút chuyển ngôn ngữ có trên header màn kho và tài xế, đạt vùng chạm 56px.
- [ ] Kiểm tra tràn chữ trên tablet kho và điện thoại tài xế.
- [ ] Bật test phát hiện chuỗi cứng (LM-070) cho toàn `src/`.

## Tiêu chí nghiệm thu

- [ ] Không còn chuỗi tiếng Việt cứng trong JSX của `src/` (test xanh).
- [ ] E2E kho và tài xế chạy được với `?lang=en`.

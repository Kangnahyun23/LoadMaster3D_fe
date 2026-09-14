---
id: LM-070
title: i18n đợt 1 — dịch phần còn lại của nav và các màn luồng Spec
phase: 5
labels: [i18n]
depends_on: [LM-054]
estimate: 1.5d
prd: [D-08]
---

# LM-070 — i18n đợt 1 (phần còn lại)

## Bối cảnh

Màn mới ở phase 3 đã viết bằng `t()`. Còn chuỗi cứng trong các phần giữ lại của Dashboard, danh sách/chi tiết/form chuyến, Planner 3D (toolbar, HUD, inspector, timeline, editor, operations, dialog duyệt), NotFound.

## Việc cần làm

- [ ] Quét chuỗi tiếng Việt cứng trong `app/`, `features/manager`, `features/trips`, `features/optimization`, `features/viewer3d`, `components/` và chuyển vào từ điển.
- [ ] Nhãn aria, `title`, `sr-only` cũng dịch.
- [ ] Ngoại lệ không dịch: badge **MOCK RESULT**; màn So sánh giữ thuật ngữ thuật toán theo AGENTS mục 6.
- [ ] Kiểm tra tràn chữ tiếng Anh ở header 56/72px, nút 40/56px, chip, timeline, phone 390px.
- [ ] Script/test phát hiện chuỗi có dấu tiếng Việt trong JSX ngoài từ điển.

## Tiêu chí nghiệm thu

- [ ] `?lang=en` đi hết luồng Spec không còn chữ tiếng Việt (trừ tên riêng trong dữ liệu).
- [ ] Ảnh chụp en ở desktop/tablet không tràn chữ.

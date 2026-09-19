---
id: LM-094
title: Planner gọn — một hàng điều khiển, ẩn Duyệt khi đã duyệt, lý do chặn trong nút
phase: 6
labels: [viewer3d, ux]
depends_on: [LM-084, LM-088]
estimate: 1.5d
prd: [D-51]
---

# LM-094 — Planner gọn

## Việc cần làm

- [ ] Gộp header và `WorkspaceToolbar` thành một hàng điều khiển ở desktop (≥ 1.366 px); tablet giữ hai hàng 56 px.
- [ ] Revision đã duyệt, không draft: bỏ nút Duyệt, hiện "Đã duyệt lúc …"; có draft thì nút "Duyệt bản chỉnh".
- [ ] Lý do chặn Duyệt nằm trong hộp thoại/tooltip của nút, không chen chữ đỏ ở header (U-5).
- [ ] Chuyến bị khoá (LM-088) hoặc người dùng chỉ đọc: không có Chỉnh sửa, không Duyệt, nói lý do một lần.
- [ ] `<select>` gốc ở thanh công cụ desktop đổi sang `Select` dùng chung (U-6).

## Tiêu chí nghiệm thu

- [ ] E2E viewer hiện có vẫn xanh (sửa selector theo bố cục mới); ảnh 1.366 và 1.600 px không tràn.

---
id: LM-096
title: Hồ sơ cá nhân và đổi mật khẩu
phase: 6
labels: [auth, account]
depends_on: [LM-082, LM-084]
estimate: 0.5d
prd: [D-42]
---

# LM-096 — Hồ sơ

## Việc cần làm

- [ ] `/ho-so`: họ tên, số điện thoại sửa được; email, vai trò, kho trực thuộc chỉ đọc.
- [ ] Đổi mật khẩu: hiện tại, mới (≥ 8 ký tự), nhập lại; sai mật khẩu hiện tại báo tại ô.
- [ ] Mục "Hồ sơ" trong menu tài khoản của nav rail; màn kho và tài xế có menu tài khoản ở danh sách chuyến.

## Tiêu chí nghiệm thu

- [ ] E2E: đổi mật khẩu → đăng xuất → mật khẩu cũ bị từ chối, mật khẩu mới vào được.

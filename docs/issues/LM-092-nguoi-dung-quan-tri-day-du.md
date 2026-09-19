---
id: LM-092
title: Người dùng — Query, lọc, khoá/mở, xoá, đặt lại mật khẩu, ma trận quyền
phase: 6
labels: [admin]
depends_on: [LM-083, LM-084, LM-085]
estimate: 1.5d
prd: [D-41, D-42, D-52]
---

# LM-092 — Người dùng

## Việc cần làm

- [ ] `users-api.ts` + `useUsersQuery` + mutation; gỡ `users.mock.ts` và `useState` (nợ AGENTS mục 9).
- [ ] Tìm, lọc vai trò/trạng thái, sắp xếp, phân trang.
- [ ] Menu thao tác mỗi dòng: Sửa, Khoá/Mở khoá, Đặt lại mật khẩu (hộp thoại hiện mật khẩu tạm một lần + nút sao chép), Xoá (xác nhận).
      Không tự khoá/xoá mình, không xoá quản trị cuối cùng — nút bị chặn kèm lý do.
- [ ] Tab "Ma trận quyền" chỉ đọc, dựng từ `ROLE_PERMISSIONS`.

## Tiêu chí nghiệm thu

- [ ] E2E: quản trị tạo tài khoản tài xế → đăng xuất → đăng nhập tài khoản mới → vào `/tai-xe`; khoá tài khoản → đăng nhập báo khoá.

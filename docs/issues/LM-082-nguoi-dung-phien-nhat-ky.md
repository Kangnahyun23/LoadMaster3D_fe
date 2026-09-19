---
id: LM-082
title: Kho mock — người dùng, mật khẩu, phiên và nhật ký sự kiện
phase: 6
labels: [data, mock-db, auth, audit]
depends_on: [LM-081]
estimate: 1.5d
prd: [D-42, D-43]
---

# LM-082 — Người dùng, phiên, nhật ký

## Việc cần làm

- [ ] Kho giữ người dùng và mật khẩu (mật khẩu không bao giờ trả ra): `authenticate`, `listUsers`, `getUser`, `createUser`,
      `updateUser`, `deleteUser`, `setUserStatus`, `resetPassword` (trả mật khẩu tạm một lần), `changePassword`.
      Luật: email duy nhất; không tự xoá/khoá mình; không xoá/khoá quản trị cuối cùng.
- [ ] Phiên của kho (`setSession`, `sessionUser`) như cookie server: `auth-api.ts` đăng nhập/đăng xuất qua kho;
      `AuthProvider` khôi phục phiên kho khi đọc `sessionStorage`. `auth.mock.ts` chỉ còn mật khẩu demo.
- [ ] `tripDriver` phải là người dùng vai trò tài xế, đang hoạt động (`DRIVER_INVALID`).
- [ ] Nhật ký: mọi hàm ghi (xe, chuyến, điểm giao, kiện, revision, Duyệt, kho, giao hàng, người dùng, đăng nhập) thêm
      `{ id, at, actorId, action, target: { type, id }, params }`; `listEvents()` mới nhất trước. Kho không lưu câu chữ.
- [ ] Nhánh từ điển `audit` dịch mọi `action`.

## Tiêu chí nghiệm thu

- [ ] Tài khoản quản trị tạo mới đăng nhập được; bị khoá thì báo khoá; đặt lại mật khẩu thì mật khẩu cũ hết hiệu lực.
- [ ] Test: mỗi hàm ghi sinh đúng một sự kiện với người làm là phiên hiện tại.

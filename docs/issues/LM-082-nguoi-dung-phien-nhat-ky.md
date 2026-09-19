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

- [x] Kho giữ người dùng và mật khẩu (mật khẩu không bao giờ trả ra): `authenticate`, `listUsers`, `getUser`, `createUser`,
      `updateUser`, `deleteUser`, `setUserStatus`, `resetPassword` (trả mật khẩu tạm một lần), `changePassword`.
      Luật: email duy nhất; không tự xoá/khoá mình; không xoá/khoá quản trị cuối cùng.
- [x] Phiên của kho (`setSession`, `sessionUser`) như cookie server: `auth-api.ts` đăng nhập/đăng xuất qua kho;
      `AuthProvider` khôi phục phiên kho khi đọc `sessionStorage`. `auth.mock.ts` chỉ còn mật khẩu demo.
- [x] `tripDriver` phải là người dùng vai trò tài xế, đang hoạt động (`DRIVER_INVALID`).
- [x] Nhật ký: mọi hàm ghi (xe, chuyến, điểm giao, kiện, revision, Duyệt, kho, giao hàng, người dùng, đăng nhập) thêm
      `{ id, at, actorId, action, target: { type, id }, params }`; `listEvents()` mới nhất trước. Kho không lưu câu chữ.
- [x] Nhánh từ điển `audit` dịch mọi `action`.

## Tiêu chí nghiệm thu

- [x] Tài khoản quản trị tạo mới đăng nhập được; bị khoá thì báo khoá; đặt lại mật khẩu thì mật khẩu cũ hết hiệu lực.
- [x] Test: mỗi hàm ghi sinh đúng một sự kiện với người làm là phiên hiện tại.

## Kết quả (19/09/2026)

Kho giữ `users` + `passwords` (không trả ra ngoài) và `session`. `auth-api.ts` đăng nhập/đăng xuất qua kho; `AuthProvider` xác nhận lại
phiên `sessionStorage` bằng `restoreSession` (tài khoản bị khoá/xoá → coi như chưa đăng nhập) và có `refreshUser()` cho LM-096.
`auth.mock.ts` chỉ còn gợi ý tài khoản demo lấy từ seed. Mật khẩu tạm 10 ký tự bỏ ký tự dễ nhầm.

Nhật ký: 28 mã hành động (`AUDIT_ACTIONS`), mỗi hàm ghi thêm đúng một sự kiện với người làm là phiên; lưu lại không đổi gì thì không ghi.
Đăng nhập sai ghi `auth.signInFailed` không có người làm. `listEvents({ from, to, actorId, targetId })` lọc theo ngày giờ Việt Nam.
Nhánh từ điển `audit` (câu cho từng mã) để LM-091 thêm cùng màn nhật ký.

Test: `users.test.ts` (9 ca: đăng nhập, sai/khoá, tạo tài khoản, đặt lại/đổi mật khẩu, tự khoá/quản trị cuối/tài xế còn chuyến,
khôi phục phiên, hồ sơ, mỗi hàm ghi một sự kiện, lọc nhật ký).

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

- [x] `users-api.ts` + `useUsersQuery` + mutation; gỡ `users.mock.ts` và `useState` (nợ AGENTS mục 9).
- [x] Tìm, lọc vai trò/trạng thái, sắp xếp, phân trang.
- [x] Menu thao tác mỗi dòng: Sửa, Khoá/Mở khoá, Đặt lại mật khẩu (hộp thoại hiện mật khẩu tạm một lần + nút sao chép), Xoá (xác nhận).
      Không tự khoá/xoá mình, không xoá quản trị cuối cùng — nút bị chặn kèm lý do.
- [x] Tab "Ma trận quyền" chỉ đọc, dựng từ `ROLE_PERMISSIONS`.

## Tiêu chí nghiệm thu

- [x] E2E: quản trị tạo tài khoản tài xế → đăng xuất → đăng nhập tài khoản mới → vào `/tai-xe`; khoá tài khoản → đăng nhập báo khoá.

## Kết quả (19/09/2026)

### Đã làm

- **Lớp dữ liệu**: `users-api.ts` (`fetchUsers`, `createUser`, `updateUser`, `setUserStatus`, `deleteUser`, `resetPassword` → kho) +
  `useUsersQuery.ts` (query `['users']`, 5 mutation; mọi ghi làm mới `['users']` và `['audit']` vì mỗi thao tác thêm một sự kiện nhật ký).
  Gỡ `users.mock.ts` và `useState` giữ danh sách — màn Người dùng hết nợ AGENTS mục 9.
- **Danh sách** (`UsersTable` + `user-columns.tsx`): `FilterBar` + `DataTable` + `useListUrlState` — tìm theo tên, email, số điện thoại
  (có hay không có dấu cách), mã, kho; lọc `vai-tro`, `trang-thai` trên URL; sắp xếp tên (mặc định), vai trò (theo tên hiển thị của ngôn
  ngữ), kho, hoạt động gần nhất (mới nhất trước); phân trang 25/50/100; rỗng vì lọc có "Xoá lọc". Bỏ bấm cả dòng để sửa (không dùng được
  bằng bàn phím) — thay bằng menu.
- **Menu mỗi dòng** (`UserRowMenu`, nút `Thao tác cho <tên>`): Sửa thông tin, Khoá/Mở khoá, Đặt lại mật khẩu, Xoá tài khoản. Thao tác kho
  sẽ từ chối được chặn trước bằng `accountGuards` (hàm thuần, cùng luật `SELF_CHANGE_FORBIDDEN`/`LAST_ADMIN` của kho): mục mờ, không bấm được,
  lý do ngay dưới nhãn ("Không áp dụng cho tài khoản bạn đang đăng nhập", "Hệ thống cần ít nhất một quản trị viên đang hoạt động"). Luật
  cần dữ liệu khác (tài xế còn chuyến chưa kết thúc) để kho trả lỗi → toast `dataErrorMessage` ("Tài xế này đang được gán cho chuyến …").
- **Thêm/sửa** (`UserFormDialog`): gắn khi mở, `key` theo người dùng → mỗi lần mở là form mới (bỏ `useEffect` reset). Bỏ trường Trạng
  thái (khoá/mở là thao tác riêng; tài khoản mới luôn hoạt động). Số điện thoại lưu dạng hiển thị của kho "0915 111 222" nên mở form
  rồi lưu không đổi gì thì kho không thấy thay đổi. Vai trò của chính mình / quản trị viên cuối hiện chỉ đọc kèm lý do. Lỗi kho (email trùng…)
  hiện `role="alert"` trong hộp thoại, dữ liệu đang nhập giữ nguyên. Sửa chính mình thì `refreshUser()` để nav rail đổi tên.
  Bỏ câu hứa giả "Email đặt mật khẩu đã được gửi" (không có email — D-20).
- **Mật khẩu tạm** (`TemporaryPasswordDialog`): sau khi tạo tài khoản hoặc đặt lại mật khẩu (có hộp thoại xác nhận), hiện một lần trong ô
  chỉ đọc (font mono, tự chọn chữ khi focus) + nút "Sao chép" (`navigator.clipboard`, trình duyệt chặn thì báo chép tay) + "Xong".
- **Xoá**: `ConfirmDialog` (dùng lại của `features/fleet`, nút `danger`), toast sau khi kho xoá.
- **Ma trận quyền** (`PermissionMatrix`, tab thứ hai): `DataTable` 13 quyền × 5 vai trò dựng từ `PERMISSIONS`/`can()` của
  `features/auth/permissions.ts`; ô có quyền dấu tích `--success`, không có là gạch; `sr-only` "Có"/"Không"; nhãn quyền ở
  `admin.permissions.labels.<nhóm>.<quyền>` (thiếu nhãn là lỗi `tsc`).
- `useUserActions.ts`: hộp thoại đang mở (trạng thái giao diện) + các mutation; toast chỉ báo việc kho đã làm.
- **Sửa ngoài phạm vi, phát hiện khi làm**: `components/ui/Select.tsx` — danh sách của Select nằm `z-50`, dưới lớp phủ Dialog `z-300`, nên
  Select trong hộp thoại (chọn vai trò khi thêm người dùng) không bấm được trên trình duyệt thật (jsdom không phát hiện). Đổi thành `z-400`.

### File

`src/features/admin/`: `UsersPage.tsx`, `UsersTable.tsx`, `user-columns.tsx`, `UserRowMenu.tsx`, `UserFormDialog.tsx`,
`TemporaryPasswordDialog.tsx`, `PermissionMatrix.tsx`, `account-guards.ts`, `useUserActions.ts`, `users-api.ts`, `useUsersQuery.ts`,
`user-form.schema.ts` · gỡ `users.mock.ts` · `src/components/ui/Select.tsx` (z-index) · `src/lib/i18n/{vi,en}/admin.ts`
· `e2e/admin-users.spec.ts`.

### Kiểm thử

- Unit `account-guards.test.ts` (3): chính mình; quản trị viên hoạt động cuối; còn quản trị viên khác / tài khoản thường / quản trị đã khoá.
- DOM `UsersPage.dom.test.tsx` (9, kho seed): lọc `?vai-tro=driver` (4 tài xế theo thứ tự chữ cái); lọc đã khoá, xoá lọc, tìm số điện
  thoại không dấu cách; tạo tài khoản → mật khẩu tạm 10 ký tự, sao chép vào clipboard, đăng nhập kho được bằng nó; menu của chính mình bị
  chặn kèm lý do; khoá rồi mở khoá; đặt lại mật khẩu (mật khẩu cũ hết hiệu lực, mới dùng được); xoá có xác nhận + tài xế còn chuyến bị từ
  chối kèm lý do; sửa với email trùng (lỗi trong hộp thoại) rồi lưu được; ma trận quyền (dòng "Xuất báo cáo" chỉ quản lý và quản trị có).
- E2E `e2e/admin-users.spec.ts` (1, desktop): quản trị thêm tài xế → đọc mật khẩu tạm → đăng xuất bằng menu tài khoản → đăng nhập tài khoản
  mới → `/tai-xe/diem-giao` → đăng xuất → quản trị tìm và khoá tài khoản → đăng nhập lại báo "Tài khoản đã bị khoá. Liên hệ quản trị hệ thống.".

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 101 file / 641 test ✅ · `E2E_PORT=5194 pnpm exec playwright test
e2e/admin-users.spec.ts e2e/admin-audit.spec.ts e2e/manager-dashboard.spec.ts e2e/rbac.spec.ts` 6/6 ✅.
`e2e/spec-flow.spec.ts` desktop "dashboard to approved plan…" đỏ **từ trước** ở bước Đội xe (chờ `VEHICLE-005`, seed LM-083 có 8 xe nên xe mới
là `VEHICLE-009`) — chưa tới bảng điều khiển, không thuộc phạm vi các issue này.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 9 "Lớp dữ liệu": bỏ câu "Màn nào còn giữ dữ liệu ở `useState` (Người dùng)…" — *(LM-092) Người dùng đã chuyển sang `users-api.ts` →
  `useUsersQuery` + mutation; không còn màn nào giữ dữ liệu nghiệp vụ ở `useState`.*
- Mục 5 "Nút"/thành phần, thêm: *Hành động bị chặn vì luật (tự khoá mình, quản trị viên cuối…) hiện mờ kèm lý do ngay tại chỗ, không để
  bấm rồi mới báo lỗi; luật cần dữ liệu khác thì để kho trả mã và hiện bằng `dataErrorMessage`.*
- Mục 5: *Lớp nổi mở từ trong hộp thoại (Select) phải cao hơn lớp phủ Dialog (`z-300`): `SelectContent` dùng `z-400`.*
- Mục 3: `ConfirmDialog` nay dùng ở hai feature (đội xe, người dùng) — đề xuất chuyển lên `components/` khi gộp (issue này không được sửa
  `features/fleet`).

### Sửa sau review độc lập (19/09/2026, `d52a88b`)

Review độc lập phát hiện: huỷ hộp thoại tạo tài khoản / đặt lại mật khẩu trong lúc kho đang ghi không dừng thao tác, rồi hộp thoại mật
khẩu tạm bật lên sau khi người dùng tưởng đã huỷ; xoá xong có thể đóng nhầm hộp thoại khác mở sau đó. Sửa: hộp thoại không đóng được khi
`pending`/`isSubmitting` (Esc, bấm nền, nút Huỷ); kết quả sửa/xoá chỉ đóng đúng hộp thoại đã gửi thao tác (cập nhật state theo hàm).
Test DOM "đặt lại mật khẩu" thêm bước Esc khi đang chạy — đỏ khi bỏ bản sửa, xanh khi có.

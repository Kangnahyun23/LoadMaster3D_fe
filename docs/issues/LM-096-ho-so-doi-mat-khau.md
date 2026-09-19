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

- [x] `/ho-so`: họ tên, số điện thoại sửa được; email, vai trò, kho trực thuộc chỉ đọc.
- [x] Đổi mật khẩu: hiện tại, mới (≥ 8 ký tự), nhập lại; sai mật khẩu hiện tại báo tại ô.
- [x] Mục "Hồ sơ" trong menu tài khoản của nav rail; màn kho và tài xế có menu tài khoản ở danh sách chuyến.

## Tiêu chí nghiệm thu

- [x] E2E: đổi mật khẩu → đăng xuất → mật khẩu cũ bị từ chối, mật khẩu mới vào được.

## Kết quả (20/09/2026)

### Đã làm

- [x] **`/ho-so`** (`ProfilePage`, trong `AppShell`, không cần quyền riêng — mọi người đã đăng nhập): mục "Thông tin cá nhân" sửa họ tên
  và số điện thoại (react-hook-form + zod, `saveProfile` → `updateProfile` của kho rồi `refreshUser()` nên tên trên nav rail/menu đổi ngay;
  làm mới mọi query vì tên người hiện ở danh sách người dùng, chuyến, nhật ký). Số điện thoại lưu dạng hiển thị của kho "0987 654 321".
  Nút "Lưu thay đổi" (primary duy nhất của màn) tắt khi chưa sửa gì. Email, vai trò, kho trực thuộc hiện chỉ đọc (`<dl>`, ô nền surface).
- [x] **Đổi mật khẩu** (`PasswordForm`, nút phụ): hiện tại, mới (≥ `MIN_PASSWORD_LENGTH` lấy từ kho, gợi ý "Ít nhất 8 ký tự"), nhập lại.
  Kho trả `PASSWORD_INCORRECT` → lỗi tại ô "Mật khẩu hiện tại" (`aria-invalid`, con trỏ quay về ô); lỗi kho khác hiện `role="alert"` bằng
  `dataErrorMessage`. Đổi xong xoá cả ba ô, toast "Đã đổi mật khẩu" (việc kho đã làm).
- [x] **Menu tài khoản**: nav rail thêm mục "Hồ sơ cá nhân" (link `/ho-so`) trước "Đăng xuất". Màn danh sách kho (`/kho`) và "Chuyến của
  tôi" (`/tai-xe`) thêm nút tài khoản 56px (`features/auth/AccountMenu.tsx`, chữ viết tắt, nhãn "Tài khoản {tên}") mở menu cỡ cảm ứng
  (mục 56px, chữ 16px): Hồ sơ cá nhân, Đăng xuất. Nút thoát cũ giữ nguyên.
- Ô nhập và nút của `/ho-so` cao 56px, chữ 16px khi con trỏ là ngón tay (`pointer-coarse:`) vì nhân viên kho và tài xế mở màn này trên máy
  cảm ứng.
- Dùng chung: kiểm và định dạng số điện thoại chuyển lên `src/lib/phone.ts` (`PHONE_PATTERN`, `phoneDigits`, `formatPhone`) — form tài
  khoản của quản trị (`features/admin/user-form.schema.ts`) và hồ sơ cùng dùng (mục 3: hai feature dùng chung).

### File

`src/features/profile/`: `ProfilePage.tsx`, `ProfileDetailsForm.tsx`, `PasswordForm.tsx`, `profile-form.schema.ts`, `profile-api.ts`,
`useProfileMutations.ts`, `profile-styles.ts` · `src/features/auth/AccountMenu.tsx` · `src/lib/phone.ts` · `src/app/App.tsx` (route `/ho-so`)
· `src/app/NavRail.tsx` (mục menu) · `src/features/warehouse/WarehouseTripsPage.tsx`, `src/features/driver/MyTripsPage.tsx` (nút tài khoản)
· `src/features/admin/user-form.schema.ts` (dùng `lib/phone`) · `src/lib/i18n/{vi,en}/profile.ts` (nhánh mới), `{vi,en}/nav.ts` (`nav.profile`).

### Kiểm thử

- DOM `ProfilePage.dom.test.tsx` (3): giá trị hiện tại + ba ô chỉ đọc; lưu họ tên/số điện thoại → kho, phiên của tab và ô số điện thoại đổi
  theo, nút Lưu tắt lại; họ tên rỗng và số điện thoại sai báo tại ô, kho không đổi; đổi mật khẩu: mới quá ngắn, nhập lại không khớp, sai
  mật khẩu hiện tại (lỗi tại ô, focus), thành công xoá form, kho từ chối mật khẩu cũ và nhận mật khẩu mới.
- DOM `AccountMenu.dom.test.tsx` (2): nút 56px, menu cỡ cảm ứng mở `/ho-so`; đăng xuất về `/dang-nhap`, kho hết phiên.
- DOM sửa/thêm: `NavRail.dom.test.tsx` (gom `renderRail`, +1: menu có "Hồ sơ cá nhân" → `/ho-so`), `WarehouseTripsPage.dom.test.tsx` và
  `MyTripsPage.dom.test.tsx` (+1 dòng: nút tài khoản 56px).
- E2E `e2e/profile.spec.ts` (1, desktop): điều phối mở Hồ sơ từ menu tài khoản → đổi mật khẩu → đăng xuất bằng menu → mật khẩu cũ báo
  "Email hoặc mật khẩu không đúng" → mật khẩu mới vào `/chuyen`.

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 119 file / 735 test ✅ · `E2E_PORT=5196 pnpm exec playwright test
e2e/profile.spec.ts` 1/1 ✅.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 1 "Trạng thái hiện tại": thêm *`/ho-so` (LM-096) cho mọi người đã đăng nhập, mở từ menu tài khoản của nav rail hoặc nút tài khoản
  56px ở màn chính của kho/tài xế.*
- Mục 5 "Nút": *màn trong `AppShell` mà nhân viên kho/tài xế cũng mở (hồ sơ) dùng `pointer-coarse:h-14 pointer-coarse:text-body-lg` cho ô
  nhập và nút, thay vì ép 56px trên desktop.*

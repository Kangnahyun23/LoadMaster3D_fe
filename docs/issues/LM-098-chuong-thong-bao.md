---
id: LM-098
title: Chuông thông báo trong app theo vai trò
phase: 6
labels: [notifications]
depends_on: [LM-082, LM-084]
estimate: 1d
prd: [D-55]
---

# LM-098 — Thông báo

## Việc cần làm

- [x] Nút chuông ở nav rail, số chưa đọc; popover danh sách sự kiện nhật ký liên quan vai trò
      (điều phối: xếp xong, kiện thiếu, sự cố giao, hoàn thành; quản lý: hoàn thành, huỷ; quản trị: sự kiện người dùng).
- [x] Bấm thông báo mở đối tượng; "Đánh dấu đã đọc" giữ trong phiên. Không toast giả, không hứa đồng bộ.

## Tiêu chí nghiệm thu

- [x] E2E: kho báo thiếu kiện → điều phối thấy thông báo mới dẫn tới chi tiết chuyến.

## Kết quả (20/09/2026)

### Đã làm

- [x] **Nguồn**: thông báo là sự kiện nhật ký kho đã ghi, không có bảng riêng. `notifications.ts` (hàm thuần): loại sự kiện theo vai trò —
  điều phối: xếp xong, báo thiếu kiện, sự cố giao, hoàn thành chuyến, huỷ chuyến; quản lý: hoàn thành, huỷ; quản trị: mọi sự kiện
  `user.*` và đăng nhập không thành công (không gồm đăng nhập thường); kho, tài xế: không có. Bỏ việc chính mình làm (`actorId`), chỉ 7
  ngày gần nhất, tối đa 20, giữ thứ tự mới nhất trước của kho.
- [x] **Dữ liệu**: `notifications-api.ts` (`listEvents` từ ngày đầu cửa sổ + tên chuyến/người dùng hiện tại) → `useNotificationsQuery`
  (`['notifications', id, role]`, `skipToken` khi vai trò không có thông báo, làm mới mỗi phút khi tab mở, mở chuông là `refetch`).
- [x] **Chuông** (`NotificationBell`, trên nút ngôn ngữ của nav rail; nút dùng chung `components/NavRailButton.tsx` cùng hình mục nav):
  số chưa đọc trên icon (pill `--danger`, "9+" khi quá 9), nhãn đọc "Thông báo, {n} chưa đọc". DropdownMenu (Radix, dùng được bằng bàn phím):
  mỗi dòng nhãn hành động (`audit.actions.*` qua `describeEvent` của nhật ký — dùng lại, không dịch lại), đối tượng "tên · mã", giờ trong
  `<time datetime>` (kèm ngày nếu không phải hôm nay); chưa đọc có chấm, chữ đậm và `sr-only` "Chưa đọc". Bấm/Enter mở đối tượng (chuyến →
  `/chuyen/<mã>`, người dùng → `/nguoi-dung?q=<mã>`) và đánh dấu đã đọc; đối tượng không còn trang (email lạ) chỉ đánh dấu đã đọc.
  "Đánh dấu đã đọc" giữ danh sách mở. Rỗng/lỗi/đang tải nói rõ; chân danh sách nói phạm vi ("7 ngày gần nhất, không gồm việc bạn làm").
  Không toast, không hứa đồng bộ.
- [x] **Đã đọc giữ trong phiên**: `read-state.ts` — trạng thái giao diện trong bộ nhớ của tab theo người dùng (`useSyncExternalStore`),
  qua được đổi màn (kể cả sang màn kho rồi quay lại), mất khi tải lại trang cùng kho in-memory. Không `localStorage`.

### File

`src/features/notifications/`: `notifications.ts`, `notifications-api.ts`, `useNotificationsQuery.ts`, `read-state.ts`, `NotificationBell.tsx`,
`NotificationItem.tsx` · `src/components/NavRailButton.tsx` · `src/app/NavRail.tsx` (chuông trên nút ngôn ngữ) · `src/lib/i18n/{vi,en}/notifications.ts`
(nhánh mới) · test cũ: `src/app/NavRail.dom.test.tsx`, `src/features/auth/LoginPage.dom.test.tsx` (bọc `QueryClientProvider` vì nav rail đọc kho).

### Kiểm thử

- Unit `notifications.test.ts` (5): điều phối (bỏ việc của mình, bỏ loại không báo, mốc đúng 7 ngày còn, quá mốc bỏ); quản lý; quản trị
  (sự kiện tài khoản của người khác + đăng nhập sai, bỏ đăng nhập thường và việc của mình); kho/tài xế không có chuông; tối đa 20, mới nhất trước.
- DOM `NotificationBell.dom.test.tsx` (3, seed neo 14/09, giả `Date` 18:00): điều phối thấy đúng 4 thông báo seed theo thứ tự, mũi tên +
  Enter mở `/chuyen/TRIP-008` và số chưa đọc 4 → 3, "Đánh dấu đã đọc" giữ danh sách mở và xoá số; quản lý: điều phối viên huỷ chuyến
  (đổi phiên kho) → mở chuông đọc lại có "Huỷ chuyến" ở đầu; quản trị: rỗng, rồi đăng nhập sai bằng email lạ (dòng không liên kết) và
  nhân viên kho đổi mật khẩu (→ `/nguoi-dung?q=US-0003`).
- DOM `NavRail.dom.test.tsx` +5: chuông chỉ có ở điều phối, quản lý, quản trị.
- E2E `e2e/notifications.spec.ts` (1, desktop): nhân viên kho (không có chuông) bắt đầu xếp và báo thiếu kiện `TRIP-2026-0914` → đăng xuất
  bằng nút tài khoản → điều phối đăng nhập, mở chuông: "Báo thiếu kiện ở kho" đứng đầu, chưa đọc → bấm mở chi tiết chuyến.

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 121 file / 748 test ✅ · `E2E_PORT=5196 pnpm exec playwright test
e2e/notifications.spec.ts` 1/1 ✅.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 3: `describeEvent`/`AuditDirectory` (`features/admin/audit-log.ts`) nay dùng ở hai feature (nhật ký, thông báo) — đề xuất chuyển lên
  `lib/` khi gộp (issue này không đổi file của nhật ký).
- Mục 9 "Dữ liệu dùng chung": thêm *trạng thái "đã đọc" của thông báo là trạng thái giao diện trong bộ nhớ tab (`read-state.ts`), không
  phải store nghiệp vụ; có backend thì về server.*
- Mục 5: *nút hành động trên nav rail (không phải liên kết) dùng `components/NavRailButton.tsx` để cùng hình mục nav.*

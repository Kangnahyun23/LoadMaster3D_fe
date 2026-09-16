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

- [x] Dịch `features/warehouse`, `features/driver`, `features/admin`, `features/auth` (phần còn lại), `app/design-system` (`/kieu-dang`, `/thanh-phan`).
- [x] Nút chuyển ngôn ngữ có trên header màn kho và tài xế, đạt vùng chạm 56px.
- [x] Kiểm tra tràn chữ trên tablet kho và điện thoại tài xế.
- [ ] Bật test phát hiện chuỗi cứng (LM-070) cho toàn `src/`. *(Phần LM-071 đã gỡ khỏi `PENDING`; phần còn lại là khối LM-070 — xong khi gộp với LM-070.)*

## Tiêu chí nghiệm thu

- [ ] Không còn chuỗi tiếng Việt cứng trong JSX của `src/` (test xanh). *(Xanh cho phạm vi LM-071; toàn `src/` hoàn tất sau khi gộp LM-070.)*
- [x] E2E kho và tài xế chạy được với `?lang=en`.

## Kết quả (16/09/2026)

- Cổng [no-hardcoded-vietnamese.test.ts](../../src/lib/i18n/no-hardcoded-vietnamese.test.ts): gỡ `/src/app/design-system/`, `/src/features/admin/`,
  `/src/features/warehouse/`, `/src/types/` khỏi `PENDING` (trước đó 292 dòng vi phạm trong phạm vi này, nay 0). Không thêm mục `ALLOWED` nào.
  `features/driver` và `features/auth` đã sạch từ trước; chỉ kiểm tra lại bản en.
- Từ điển: thêm nhánh `warehouse.header|card|finished|…` (vỏ màn kho, lớp phủ, toast bỏ qua) và hai nhánh mới cuối từ điển
  `admin.users` (cột, trạng thái, thiết bị theo vai trò, form, mã lỗi zod) và `designSystem` (hai trang bàn giao). Không đụng
  `common`, `viewer`, `trips`, `nav`, `optimization`, `manager`.
- [types/user.ts](../../src/types/user.ts): bỏ `ROLE_LABELS`, `ROLE_DEVICES`, `USER_STATUS_LABELS`; thay bằng `ROLES`, `USER_STATUSES` (nguồn cho
  type và `z.enum`). Tên hiển thị: `roles.<vai trò>`, `admin.users.status.*`, `admin.users.devices.*`. Schema người dùng giữ key từ điển làm
  message như form đăng nhập, dịch lúc hiển thị (`translateUserFormError`). Bảng người dùng dựng cột trong component, ngày giờ qua `useFormat()`.
- Nút chuyển ngôn ngữ `LanguageSwitch size="touch"` (56px) ở [StepHeader.tsx](../../src/features/warehouse/StepHeader.tsx) và header
  [DeliveryStopView.tsx](../../src/features/driver/DeliveryStopView.tsx) (dưới 400px ẩn icon để vừa 390px). Đổi ngôn ngữ không remount nên bước
  kho, điểm giao hiện tại và kiện đã đánh dấu giữ nguyên. Hai trang tài liệu cũng có nút chuyển (cỡ desktop) trên đầu trang.
- Design system: dữ liệu mẫu tiếng Việt (tên hàng, điểm giao, địa chỉ, loại xe, tên trục, câu mẫu thang chữ có dấu) chuyển sang
  [design-system.mock.ts](../../src/app/design-system/design-system.mock.ts); số mẫu (8.240 kg, 87,4%, kích thước) qua `useFormat()` thay chuỗi cứng.
- Tràn chữ: helper E2E `overflowingText` (chữ vượt khung, ra ngoài viewport hoặc rộng hơn nút chứa nó). Phát hiện và sửa: nút tròn 56px
  "Unloaded" của tài xế tràn khỏi vòng → en đổi thành "Done". Đổi luôn "optimisation" → "optimization" cho thống nhất.
- E2E: [warehouse.spec.ts](../../e2e/warehouse.spec.ts) thêm ca tablet `?lang=en` (Step 1, nút ngôn ngữ ≥ 56px, xác nhận → Step 2, chuyển VI giữa
  phiên vẫn bước 2 cùng kiện, chuyển lại EN; không tràn ở 820×1180 và 1024×768; đính kèm 2 ảnh). [driver-approved-plan.spec.ts](../../e2e/driver-approved-plan.spec.ts)
  thêm ca phone 390×844 `?lang=en` (Stop 1 / 4, đánh dấu hết, hoàn tất → Stop 2, đánh dấu một kiện, chuyển VI vẫn điểm 2 và kiện vẫn đánh dấu; 2 ảnh).
  Test DOM `useLoadingSession` bọc `I18nProvider`.
- Kiểm tra: `pnpm lint` sạch, `pnpm build` xanh, `pnpm test` 520/520 (82 file), `pnpm test:e2e` 52/52.
- Còn lại (ngoài phạm vi, thuộc LM-070): nhãn trong khung 3D của màn kho ("Hiện tại · Điểm 4", "Cửa sau · Hướng dỡ", nút "Chỉ kiện này") và
  `StatusBadge`, `stopLabel`, placeholder "Chọn…" của `SelectField` vẫn tiếng Việt khi `?lang=en`. `optionsFromLabels` (components/ui) không còn
  nơi gọi — để LM-070 quyết định gỡ.

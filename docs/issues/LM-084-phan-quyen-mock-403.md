---
id: LM-084
title: Phân quyền mock — ma trận quyền, chặn route, màn 403, nav theo quyền, quản lý chỉ đọc
phase: 6
labels: [auth, rbac, e2e]
depends_on: [LM-082]
estimate: 1.5d
prd: [D-41]
---

# LM-084 — Phân quyền

## Việc cần làm

- [x] `features/auth/permissions.ts`: danh sách quyền, `ROLE_PERMISSIONS` (quản trị toàn quyền; điều phối; quản lý chỉ đọc + xuất; kho; tài xế), `can()`, `useCan()`.
- [x] Route bọc `RequirePermission`; thiếu quyền → màn 403 (`ForbiddenPage`, nút về màn chính của vai trò). Nav rail chỉ hiện mục có quyền.
- [x] Quản lý xem chuyến/đội xe/Planner chỉ đọc: ẩn Tạo, Sửa, Chạy tối ưu, Duyệt, Chỉnh sửa, lưu kiện.
- [x] ~~`ROLE_HOME` tài xế đổi sang `/tai-xe`~~ → chuyển sang LM-087 (cùng lúc dựng màn danh sách, tránh vòng lặp thoát). Quản trị thoát màn kho/tài xế về trang chuyến như điều phối.
- [x] E2E: fixture `login(route, role)`; sửa các spec đang dùng tài khoản điều phối để mở kho/tài xế; spec mới kiểm nav từng vai trò và 403.

## Tiêu chí nghiệm thu

- [x] Tài xế mở `/nguoi-dung` thấy 403; quản trị mở được mọi màn; quản lý không thấy nút ghi nào.

## Kết quả (19/09/2026)

- `features/auth/permissions.ts`: 13 quyền, `ROLE_PERMISSIONS` (quản trị toàn quyền; điều phối: dashboard, chuyến, tối ưu, phương án, Duyệt,
  đội xe; quản lý: dashboard, xuất báo cáo, xem chuyến/phương án/đội xe; kho: `warehouse.operate`; tài xế: `driver.operate`), `can()`, `useCan()`.
- `app/App.tsx`: hàm `guarded(permission, routes)` bọc từng nhóm route bằng `RequirePermission`; thiếu quyền → `ForbiddenPage` (403,
  nút "Về màn chính" theo `ROLE_HOME`). `NotFoundPage` và `ForbiddenPage` dùng chung khung `ErrorScreen`; 404 nay về màn chính thay vì
  danh sách chuyến (vai trò kho/tài xế không mở được danh sách chuyến).
- Nav rail lọc mục theo quyền. Chỉ đọc (quản lý): ẩn Tạo chuyến, Tạo kế hoạch xếp, Chạy tối ưu, Đổi xe, kéo/xoá điểm giao, Thêm kiện,
  lưu/xoá/nhân bản kiện (panel kiện xem được, ô bị khoá), Thêm xe, Lưu/Xoá xe (form khoá), Duyệt, Chỉnh sửa, "Tới Thiết lập tối ưu".
  Các prop `readOnly`/`onAdd?`/`onEdit?`/`onApprove?` này LM-088 dùng lại cho khoá theo pha chuyến.
- Nút "Thêm kiện" ở thanh bảng kiện đổi sang secondary: màn chi tiết chuyến chỉ còn một primary (Chạy tối ưu).
- E2E: fixture `login(route, role = 'dispatcher')`; spec đi qua nhiều vai trò dùng `admin`, spec kho/tài xế dùng đúng vai trò;
  `spec-flow` đổi mã chuyến tạo mới `TRIP-001` → `TRIP-015` (seed LM-083). Spec mới `e2e/rbac.spec.ts` (3 test).

Kiểm tra: `tsc -b` ✅ · lint ✅ · `pnpm test` 579/579 ✅ (thêm `permissions.test.ts`, `RequirePermission.dom.test.tsx`, NavRail theo 5 vai trò)
· E2E `rbac` + `warehouse` + `driver-approved-plan` 10/10 ✅ (bộ E2E đầy đủ chạy ở mốc gộp đợt màn).

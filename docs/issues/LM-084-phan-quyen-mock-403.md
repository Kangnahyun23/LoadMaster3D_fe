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

- [ ] `features/auth/permissions.ts`: danh sách quyền, `ROLE_PERMISSIONS` (quản trị toàn quyền; điều phối; quản lý chỉ đọc + xuất; kho; tài xế), `can()`, `useCan()`.
- [ ] Route bọc `RequirePermission`; thiếu quyền → màn 403 (`ForbiddenPage`, nút về màn chính của vai trò). Nav rail chỉ hiện mục có quyền.
- [ ] Quản lý xem chuyến/đội xe/Planner chỉ đọc: ẩn Tạo, Sửa, Chạy tối ưu, Duyệt, Chỉnh sửa, lưu kiện.
- [ ] `ROLE_HOME` tài xế đổi sang `/tai-xe` (LM-087 dựng màn); nút thoát theo màn chính mới.
- [ ] E2E: fixture `login(route, role)`; sửa các spec đang dùng tài khoản điều phối để mở kho/tài xế; spec mới kiểm nav từng vai trò và 403.

## Tiêu chí nghiệm thu

- [ ] Tài xế mở `/nguoi-dung` thấy 403; quản trị mở được mọi màn; quản lý không thấy nút ghi nào.

---
id: LM-042
title: Xem trước 3D thùng xe và vật cản ở trang chi tiết xe
phase: 3
labels: [fleet, viewer3d, performance]
depends_on: [LM-033, LM-041]
estimate: 1d
prd: [D-17, D-34]
---

# LM-042 — Xem trước 3D xe

## Việc cần làm

- [ ] `viewer3d/VehiclePreviewViewer.tsx` dùng `SceneCanvas` (không có kiện), export để `fleet` lazy-load; không import `three` trong `features/fleet`.
- [ ] Đọc giá trị bằng `useWatch`, debounce 250 ms; chỉ đẩy vào scene khi phần xe/vật cản đó parse hợp lệ; nếu không, giữ hình hợp lệ gần nhất và hiện nhãn "Đang chờ giá trị hợp lệ".
- [ ] Camera chỉ fit lại khi kích thước thùng đổi; sửa vật cản không đổi góc nhìn người dùng.
- [ ] Tier `low` mặc định, `frameloop="demand"`, không trang trí cabin để nhẹ.
- [ ] Bấm dòng vật cản trong bảng thì vật cản đó được làm nổi trong 3D, và ngược lại.
- [ ] Skeleton SVG đẳng cự khi đang tải chunk 3D.

## Tiêu chí nghiệm thu

- [ ] Gõ "600" vào chiều dài không làm camera nhảy 3 lần; không có lỗi console khi giá trị trung gian không hợp lệ.
- [ ] Danh sách `/doi-xe` không tải chunk Three.js (kiểm bằng network trong E2E).

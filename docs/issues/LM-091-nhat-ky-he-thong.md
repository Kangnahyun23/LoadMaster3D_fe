---
id: LM-091
title: Nhật ký hệ thống /nhat-ky
phase: 6
labels: [admin, audit]
depends_on: [LM-083, LM-084, LM-085]
estimate: 1d
prd: [D-43, D-52]
---

# LM-091 — Nhật ký

## Việc cần làm

- [ ] `features/admin/audit-api.ts` + hook; màn `/nhat-ky` (quyền `audit.view`), mục nav "Nhật ký".
- [ ] Bảng: thời điểm, người làm, hành động (dịch mã), đối tượng (liên kết tới chuyến/xe/người dùng), chi tiết (tham số format theo locale).
- [ ] Lọc: khoảng ngày, người làm, nhóm hành động (chuyến, đội xe, tối ưu, kho, giao hàng, người dùng, đăng nhập), tìm theo mã đối tượng; phân trang.

## Tiêu chí nghiệm thu

- [ ] E2E: điều phối huỷ một chuyến → quản trị thấy sự kiện đó đầu nhật ký, lọc theo người làm ra đúng.

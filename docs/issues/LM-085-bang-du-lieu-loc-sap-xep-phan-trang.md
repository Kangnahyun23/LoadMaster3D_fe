---
id: LM-085
title: Bảng dữ liệu dùng chung — tìm, lọc, sắp xếp, phân trang, giữ trên URL
phase: 6
labels: [components, table]
depends_on: [LM-080]
estimate: 1d
prd: [D-52]
---

# LM-085 — DataTable có lọc, sắp xếp, phân trang

## Việc cần làm

- [ ] `DataTable` bật tính năng TanStack Table v9 khi màn cần: sắp xếp (tiêu đề là nút, `aria-sort`), phân trang (25/50/100, "x–y / n").
- [ ] `FilterBar` dùng chung: ô tìm, chọn một giá trị (Select), khoảng ngày; nút "Xoá lọc" khi có lọc.
- [ ] `useListUrlState`: trạng thái tìm/lọc/sắp xếp/trang trên URL (`?q=&trang-thai=&sap-xep=&trang=`), quay lại giữ nguyên.
- [ ] Trạng thái "không có kết quả khớp lọc" khác trạng thái rỗng.
- [ ] Mẫu trên `/thanh-phan`.

## Tiêu chí nghiệm thu

- [ ] DOM test: sắp xếp, lọc, đổi trang, URL đồng bộ; bàn phím dùng được toàn bộ.

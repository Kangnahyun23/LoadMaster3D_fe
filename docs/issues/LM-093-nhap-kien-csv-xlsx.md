---
id: LM-093
title: Nhập kiện từ CSV và .xlsx — file mẫu, xem trước, lỗi theo dòng
phase: 6
labels: [trips, import]
depends_on: [LM-088]
estimate: 1.5d
prd: [D-49]
spec: [9.3]
---

# LM-093 — Nhập kiện từ file

## Việc cần làm

- [ ] Nút phụ "Nhập từ file" ở bảng kiện (chỉ khi được sửa chuyến). Hộp thoại: chọn file `.csv`/`.xlsx`, tải file mẫu (cả hai dạng).
- [ ] Cột cố định theo tên trường `CargoPackage` (nhận cả tiêu đề vi/en), `allowedOrientations` dạng `LWH|WLH`.
- [ ] Xem trước: từng dòng qua `packageSchema` + validation domain; lỗi hiện theo dòng bằng câu dịch từ mã. Mã trùng (trong file hoặc với kiện có sẵn) là lỗi dòng.
- [ ] Nút "Nhập N dòng hợp lệ" (bỏ dòng lỗi, nói rõ số dòng bỏ). Kho: `importPackages` — một lần tăng `inputVersion`, một sự kiện nhật ký.
- [ ] `read-excel-file` tải lười khi mở file .xlsx. AGENTS mục 2 thêm thư viện.

## Tiêu chí nghiệm thu

- [ ] Unit test phân tích CSV (dấu phẩy thập phân, BOM, dòng trống) và map lỗi; E2E nhập file mẫu có 1 dòng lỗi.

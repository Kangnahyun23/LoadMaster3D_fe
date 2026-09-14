---
id: LM-044
title: Bảng kiện chỉ đọc, ảo hoá dòng, tổng hợp thể tích và khối lượng
phase: 3
labels: [trips, table, performance]
depends_on: [LM-017, LM-028, LM-043]
estimate: 1d
prd: [D-16, D-35]
spec: [9.3]
---

# LM-044 — Bảng kiện

## Việc cần làm

- [ ] `features/trips/PackagesTable.tsx` dùng `DataTable` (TanStack Table v9) thay `OrdersTable`.
- [ ] Cột: mã, tên, D × R × C (cm), khối lượng (kg), số lượng, điểm giao (số + màu + tên), hướng cho phép (số lượng), cờ lỗi/cảnh báo. Cột số căn phải, mono.
- [ ] Ảo hoá dòng khi > 100 kiện. Cần thêm `@tanstack/react-virtual` (cùng họ TanStack) — ghi vào AGENTS mục 2; nếu nhóm không muốn thêm, dùng phân trang 50 dòng.
- [ ] Thanh tổng hợp: số kiện gốc, số package instance, tổng thể tích (cm³, kèm m³ để dễ đọc), tổng khối lượng (kg) so với tải trọng xe, số lỗi/cảnh báo.
- [ ] Lọc theo điểm giao và theo "có lỗi".
- [ ] Không hiện nút Import CSV/Excel (D-20).
- [ ] Trạng thái rỗng dùng `EmptyState` với nút thêm kiện.

## Tiêu chí nghiệm thu

- [ ] 500 kiện cuộn mượt, số node DOM dòng không vượt ~60.
- [ ] Tổng hợp khớp domain (`sum weightKg × quantity`, thể tích × quantity).

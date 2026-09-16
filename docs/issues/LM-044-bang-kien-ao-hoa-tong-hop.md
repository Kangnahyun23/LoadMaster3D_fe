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

- [x] `features/trips/PackagesTable.tsx` dùng `DataTable` (TanStack Table v9) thay `OrdersTable`.
- [x] Cột: mã, tên, D × R × C (cm), khối lượng (kg), số lượng, điểm giao (số + màu + tên), hướng cho phép (số lượng), cờ lỗi/cảnh báo. Cột số căn phải, mono.
- [x] Ảo hoá dòng khi > 100 kiện. Cần thêm `@tanstack/react-virtual` (cùng họ TanStack) — ghi vào AGENTS mục 2; nếu nhóm không muốn thêm, dùng phân trang 50 dòng.
- [x] Thanh tổng hợp: số kiện gốc, số package instance, tổng thể tích (cm³, kèm m³ để dễ đọc), tổng khối lượng (kg) so với tải trọng xe, số lỗi/cảnh báo.
- [x] Lọc theo điểm giao và theo "có lỗi".
- [x] Không hiện nút Import CSV/Excel (D-20).
- [x] Trạng thái rỗng dùng `EmptyState` với nút thêm kiện.

## Tiêu chí nghiệm thu

- [x] 500 kiện cuộn mượt, số node DOM dòng không vượt ~60.
- [x] Tổng hợp khớp domain (`sum weightKg × quantity`, thể tích × quantity).

## Kết quả (16/09/2026)

- [PackagesTable.tsx](../../src/features/trips/PackagesTable.tsx) dùng `DataTable` (TanStack Table v9): mã, tên, D × R × C (cm), khối lượng, số lượng, điểm giao (số + màu + tên), số hướng dùng được, cờ lỗi/cảnh báo. Cột số căn phải, mono, định dạng qua `useFormat()`.
- **Phân trang 50 dòng thay vì ảo hoá:** không thêm `@tanstack/react-virtual` vào stack (AGENTS mục 2 — chỉ thêm dependency khi có nhu cầu đã chứng minh). Ở 500 kiện, DOM chỉ có 50 dòng.
- Lọc theo điểm giao và "chỉ kiện có lỗi"; trạng thái rỗng dùng `EmptyState` + nút thêm kiện; không có nút Import CSV/Excel (D-20).
- Lỗi từng kiện: [package-issues.ts](../../src/features/trips/package-issues.ts) gộp `validatePackages` và `checkDoorClearance` theo `params.packageId`.
- Tổng hợp nằm ở thẻ Tóm tắt hàng hoá ([trip-summary.ts](../../src/features/trips/trip-summary.ts), test `trip-summary.test.ts`): số dòng kiện, số kiện thật, thể tích (m³), khối lượng so tải trọng xe, cờ vượt tải.

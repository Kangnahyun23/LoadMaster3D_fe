---
id: LM-016
title: Lưới không gian X–Y cho truy vấn láng giềng
phase: 1
labels: [domain, performance]
depends_on: [LM-015]
estimate: 1d
prd: [D-29]
---

# LM-016 — Lưới không gian X–Y

## Bối cảnh

Chồng lấn, tìm kiện đỡ, truyền tải và LIFO đều cần tìm kiện lân cận. Quét thẳng là O(N²) ở 1.000 kiện và không đạt ngân sách một lần thả p95 ≤ 8 ms.

## Việc cần làm

- [x] `src/domain/geometry/spatial-grid.ts`: lưới đều theo X–Y, cạnh ô cấu hình được. *(Mặc định cố định 50 cm thay vì trung vị footprint — xem Kết quả.)*
- [x] API: `createSpatialGrid(entries, cellCm)`, `queryAabb`, `queryBelow`, `queryAbove`, `queryRearCorridor` *(bỏ tham số `doorX`)*, `update(id, box)`, `remove(id)`; tuỳ chọn `excludeId`.
- [x] Kết quả trả ID, không trả tham chiếu có thể bị sửa.
- [x] Không phụ thuộc React/Three.

## Tiêu chí nghiệm thu

- [x] Test đối chiếu: fixture ngẫu nhiên tất định 1.000 hộp — lưới 50 cm trả kết quả **giống hệt** lưới một ô (tương đương quét thẳng) cho cả 4 truy vấn, trước và sau 200 lần dời.
- [ ] Benchmark `queryAabb` 1.000 lần trên 1.000 hộp < 5 ms (máy dev) — file bench đã có, **chưa chạy** (chờ máy rảnh; không đo khi 3 agent đang chạy E2E/Vitest vì số sẽ sai).

## Kết quả — 15/09/2026 (TDD)

**Seam:** `@/domain/geometry`. Test: [spatial-grid.test.ts](../../src/domain/geometry/spatial-grid.test.ts). Benchmark: [spatial-grid.bench.ts](../../src/domain/geometry/spatial-grid.bench.ts) (`pnpm test:bench`).

**API**

| Hàm | Trả về |
|---|---|
| `queryAabb(box, { excludeId? })` | hộp chồng lấn thật (Spec 7.2, qua `overlaps`) |
| `queryBelow(box, …)` | hộp có mặt trên chạm đáy `box` trong `CONTACT_TOLERANCE_CM = 0,2` và đáy giao nhau thật trên X–Y |
| `queryAbove(box, …)` | hộp có đáy chạm mặt trên `box`, cùng điều kiện |
| `queryRearCorridor(box, …)` | hộp nằm hẳn phía cửa sau tính từ mặt sau `box` (`x ≥ x + l` có EPSILON) và mặt cắt Y–Z giao nhau thật |
| `update(id, box)` / `remove(id)` | cập nhật lưới cho editor |

Kết quả luôn theo thứ tự thêm vào (tất định cho mock service).

**Quyết định**

- Cạnh ô mặc định **50 cm** cố định, không tính theo trung vị footprint: đơn giản, đủ cho thùng 600 × 240 cm; tham số `cellCm` cho phép chỉnh khi benchmark cho thấy cần.
- `queryRearCorridor` không nhận `doorX`: mọi hộp đã nằm trong thùng, vùng ô của hành lang giới hạn bởi mặt xa nhất về phía cửa (`farthestEndXCm`, chỉ tăng — vùng rộng hơn cần thiết vẫn đúng vì kết quả được lọc chính xác).
- Dung sai tiếp xúc 0,2 cm = 2 mm của editor cũ; LM-018 dùng lại cho support ratio.

**Test:** 9 test — 8 vòng red → green (queryAabb, excludeId, below, above, corridor, update, remove, thứ tự sau remove + thêm) và 1 test đối chiếu. Hai lỗi bắt được trong lúc làm:

- `candidates` bản đầu duyệt toàn bộ hộp mỗi truy vấn → O(N), mất tác dụng lưới (sửa trước khi commit).
- Thứ tự dùng `order.size` trùng số sau `remove` rồi thêm → kết quả `B, D, C` thay vì `B, C, D` (test đỏ, sửa bằng bộ đếm chỉ tăng).

Test đối chiếu đã chứng minh đỏ: cho mỗi hộp chỉ đăng ký ô đầu tiên → 4 test đỏ. Timeout 30 s vì lưới một ô là quét thẳng 4 triệu phép so, vượt 5 s khi máy tải nặng.

**Kiểm tra:** Vitest 142/142 ✅ (sau khi gộp LM-012) · `tsc -b` ✅ · `oxlint` ✅.

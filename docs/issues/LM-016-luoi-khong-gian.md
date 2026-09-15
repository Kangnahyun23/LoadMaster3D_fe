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
- [ ] Benchmark `queryAabb` 1.000 lần trên 1.000 hộp < 5 ms (máy dev) — **chưa đạt**, xem "Benchmark" bên dưới. Ngưỡng thật chuyển về cổng ngân sách D-29 của **LM-023**.

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

## Benchmark — 15/09/2026

Máy dev Windows, 16 luồng, không chạy việc khác. `npx vitest bench --run --project "unit (bench)" --reporter=verbose src/domain/geometry/spatial-grid.bench.ts` (reporter mặc định không in bảng khi không có TTY; tên project ở chế độ bench có hậu tố ` (bench)`).

| Kịch bản (1.000 hộp) | Trung bình | p99 | So quét thẳng |
|---|---:|---:|---:|
| Một lần thả editor: `update` + 4 truy vấn | **0,47 ms** | 0,81 ms | — |
| Dựng lưới | 0,95 ms | 1,64 ms | — |
| Xếp kín 40 × 30 × 25 cm (gần thật): `queryAabb` + `queryBelow` cho mọi hộp (2.000 truy vấn) | **35,1 ms** | 38,2 ms | quét 999.000 cặp: 129,9 ms (nhanh hơn 3,7×) |
| Ngẫu nhiên chồng chéo dày đặc (xấu nhất): `queryAabb` × 1.000 | 105,1 ms | 118,0 ms | 137,3 ms (1,3×) |

Nhận xét:

- **Đường editor** đạt xa ngân sách một lần thả p95 ≤ 8 ms (D-29).
- **Toàn bộ 1.000 hộp chưa đạt ước lượng < 5 ms.** Lưới chỉ chia X–Y: một cột 10 tầng rơi cả vào cùng ô, nên mỗi truy vấn xét khoảng 100 ứng viên. Ứng viên tối ưu đầu tiên nếu LM-023 vượt 50 ms: thêm chiều Z vào khoá ô (vùng truy vấn below/above/hành lang đều có biên Z).
- Vitest cảnh báo "module export getters" (`lt`, `gt`, `overlaps`, `EPSILON`) làm số đo cao hơn bundle thật; số ở đây là cận trên.
- Không tối ưu ngay: theo AGENTS mục 12, đo toàn engine ở LM-023 trước.

**Cập nhật ở LM-023 (15/09/2026):** `candidates()` lọc trước rồi mới sắp theo thứ tự thêm vào; khoá ô thêm trục Z (ô 50 cm cả 3 chiều), `queryBelow`/`queryAbove`
chỉ xét lát mỏng ± `CONTACT_TOLERANCE_CM` quanh đáy/đỉnh. Bench xếp kín 1.000 thùng (`queryAabb` + `queryBelow` × 1.000): 35,1 → 25,6 ms (lọc trước) → **8,9 ms** (ô 3 chiều).
API không đổi; test đối chiếu với lưới một ô vẫn xanh và đỏ khi lát tiếp xúc mỏng bằng 0.

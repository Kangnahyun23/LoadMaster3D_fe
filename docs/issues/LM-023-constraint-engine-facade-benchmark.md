---
id: LM-023
title: Constraint engine — facade toàn bộ + tăng dần, benchmark làm cổng CI
phase: 1
labels: [domain, constraints, performance]
depends_on: [LM-016, LM-017, LM-018, LM-019, LM-020, LM-021, LM-022]
estimate: 1.5d
prd: [D-09, D-24, D-29]
spec: [7, 14]
---

# LM-023 — Constraint engine facade

## Việc cần làm

- [x] `createConstraintEngine(vehicle, packages, placements, settings)` giữ grid + đồ thị đỡ + cache issue.
- [x] `evaluateAll() → { issues, byInstanceId, supportRatioById, loadById }`.
- [x] `evaluateMove(id, candidate: { position, orientation })` không đổi trạng thái — dùng cho preview khi kéo; `commitMove(id, candidate)` cập nhật grid và tính lại cục bộ (kiện bị kéo, cột đỡ ở vị trí cũ và mới, hành lang LIFO liên quan).
- [x] `approvalBlockers(result)` gom: còn `error`, kiện `mustLoad` trong `unplacedPackages` (`MUST_LOAD_UNPLACED`, D-24), revision lỗi thời (nhận cờ từ ngoài).
- [x] Benchmark Vitest (`*.bench.ts`) với fixture tất định 132 / 500 / 1.000 kiện; một test đọc kết quả bench và **fail** khi vượt ngân sách.

## Ngân sách (D-29)

| Thao tác | 1.000 kiện | Ngưỡng CI |
|---|---|---|
| `evaluateAll` | p95 ≤ 50 ms | fail khi p95 > 75 ms (dự phòng máy CI chậm) |
| `evaluateMove` / `commitMove` | p95 ≤ 8 ms | fail khi p95 > 12 ms |

## Tiêu chí nghiệm thu

- [x] Sau 500 lần `commitMove` ngẫu nhiên tất định, `evaluateAll()` trên engine mới dựng từ đầu cho **cùng** tập issue.
- [x] Benchmark đạt ngân sách trên máy dev; số đo ghi vào `docs/benchmarks/constraint-engine-<ngày>.json`.

## Kết quả (15/09/2026)

Seam `@/domain/constraints`, TDD: `engine.test.ts` 4, `engine-moves.test.ts` 3, `approval.test.ts` 4; cổng benchmark `constraint-engine.bench.ts`.

**API**

| Hàm | Việc |
|---|---|
| `createConstraintEngine({ vehicle, packages, placements, settings })` | mở rộng kiện (LM-013), dựng layout + lưới, đồ thị đỡ (LM-019), issue từng kiện; trùng mã instance hoặc placement lạ → `throw` |
| `engine.evaluateAll()` | `{ issues, byInstanceId, supportRatioById, loadById }` — ảnh chụp, không đổi theo engine về sau |
| `engine.evaluateMove(id, pose)` | kết quả nếu kiện ở `pose`; engine trở lại đúng placement gốc (không đi qua `roundCm` lần hai) |
| `engine.commitMove(id, pose)` | dời qua `applyPose` (toạ độ `roundCm`) và tính lại cục bộ |
| `engine.placements()` | placement hiện tại theo thứ tự ban đầu |
| `approvalBlockers({ issues, packages, unplacedPackages, stale })` | `{ canApprove, issues, stale }`: `error`/`blockApproval` + một `MUST_LOAD_UNPLACED` mỗi kiện gốc, theo thứ tự request |

`pose` là `PlacementPose = { xCm, yCm, zCm, orientation }` (kích thước suy từ kiện gốc), dùng chung với LM-026/LM-034.

**Quyết định**

- **Thứ tự issue:** từng kiện theo thứ tự placement — biên, chồng lấn, vật cản, hướng đặt, tỷ lệ đỡ, LIFO — rồi xếp chồng, thứ tự xếp, trọng tâm.
  `byInstanceId` gồm issue mà kiện là chủ thể **hoặc** nằm trong `relatedIds`.
- **`OVERLAP` mỗi cặp một lần**, chủ thể là kiện đứng sau trong danh sách placement, `relatedIds` là các kiện đứng trước nó bị chồng lấn.
- **Mã mới `ORIENTATION_NOT_ALLOWED`** (error, `{ orientation }`): PRD mục 8 coi hướng ngoài `effectiveOrientations` là lỗi nhưng danh mục LM-014 chỉ có
  `ORIENTATION_MISMATCH` (sai kích thước) — câu của mã đó nói sai cho ca này. Danh mục thành 23 mã; test kiểu, câu vi/en và snapshot cập nhật theo.
- **Tỷ lệ đỡ lấy từ cạnh của đồ thị đỡ** (`supportRatioOver` tách từ LM-018), không truy vấn `queryBelow` lần hai; test đối chiếu từng kiện với `supportRatio` của LM-018.
- **Tính lại cục bộ:** trước và sau khi dời, gom kiện chồng lấn hộp của nó, kiện tựa lên nó, và kiện giao sớm hơn có nó trong hành lang dỡ (quét toàn bộ —
  vài phép so sánh mỗi kiện); tải xếp chồng qua `recomputeColumn`. Xếp chồng, thứ tự xếp, trọng tâm tính lại toàn bộ mỗi lần (O(N), < 1 ms).
- **`evaluateMove`** = commit tạm → ảnh chụp → đặt lại placement gốc; lưới giữ thứ tự thêm vào khi `update` nên `relatedIds` không đổi sau khi đặt lại.
- **Tối ưu lưới (LM-016):** lọc trước rồi mới sắp ứng viên; ô 3 chiều (khoá có Z), `queryBelow`/`queryAbove` chỉ xét lát mỏng ± dung sai quanh đáy/đỉnh.
  Trước tối ưu: dựng + kiểm 1.000 kiện p95 **93,5 ms** (hành lang LIFO 25,7 ms, `queryBelow` 10,7 ms, `queryAabb` 8,5 ms).
- **File bench cần kiểu Node** (ghi số đo) → `tsconfig.bench.json` riêng; `tsconfig.app.json` loại `*.bench.ts` để code app không thấy kiểu Node.

**Test**

- 500 lần `commitMove` ngẫu nhiên tất định (55 kiện 3 loại, 2 vật cản trong đó 1 chịu tải, 1/5 tư thế lún 10 cm để có chồng lấn): mỗi 50 lần so `issues` với engine
  dựng lại, `supportRatioById` với LM-018, `loadById` (≤ 1e-9); mỗi 25 lần `evaluateMove` rồi kiểm engine không đổi. Kiểm kịch bản thật sự có `OVERLAP`,
  `SUPPORT_BELOW_MIN`, `LIFO_PARTIAL`, `TOP_LOAD_EXCEEDED`, `NOT_STACKABLE`, `LOADING_ORDER_INFEASIBLE`. Bản đầu dùng `expect.objectContaining(Set)` — không kiểm gì với Set,
  và bộ sinh không bao giờ tạo chồng lấn; sửa cả hai. Test đỏ dưới 3 đột biến: bỏ quét hành lang LIFO, bỏ kiện tựa lên, bỏ tập láng giềng trước khi dời.
- Test tích hợp một phương án kích hoạt vật cản, biên, tỷ lệ đỡ, LIFO, tải chồng, thứ tự xếp đúng thứ tự dự đoán tay (đỏ khi bỏ LIFO khỏi engine).
- Mẫu Spec §12: không lỗi, đỡ 1, tải 0, chỉ cảnh báo `COG_LATERAL` (một thùng ở y 0..60 → trọng tâm y 30, lệch 90 cm) — kỳ vọng viết tay ban đầu sót trọng tâm.

**Benchmark** (`BENCH_RECORD=docs/benchmarks/constraint-engine-2026-09-15.json pnpm test:bench`, Ryzen 7 5800H, Node 22.16; fixture `src/test/engine-plans.ts`):

| Thao tác | p50 | p95 | Ngân sách |
|---|---:|---:|---:|
| dựng + `evaluateAll` 132 kiện | 2,24 ms | 2,77 ms | — |
| dựng + `evaluateAll` 500 kiện | 13,38 ms | 13,75 ms | — |
| dựng + `evaluateAll` 1.000 kiện | 28,60 ms | **32,83 ms** | 50 ms |
| `evaluateMove` 1.000 kiện | 1,43 ms | **1,94 ms** | 8 ms |
| `commitMove` 1.000 kiện | 1,15 ms | **1,49 ms** | 8 ms |

Cổng chạy trong `pnpm test:bench` (ngưỡng CI 75/12 ms khi có biến `CI`). **Chưa đưa vào workflow CI:** runner GitHub dao động, cần một lượt chạy thật trước khi làm cổng chặn.

**Chuyển tiếp**

- **LM-024:** mock service dùng engine để ghi `supportRatio`/`constraintWarnings` và kiểm property test.
- **LM-035:** editor gọi `evaluateMove` khi thả, `commitMove` khi hợp lệ; `approvalBlockers` cho LM-050 (cờ `stale` từ LM-026).

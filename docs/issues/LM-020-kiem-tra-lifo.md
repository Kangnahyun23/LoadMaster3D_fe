---
id: LM-020
title: Kiểm tra LIFO — che kín mặt sau là vi phạm
phase: 1
labels: [domain, constraints]
depends_on: [LM-018]
estimate: 1d
prd: [D-13, D-26]
spec: [7.11]
---

# LM-020 — Kiểm tra LIFO

## Bối cảnh

Spec 7.11: báo lỗi nếu hàng giao muộn **chặn hoàn toàn** hàng giao sớm. D-26 định nghĩa: mặt cắt Y–Z của kiện giao sớm A bị các kiện giao muộn hơn nằm giữa A và cửa sau (+X) che phủ 100%.

## Việc cần làm

- [x] `checkLifo(placements, packageById, vehicle, enforceLifo)`. *(Chữ ký `lifoIssues(placement, rules, layout)` — xem Kết quả.)*
- [x] Với mỗi A: lấy kiện B có `deliveryStop(B) > deliveryStop(A)` và `B.x ≥ A.x + A.length` (có EPSILON), chiếu Y–Z giao với A; tính diện tích hợp phần giao.
- [x] Hợp = 100% diện tích mặt sau A → `LIFO_BLOCKED` (error khi `enforceLifo`, warning khi không); 0 < hợp < 100% → `LIFO_PARTIAL` (warning). `params.coverage`, `relatedIds`.
- [x] Dùng `queryRearCorridor` của LM-016 và hàm hợp diện tích chung với LM-018. *(`coveredArea` trong `@/domain/geometry`.)*
- [ ] Thay thế logic `potentialBlockers` trong `viewer3d/operations/operations-model.ts` bằng hàm domain (giữ hành lang để vẽ). *(Hoãn sang LM-036: engine 3D còn mm tới LM-031 — xem Kết quả.)*

## Tiêu chí nghiệm thu

- [x] Test: một kiện giao muộn che kín → blocked; hai kiện ghép che kín → blocked; che 60% → partial; kiện cùng điểm giao che kín → không vi phạm.
- [x] `enforceLifo = false` hạ blocked xuống warning.

## Kết quả (15/09/2026)

**Seam:** `@/domain/geometry` ([rect.test.ts](../../src/domain/geometry/rect.test.ts)) và `@/domain/constraints` ([lifo.test.ts](../../src/domain/constraints/lifo.test.ts)).

**API**

| Hàm | Trả về |
|---|---|
| `coveredArea(target, covers)`, kiểu `Rect = { u1, u2, v1, v2 }` | diện tích phần `target` bị hợp `covers` phủ, cm²: phần ngoài `target` bị cắt, phần các hình chồng nhau tính một lần, hình chỉ chạm cạnh (kể cả cạnh trôi dấu phẩy động) = 0 |
| `lifoIssues(placement, rules, layout)`, kiểu `LifoRules = { deliveryStopByInstanceId, enforceLifo }` | `[]`, hoặc `LIFO_BLOCKED` (`error` khi `enforceLifo`, `warning` khi không; `params.coverage` = 1), hoặc `LIFO_PARTIAL` (`warning`; `params.coverage` là tỷ lệ tính được). `relatedIds`: kiện chắn theo thứ tự layout |

**Quyết định**

- Tên `lifoIssues` thay `checkLifo`, cùng lối `obstacleIssues` / `supportIssues` của LM-018: kiểm **từng placement** trên `PlacementLayout` dựng sẵn, để engine LM-023 tính lại cục bộ. `placement` có thể là vị trí thử của kiện đã có trong layout (editor): vị trí cũ của nó bị loại bằng `excludeId`.
- Điểm giao là đầu vào tường minh `deliveryStopByInstanceId: ReadonlyMap<string, number>` — placement không mang `deliveryStop`; dựng từ `expandPackages(...).instances`. Không nhận `packageById` rồi tách mã instance. Gom với `enforceLifo` thành một object để không có tham số boolean theo vị trí.
- Kiện chắn = `grid.queryRearCorridor(box, { excludeId })` của LM-016 (bắt đầu từ mặt sau A, `x ≥ x_A + dài_A` có EPSILON; mặt cắt Y–Z giao thật), lọc `stop(B) > stop(A)`. Điểm giao so bằng `>` trực tiếp: số nguyên từ 1 theo schema, không phải toạ độ. Chỉ xét hành lang thẳng +X như D-26: kiện giao muộn đặt **trên** A hay chỉ chạm cạnh mặt cắt không tính.
- `coverage` = `coveredArea(mặt cắt A, mặt cắt các kiện chắn) ÷ (rộng × cao đã xếp)`. Phân loại qua EPSILON trên tỷ lệ, cùng quy ước `lt(ratio, minSupportRatio)` của LM-018: `!lt(coverage, 1)` → blocked, `gt(coverage, 0)` → partial. Hệ quả: phần hở hoặc phần che nhỏ hơn 1e-6 mặt sau (0,1 × 0,1 cm trên mặt 240 × 250 cm = 1,67e-7) coi như không có. Không chặn trên như `supportRatio`: nhánh blocked ghi thẳng `coverage: 1` (đúng mô tả `ConstraintParams`), còn hợp đã cắt theo mặt sau không vượt quá nhiễu dấu phẩy động.
- `relatedIds` theo thứ tự thêm vào lưới (thứ tự `placements` truyền cho `createPlacementLayout`): tất định mà không phải sắp theo số thực. Nơi cần "kiện chắn gần nhất" tự sắp theo x.
- Kiện không có trong bảng điểm giao: không được kiểm và không chắn kiện nào, không ném lỗi. Bảo đảm bảng đủ là việc của nơi dựng bảng (engine LM-023).
- **Hợp diện tích lên `@/domain/geometry`:** `clipFootprint` + `unionArea` riêng của `support.ts` gộp thành `coveredArea(target, covers)` trên `Rect` tổng quát, vì cả tỷ lệ đỡ (đáy X–Y) lẫn LIFO (mặt cắt Y–Z) đều "cắt theo mặt của kiện rồi lấy hợp". `support.ts` chỉ còn phép chiếu `footprint(box)`; từng phép toán giữ nguyên (cùng `max/min`, cùng EPSILON), 8 test LM-018 xanh không sửa. Mỗi nơi gọi tự viết phép chiếu một dòng (`footprint`, `section`), không đưa lên geometry khi mới có một chỗ dùng.
- EPSILON ở bộ lọc dải của phép quét giữ nguyên từ LM-018 để không đổi hành vi, nhưng không có test riêng: đo bằng Node, nó chỉ làm lệch diện tích cỡ 1e-12 cm² (5.988 so với 5.987,999999999998) và không đổi quyết định nào. Bộ lọc dải cũng che EPSILON của bước cắt trên trục u, nên test mép trôi kiểm cả hai trục — chỉ trục v làm lộ mảnh 1,7e-12 cm² khi so thô.

**Hình học trong test (số đã chạy thử bằng Node).** Mã `PKG-00n` giao ở điểm n. Kiện A `PKG-002-01` 120 × 60 × 50 cm tại (300, 0, 0): mặt sau ở x = 420, y 0..60 × z 0..50 = 3.000 cm².

- Che 60%: pallet 100 × 100 × 100 cm tại (450, 24, 0), cách 30 cm, cắt còn y 24..60 × z 0..50 = 1.800 / 3.000 = 0,6.
- Hai kiện ghép: y 0..30 sát mặt sau và y 30..60 lùi 60 cm. Layout đặt kiện xa trước, nên thứ tự layout khác cả thứ tự mã lẫn thứ tự x.
- Chồng nhau khi nhìn từ cửa: y 0..36 và y 24..48 → 1.800 + 1.200 − 600 = 2.400 → 0,8 (cộng thẳng ra 1,0, thành blocked sai).
- Mép sau trôi: A tại x = 100,4 dài 120,7 → mặt sau 221,10000000000002; kiện bắt đầu ở x = 221,1 vẫn chắn (so thô `>=` thì không).
- Tỷ lệ trôi: mặt sau y 60,1..180,3; hai kiện y 60,1..160,1 và 160,1..(160,1 + 20,2 = 180,29999999999998) → tỷ lệ tính ra 0,9999999999999999, vẫn blocked với `coverage: 1`.
- Geometry: cạnh 100,4 + 120,7 = 221,10000000000002 để lại mảnh 1,7053025658242404e-12 cm² với hình bắt đầu ở 221,1 nếu so thô.

**Test:** 13 test (geometry 4, LIFO 9), 8 vòng red → green (4 geometry; LIFO: che kín, che 60%, cùng/sớm điểm giao, `enforceLifo = false`). 5 test xanh ngay được chứng minh đỏ bằng đột biến rồi khôi phục: hai kiện ghép (chỉ tính kiện chắn đầu → partial; sắp `relatedIds` theo mã → sai thứ tự), chồng nhau khi nhìn từ cửa (cộng diện tích từng kiện → blocked 1), mép sau trôi (thêm điều kiện thô `x >= x_A + dài_A` → `[]`), tỷ lệ trôi (`coverage === 1` hoặc `>= 1` → partial 0,9999999999999999; ghi `coverage` thô → sai params), thiếu điểm giao (kiện chắn lạ coi là giao muộn → blocked; kiện lạ coi là điểm 0 → blocked). Ngoài ra kiểm riêng từng nửa của test cùng/sớm điểm giao (`>=`, `!==`) và điều kiện `gt(coverage, 0)` (đổi thành `>= 0` → 2 test đỏ).

**Đo tham khảo** (Vitest bench chạy một lần rồi xoá, không commit; Vitest cảnh báo module getter nên là cận trên). 1.000 thùng 40 × 30 × 25 cm xếp kín trong Truck 6m, layout dựng sẵn, cùng fixture với `spatial-grid.bench.ts`:

| Thao tác | Trung bình | Lọc trước khi sắp (thử tạm) |
|---|---:|---:|
| `lifoIssues` × 1.000, điểm giao đúng thứ tự (0 vi phạm) | 71,1 ms | 33,8 ms |
| `lifoIssues` × 1.000, điểm giao ngẫu nhiên 1..8 (694 blocked) | 74,5 ms | 38,1 ms |
| `lifoIssues` × 1.000, ngược hoàn toàn (933 blocked) | 75,6 ms | 38,2 ms |
| riêng `grid.queryRearCorridor` × 1.000 | 78,5 ms (±6,6 %) | 34,6 ms |

Gần như toàn bộ chi phí nằm ở truy vấn hành lang của lưới LM-016; hợp diện tích và lọc điểm giao chỉ thêm vài ms. **Chưa tối ưu, một mình LIFO đã vượt ngân sách `evaluateAll` p95 ≤ 50 ms (D-29) của cả engine.** Nguyên nhân: `candidates()` sắp mọi ứng viên theo thứ tự thêm vào **trước** khi lọc, mà hành lang của kiện sâu trong thùng quét tới 12 cột ô, mỗi ô chứa mọi tầng Z (vài trăm ứng viên). Cột phải là phép thử sửa tạm `spatial-grid.ts` cho lọc rồi mới sắp — đã hoàn tác, không nằm trong commit này (file của LM-016).

**Chuyển tiếp**

- **LM-036:** thay `potentialBlockers` bằng `lifoIssues` sau khi engine sang cm (LM-031) — đã thêm mục vào issue. Khác biệt cần xử lý: domain chỉ tính kiện giao muộn hơn (khi phát dỡ `potentialBlockers` lấy cả cùng điểm giao) và nằm hẳn sau mặt sau (`potentialBlockers` lấy mọi kiện có phần vượt mặt sau); callout đang dùng `blockers[0]` là kiện gần nhất nên phải tự sắp theo x.
- **LM-023:** (1) lọc trước khi sắp trong `candidates()` (đo ở trên: giảm khoảng một nửa); nếu vẫn vượt ngân sách, thêm Z vào khoá ô hoặc dựng chỉ mục riêng cho hành lang (LM-018 cũng gợi ý Z). (2) Kéo/thả phải tính lại LIFO của kiện bị kéo và của các kiện có hành lang chứa vị trí cũ hoặc mới; lưới chưa có truy vấn ngược "kiện phía trước". (3) Dựng `deliveryStopByInstanceId` một lần từ `expandPackages(...).instances`.
- Câu vi/en cho `LIFO_BLOCKED` / `LIFO_PARTIAL` đã có trong `formatIssue` (LM-028), không đổi.

**Kiểm tra:** Vitest 276/276 ✅ (263 + 13) · `pnpm lint` ✅ (exit 0, không cảnh báo) · `pnpm build` ✅ (`tsc -b` + Vite).

---
id: LM-022
title: Thứ tự xếp khả thi — phát hiện và tính lại
phase: 1
labels: [domain, constraints]
depends_on: [LM-019, LM-020]
estimate: 1d
prd: [D-32]
spec: [7.11]
---

# LM-022 — Thứ tự xếp khả thi

## Việc cần làm

- [x] `checkLoadingOrder(placements, supportGraph)`: kiện được xếp (`loadingOrder`) trước kiện đỡ nó → `LOADING_ORDER_INFEASIBLE` (warning) kèm `relatedIds`.
- [x] `recomputeOrders(placements, packageById, supportGraph, vehicle)`: sắp xếp topo theo quan hệ đỡ (dưới trước trên); trong các kiện sẵn sàng ưu tiên `deliveryStop` lớn hơn, rồi `x` nhỏ hơn (sâu hơn), rồi `z`, rồi ID — tất định.
- [x] `unloadingOrder`: ngược nguyên tắc — điểm giao nhỏ trước, trong cùng điểm: kiện không bị đỡ bởi kiện còn lại, gần cửa trước, cao trước.
- [x] Trả thêm cờ để UI gắn nhãn "thứ tự tính lại ở FE".

## Tiêu chí nghiệm thu

- [x] Kết quả `recomputeOrders` không bao giờ sinh `LOADING_ORDER_INFEASIBLE`.
- [x] Hai lần chạy cùng input cho cùng thứ tự.
- [x] Test chu trình không thể xảy ra (đồ thị đỡ là DAG theo z) được khẳng định bằng test ca biên chạm mặt.

## Kết quả (15/09/2026)

Seam `@/domain/constraints`, TDD, 6 test (`loading-order.test.ts`). Làm song song với LM-020 vì chỉ cần đồ thị đỡ của LM-019.

**API** (tên theo lối LM-018/LM-019, dùng `StackGraph` thay cho `placements` + `supportGraph` rời):

| Hàm | Việc |
|---|---|
| `loadingOrderIssues(graph)` | kiện có kiện đỡ mang `loadingOrder` **không nhỏ hơn** của nó (xếp sau hoặc cùng lượt) → `LOADING_ORDER_INFEASIBLE` (warning), `relatedIds` là các kiện đỡ đó, sắp theo mã |
| `recomputeOrders(graph, deliveryStops)` | `{ recomputedOnFrontend: true, orders: Map<id, { loadingOrder, unloadingOrder }> }`, 1-based, tất định |

**Quyết định**

- **Xếp:** sắp xếp topo (kiện đỡ trước kiện trên); trong các kiện sẵn sàng ưu tiên `deliveryStop` lớn → `x` nhỏ (sâu) → `z` nhỏ → mã kiện.
- **Dỡ:** chỉ dỡ kiện không còn kiện nào tựa lên; trong các kiện sẵn sàng ưu tiên `deliveryStop` nhỏ → `x` lớn (gần cửa) → `z` lớn (cao) → mã kiện.
  Quan hệ chặn khi dỡ chỉ là quan hệ đỡ; kiện chắn hành lang về cửa là việc của LIFO (LM-020).
- Toạ độ trong comparator so qua `eq` (lệch trong EPSILON coi là bằng nhau để tiêu chí sau quyết định).
- `deliveryStops` là `Map` theo `packageInstanceId` (lấy từ `PackageInstance` của LM-013); thiếu điểm giao hoặc đồ thị có chu trình → `throw`.
- Kahn đếm số kiện chặn còn lại; mỗi bước quét từ kiện đầu tiên chưa lấy. Bản đầu (tạo lại mảng kiện chặn mỗi lần quét) mất 26,7 ms với
  1.000 kiện → 5,1 ms sau khi đổi, cùng bộ test.

**Test**

- Bộ dựng tay 10 kiện có cặp ngược ưu tiên (kiện điểm 4 trên kiện điểm 1) để ràng buộc đỡ phải thắng ưu tiên cả khi xếp lẫn khi dỡ; thứ tự
  kỳ vọng tính tay. Hai test thứ tự và test thuộc tính đều đỏ khi bỏ điều kiện chờ kiện chặn (bản đầu của bộ dựng tay trùng thứ tự ưu tiên nên
  không bắt được — đã thêm cặp ngược).
- Thuộc tính trên 50 phương án ngẫu nhiên tất định (30 kiện, > 1.000 cạnh đỡ): thứ tự tính lại không sinh `LOADING_ORDER_INFEASIBLE`, không
  dỡ kiện khi còn kiện tựa lên, chạy hai lần cho cùng kết quả.
- Ca biên chạm mặt: hai kiện chỉ chạm mặt bên không đỡ nhau; chồng chạm qua số trôi (`100.4 + 120.7 = 221.10000000000002` với kiện trên ở 221,1) chỉ đỡ một chiều.
- So sánh `>=` (cùng lượt vẫn là không khả thi) được chứng minh bằng đột biến `>`.

**Đo tham khảo** (1.000 thùng xếp kín thành cột 10 tầng, 5 điểm giao): `recomputeOrders` 5,1 ms, `loadingOrderIssues` 0,55 ms.

**Chuyển tiếp**

- **LM-023:** facade gọi `loadingOrderIssues` trong kiểm toàn phương án; editor giữ thứ tự gốc (D-32).
- **LM-050 (Duyệt):** gọi `recomputeOrders` rồi ghi `loadingOrder`/`unloadingOrder` vào revision approved, hiện nhãn "thứ tự tính lại ở FE" khi `recomputedOnFrontend`.

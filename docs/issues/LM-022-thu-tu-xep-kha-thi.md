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

- [ ] `checkLoadingOrder(placements, supportGraph)`: kiện được xếp (`loadingOrder`) trước kiện đỡ nó → `LOADING_ORDER_INFEASIBLE` (warning) kèm `relatedIds`.
- [ ] `recomputeOrders(placements, packageById, supportGraph, vehicle)`: sắp xếp topo theo quan hệ đỡ (dưới trước trên); trong các kiện sẵn sàng ưu tiên `deliveryStop` lớn hơn, rồi `x` nhỏ hơn (sâu hơn), rồi `z`, rồi ID — tất định.
- [ ] `unloadingOrder`: ngược nguyên tắc — điểm giao nhỏ trước, trong cùng điểm: kiện không bị đỡ bởi kiện còn lại, gần cửa trước, cao trước.
- [ ] Trả thêm cờ để UI gắn nhãn "thứ tự tính lại ở FE".

## Tiêu chí nghiệm thu

- [ ] Kết quả `recomputeOrders` không bao giờ sinh `LOADING_ORDER_INFEASIBLE`.
- [ ] Hai lần chạy cùng input cho cùng thứ tự.
- [ ] Test chu trình không thể xảy ra (đồ thị đỡ là DAG theo z) được khẳng định bằng test ca biên chạm mặt.

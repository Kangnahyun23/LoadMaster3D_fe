---
id: LM-019
title: Sức chịu tải xếp chồng — truyền tải toàn stack theo diện tích
phase: 1
labels: [domain, constraints, performance]
depends_on: [LM-018]
estimate: 1.5d
prd: [D-18, D-29]
spec: [7.8]
---

# LM-019 — Truyền tải toàn stack

## Bối cảnh

Spec 7.8 yêu cầu không chỉ kiểm tra kiện ngay phía trên. D-18 chốt mô hình: tải của một kiện (trọng lượng bản thân + tải nó nhận) chia xuống các kiện đỡ theo tỷ lệ diện tích tiếp xúc. Đây là **ước tính FE**, không phải mô phỏng vật lý.

## Việc cần làm

- [ ] Dựng đồ thị đỡ: cạnh `trên → dưới` kèm diện tích tiếp xúc (dùng lưới LM-016).
- [ ] Duyệt theo z giảm dần (từ đỉnh xuống): `load[below] += (weight[top] + load[top]) × area / totalSupportArea(top)`. Phần tựa sàn hoặc vật cản chịu tải không truyền vào kiện.
- [ ] Kiểm tra: `load > maxTopLoadKg` → `TOP_LOAD_EXCEEDED` (error, `params.loadKg`, `params.maxKg`); `stackable = false` mà có kiện tựa lên → `NOT_STACKABLE`; `fragilityLevel = HIGH` và `maxTopLoadKg = 0` có tải → error; số tầng trong cột vượt `maxStackCount` → `STACK_COUNT_EXCEEDED`.
- [ ] Vật cản chịu tải có `maxTopLoadKg` → kiểm tra tương tự. Chốt nghĩa khi vật cản chịu tải **bỏ trống** `maxTopLoadKg` (không giới hạn hay chặn) — schema LM-010 đang cho phép bỏ trống.
- [ ] API tính lại cục bộ: `recomputeColumn(graph, affectedIds)` chỉ duyệt các kiện phía trên/dưới bị ảnh hưởng (phục vụ LM-023).

## Tiêu chí nghiệm thu

- [ ] Test tay: 3 kiện 30 kg chồng thẳng → kiện đáy nhận 60 kg; một kiện 40 kg tựa đều lên 2 kiện → mỗi kiện nhận 20 kg.
- [ ] Kết quả tính lại cục bộ bằng kết quả tính toàn bộ trên 200 thay đổi ngẫu nhiên tất định.
- [ ] Ghi rõ trong JSDoc là ước tính, không phải solver ổn định.

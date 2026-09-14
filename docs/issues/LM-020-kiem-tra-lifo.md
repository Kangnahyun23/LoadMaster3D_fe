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

- [ ] `checkLifo(placements, packageById, vehicle, enforceLifo)`.
- [ ] Với mỗi A: lấy kiện B có `deliveryStop(B) > deliveryStop(A)` và `B.x ≥ A.x + A.length` (có EPSILON), chiếu Y–Z giao với A; tính diện tích hợp phần giao.
- [ ] Hợp = 100% diện tích mặt sau A → `LIFO_BLOCKED` (error khi `enforceLifo`, warning khi không); 0 < hợp < 100% → `LIFO_PARTIAL` (warning). `params.coverage`, `relatedIds`.
- [ ] Dùng `queryRearCorridor` của LM-016 và hàm hợp diện tích chung với LM-018.
- [ ] Thay thế logic `potentialBlockers` trong `viewer3d/operations/operations-model.ts` bằng hàm domain (giữ hành lang để vẽ).

## Tiêu chí nghiệm thu

- [ ] Test: một kiện giao muộn che kín → blocked; hai kiện ghép che kín → blocked; che 60% → partial; kiện cùng điểm giao che kín → không vi phạm.
- [ ] `enforceLifo = false` hạ blocked xuống warning.

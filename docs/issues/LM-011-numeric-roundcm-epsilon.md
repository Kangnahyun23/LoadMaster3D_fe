---
id: LM-011
title: Helper số — roundCm và so sánh EPSILON
phase: 1
labels: [domain, precision]
depends_on: [LM-004]
estimate: 0.5d
prd: [D-10, D-27]
spec: [2]
---

# LM-011 — Helper số: roundCm và so sánh EPSILON

## Bối cảnh

cm thập phân gây sai số dấu phẩy động: `45.1 + 45.1 + 45.1 = 135.29999…`. Nếu so sánh `<` `>` trực tiếp, hai kiện chạm mặt có thể bị báo chồng lấn, hoặc snap lệch dần sau nhiều lần kéo.

## Việc cần làm

- [ ] `src/domain/geometry/numeric.ts`: `EPSILON = 1e-6`, `roundCm(v)` (bội 0,1 cm), `roundKg(v)` (bội 0,01 kg), `lt`, `lte`, `gt`, `gte`, `eq` có EPSILON.
- [ ] Quy ước: `roundCm` áp tại biên — dữ liệu form khi lưu, placement từ service, editor khi commit; không áp giữa phép tính trung gian.
- [ ] Rule lint hoặc test quét `src/domain/**` phát hiện so sánh số trực tiếp giữa các toạ độ (tối thiểu: test mẫu ca biên; nếu oxlint không hỗ trợ rule tuỳ chỉnh thì ghi trong AGENTS.md).

## Tiêu chí nghiệm thu

- [ ] Test ca cộng dồn: ba kiện cao 45,1 cm xếp chồng, kiện thứ tư đặt tại z = 135,3 không bị báo chồng lấn.
- [ ] `roundCm(12.349999) === 12.3`, `roundCm(12.35) === 12.4` (quy tắc làm tròn được ghi rõ, kể cả số âm).

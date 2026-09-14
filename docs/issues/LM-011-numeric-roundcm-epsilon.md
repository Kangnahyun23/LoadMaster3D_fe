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

cm thập phân gây sai số dấu phẩy động: `100.1 + 60.3 = 160.39999999999998`, `262.45 − 250 = 12.449999999999989`. Nếu so sánh `<` `>` trực tiếp, hai kiện chạm mặt có thể bị báo chồng lấn, hoặc snap lệch dần sau nhiều lần kéo.

## Việc cần làm

- [x] `src/domain/geometry/numeric.ts`: `EPSILON = 1e-6`, `roundCm(v)` (bội 0,1 cm), `roundKg(v)` (bội 0,01 kg), `lt`, `gt`, `eq` có EPSILON. `lte`/`gte` hoãn tới khi có nơi dùng (YAGNI, TDD không có test đòi hỏi).
- [ ] Quy ước: `roundCm` áp tại biên — dữ liệu form khi lưu, placement từ service, editor khi commit; không áp giữa phép tính trung gian. → ghi vào AGENTS.md ở **LM-003**; áp thật ở LM-024, LM-034, LM-041, LM-045.
- [ ] Rule lint phát hiện so sánh số trực tiếp giữa toạ độ: oxlint không có rule tuỳ chỉnh cho việc này → ghi quy ước vào AGENTS.md ở **LM-003**; test ca biên đã có (xem Kết quả).

## Tiêu chí nghiệm thu

- [x] Test ca cộng dồn: kiện chạm mặt khi toạ độ bị trôi (`100.4 + 120.7 = 221.10000000000002`) không bị báo chồng lấn; kiện chạm trần ở z trôi (`250.00000000000003`) không bị báo vượt biên. *(Ví dụ gốc 100,1 + 60,3 trôi xuống dưới nên không gây chồng lấn giả — đã thay bằng ca trôi lên.)*
- [x] `roundCm(12.34) === 12.3`, `roundCm(12.35) === 12.4`, `roundCm(-12.35) === -12.4` (nửa xa số 0), `roundCm(262.45 − 250) === 12.5` (bù trôi), không trả `-0`.

## Kết quả — 14/09/2026 (TDD)

- Seam đã chốt: chỉ test qua `@/domain/geometry` ([index.ts](../../src/domain/geometry/index.ts)).
- Quy tắc làm tròn đã chốt: nửa xa số 0, cộng `EPSILON` trước khi làm tròn, không trả `-0`.
- Test: [src/domain/geometry/geometry.test.ts](../../src/domain/geometry/geometry.test.ts) — 6 test cho phần số (`roundCm` 4, `roundKg` 1, `eq` 1).
- Hai giả định trong bản issue gốc sai và đã được máy kiểm chứng lại trước khi viết test: `45.1 + 45.1 + 45.1` cho đúng `135.3`; `0.15 * 10` cho đúng `1.5`.

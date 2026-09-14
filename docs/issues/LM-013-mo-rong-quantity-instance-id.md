---
id: LM-013
title: Mở rộng quantity thành instance, quy tắc ID và truy vết
phase: 1
labels: [domain]
depends_on: [LM-010]
estimate: 0.5d
prd: [D-33]
spec: [6]
---

# LM-013 — Mở rộng quantity thành instance

## Việc cần làm

- [ ] `expandPackages(packages) → { instances, packageIdByInstanceId: Map, issues }`.
- [ ] ID = `{packageId}-{n}` với n 1-based, đệm tối thiểu 2 chữ số, số chữ số = `max(2, digits(quantity))` (quantity 100 → `-001`…`-100`).
- [ ] Truy vết chỉ qua `packageIdByInstanceId`, **không** tách chuỗi ID.
- [ ] Phát hiện trùng ID trong toàn request (vd kiện gốc `PKG-001-01` va với instance của `PKG-001`) → lỗi `DUPLICATE_INSTANCE_ID`.
- [ ] Hàm `nextPackageId(existing)` cho thao tác nhân bản.

## Tiêu chí nghiệm thu

- [ ] Fixture Spec (`PKG-001`, quantity 4) sinh `PKG-001-01`…`PKG-001-04`.
- [ ] quantity 100 sinh đủ 100 ID duy nhất, sắp xếp chuỗi đúng thứ tự.
- [ ] Ca va chạm ID được phát hiện.

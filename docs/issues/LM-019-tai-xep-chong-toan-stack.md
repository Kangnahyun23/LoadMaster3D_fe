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

- [x] Dựng đồ thị đỡ: cạnh `trên → dưới` kèm diện tích tiếp xúc (dùng lưới LM-016).
- [x] Duyệt theo z giảm dần (từ đỉnh xuống): `load[below] += (weight[top] + load[top]) × area / totalSupportArea(top)`. Phần tựa sàn hoặc vật cản chịu tải không truyền vào kiện.
- [x] Kiểm tra: `load > maxTopLoadKg` → `TOP_LOAD_EXCEEDED` (error, `params.loadKg`, `params.maxKg`); `stackable = false` mà có kiện tựa lên → `NOT_STACKABLE`; `fragilityLevel = HIGH` và `maxTopLoadKg = 0` có tải → error; số tầng trong cột vượt `maxStackCount` → `STACK_COUNT_EXCEEDED`.
- [x] Vật cản chịu tải có `maxTopLoadKg` → kiểm tra tương tự. Chốt nghĩa khi vật cản chịu tải **bỏ trống** `maxTopLoadKg` (không giới hạn hay chặn) — schema LM-010 đang cho phép bỏ trống.
- [x] API tính lại cục bộ: `recomputeColumn(graph, affectedIds)` chỉ duyệt các kiện phía trên/dưới bị ảnh hưởng (phục vụ LM-023).

## Tiêu chí nghiệm thu

- [x] Test tay: 3 kiện 30 kg chồng thẳng → kiện đáy nhận 60 kg; một kiện 40 kg tựa đều lên 2 kiện → mỗi kiện nhận 20 kg.
- [x] Kết quả tính lại cục bộ bằng kết quả tính toàn bộ trên 200 thay đổi ngẫu nhiên tất định.
- [x] Ghi rõ trong JSDoc là ước tính, không phải solver ổn định.

## Kết quả (15/09/2026)

Seam `@/domain/constraints`, TDD 12 vòng, 14 test (`stack-load.test.ts` 5, `stack-issues.test.ts` 8, `stack-recompute.test.ts` 1)
và 2 test dịch câu từ `stackIssues` thật trong `src/lib/i18n/issue-message.test.ts`.

**API**

| Hàm | Việc |
|---|---|
| `createStackGraph(layout, profiles)` | dựng đồ thị đỡ trên `PlacementLayout` (LM-018): cạnh `trên → dưới` kèm diện tích tiếp xúc, tải từng kiện và từng vật cản chịu tải |
| `topLoadKg(graph, id)` / `obstacleTopLoadKg(graph, obstacleId)` | tải nhận từ phía trên, kg, chưa làm tròn |
| `stackIssues(graph)` | `TOP_LOAD_EXCEEDED`, `NOT_STACKABLE`, `STACK_COUNT_EXCEEDED` theo thứ tự kiện, rồi vật cản quá tải |
| `movePlacement(layout, placement)` | đổi vị trí/hướng một kiện: Map và lưới cùng lúc, giữ thứ tự |
| `recomputeColumn(graph, changedIds)` | tính lại cục bộ sau `movePlacement` |

`StackingProfile = Pick<CargoPackage, 'weightKg' | 'stackable' | 'maxTopLoadKg' | 'maxStackCount'>` — `PackageInstance` (LM-013) thoả kiểu này.

**Quyết định**

- **Truyền tải (D-18):** `load[dưới] += (weight[trên] + load[trên]) × diện tích tiếp xúc / tổng diện tích đỡ của kiện trên`.
  Tổng diện tích đỡ gồm kiện bên dưới và mặt trên vật cản **chịu tải**; phần treo không đỡ không làm mất tải. Vật cản không chịu
  tải không nhận tải và không tính diện tích (cùng quy ước `supportRatio` của LM-018), nên toàn bộ tải dồn vào kiện — ước tính thận trọng.
  Tính theo kiểu "kéo" có ghi nhớ: tải của kiện = tổng phần các kiện trên truyền xuống, kiện trên tính trước; không cần sắp theo z.
- **`maxTopLoadKg = 0` là không chịu chút tải nào**, gồm ca `fragilityLevel = HIGH` của Spec — không cần quy tắc riêng theo mức dễ vỡ.
- **`stackable = false`** có kiện tựa lên → chỉ `NOT_STACKABLE` (`relatedIds` sắp theo mã); không báo thêm `TOP_LOAD_EXCEEDED` dù schema buộc `maxTopLoadKg = 0`.
- **Số tầng** của một kiện = số kiện từ sàn tới nó theo nhánh đỡ dài nhất + số kiện phía trên theo nhánh dài nhất. Mọi kiện trong chồng
  có `maxStackCount` nhỏ hơn số tầng đều bị báo (cột 4 thùng giới hạn 3 → cả 4 thùng). Vật cản không tính là tầng.
- **Vật cản chịu tải bỏ trống `maxTopLoadKg` = không giới hạn** (cùng nghĩa `maxStackCount` bỏ trống). Quá tải → `TOP_LOAD_EXCEEDED`
  không có `packageInstanceId`, vật cản ở `relatedIds[0]` theo quy ước chủ thể của `ConstraintIssue`. Câu vi/en dùng chủ ngữ
  "Kiện …" / "Vật cản …" (snapshot mẫu `TOP_LOAD_EXCEEDED` của kiện đổi theo, đã duyệt).
- **Tính lại cục bộ:** nối lại cạnh cho kiện đã đổi và các kiện tựa lên vị trí cũ (từ đồ thị) hoặc mới (`queryAbove`); tải chỉ tính lại
  cho các kiện nằm dưới những kiện có cạnh đổi (mặt đỡ cũ và mới), lần xuống sàn. Test 200 lần dời ngẫu nhiên tất định (40 kiện,
  hốc bánh xe chịu tải 60 kg) so tải kiện, tải vật cản (sai số ≤ 1e-9 kg) và `stackIssues` với dựng lại toàn bộ sau **mỗi** lần dời,
  kèm điều kiện kịch bản thật sự có xếp chồng (> 150/200 lần dời). Đã chứng minh đỏ bằng hai đột biến: quên mặt đỡ cũ; quên kiện
  tựa lên vị trí cũ.
- `PlacementLayout.placements` đổi từ `ReadonlyMap` sang `Map` (chỉ sửa qua `movePlacement`) để editor dời kiện mà Map và lưới không lệch.
- Helper test dùng chung `src/test/placements.ts`: `placed`, `EMPTY_TRUCK_6M`, `stackingProfile`, `stackGraphOf`.

**Đo tham khảo** (file đo tạm, đã xoá; máy dev). 1.000 thùng 40 × 30 × 25 cm xếp kín thành cột 10 tầng:

| Thao tác | Thời gian |
|---|---:|
| `createStackGraph` (kể cả `createPlacementLayout`) | 17,6 ms (trung vị 7 lần) |
| `stackIssues` | 0,66 ms |
| `movePlacement` + `recomputeColumn` một kiện đáy cột 10 tầng | trung vị 0,048 ms, p95 0,107 ms |

**Chuyển tiếp**

- **LM-022:** thứ tự xếp khả thi dùng `graph.supports` (kiện đỡ phải xếp trước).
- **LM-023:** `createStackGraph` và `supportRatio` (LM-018) cùng gọi `queryBelow` cho mọi kiện (~18 ms mỗi bên) — facade nên truy vấn
  một lần và dùng chung cạnh đỡ để giữ ngân sách D-29 50 ms. Kiện thử trong editor (chưa commit) cần tính trên bản sao hoặc
  commit rồi hoàn tác; `recomputeColumn` đủ nhanh cho cả hai.
- **LM-035:** sau `movePlacement` luôn gọi `recomputeColumn` cùng ID.

---
id: LM-018
title: Ràng buộc placement — vật cản, bề mặt không chịu tải, tỷ lệ đỡ đáy
phase: 1
labels: [domain, constraints]
depends_on: [LM-016]
estimate: 1d
prd: [D-27, D-29]
spec: [7.6, 7.7]
---

# LM-018 — Vật cản và tỷ lệ đỡ đáy

## Việc cần làm

- [x] `checkObstacles(placement, vehicle)`: chồng lấn vật cản → `OBSTACLE_OVERLAP` (error). *(Tên `obstacleIssues` — xem Kết quả.)*
- [x] Kiện tựa trực tiếp lên mặt trên vật cản `loadBearing = false` → `NON_BEARING_SUPPORT` (error); vật cản `loadBearing = true` được tính là bề mặt đỡ.
- [x] `supportRatio(placement, others, obstacles)`: diện tích hợp của các mặt đỡ (sàn, kiện, vật cản chịu tải) trong tolerance, không đếm trùng. Chuyển thuật toán hợp diện tích từ `viewer3d/editor/geometry.ts` sang domain (cm, EPSILON). *(Chữ ký `supportRatio(placement, layout)` — xem Kết quả.)*
- [x] Dưới `minSupportRatio` → `SUPPORT_BELOW_MIN` (warning) với `params.ratio`, `params.required`.
- [x] Dùng lưới LM-016 để lấy ứng viên.
- [x] `overlapArea2D`, `overlapVolume` trong `@/domain/geometry` (chuyển từ LM-015 vì đây là nơi dùng đầu tiên), so qua `lt/gt` EPSILON.

## Tiêu chí nghiệm thu

- [x] Fixture Spec: kiện đặt ở (0,0,0) chồng hốc bánh `OBS-001` → error; kiện đặt trên hốc bánh (z = 45) → `NON_BEARING_SUPPORT`.
- [x] Ví dụ Spec "PKG-008 support ratio 0.62 is below the required 0.80" tái hiện được.
- [x] Hai kiện đỡ chồng lên nhau một phần không bị cộng trùng diện tích.

## Kết quả — 15/09/2026 (TDD)

**Seam:** `@/domain/geometry` ([intersection.test.ts](../../src/domain/geometry/intersection.test.ts)) và `@/domain/constraints` ([obstacles.test.ts](../../src/domain/constraints/obstacles.test.ts), [support.test.ts](../../src/domain/constraints/support.test.ts)).

**API**

| Hàm | Trả về |
|---|---|
| `overlapArea2D(a, b)` | diện tích giao của hai đáy trên X–Y, cm²; chỉ chạm cạnh (kể cả mép bị dấu phẩy động đẩy lệch) = 0 |
| `overlapVolume(a, b)` | thể tích giao, cm³; chỉ chạm mặt = 0 |
| `obstacleIssues(placement, vehicle)` | theo thứ tự vật cản của xe, mỗi vật cản: `OBSTACLE_OVERLAP` rồi `NON_BEARING_SUPPORT` — cả hai `error`, `params.obstacleId` |
| `createPlacementLayout(vehicle, placements)` | `PlacementLayout = { vehicle, placements (Map theo packageInstanceId), grid (LM-016) }`, dựng một lần mỗi snapshot |
| `supportRatio(placement, layout)` | tỷ lệ đỡ 0..1 |
| `supportIssues(placement, minSupportRatio, layout)` | `SUPPORT_BELOW_MIN` (`warning`, `params.ratio`, `params.required`) hoặc `[]` |

**Quyết định**

- Tên `obstacleIssues` / `supportIssues` thay `checkObstacles`, cùng lối `boundaryIssues` của LM-014: hàm trả mảng issue.
- `supportRatio` nhận `PlacementLayout` thay vì `(others, obstacles)`: lưới chỉ trả ID nên cần tra ID → kiện O(1); nếu nhận mảng thì mỗi lần gọi phải dựng lại Map, 1.000 lần gọi thành O(N²). Factory dựng Map và lưới cùng lúc nên luôn khớp nhau. Engine LM-023 có thể tự giữ Map + lưới, cập nhật bằng `grid.update` và truyền đúng kiểu.
- **Tiếp xúc:** đáy cách mặt trên không quá `CONTACT_TOLERANCE_CM` = 0,2 cm về cả hai phía, so qua EPSILON (45,2 − 45 = 0,20000000000000284 vẫn là tiếp xúc) — cùng quy ước `queryBelow`. Sàn: `|z| ≤ 0,2` → tỷ lệ 1. "Tựa lên" vật cản đòi hai đáy giao nhau thật; chỉ chạm cạnh thì không.
- **Mặt đỡ:** kiện khác (`queryBelow` với `excludeId` là chính kiện, để vị trí thử trong editor không tự đỡ mình) và vật cản `loadBearing = true`. Vật cản không chịu tải không đóng góp diện tích; kiện tựa lên nó nhận `NON_BEARING_SUPPORT` (error), thường kèm `SUPPORT_BELOW_MIN`.
- Kiện vừa lún vào vừa tựa lên cùng một vật cản không chịu tải (lún ≤ 0,2 cm) nhận cả hai lỗi.
- **Hợp diện tích:** chuyển thuật toán quét dải của editor cũ sang cm; dải hẹp hơn EPSILON không phủ gì; tỷ lệ chặn trên ở 1 vì mép trôi cho ra 1,0000000000000002 (hợp diện tích không âm nên không cần chặn dưới). Thuật toán là chi tiết nội bộ của `support.ts`, không đưa lên seam geometry. Quy tắc tiếp xúc dùng chung nằm trong `constraints/contact.ts` (không export).
- So tỷ lệ với `minSupportRatio` qua `lt`: 49,6 / 62 cm đúng 80% nhưng tính ra 0,7999999999999998 — không cảnh báo.
- Không dùng `placement.supportRatio` của contract (Spec 7.7 cho phép nhận từ mock): luôn tính lại từ hình học, vì chỉnh tay trong editor làm số cũ lỗi thời.
- Câu Spec §13 của PKG-008 được kiểm trong `support.test.ts`, không sửa `spec-messages.test.ts` vì LM-017 làm song song trong cùng thư mục.

**Hình học tái hiện Spec §13 (số đã chạy thử bằng Node):** PKG-008 đáy 100 × 50 cm tại (300, 100, 60) trên PKG-009 120 × 60 × 60 cm tại (242, 90, 0). Phần được đỡ x 300..362 × y 100..150 = 3.100 / 5.000 cm² → `0.62` đúng bằng literal. Hai mặt đỡ chồng nhau dưới PKG-008: 1.800 + 2.450 − 450 = 3.800 cm² → 0,76 (cộng thẳng ra 0,85).

**Test:** 19 test (geometry 4, vật cản 7, tỷ lệ đỡ 8), 15 vòng red → green. 4 test xanh ngay được chứng minh đỏ bằng đột biến rồi khôi phục: thể tích chồng mặt bị trôi (bỏ EPSILON trục z → 2,05e-10), mẫu Spec x = 120 (chồng lấn tính cả chạm mặt), nhiều vật cản (chỉ xét vật cản đầu), dung sai 0,2 cm (bỏ EPSILON → 45,2 không còn tiếp xúc; nới dung sai lên 0,3 cm → 45,3 bị báo).

**Đo tham khảo** (Vitest bench chạy một lần rồi xoá, không commit; máy dev; Vitest cảnh báo module getter nên là cận trên). 1.000 thùng 40 × 30 × 25 cm xếp kín trong Truck 6m:

| Thao tác | Trung bình |
|---|---:|
| `createPlacementLayout` | 0,63 ms |
| `supportIssues` × 1.000 (layout dựng sẵn) | 18,9 ms — riêng `grid.queryBelow` × 1.000: 18,7 ms |
| Xếp so le, mỗi kiện 2 mặt đỡ: `supportIssues` × 1.000 | 23,3 ms — riêng `queryBelow`: 22,2 ms |
| `obstacleIssues` × 1.000 | 0,61 ms |

Gần như toàn bộ chi phí nằm ở lưới X–Y (đúng nhận xét LM-016: một cột nhiều tầng rơi cùng ô); phần hợp diện tích chỉ thêm 1–5 %. Một lần kiểm cho editor ≈ 0,02 ms, xa ngân sách 8 ms. Chưa tối ưu: đo toàn engine ở LM-023 trước (AGENTS mục 12).

**Chuyển tiếp**

- **LM-019:** chốt nghĩa vật cản chịu tải **bỏ trống** `maxTopLoadKg` (không giới hạn hay chặn); tải truyền xuống vật cản chịu tải; dùng lại `PlacementLayout` để dựng đồ thị đỡ.
- **LM-020:** LIFO cần hợp diện tích trên mặt cắt Y–Z — lúc đó mới đưa `unionArea` lên `@/domain/geometry` dạng tổng quát.
- **LM-023:** ngân sách D-29 cho toàn engine; nếu vượt, thêm chiều Z vào khoá ô lưới. Khi kéo/thả phải tính lại tỷ lệ đỡ của các kiện phía trên vị trí cũ và mới.
- **LM-024:** mock service ghi `placement.supportRatio` bằng `supportRatio(placement, layout)`.
- **LM-028:** câu hiển thị vi/en cho `OBSTACLE_OVERLAP`, `NON_BEARING_SUPPORT`, `SUPPORT_BELOW_MIN`.
- **LM-035:** gỡ `supportCoverage` / `validatePlacement` cũ của editor sau khi chuyển sang engine.
- Layout giả định `packageInstanceId` không trùng (Map giữ bản cuối); trùng ID do `DUPLICATE_INSTANCE_ID` của LM-013 báo trước.

**Kiểm tra:** Vitest 186/186 ✅ (167 + 19) · `pnpm lint` ✅ (0 cảnh báo, 0 lỗi) · `pnpm build` ✅ (`tsc -b` + Vite).

---
id: LM-024
title: OptimizationService interface + MockOptimizationService (shelf packing)
phase: 1
labels: [service, mock]
depends_on: [LM-013, LM-017, LM-021, LM-022, LM-023]
estimate: 2d
prd: [D-11, D-23, D-33]
spec: [11, 12]
---

# LM-024 — MockOptimizationService

## Việc cần làm

- [ ] `src/services/optimization/OptimizationService.ts`: interface đúng Spec mục 11.
- [ ] `MockOptimizationService.ts` (thuần, chạy được cả trong worker và test):
  - [ ] Validate request (LM-017); còn error → `status: 'FAILED'`.
  - [ ] Mở rộng quantity (LM-013).
  - [ ] Sắp: `mustLoad` trước, `priority` cao, `deliveryStop` lớn (giao muộn) trước, thể tích lớn trước, ID — tất định; `randomSeed` chỉ dùng để phá hoà.
  - [ ] Shelf/row packing từ vách trong (x = 0) ra cửa: hàng theo Y, tầng theo Z; thử lần lượt `effectiveOrientations`; bỏ vị trí chồng vật cản; kiểm tra qua cửa, xếp chồng, support qua constraint engine.
  - [ ] Hết tải → `OVER_PAYLOAD`; không qua cửa → `DOOR_TOO_SMALL`; không có hướng → `NO_ALLOWED_ORIENTATION`; vi phạm xếp chồng → `STACKING_VIOLATION`; hết chỗ → `NO_SPACE`.
  - [ ] Placement qua `roundCm`; `loadingOrder`/`unloadingOrder` từ LM-022; `supportRatio`, `constraintWarnings` từ engine; metrics từ LM-021; `isMockResult: true`, `method: 'MOCK'`, `jobId` tất định theo seed + hash input.
- [ ] Không có tên `AIService`, không có chữ "AI optimized".

## Tiêu chí nghiệm thu

- [ ] Fixture Spec mục 12 cho kết quả `COMPLETED`, mọi placement qua `evaluateAll()` không có error.
- [ ] Property test (500 input ngẫu nhiên tất định): không placement nào vượt biên, chồng lấn nhau hoặc chồng vật cản; `placedCount + unplacedCount = số instance`.
- [ ] Cùng request + seed → kết quả giống hệt.
- [ ] 1.000 instance chạy xong < 1 s trên máy dev (ghi số).

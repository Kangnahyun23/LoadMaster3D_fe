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

- [ ] `checkObstacles(placement, vehicle)`: chồng lấn vật cản → `OBSTACLE_OVERLAP` (error).
- [ ] Kiện tựa trực tiếp lên mặt trên vật cản `loadBearing = false` → `NON_BEARING_SUPPORT` (error); vật cản `loadBearing = true` được tính là bề mặt đỡ.
- [ ] `supportRatio(placement, others, obstacles)`: diện tích hợp của các mặt đỡ (sàn, kiện, vật cản chịu tải) trong tolerance, không đếm trùng. Chuyển thuật toán hợp diện tích từ `viewer3d/editor/geometry.ts` sang domain (cm, EPSILON).
- [ ] Dưới `minSupportRatio` → `SUPPORT_BELOW_MIN` (warning) với `params.ratio`, `params.required`.
- [ ] Dùng lưới LM-016 để lấy ứng viên.
- [ ] `overlapArea2D`, `overlapVolume` trong `@/domain/geometry` (chuyển từ LM-015 vì đây là nơi dùng đầu tiên), so qua `lt/gt` EPSILON.

## Tiêu chí nghiệm thu

- [ ] Fixture Spec: kiện đặt ở (0,0,0) chồng hốc bánh `OBS-001` → error; kiện đặt trên hốc bánh (z = 45) → `NON_BEARING_SUPPORT`.
- [ ] Ví dụ Spec "PKG-008 support ratio 0.62 is below the required 0.80" tái hiện được.
- [ ] Hai kiện đỡ chồng lên nhau một phần không bị cộng trùng diện tích.

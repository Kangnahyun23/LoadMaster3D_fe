---
id: LM-031
title: Engine 3D đổi đơn vị sang cm (SCENE_SCALE = 0.01)
phase: 2
labels: [viewer3d, units, refactor]
depends_on: [LM-030]
estimate: 1.5d
prd: [D-03]
spec: [2, 10]
---

# LM-031 — Engine 3D sang cm

## Bối cảnh

Rủi ro lớn nhất của tích hợp: nhầm hệ số 10 âm thầm. Chỉ `scene/units.ts` được biết về scale.

## Việc cần làm

- [ ] `scene/units.ts`: `SCENE_SCALE = 0.01`; `boxCenter`, `boxSize`, `containerSize`, `containerCenter` đọc trường `*Cm` theo ánh xạ Spec mục 10.
- [ ] Rà mọi hằng số mm trong `viewer3d`: `cargo-buffers.ts` (`DROP_HEIGHT`, `HULL_PADDING`), `truck-geometry.ts`, `Container.tsx`, `ContainerDetails.tsx` (vạch sàn theo mét), `operations/stop-map.ts`, `placement-measurements.ts`, `ExtractionCorridor.tsx`, `SceneCallout`, `CameraRig` (fit theo bao).
- [ ] `benchmark.mock.ts`: sinh fixture cm theo contract Spec (132/300/500/1.000), không chồng lấn, không vượt thùng.
- [ ] Nhãn khoảng cách hiển thị cm (qua format theo locale).
- [ ] Tìm `mm`, `Mm`, `/ 1000`, `* 0.001` trong `src/` — không còn trong state/payload/nhãn.

## Tiêu chí nghiệm thu

- [ ] Ảnh chụp Planner mặc định, focus điểm giao, dỡ hàng khớp bộ ảnh `docs/screenshots/scene-first/` về tỷ lệ (sai lệch chỉ do dữ liệu seed khác).
- [ ] `?debug&packages=1000&quality=low`: draw call vẫn 16, không tăng theo số kiện.
- [ ] Test đơn vị: thùng 600 × 240 × 250 cm → kích thước scene 6 × 2,5 × 2,4.

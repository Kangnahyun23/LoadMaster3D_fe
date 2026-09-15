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

- [x] `scene/units.ts`: `SCENE_SCALE = 0.01`; `boxCenter`, `boxSize`, `containerSize`, `containerCenter` đọc trường `*Cm` theo ánh xạ Spec mục 10.
- [x] Rà mọi hằng số mm trong `viewer3d`: `cargo-buffers.ts` (`DROP_HEIGHT`, `HULL_PADDING`), `truck-geometry.ts`, `Container.tsx`, `ContainerDetails.tsx` (vạch sàn theo mét), `operations/stop-map.ts`, `placement-measurements.ts`, `ExtractionCorridor.tsx`, `SceneCallout`, `CameraRig` (fit theo bao).
- [x] `benchmark.mock.ts`: sinh fixture cm theo contract Spec (132/300/500/1.000), không chồng lấn, không vượt thùng.
- [x] Nhãn khoảng cách hiển thị cm (qua format theo locale).
- [x] Tìm `mm`, `Mm`, `/ 1000`, `* 0.001` trong `src/` — không còn trong state/payload/nhãn.

## Tiêu chí nghiệm thu

- [ ] Ảnh chụp Planner mặc định, focus điểm giao, dỡ hàng khớp bộ ảnh `docs/screenshots/scene-first/` về tỷ lệ (sai lệch chỉ do dữ liệu seed khác).
- [ ] `?debug&packages=1000&quality=low`: draw call vẫn 16, không tăng theo số kiện.
- [x] Test đơn vị: thùng 600 × 240 × 250 cm → kích thước scene 6 × 2,5 × 2,4.

## Kết quả (15/09/2026)

- [scene/units.ts](../../src/features/viewer3d/scene/units.ts): `SCENE_SCALE = 0.01`, `toScene`/`fromScene`; test đơn vị thùng 600 × 240 × 250 cm → 6 × 2,5 × 2,4 ([viewer-scene-first.test.ts](../../tests/viewer-scene-first.test.ts)).
- Toàn `viewer3d` dùng `ScenePlacement` + `VehicleConfig`; hằng số đổi: lưới 5 cm, hút 2 cm, tiếp xúc 0,2 cm, lát cắt bước 5 cm, bản đồ điểm giao (lề 2 cm, làn 10 cm, cao 0,4 cm), mặt snap dày 0,4 cm, `describeWhere` 150 cm, kéo editor commit qua `roundCm`. Nhãn khoảng cách/toạ độ qua `useFormat().length`.
- [benchmark.mock.ts](../../src/features/viewer3d/benchmark.mock.ts): `createBenchmarkInput(count)` sinh request + result đúng contract Spec (cm nguyên, 3 hướng tự nghịch đảo, `matchesOrientation` đúng từng kiện, không chồng lấn, không vượt thùng). `createBenchmarkPlan` mm giữ cho kho/tài xế tới LM-060. Mã instance đổi thành `BENCH-NNNNN-01`.
- Kho/tài xế vẫn `LoadPlan` mm; viewer của chúng qua `adaptLoadPlan`. Quan hệ trên/dưới cm tách ra [panels/placement-relations.ts](../../src/features/viewer3d/panels/placement-relations.ts) (bản mm `lib/placement.ts` còn cho kho).
- Test: 4 file `tests/viewer-*.test.ts` viết lại theo cm (helper [src/test/scene.ts](../../src/test/scene.ts): `benchmarkScene`, `seedScene`, `sceneBox`); test 6 × 6 cặp hướng thay test 9 cặp 0/1/2. E2E đổi toạ độ/kéo sang cm, mã `-01`, dữ liệu seed đọc qua `SOURCE_MODULES.scene`.
- Rà `mm`/`/ 1000`/`* 0.001` trong engine: không còn (`length / 1000` trong stop-map là tỉ lệ, không phải đổi đơn vị).
- Ảnh so bộ `docs/screenshots/scene-first/` và số draw call để ở LM-038.

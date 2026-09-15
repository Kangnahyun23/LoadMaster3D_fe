---
id: LM-033
title: Vẽ vật cản trong 3D với số draw call cố định
phase: 2
labels: [viewer3d, performance]
depends_on: [LM-031]
estimate: 1d
prd: [D-17]
spec: [7.6, 10]
---

# LM-033 — Vật cản trong 3D

## Việc cần làm

- [x] `scene/ObstacleInstances.tsx`: một `InstancedMesh` thân + một viền, màu khác kiện (token mới, ví dụ `--obstacle` / `--obstacle-bearing`, thêm vào `index.css` và AGENTS mục 4), phân biệt `loadBearing`.
- [x] Vật cản `RESERVED_ZONE` dạng trong suốt có vạch; `PARTITION` đặc.
- [x] Không raycast vật cản khi kéo kiện; click vật cản hiện thông tin loại, kích thước cm, chịu tải.
- [x] Nhãn ẩn `sr-only` mô tả vật cản (AGENTS mục 10).
- [x] Thêm vào chú giải cạnh chú giải điểm giao.

## Tiêu chí nghiệm thu

- [x] 0, 1 hoặc 20 vật cản đều thêm đúng 2 draw call. *(Đọc là: số draw call không tăng theo số vật cản — 0 vật cản không vẽ gì, 1 hay 20 vật cản cùng thêm đúng 2.)*
- [x] Hốc bánh mẫu Spec hiển thị đúng góc (0,0,0), 120 × 30 × 45 cm.

## Kết quả (15/09/2026)

- [ObstacleInstances.tsx](../../src/features/viewer3d/scene/ObstacleInstances.tsx): một `InstancedMesh` thân (`obstacle-body`, màu instance theo `loadBearing`: `--obstacle` / `--obstacle-bearing`) + một `LineSegments` gộp mọi cạnh (`obstacle-edges`). Không đổ bóng để shadow pass không thêm draw call; không có vật cản thì không vẽ gì.
- Vùng dành riêng: cùng vật liệu, thuộc tính instance `obstacleHatch` qua `onBeforeCompile` bỏ điểm ảnh giữa các vạch chéo (12 cm) → có vạch, nhìn xuyên được, vẫn ghi depth đúng; loại khác đặc. Không dùng vật liệu trong suốt thứ hai để giữ 2 draw call.
- Raycast: chế độ Xem bấm vật cản mở nhãn neo 3D (`ObstacleCallout`: loại, mã, kích thước, góc, chịu tải/tải tối đa, qua `viewer.obstacles.*` vi/en). Chế độ Chỉnh sửa tắt hẳn raycast vật cản (`obstaclePicking={false}`); lúc kéo editor còn tắt toàn bộ sự kiện R3F.
- Đổi đơn vị trong `scene/units.ts` (`obstacleCenter`, `obstacleSize`, `obstacleCorners`); buffer cạnh thuần ở `scene/obstacle-layout.ts`.
- `sr-only`: danh sách "Vật cản trong thùng" đặt cạnh Canvas cho cả ba vai trò. Chú giải `ObstacleLegend` nằm dưới chú giải điểm giao trong tab Hiển thị, chỉ khi xe có vật cản.
- Debug: `?debug&packages=N&obstacles=0|1|20` (`benchmark-obstacles.mock.ts`). 1 = hốc bánh mẫu Spec; 20 = đủ bốn loại, có vật cản chịu tải. Kiện chạm hình chiếu sàn của vật cản chuyển sang chưa xếp (`NO_SPACE`) nên fixture không chồng lấn; thiếu tham số thì benchmark giữ nguyên.
- Kiểm thử: `tests/viewer-obstacles.test.ts` (tâm/kích thước hốc bánh Spec `[0,6; 0,225; 0,15]` / `[1,2; 0,45; 0,3]`, 12 cạnh mỗi vật cản, fixture hợp lệ và không vi phạm `obstacleIssues`); `e2e/viewer-obstacles.spec.ts`: draw call 132 kiện tier balanced — không tham số 25, `obstacles=0` 25, `=1` 27, `=20` 27; bấm hốc bánh hiện đúng thông tin, chú giải và danh sách `sr-only`, chế độ Chỉnh sửa tia qua vật cản trả 0 giao cắt.
- Seed Planner (`TRIP-2026-0914`, xe `VEHICLE-002`) không có vật cản nên màn mặc định không đổi.

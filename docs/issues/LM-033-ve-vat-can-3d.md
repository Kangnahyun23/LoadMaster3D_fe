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

- [ ] `scene/ObstacleInstances.tsx`: một `InstancedMesh` thân + một viền, màu khác kiện (token mới, ví dụ `--obstacle` / `--obstacle-bearing`, thêm vào `index.css` và AGENTS mục 4), phân biệt `loadBearing`.
- [ ] Vật cản `RESERVED_ZONE` dạng trong suốt có vạch; `PARTITION` đặc.
- [ ] Không raycast vật cản khi kéo kiện; click vật cản hiện thông tin loại, kích thước cm, chịu tải.
- [ ] Nhãn ẩn `sr-only` mô tả vật cản (AGENTS mục 10).
- [ ] Thêm vào chú giải cạnh chú giải điểm giao.

## Tiêu chí nghiệm thu

- [ ] 0, 1 hoặc 20 vật cản đều thêm đúng 2 draw call.
- [ ] Hốc bánh mẫu Spec hiển thị đúng góc (0,0,0), 120 × 30 × 45 cm.

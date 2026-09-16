---
id: LM-042
title: Xem trước 3D thùng xe và vật cản ở trang chi tiết xe
phase: 3
labels: [fleet, viewer3d, performance]
depends_on: [LM-033, LM-041]
estimate: 1d
prd: [D-17, D-34]
---

# LM-042 — Xem trước 3D xe

## Việc cần làm

- [x] `viewer3d/VehiclePreviewViewer.tsx` dùng `SceneCanvas` (không có kiện), export để `fleet` lazy-load; không import `three` trong `features/fleet`.
- [x] Đọc giá trị bằng `useWatch`, debounce 250 ms; chỉ đẩy vào scene khi phần xe/vật cản đó parse hợp lệ; nếu không, giữ hình hợp lệ gần nhất và hiện nhãn "Đang chờ giá trị hợp lệ".
- [x] Camera chỉ fit lại khi kích thước thùng đổi; sửa vật cản không đổi góc nhìn người dùng.
- [x] Tier `low` mặc định, `frameloop="demand"`, không trang trí cabin để nhẹ.
- [x] Bấm dòng vật cản trong bảng thì vật cản đó được làm nổi trong 3D, và ngược lại.
- [x] Skeleton SVG đẳng cự khi đang tải chunk 3D.

## Tiêu chí nghiệm thu

- [x] Gõ "600" vào chiều dài không làm camera nhảy 3 lần; không có lỗi console khi giá trị trung gian không hợp lệ.
- [x] Danh sách `/doi-xe` không tải chunk Three.js (kiểm bằng network trong E2E).

## Kết quả (16/09/2026)

**Tách hai lớp.** `fleet/VehiclePreview.tsx` theo dõi form (`useWatch`, debounce 250 ms) và quyết định hình;
`viewer3d/VehiclePreviewViewer.tsx` chỉ vẽ: `SceneCanvas` không kiện, `experience="fleet"`, tier `low` (trừ khi
`?debug&quality=` khoá tier khác), `decoration={false}`, `frameloop="demand"` sẵn có. `fleet` lazy-load component
này; chunk `VehicleDetailPage` sau build không import `SceneCanvas`/`three`.

**Hình hợp lệ.** `fleet/vehicle-preview.ts` (thuần, có unit test): `previewVehicle` parse phần hình học (lòng thùng,
cửa, vật cản) bằng zod rồi chạy `validateVehicle`; lỗi của trường không vẽ (tải trọng, tải trên) không chặn hình.
`nextPreview` giữ hình hợp lệ gần nhất và bật nhãn "Đang chờ giá trị hợp lệ"; hình học không đổi thì trả đúng state cũ.

**Camera.** `SceneCanvas` có thêm `frameVehicle` cho `CameraRig`. `nextPreview` chỉ đổi tham chiếu `frame` khi dài,
rộng hoặc cao lòng thùng đổi (so qua `eq`), nên sửa vật cản hay cửa không canh khung lại.

**Làm nổi vật cản.** `SceneCanvas` nhận `highlightedObstacleId`/`onObstacleSelect` (có prop thì không mở callout).
`ObstacleInstances` tách ghi màu khỏi ghi ma trận: đổi vật cản làm nổi chỉ `setColorAt` màu `--highlight`, không thêm
draw call. Bấm/focus vào một dòng bảng (`aria-current`, nền `--primary-bg`) làm nổi trong 3D; bấm vật cản trong 3D làm
nổi dòng, bấm lại thì bỏ.

**Skeleton và jsdom.** `VehiclePreviewSkeleton` vẽ SVG đẳng cự theo đúng tỉ lệ thùng đang nhập khi đang tải chunk.
Không có `WebGLRenderingContext` (jsdom, trình duyệt tắt WebGL) thì chỉ vẽ phác thảo tĩnh kèm câu giải thích, không tải
chunk — test RTL của form giữ nguyên.

**Bố cục.** Từ `xl`, xem trước là cột phải 400 px dính khi cuộn; màn hẹp hơn nằm cuối form.

**Kiểm chứng.** `vehicle-preview.test.ts` (9 ca: 6/60 cm làm hốc bánh HD210 lọt ra ngoài, 600 cm hợp lệ; sửa vật cản/cửa
giữ `frame`). E2E `e2e/fleet-vehicle-preview.spec.ts`: danh sách `/doi-xe` không request `.vite/deps/three`,
`@react-three_*` hay `VehiclePreviewViewer` (đối chứng: mở xe thì có); gõ "600" vào HD210 (720 cm) canh camera đúng
1 lần, dời OBS-001 không canh thêm, không lỗi console; xe mới 600 cm gõ lại "600" canh 0 lần — đặt debounce 0 thì cùng
test đếm 3 lần; bấm OBS-002 trong 3D làm nổi dòng, bấm dòng OBS-001 tô instance 0 màu `facc15`.

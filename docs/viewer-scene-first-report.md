# Scene-first 3D UX — 14/09/2026

## Implemented

Giữ core sau Prompt 1–4: `Immutable LoadPlan + ViewerDraft → Effective placements + SceneSemantics → SceneCanvas`. Planner, kho và tài xế tiếp tục dùng cùng renderer, instance mapping và quality tiers. Không đổi domain, dependency, mock nghiệp vụ hoặc nối backend.

- Planner mặc định mở toàn vùng scene; inspector chứa thông tin kiện, danh sách, vận hành, tải trục, màu/slice và lớp phân tích. Duyệt phương án vẫn là primary duy nhất.
- Timeline có các ô cao bằng nhau, khe và ranh giới điểm giao, marker hiện tại; tối đa 64 bins theo chiều rộng. Slider vẫn có đủ 1.000 bước.
- Hover/selected/current/next dùng số lượng viền và nhãn cố định. Double-click focus giữ góc nhìn; Esc hoặc “Xem toàn xe” phục hồi camera. Theo bước tự tạm dừng khi người dùng xoay camera.
- Editor thêm mặt phẳng thao tác, khoảng cách vách/mặt đỡ, mặt snap, vùng giao nhau và vị trí gốc. Các cập nhật trong gesture dùng refs/Three/DOM imperative; undo/redo và geometry validation được giữ nguyên.
- Dỡ hàng có hành lang, mũi tên và quan hệ target/blocker. Khi phát gặp blocker, mô phỏng dừng tại target; chọn blocker để xem không đổi target. Có quay lại target và bỏ qua bước mô phỏng một cách tường minh. Bỏ qua kiện bị cản chỉ fade tại chỗ.
- CoM là lớp phân tích tùy chọn: marker, chiếu xuống sàn, tham chiếu tâm thùng và HUD lệch ngang; bật lớp không đổi camera. Tải trục vẫn lấy từ phương án gốc.
- Atlas trung tính chung phân biệt carton/pallet/crate bằng thuộc tính instance; cargo vẫn tối đa ba InstancedMesh. Giữ cabin, bánh, hardware cửa, sàn và ánh sáng đã có; không tăng polygon xe hoặc thêm postprocessing.

## Visual bugs đã sửa

- Bỏ dải màu bên ngoài xe. Bản đồ điểm giao mặc định tắt, geometry nằm trong mép sàn và chịu che khuất bình thường; vẫn giữ tỷ lệ thực khi nhiều stop xen kẽ.
- Bỏ histogram timeline cao thấp và các mảng màu dính liền khó đọc.
- Sửa leader lệch điểm neo, nhãn current/next tràn khỏi phone, nhãn blocker đè nhau, nhãn snap bị xuống dòng thành cột hẹp và nút quay lại target trắng trên trắng. Focus điểm giao đưa bước hiện tại về kiện đầu tiên của điểm đó, tránh nhãn của điểm khác.
- CoM có marker đọc được khi bị hàng che; marker phân tích xuyên che khuất, khối cargo vẫn giữ depth bình thường.

## Scene UX và ảnh kiểm tra

Ảnh dùng UI thật trong Chromium, viewport desktop 1600×1000, tablet 1024×900 / 820×1180 và phone 390×844. Overlay debug được ẩn riêng lúc chụp để thể hiện giao diện sản phẩm; [số đo từng cảnh](benchmarks/viewer-scene-first-visual-qa-2026-09-14.json) được lưu riêng. Ảnh editor dùng 1.000 kiện và focus vào kiện đang sửa.

| Trạng thái | Ảnh |
|---|---|
| Trước đợt sửa này | [Planner trước](screenshots/operations-planner.png) |
| Mặc định | [Planner](screenshots/scene-first/01-planner-default.png) |
| Xếp giữa chừng | [Bước 47](screenshots/scene-first/02-loading-middle.png) |
| Focus điểm 2 | [Điểm 2](screenshots/scene-first/03-stop-two.png) |
| Dỡ thông thoáng | [Đường dỡ](screenshots/scene-first/04-unloading-clear.png) |
| Dỡ gặp blocker | [Cảnh báo](screenshots/scene-first/05-unloading-blocked.png) |
| CoM | [Tâm khối lượng hàng](screenshots/scene-first/06-center-of-mass.png) |
| Snap hợp lệ | [Editor snap](screenshots/scene-first/07-edit-valid-snap.png) |
| Overlap | [Editor overlap](screenshots/scene-first/08-edit-overlap.png) |
| Tablet | [1024 px](screenshots/scene-first/09-planner-1024.png), [820 px](screenshots/scene-first/09-planner-820.png) |
| Planner phone | [390 px](screenshots/scene-first/09-planner-390.png) |
| Driver phone | [Driver](screenshots/scene-first/10-driver-phone.png) |

## Performance trước / sau

Nguồn trước: [benchmark Prompt 3–4](benchmarks/viewer-operations-2026-09-14.json). Nguồn sau: [benchmark hiện tại](benchmarks/viewer-scene-first-2026-09-14.json). Chromium headless / SwiftShader, viewport 1600×1000, DPR thiết bị 1. Scene mới sử dụng vùng Canvas rộng hơn vì bỏ hai panel thường trực; khối lượng pixel khác lần đo trước.

| Kiện | Tier / DPR | Draw calls trước → sau | Tam giác sau | FPS trước → sau khi kéo |
|---:|---|---:|---:|---:|
| 132 | low / 0,5 | 16 → 16 | 3.428 | 60 → 60 |
| 300 | low / 0,5 | 16 → 16 | 7.460 | 60 → 60 |
| 500 | low / 0,5 | 16 → 16 | 12.260 | 60 → 60 |
| 1.000 | low / 0,5 | 16 → 16 | 24.260 | 31 → 22 |
| 1.000 | balanced / 1 | 25 → 25 | 41.444 | 16 → 14 |
| 1.000 | high / 1 | 33 → 33 | 58.378 | 10 → 9 |

Chi phí draw của scene mặc định giữ nguyên; geometry tăng khoảng 94 tam giác từ viền nghiệp vụ cố định. Editor thêm hai InstancedMesh phụ có capacity 3 mặt snap và 4 vùng overlap, không nhân theo cargo count. Không có mesh/label/shadow riêng cho từng kiện.

FPS phần mềm dao động: [lượt kiểm tra operations riêng](benchmarks/viewer-scene-first-operations-2026-09-14.json) ghi 37 FPS ở low/1.000, còn lượt benchmark cuối ghi 22 FPS. Không kết luận đã tăng tốc GPU từ các mẫu này. Bottleneck còn lại là pixel/transparent overdraw, bóng ở high và software rendering; cần đo GPU PC/tablet/phone thật để xác nhận mục tiêu thiết bị. Demand mode nghỉ với **0 frame thừa**, kể cả debug; tier override/DPR, runtime downgrade, cooldown và reduced motion vẫn hoạt động.

## Kiểm tra

- 37 kiểm tra TypeScript: toàn bộ 32 kiểm tra cũ và 5 regression mới cho stop-map trong thùng, stop xen kẽ, mặt snap thực, vùng giao nhau và khoảng cách mặt đỡ.
- Browser regression giữ các kiểm tra camera, picking, slice, màu, playback, pin/orientation, draft reset, editor/history, touch drag/nudge, kho, driver lazy loading, approval và reduced motion. Các selector được cập nhật cho inspector/toolbar mới.
- Cả 7 suite browser pass: `viewer-ui`, `viewer-editor-ui`, `viewer-operations-ui`, `viewer-visuals`, `viewer-demand-quality`, `viewer-benchmark`, `viewer-scene-first-ui`. Suite mới kiểm tra scene mặc định rộng, stop map tắt, follow/pause, double-click/reset focus, target blocker không bị thay thế, stop focus, snap/overlap, timeline đều và nhãn không tràn viewport. Đã xem trực tiếp 12 ảnh và sửa lỗi bố cục.
- `pnpm lint`: pass. `pnpm build`: pass. Vite vẫn cảnh báo chunk >500 kB; `SceneCanvas` khoảng 668 kB minified / 184 kB gzip và tiếp tục lazy-load.

## Files chính

- Workspace: `ViewerPage`, `WorkspaceToolbar`, `SceneInspector`, `SceneHud`, `Timeline`.
- Scene: `SceneCanvas`, `CameraRig`, `CargoInstances`, `CargoFeedback`, `SelectionLabel`, `SceneCallout`, `cargo-buffers`, `cargo-surface`.
- Editor: `EditorProxy`, `EditorSpatialFeedback`, `EditorGestureHud`, `spatial-feedback`, `snapping`, `preview-store`, `useManualEditor`, `EditorToolbar`.
- Operations: `useOperations`, `useUnloadPlayback`, `OperationsPanel`, `OperationsCues`, `ExtractionCorridor`, `DriverCargoViewer`, `LoadPlanViewer`.
- Tests/evidence: các suite `tests/viewer-*`, báo cáo/ảnh/JSON này và cập nhật quy tắc tương ứng trong `AGENTS.md`.

## Deferred

Chưa đo thiết bị thật; chưa có mô phỏng người/xe nâng, physics, authoritative unload sequence, optimizer hoặc tính tải trục từ CoM. Bề mặt pallet/crate biểu diễn loại đóng gói trên bounding envelope, không mô hình hóa từng thanh/vật chứa. Draft vẫn chỉ trong phiên; chưa lưu/chia sẻ giữa vai trò. Không thêm backend fields, API/WebSocket, offline hoặc WebGPU.

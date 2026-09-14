# 3D Operations Engine — Prompt 3 + 4

Ngày 14/09/2026. Hoàn thiện trên foundation và manual editor hiện có; không nối backend, thêm dependency hay thay renderer. Yêu cầu bổ sung về chi tiết xe/animation được thực hiện trong cùng phạm vi.

## Kiến trúc

Trước: Planner đã có adapter/draft/editor; Warehouse còn dựng scene riêng; Driver chỉ có danh sách 2D. Playback lấy loading step, chưa phân biệt kiểm tra thứ tự và khả năng tiếp cận khi dỡ.

Sau:

```text
Immutable LoadPlan → adaptLoadPlan → ViewerSceneModel
                                      + ViewerDraft (Planner)
                                      ↓
                               Effective placements
                                      + SceneSemantics
                                      ↓
                                  SceneCanvas
                         Planner / Warehouse / Driver
```

`SceneCanvas` dùng chung units, camera, cargo instances, ID mapping, selected state, chất lượng và cues. Wrapper sở hữu panel/workflow riêng; Warehouse/Driver không tải editor UI. Three của Driver chỉ tải khi mở “Xem vị trí hàng”. Không ghi vào `plan.placements`.

Cargo vẫn tối đa 3 InstancedMesh: solid, ghost và hull. Low bỏ hull chung, giữ warning hull khi cần. Sáu bánh dùng một InstancedMesh riêng. Chỉ một editor proxy hoặc một proxy animation dỡ tạm, không tạo mesh/HTML label cho từng kiện.

## UX theo vai trò

- **Planner:** Xếp hàng / Dỡ hàng có state riêng; focus điểm giao; current/next; ẩn các điểm trước, làm mờ điểm sau; chọn/focus blocker; khung hành lang dỡ; CoM toggle; dải phân bố stop thực; tải trục kèm tỷ lệ và nguồn phương án gốc. Timeline tối đa 80 bins, slider vẫn đủ 1.000 bước. Duyệt phương án là primary duy nhất; dialog phân biệt source, phép tính và advisory, thao tác gửi vẫn báo chờ backend.
- **Editor giữ nguyên:** drag bằng một proxy, nudge cảm ứng, snap, rotate 0/1/2, pin, geometry validation, support advisory, undo/redo/reset, camera focus. Gesture không đưa React state qua mỗi pointer frame. Đổi sang edit dừng playback; chỉnh geometry bắt đầu lại mô phỏng dỡ.
- **Warehouse:** `PositionViewer` tái sử dụng core; cargo đã xếp trầm, current nổi bật, next ghost, future ẩn. Viền mờ xuyên che khuất giúp tìm current nhưng khối đặc vẫn giữ depth. Có “Chỉ kiện này”, camera preset lớn và chỉ dẫn khoảng cách thực từ vách/cửa/sàn, layer và kiện gần nhất bên dưới. Không chỉnh plan. API nội bộ đổi thành `plan/current`, đã cập nhật caller duy nhất.
- **Driver:** modal 3D lazy, cửa sau mặc định, chỉ mô phỏng thứ tự gợi ý tại stop hiện tại, giữ kiện từ chối trên xe, inspection blocker, focus và khoảng cách. Playback không đánh dấu đã giao. Đóng modal trở về danh sách và phục hồi focus.
- **Responsive/accessibility:** phone ưu tiên Canvas và panel dưới; Planner dùng drawer chi tiết/hiển thị; Warehouse xếp scene trên chỉ dẫn ở màn hẹp. Nút cảm ứng 56px, camera orbit/pinch, nudge thay drag, keyboard shortcuts có guard cho input/dialog. Nhãn ID có số điểm; panel có tên điểm; reduced motion không dịch chuyển lớn.

## Chi tiết xe và chuyển động

Cabin có profile vát, kính trước/bên, gương, tay nắm, bậc lên xuống, grille, đèn, chắn trước/sau, thanh bảo vệ, bình dưới gầm, chắn bùn. Mâm, hub và bulông bánh nằm trong geometry instanced chung; phụ kiện thân xe gộp thành một mesh. Cửa có bản lề, thanh khóa, khung và animation mở ngắn. Sàn có vạch chia thực theo mét. Đây là biểu diễn minh họa, không phải cấu hình chassis/axle authoritative.

Cargo dùng một texture trung tính 128×128 dùng chung cho chi tiết bề mặt/đường đóng gói, nhân với instance color; không phải nhãn hướng đặt. Low tắt chi tiết phụ. Không postprocessing, physics hoặc tài nguyên ảnh tải ngoài.

Loading giữ spring ghi slot đang xếp. Unloading dùng một proxy: đường thẳng về rear door khi hành lang trống; có potential blocker thì fade tại chỗ. Reduced motion chỉ fade ngắn, low bỏ translation. Camera/animation gọi invalidate và trở lại idle; camera fit theo phép chiếu các góc bao, giữ hướng người dùng khi resize/focus.

## Chất lượng và giới hạn đo

High/balanced/low điều khiển DPR, shadows, hull chung, decoration, surface và animation. Profile đầu dựa trên CPU/memory hint và role, không suy diễn phone luôn yếu. Runtime chỉ quan sát frame liên tục: 3 mẫu >28 ms để hạ, 8 mẫu <18 ms để nâng, cooldown 12 giây; bỏ qua idle. Debug override khóa tier. Đã kiểm tra downgrade balanced → low trong trình duyệt, upgrade/hysteresis/cooldown bằng unit test.

Số đo cuối ở `benchmarks/viewer-operations-2026-09-14.json`. Môi trường Chromium headless + SwiftShader, viewport desktop 1600×1000, DPR thiết bị 1. FPS là mẫu khoảng cách frame khi kéo camera, không phải GPU timestamp hay benchmark điện thoại thật. Các viewport cảm ứng 390×844 và 820×1180 chỉ là giả lập thao tác/bố cục.

| Kiện | Tier | DPR | Draw calls | Triangles | FPS khi kéo camera |
|---:|---|---:|---:|---:|---:|
| 132 | low | 0,5 | 16 | 3.336 | 60 |
| 300 | low | 0,5 | 16 | 7.370 | 60 |
| 500 | low | 0,5 | 16 | 12.166 | 60 |
| 1.000 | low | 0,5 | 16 | 24.166 | 31 |
| 1.000 | balanced | 1 | 25 | 41.350 | 16 |
| 1.000 | high | 1 | 33 | 58.284 | 10 |

Low dùng Lambert cho cargo sau khi quan sát 25 FPS ở 1.000 kiện với Standard trên cùng camera mới; lần đo sau đạt 31 FPS. Đây là hai mẫu trên máy phần mềm, không phải bảo đảm tăng hiệu năng cố định. Balanced/high giữ Standard và texture; tốc độ phần mềm thấp ở hai tier này là lý do cần adaptation và đo GPU thật, không phải căn cứ để tuyên bố mọi tier đạt target. Xe chi tiết 132 kiện ở high: 33 draws, 16.620 triangles. Editor low ở 1.000 kiện: 19 draws; inspection có blocker và CoM: 21 draws. Tất cả quay về idle khi kết thúc thao tác.

Phép đo thuần TypeScript ở đợt kiểm tra tổng hợp: derivation operations 1.000 kiện trung bình ~0,44 ms; summary approval ~28,74 ms; snapping + validation p95 ~3,78 ms. Tải CPU và GC ảnh hưởng kết quả, nên không dùng các số này làm cam kết latency trên thiết bị khác.

Ảnh kiểm tra: `screenshots/operations-planner.png`, `operations-truck.png`, `operations-driver-phone.png`.

## Kiểm chứng

- 32 kiểm tra TypeScript pass: immutable snapshot, 9 tổ hợp orientation, deterministic fixtures, ID mapping, draft/history, snapping/bounds/overlap/support union, stop-order/corridor, suggested unload order, mass, distribution/bins, measurements và quality policy.
- Browser operations: chọn đúng instance 1000; current/next; loading/unloading; ẩn stop trước; blocker click/focus; warning hull trên low; CoM; approval wording; warehouse isolate + xác nhận bước; driver không tải Three trước khi mở; phone/tablet drawer và đóng modal. Không có browser error.
- Browser editor regression: mouse drag hợp lệ/không hợp lệ/Escape, camera/raycast capture, orientation/pin/nudge/undo/redo/reset/focus; touch drag + undo, touch alternatives, 1.000 instances. Không có browser error.
- Animation kiểm tra transform thực: spring loading có nhiều frame; proxy dỡ di chuyển/fade; reduced motion không translation; hoàn tất quay về demand idle. Kiểm tra hình ảnh xe/cửa và driver phone.
- `pnpm lint`: pass, không warning/error từ oxlint.
- `pnpm build`: pass (TypeScript + Vite production). Vite còn cảnh báo chunk >500 kB; shared `SceneCanvas` ~662 kB minified / 182 kB gzip, tải lazy. Chưa tối ưu bundle thêm khi chưa có số đo thiết bị thật chứng minh cần tách tiếp.

## Files thay đổi chính

- Core: `scene/SceneCanvas.tsx`, `CameraRig.tsx`, `CargoInstances.tsx`, `useCargoMatrices.ts`, `useCargoColors.ts`, `SelectionLabel.tsx`; `usePerformanceFlags.ts`, `quality-policy.ts`, `DebugOverlay.tsx`.
- Visual: `scene/TruckCab.tsx`, `truck-geometry.ts`, `Container.tsx`, `ContainerDetails.tsx`, `SceneLighting.tsx`, `materials.ts`, `cargo-surface.ts`.
- Operations: `operations/operations-model.ts`, `scene-semantics.ts`, `useOperations.ts`, `useUnloadPlayback.ts`, `OperationsToolbar.tsx`, `OperationsPanel.tsx`, `BlockerPanel.tsx`, `OperationsCues.tsx`, `ExtractionCorridor.tsx`, `UnloadMotion.tsx`, `placement-measurements.ts`, `approval-checks.ts`.
- Planner: `ViewerPage.tsx`, `LoadPlanViewer.tsx`, `Timeline.tsx`, `ApprovePlanDialog.tsx`, `panels/SceneInspector.tsx`, `SelectedPackagePanel.tsx`, các overlay axle/slice/stop; editor toolbar/focus integration.
- Warehouse/Driver: `PositionViewer.tsx`, `DriverCargoViewer.tsx`; `warehouse/LoadingStepPage.tsx`, `PackageInstructionCard.tsx`, `describe-step.ts`; `driver/DriverStopPage.tsx`, `driver.mock.ts`; `lib/placement.ts` chỉ nhận readonly array.
- Rules/evidence: `AGENTS.md`, báo cáo và JSON benchmark; các test operations, visual, benchmark và regression hiện có. Không đổi major, lockfile, backend contract hoặc mock nghiệp vụ 132 kiện.

## Source Data

Placement ID, position mm, oriented dimensions, orientation, weight, step, stop, pinned/fragile; stop number/name; container inner dimensions; tải/capacity trục trước/sau và payload lấy trực tiếp từ LoadPlan. Sau edit, tải trục vẫn ghi rõ là số phương án gốc.

## Derived

Effective placements từ draft; loading states từ step; tỷ lệ tải trục source; tâm khối lượng **hàng** bằng tổng center×weight/tổng weight; phân bố thể tích theo đoạn chiều dài; measurements và timeline bins. Các phép tính deterministic; không suy luận center of mass toàn xe.

## Advisory

Suggested unload order; potential blocker qua hành lang +X; weak support/fragile-load/manual edits của editor. Stop-order consistency chỉ kiểm tra stop theo loading step giảm dần. Hành lang bỏ qua người, xe nâng, clearance, thay đổi hướng kiện khi dỡ; không gọi “không thể dỡ” hoặc “LIFO hoàn toàn hợp lệ”. Nearest-below trong hướng dẫn kho không phải stability solver.

## Missing Backend Data

Axle positions, wheelbase, tare weight, tare center of mass, vehicle configuration, kingpin position nếu semi-trailer; authoritative unload sequence và dữ liệu thao tác/clearance nếu muốn xác nhận khả năng dỡ. Cần hợp đồng lưu/duyệt draft, version/concurrency và tính lại tải trục sau edit/dỡ trước khi coi kết quả là authoritative. Không tự thêm field giả vào runtime.

## Technical debt và deferred

Chưa đo thiết bị PC/tablet/phone thật, thermal/battery hoặc GPU timestamp; high có shadows và transparency nên nhạy fill rate. Các buffer cargo vẫn dành slot cho toàn bộ placements (instance ẩn thu về zero scale); draw calls không tăng nhưng vertex/pixel cost còn phụ thuộc scene. Heuristic tổng hợp approval là O(n²), chỉ chạy khi mở dialog; không chạy mỗi frame. Draft chưa lưu/chia sẻ giữa phiên/role vì chưa có backend.

Chưa có auto-follow camera (optional; người dùng chủ động focus), authoritative optimizer/LIFO/axle physics, người/xe nâng, animation thao tác vật lý, arbitrary rotation, kéo UnplacedPackage vào thùng, API/WebSocket, offline queue, WebGPU, physics engine hay dependency nâng major.

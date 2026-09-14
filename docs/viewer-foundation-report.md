# Prompt 1 — Foundation 3D Operations Engine

Phạm vi: foundation của planner, tương thích viewer kho. Không triển khai Prompt 2–4, không nối backend, không đổi dependency.

## 1. Kiến trúc trước và sau

Trước: `LoadPlan → useLoadPlanViewer (Map orientation + Map pinned) → Placement[] → CargoInstances`.

Sau:

```text
LoadPlan (snapshot nguồn, không bị sửa)
  → adaptLoadPlan
  → ViewerSceneModel (bản sao được freeze, lookup theo ID, canonical dimensions)
  + ViewerDraft { patches: Map<placementId, PlacementPatch> }
  → resolveEffectiveScene
  → EffectiveViewerScene { placements, placementById }
  → CargoInstances → GPU buffers
```

`PlacementPatch` nhận `position`, `orientation`, `pinned`. Chỉ chứa khác biệt với snapshot; trả về giá trị nguồn sẽ loại field khỏi patch. Unknown ID không làm đổi draft. Vị trí được sao chép để tránh caller sửa tiếp object sau commit.

Domain `src/types/load-plan.ts` và mock nghiệp vụ `src/lib/load-plan.mock.ts` giữ nguyên. Component scene lấy vehicle/geometry từ model nội bộ. Màn kho giữ API `PositionViewer` và luồng lazy-load hiện tại; engine dùng chung cho cả ba vai trò là phạm vi Prompt 4.

Orientation được giải nghĩa đúng contract: kích thước đã xoay → đảo hướng nguồn → kích thước canonical → áp hướng đích. Ví dụ nguồn orientation 1 có `400×600×250` thì target 2 thành `250×400×600`, giữ nguyên góc vị trí mm. Kiểm tra đủ chín cặp nguồn/đích 0/1/2.

GPU slot có hai bảng ánh xạ ID↔index riêng, sắp theo ID. List order, group và filter không được dùng làm identity. Khi tập ID thay đổi, buffers và mapping được cập nhật đồng bộ. Các kiện khác vẫn là instances; toàn bộ scene chỉ có một outline và một nhãn HTML cho kiện được chọn.

## 2. Render và hot paths

- Tách cập nhật màu khỏi cập nhật ma trận. Đổi selection không ghi lại buffers cargo; đổi màu không ghi lại ma trận.
- Step/slice so sánh visibility; geometry so sánh vị trí/kích thước. Chỉ slot thay đổi được ghi và đánh dấu vùng upload. Vòng so sánh vẫn O(N), chưa thêm cấu trúc dữ liệu phức tạp.
- Animation dùng spring và ref theo ID; mỗi frame ghi ma trận kiện đang chạy và hull tương ứng. Khi tua/ngắt animation, đưa kiện cũ về vị trí đúng trước khi bắt đầu kiện mới.
- Không gọi `computeBoundingSphere()` trong đường animation, step, slice hay màu. Sphere bảo thủ bao mọi effective placement và quãng rơi, chỉ dựng lại khi geometry thay đổi. Cần giữ sphere vì raycast vẫn kiểm tra nó ngay cả khi `frustumCulled=false`.
- Planner và warehouse Canvas dùng `frameloop="demand"`. CameraControls và spring đánh thức loop; cập nhật buffer imperative gọi invalidate. Scene nghỉ ngừng render.
- Debug dùng subscription riêng, đọc renderer sau render, không tự invalidate. FPS chỉ tính chuỗi frame liên tục, khoảng nghỉ bị loại. `ms/frame` là khoảng cách frame CPU quan sát được, không phải GPU timer.

Tham chiếu đã đối chiếu với source đang cài: [R3F demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three.js InstancedMesh bounds và raycast](https://threejs.org/docs/pages/InstancedMesh.html).

## 3. Quality tiers và dữ liệu benchmark

| Tier | DPR tối đa | Shadows | Hull chung | Cabin/bánh/mặt đất | Animation |
|---|---:|---|---|---|---|
| high | 2 | Có | Có | Có | Rơi đầy đủ |
| balanced | 1,5 | Không | Có | Có | Quãng rơi nhỏ |
| low | 0,5 | Không | Không | Không | Tắt |

Mọi tier giữ thùng, cửa, màu, selection outline và nhãn. Postprocessing tắt. `prefers-reduced-motion` theo dõi thay đổi khi đang xem và tắt translation cargo. Cấu hình khởi đầu dựa trên thông tin phần cứng có sẵn, không mặc định mọi mobile yếu; chưa có runtime adaptation/hysteresis (Prompt 4).

Ví dụ: `/chuyen/TRIP-2026-0914/phuong-an?debug&packages=1000&quality=balanced`.

Thiếu `debug` thì `packages` và `quality` không làm đổi luồng thường. `?debug` không có `packages` dùng mock nghiệp vụ 132 kiện. Có `packages=132` dùng fixture riêng 132 kiện, không thay mock nghiệp vụ.

Generator deterministic chứa 4 stops, ít nhất 3 dạng kích thước, orientation nguồn 0/1/2, ID và step duy nhất, tọa độ/kích thước mm nguyên, không overlap và không vượt thùng. Các ô có khoảng trống: đây là fixture đo renderer, không phải load plan đã kiểm chứng support hoặc ổn định vật lý.

## 4. Kết quả kiểm tra

Kiểm thử trình duyệt dùng Windows, headless Chromium 149, SwiftShader (renderer phần mềm). Không phải phép đo trên GPU desktop thực, tablet hoặc điện thoại thực; không dùng các con số này để chứng nhận FPS thiết bị.

Màn sản phẩm thật, viewport 1600×1000, DPR 1, tier balanced, toàn bộ kiện hiển thị, có một kiện được chọn:

| Placements | Draw calls | Tam giác | Frame thêm khi nghỉ 1,2 giây |
|---:|---:|---:|---:|
| 132 | 20 | 5.482 | 0 |
| 300 | 20 | 11.530 | Scene về trạng thái nghỉ |
| 500 | 20 | 18.730 | Scene về trạng thái nghỉ |
| 1.000 | 20 | 36.730 | Scene về trạng thái nghỉ |

Tại 1.000 kiện: low 14 calls, 24.116 tam giác; high 26 calls, 49.354 tam giác (bao gồm shadow). Số đo ban đầu dùng DPR 1; low sau nghiệm thu bổ sung dùng DPR 0,5 để ưu tiên tương tác. Không tăng draw call tuyến tính theo kiện. Triangle count vẫn tăng theo số instance; tắt/hide bằng scale zero chưa giảm instance count submitted.

Đối chứng source trước/sau trên cùng fixture/scene, viewport 1280×720, DPR 1, không shadows, có hull, ép render liên tục để so sánh công bằng (đây là harness đo, app thật dùng demand):

| Kiện | FPS trước | FPS sau | Calls trước/sau (chưa chọn) | Ma trận ghi khi đổi một vị trí, trước → sau |
|---:|---:|---:|---:|---:|
| 132 | 27,2 | 29,1 | 19 / 19 | 396 → 3 |
| 300 | 33,0 | 33,3 | 19 / 19 | 900 → 3 |
| 500 | 29,1 | 30,1 | 19 / 19 | 1.500 → 3 |
| 1.000 | 25,3 | 24,5 | 19 / 19 | 3.000 → 3 |

FPS là một lần đo SwiftShader, dao động theo CPU/headless scheduling; **chưa chứng minh cải thiện FPS khi render liên tục**. Kết luận có bằng chứng rõ là giảm công việc cập nhật và ngừng render khi idle. Khối lượng tam giác và chi phí rasterization không thay đổi ở cùng tier.

Ở 1.000 kiện, đổi màu trước đây ghi 3.000 ma trận + 2.000 màu + gọi `computeBoundingSphere()` 3 lần; sau chỉ ghi 2.000 màu. Đổi một vị trí trước ghi lại tất cả, sau chỉ ghi 3 ma trận và dựng conservative bounds một lượt O(N). Step + animation không còn ghi lại màu hoặc gọi `computeBoundingSphere()` mỗi frame. Ghi ma trận dùng vùng update tương ứng của buffer.

Kiểm tra đã qua:

- `pnpm lint` không warning; `pnpm build` thành công (Vite còn cảnh báo kích thước chunk Three.js).
- 13 Node tests: orientation, snapshot immutability, patch merge/reset, ID mapping/reorder/filter, dirty geometry, slice/step, deterministic generator, bounds và kiểm tra overlap tất cả cặp của bốn fixtures.
- Luồng trình duyệt: đăng nhập mẫu, 5 presets, orientation cycle, pin/unpin, 3 color modes, slice từ 0 đến hết, tua và playback 4×, đổi fixture qua router và reset draft, cả ba quality tiers, reduced motion, debug chỉ xuất hiện đúng query.
- Kho: camera và xác nhận sang kiện tiếp theo. Tài xế: route 2D hiện tại giữ nguyên. Không có JavaScript page errors.
- Kiểm tra scene 1.000 kiện: ma trận của cả ba instanced meshes đúng sau đảo thứ tự, lọc còn 500, khôi phục, đổi vị trí/orientation ngoài bounds cũ, tắt/bật lại hull, ngắt spring bằng scrub/slice/draft và tua liên tiếp mỗi 175ms. Picking tại các điểm nhìn thấy rõ đúng ID trước/sau reorder/filter/draft. Sau khi ổn định, 0 frame thêm trong 1,2 giây.

Dữ liệu gốc được lưu ở [benchmarks/viewer-foundation-2026-09-13.json](benchmarks/viewer-foundation-2026-09-13.json). Lượt đo FPS đầu có một tọa độ thử của fixture 300 rơi sát cạnh/kiện che khuất (cả trước và sau đều chọn cùng kiện khác); kiểm tra picking riêng dùng hit gần nhất tại pixel sự kiện và chỉ chọn điểm ổn định quanh ±2px, không tính tọa độ sát cạnh này là lỗi mapping.

### Nghiệm thu bổ sung: tương tác thật và DPR

`tests/viewer-demand-quality.mjs` kéo camera trong màn sản phẩm 1.000 kiện, viewport 1600×1000, devicePixelRatio 2. Chromium vẫn báo SwiftShader dù không ép renderer. Debug FPS và ms/frame cập nhật trong lúc kéo; chuyển tier trong cùng Canvas đổi DPR chính xác; camera dừng thì 0 frame thêm trong 1,2 giây. Không có JavaScript page errors.

| Cấu hình khi xoay | FPS quan sát |
|---|---:|
| balanced, DPR 1,5 | 7–9 |
| low ban đầu, DPR 1 | 16–21 |
| low thử nghiệm, DPR 0,75 | 22–28 |
| **low cuối cùng, DPR 0,5** | **31–36** |

Vì thế low tier được chốt ở DPR 0,5, giữ nguyên geometry, picking, màu và nhãn; phần raster 3D mềm hơn nhưng chữ HTML/panel không giảm độ phân giải. Chuyển low → high → balanced trong cùng phiên xác nhận DPR 0,5 → 2 → 1,5, draw calls 14 → 26 → 20 và vẫn 1.000 placements. Đã có bằng chứng tương tác trên môi trường kiểm thử ở low tier; vẫn không suy diễn thành benchmark GPU/mobile thật hoặc cam kết mọi tier đều đạt 30 FPS trên mọi thiết bị.

## 5. File thay đổi

Model/draft mới: `viewer-scene-model.ts`, `viewer-draft.ts`, tích hợp trong `useLoadPlanViewer.ts`.

Renderer: `LoadPlanViewer.tsx`, `scene/CargoInstances.tsx`, `scene/instance-layout.ts`, `scene/cargo-buffers.ts`, `scene/useCargoMatrices.ts`, `scene/useCargoColors.ts`, `colors.ts`. `PositionViewer.tsx` chỉ thêm demand và bỏ sphere không cần thiết của cargo kho không picking.

Quality/debug/fixture: `usePerformanceFlags.ts`, `scene/PerfProbe.tsx`, `DebugOverlay.tsx`, `benchmark.mock.ts`, `viewer-options.ts`, `ViewerPage.tsx`.

Kiểm tra và tài liệu: `tests/viewer-foundation.test.ts`, `tests/viewer-ui.mjs`, `tests/viewer-demand-quality.mjs`, `AGENTS.md`, báo cáo này và `docs/benchmarks/viewer-foundation-2026-09-13.json`. Tên renderer/model ở trên đều nằm dưới `src/features/viewer3d/`.

## 6. Bottlenecks và giả định cho Prompt 2

- Raycast vẫn quét instances O(N) mỗi pointer event; draw calls thấp không đồng nghĩa picking có chi phí hằng số.
- Timeline còn một DOM bar mỗi placement; aggregation là phần Prompt 3. Panel mô tả lớp còn dùng phép tìm trên/dưới, không phải stability solver.
- O(N) geometry comparison, O(N) resolve draft và tạo lookup/layout diễn ra khi commit; không có React state mỗi frame. Cần đo lại trước khi chọn spatial index hoặc store ngoài React.
- High tier có shadow và fill-rate lớn; chất lượng/FPS thiết bị thật cần benchmark riêng. Chưa nâng target FPS trong AGENTS dựa trên SwiftShader.
- UI planner vẫn bố cục desktop hiện tại; responsive experience và unify warehouse/driver được để Prompt 4.
- Prompt 2 nên commit **một gesture = một patch/command** sau khi drag; position dùng mm nghiệp vụ. Refs/proxy giữ chuyển động tần số cao ngoài React.
- `updatePlacement(id, patch)` là extension point; chưa có validation, snap, collision, history, drag hay persistence. Orientation giữ gốc vị trí; dimensions luôn derive từ snapshot canonical, không tích lũy phép xoay.
- Hiện mỗi fixture có phiên keyed riêng. Khi backend trả snapshot mới cùng trip/plan ID cần revision của snapshot hoặc reset session theo identity mới.
- Không suy diễn semantics cho UnplacedPackage. Không có API/WebSocket, optimizer, physics, CoG, LIFO heuristic hoặc driver 3D trong giai đoạn này.

## 7. Chạy lại

```powershell
pnpm lint
pnpm build
node --experimental-strip-types --test tests/viewer-foundation.test.ts
pnpm dev --host 127.0.0.1 --port 5175
```

Kiểm thử browser dùng Playwright đã có sẵn trong runtime, không cài dependency vào repo:

```powershell
$env:PLAYWRIGHT_MODULE = '<đường dẫn module playwright đã cài>'
$env:CHROMIUM_EXECUTABLE = '<đường dẫn Chromium tương thích đã cài>'
$env:VIEWER_TEST_URL = 'http://127.0.0.1:5175'
node tests/viewer-ui.mjs
$env:VIEWER_INITIAL_QUALITY = 'low'
node tests/viewer-demand-quality.mjs
```

Screenshot và JSON của kiểm tra UI được ghi trong `node_modules/.tmp/viewer-ui/`, không đưa output tạm vào source nghiệp vụ.

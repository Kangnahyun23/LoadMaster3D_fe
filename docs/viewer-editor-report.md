# Prompt 2 — Manual 3D placement editor

Phạm vi: Planner manual editor trên foundation Prompt 1. Không triển khai Prompt 3/4, không nối backend hay thêm dependency.

## Audit trước implementation

Giữ adapter, snapshot bất biến, phép đổi orientation nguồn → canonical → orientation đích, layout instance theo ID, demand rendering và quality tiers. Thêm geometry/snapping thuần TypeScript, lịch sử patch và proxy của kiện được chọn. Điểm dễ regression: pointer capture/camera, click sau drag, keyboard playback, reset và orientation ở nguồn khác 0.

## Kiến trúc editor

```text
Immutable LoadPlan → ViewerSceneModel
                         + ViewerDraft ← command history (patches by ID)
                         ↓
                  Effective placements → CargoInstances
                         ↓ selection in Edit mode
                    One editor proxy
                  pointer refs → preview → validate → one commit
```

- Mode Xem giữ camera, color, slice, playback, selected details và axle panel. Chế độ Chỉnh sửa tạm dừng playback, hiện toàn bộ placements và chỉ ẩn instance được proxy thay thế. Khi về Xem, step/slice trước đó còn nguyên.
- Drag trực tiếp theo mặt phẳng X–Y, X–Z hoặc Y–Z. Trong gesture camera và raycast cargo tạm ngưng; thao tác chỉ ghi Three position/material và invalidate. Preview status có subscription riêng, tối đa khoảng 10 lần/giây; ViewerPage/Canvas không nhận React state mỗi pointer event.
- Thả hợp lệ tạo đúng một `MOVE`. Thả không hợp lệ giữ vị trí cũ. Escape, pointercancel, mất capture, blur và unmount đều giải phóng camera/events. Click phát sinh sau drag được chặn để không chọn nhầm kiện phía sau.
- Nudge X/Y/Z 10/50/100 mm; mũi tên dịch X/Y, Page Up/Down dịch Z. Nudge không tự hút. Nút Căn vị trí hoặc drag có thể snap vào sàn, vách, lưới 50 mm và mặt cargo trong ngưỡng 20 mm. Trục ngoài mặt phẳng kéo giữ nguyên.
- Orientation chỉ 0/1/2, qua nút hoặc R. Xoay giữ góc vị trí. Xoay gây overlap/vượt thùng bị chặn.
- `MOVE`, `ROTATE`, `PIN`, `UNPIN`, `RESET_PLACEMENT`, `RESET_DRAFT` lưu patch trước/sau theo ID; tối đa 200 commands. Ctrl/Cmd+Z, thêm Shift để redo và có nút tương đương. Một reset global là một command, sau dialog xác nhận.
- Ghim khóa move/rotate; bỏ ghim để chỉnh tiếp. Reset riêng bị chặn nếu kiện khác đã chiếm vị trí gốc. Reset global trả chính xác snapshot nguồn.
- Camera focus dùng `moveTo`, giữ hướng nhìn; reduced motion chuyển ngay. Kiện có nhãn ID/điểm, trục X/Y/Z và một lưới sàn với số draw call cố định.
- Desktop dùng panel phải; tablet/phone dùng panel dưới, vùng scene giữ chiều rộng màn hình, nudge cao 56 px. Feedback nằm trên vùng controls có thể cuộn. Dropdown ID hỗ trợ chọn bằng bàn phím kể cả kiện bị che.

## Hard geometry rules

- Position phải là số mm nguyên hữu hạn, dimensions dương.
- Không qua sàn, trần, vách trước, cửa sau hoặc hai vách bên.
- AABB overlap chặn commit; hai mặt chỉ chạm nhau được chấp nhận. Loại chính kiện đang kiểm tra theo ID.
- Không clamp vị trí sai để che lỗi; ghost đỏ và lý do cho biết điều gì không hợp lệ.

## Advisory rules

- Support coverage là union của các hình chữ nhật tiếp xúc được cắt theo footprint đáy, không đếm trùng. Sàn cho support 100%; cargo bên dưới chỉ tính khi mặt trên cách đáy trong tolerance 2 mm.
- Coverage dưới 80% có cảnh báo tỷ lệ. Đây là diện tích tiếp xúc, không phải mô phỏng cân bằng hay solver ổn định.
- Kiện dễ vỡ đang đỡ hàng hoặc đặt lên kiện dễ vỡ có cảnh báo; không suy ra sức chịu tải.
- Vị trí/hướng đặt đã chỉnh thủ công có advisory riêng. Ghost xanh nếu hợp lệ và không advisory, vàng nếu hợp lệ có advisory, đỏ nếu hard invalid. Text đi kèm mọi trạng thái.
- Source mock có khe hở 10 mm giữa một số tầng; benchmark cũng có khe hở. Các trường hợp này có thể hiện support thấp dù chưa chỉnh sửa, đúng theo phép đo tiếp xúc đã công bố.

## Performance và kiểm tra

Node v22.16, Windows; 100 lượt warm-up và 1.000 mẫu/count cho **snapping + validation**:

| Placements | Median CPU | p95 CPU | Draw calls Xem / Chỉnh sửa | Triangles Chỉnh sửa |
|---:|---:|---:|---:|---:|
| 132 | 0,041 ms | 0,114 ms | 14 / 17 | 3.368 |
| 300 | 0,068 ms | 0,134 ms | 14 / 17 | 7.400 |
| 500 | 0,115 ms | 0,182 ms | 14 / 17 | 12.200 |
| 1.000 | 0,232 ms | 0,311 ms | 14 / 17 | 24.200 |

Renderer được đo trên Chromium headless/SwiftShader, viewport 1.600 × 1.000, tier low/DPR 0,5. Cargo vẫn là hai InstancedMesh ở low (ba ở balanced/high); tổng mesh không phải instance là 13, không tăng theo số cargo. Một proxy, bốn nhãn neo 3D trong editor, không có nhãn/shadow riêng cho 1.000 cargo.

Không suy ra FPS thiết bị thật từ môi trường này. Bài drag phát pointer theo nhịp có khoảng nghỉ nên không cung cấp FPS liên tục đáng tin cậy; số draw calls/triangles và zero-frame idle đã đo trực tiếp. Dữ liệu trình duyệt: `docs/benchmarks/viewer-editor-2026-09-13.json`.

- 21 Node tests: foundation, orientation 9 cặp nguồn/đích, immutability, mapping, bounds/overlap, support union, snapping, history và benchmark.
- Browser editor: move, rotate hợp lệ/không hợp lệ, pin/unpin, nudge, keyboard undo/redo, reset/cancel reset, focus giữ hướng, drag hợp lệ, invalid drop, overlap, Escape, một gesture/một command, camera/events phục hồi và idle demand.
- Viewport cảm ứng giả lập 390 × 844 và 820 × 1.180: nudge/undo, vùng chạm 56 px, scene toàn chiều rộng, lối thoát; thêm touch drag thật qua Chromium input trên tablet giả lập. Chưa test thiết bị vật lý.
- Regression browser: camera presets, colors, slice, playback, query gating/snapshot reset, quality tiers/reduced motion, warehouse camera và bước tiếp theo, driver 2D.
- Final commands: `pnpm lint` và `pnpm build` đều pass. Build còn warning chunk Three.js lớn hơn 500 kB như foundation; route vẫn lazy-load, không nâng dependency.

## Files của Prompt 2

- Mới: `editor/geometry.ts`, `snapping.ts`, `draft-history.ts`, `preview-store.ts`, `useManualEditor.ts`, `EditorProxy.tsx`, `EditorGuides.tsx`, `EditorToolbar.tsx`, `EditorPanel.tsx`, `EditorControls.tsx` trong `src/features/viewer3d`.
- Tích hợp: `useLoadPlanViewer.ts`, `ViewerPage.tsx`, `LoadPlanViewer.tsx`, `ViewerHeader.tsx`, `Timeline.tsx`, `panels/SelectedPackagePanel.tsx`, `scene/CameraRig.tsx`, `scene/CargoInstances.tsx`, `scene/useCargoMatrices.ts`.
- Tests: `tests/viewer-editor.test.ts`, `tests/viewer-editor-ui.mjs`, `tests/viewer-browser-helpers.mjs`, cập nhật `tests/viewer-ui.mjs` theo explicit Edit mode.
- Docs: report này, benchmark JSON và phần Manual editor trong `AGENTS.md`. Các thay đổi foundation từ Prompt 1 vẫn còn trong working tree.

## Giới hạn và phần để sau

- Quét AABB đủ nhanh với fixture hiện tại; chưa cần spatial hash/BVH. Union support có thể tốn hơn với nhiều mặt tiếp xúc phức tạp; chưa có bằng chứng cần thêm cấu trúc tăng tốc.
- Drag đi đến điểm đích, không mô phỏng đường chuyển kiện/swept collision. Support chỉ đánh giá kiện đang chỉnh và tiếp xúc dễ vỡ, không tái giải toàn bộ stack sau mỗi gesture.
- Draft/history chỉ sống trong session của snapshot. Không lưu server, không tạo placement từ UnplacedPackage; vẫn giữ extension point `PlacementPatch` theo ID.
- Không thêm gizmo nhỏ bắt buộc; direct drag, plane selection, keyboard và nudge là các cách thao tác hiện tại.
- Loading/Unloading Story, LIFO/blockers, CoG và diễn giải tải trục thuộc Prompt 3. Shared warehouse/driver experience và runtime tier adaptation thuộc Prompt 4. Không sửa axle reactions từ draft hay tự phát minh backend fields.

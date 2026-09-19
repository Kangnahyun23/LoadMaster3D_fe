---
id: LM-094
title: Planner gọn — một hàng điều khiển, ẩn Duyệt khi đã duyệt, lý do chặn trong nút
phase: 6
labels: [viewer3d, ux]
depends_on: [LM-084, LM-088]
estimate: 1.5d
prd: [D-51]
---

# LM-094 — Planner gọn

## Việc cần làm

- [x] Gộp header và `WorkspaceToolbar` thành một hàng điều khiển ở desktop (≥ 1.366 px); tablet giữ hai hàng 56 px.
- [x] Revision đã duyệt, không draft: bỏ nút Duyệt, hiện "Đã duyệt lúc …"; có draft thì nút "Duyệt bản chỉnh".
- [x] Lý do chặn Duyệt nằm trong hộp thoại/tooltip của nút, không chen chữ đỏ ở header (U-5).
- [x] Chuyến bị khoá (LM-088) hoặc người dùng chỉ đọc: không có Chỉnh sửa, không Duyệt, nói lý do một lần.
- [x] `<select>` gốc ở thanh công cụ desktop đổi sang `Select` dùng chung (U-6).

## Tiêu chí nghiệm thu

- [x] E2E viewer hiện có vẫn xanh (sửa selector theo bố cục mới); ảnh 1.366 và 1.600 px không tràn.

## Kết quả (19/09/2026)

### Đã làm

- **Một hàng điều khiển từ 1.366 px** (`ViewerHeader.tsx`, 56 px như AGENTS mục 5): quay lại · mã chuyến · MOCK RESULT (+ "Đã chỉnh
  tay" xếp chồng dưới nó, 22 + 4 + 22 px) · Thể tích/Tải trọng/Đã xếp · **Xếp hàng/Dỡ hàng, điểm giao, góc nhìn** · trạng thái duyệt ·
  Chỉnh sửa · So sánh · Duyệt. Hẹp hơn 1.366 px, Xếp/Dỡ, điểm giao, góc nhìn và Chỉnh sửa xuống `WorkspaceToolbar` (tablet: hai hàng,
  điều khiển 56 px). Không render trùng: bản trong thanh trên chỉ hiện từ `min-[1366px]`, thanh công cụ riêng ẩn từ đó (`display:none`,
  không vào cây truy cập).
- **Bỏ trùng lặp (U-4)**: thanh công cụ không còn "Danh sách kiện", "Vận hành", "Hiển thị" — hộp thông tin mở từ một lối là nút góc khung
  3D, nay ghi đủ "Chi tiết / Hiển thị" (và thẻ kiện cho tab Kiện). "Thời gian chạy" rời thanh trên (còn ở tab Chỉ số). So sánh phương án
  chỉ icon + tooltip dưới 1.536 px.
- **Duyệt** (`approval/planner-access.ts`, hàm thuần): bản đã duyệt không có dời/xoay kiện → không có nút Duyệt, hiện **"Đã duyệt lúc
  HH:mm dd/MM"** (`format.time` + `format.dayMonth` mới, theo locale: en "14:30, Sep 14"); có dời/xoay (patch gửi Duyệt; ghim không tính)
  → nút primary **"Duyệt bản chỉnh"**; revision chưa duyệt → "Duyệt phương án". Thời điểm duyệt vào model: `ViewerSceneModel.revision.approvedAt`.
- **Lý do chặn Duyệt (U-5)**: bỏ chữ đỏ ở thanh; nút Duyệt đổi icon cảnh báo, lý do ở tooltip và `aria-describedby` (sr-only); hộp thoại
  Duyệt vẫn liệt kê đủ.
- **Khoá**: pha chuyến đọc từ `fetchPlanSource` (đã trả `trip.phase`, không cần mở rộng `viewer-api.ts`) → `ViewerSession phase`. Pha khác
  `planning` hoặc thiếu quyền `plans.approve` → không Chỉnh sửa (thanh, thẻ kiện, inspector), không Duyệt, một dòng `role="status"` dưới
  thanh trên: "Chuyến đang xếp hàng — phương án đã chốt." / "Chỉ xem: tài khoản của bạn không chỉnh sửa hay duyệt phương án." (nhánh
  `viewer.lock`, key trùng pha). Pha khoá thắng quyền. Liên kết "Tới Thiết lập tối ưu" của banner lỗi thời ẩn khi khoá.
- **Select (U-6)**: `panels/PlannerSelect.tsx` (`PlannerSelect`, `CameraSelect`) bọc `Select` Radix dùng chung — nút mở và dòng chọn 56 px
  cảm ứng, 44/36 px từ `xl` — cho điểm giao và góc nhìn ở thanh chế độ Xem và góc nhìn ở thanh chế độ Chỉnh sửa. Giữ `<select>` gốc có chủ
  ý: "Chọn kiện" (editor, inspector — tới 1.000 dòng, Radix Select dựng hết mọi dòng khi mở), tốc độ ở `Timeline` (dùng chung với màn tài
  xế), `PositionViewer`/`DriverCargoViewer` (màn cảm ứng kho/tài xế, agent khác). Nhãn "Tất cả điểm giao" → "Mọi điểm giao" (trùng bộ
  lọc danh sách kiện của Planner) để vừa ô 160 px ở 1.366 px.
- Phím tắt Space/←/→/Home bỏ qua khi tiêu điểm trong danh sách của Select đang mở (`[role="listbox"]`).
- Không đổi engine, không thêm draw call; inspector vẫn đóng mặc định.

### Đo bố cục (Chromium, E2E)

Thanh trên không tràn, mã chuyến một dòng, không chữ bị cắt: 1.366 × 768 (đã duyệt; draft "Duyệt bản chỉnh"; đã duyệt có chỉnh tay;
chuyến đang xếp) và 1.600 × 1.000 — `planner-compact.spec.ts`. Đo thêm bằng script tạm (không commit): 1.024, 1.280, 1.440 (en), 820, 390 px
không phần tử nào tràn; ca chật nhất là revision chưa duyệt ở 1.366 px tiếng Việt (vừa khít, khoảng trống 0 px, không cắt chữ).

### File

- Mới: `src/features/viewer3d/approval/planner-access.ts` (+ test), `src/features/viewer3d/panels/{PlannerActions,PlannerSelect}.tsx`,
  `src/features/viewer3d/panels/PlannerActions.dom.test.tsx`, `e2e/planner-compact.spec.ts`.
- Sửa: `src/features/viewer3d/{ViewerHeader,ViewerSession,ViewerPage}.tsx`, `scene-input.ts` (`approvedAt`), `panels/WorkspaceToolbar.tsx`
  (`SimulationControls` + thanh riêng), `editor/EditorToolbar.tsx` (góc nhìn), `operations/SceneHud.tsx` (nhãn nút góc),
  `src/lib/format.ts` (`dayMonth`, + test), `src/lib/i18n/{vi,en}/viewer.ts` (thêm `plan.approveDraft/approvedAt/approvedAtValue`, `lock.*`;
  bỏ key không còn dùng `plan.approved`, `plan.runtime`, `toolbar.packageList/operations/display`, `hud.details`).
- E2E sửa theo bố cục mới: `viewer-helpers.ts` (`cameraPreset`/`focusStop` bấm Select Radix, `openInspector` qua nút góc),
  `viewer-operations-ui.spec.ts`, `viewer-scene-first-ui.spec.ts`, `plan-approval.spec.ts` (Duyệt từ `?revision=REV-001`; lý do chặn ở
  tooltip), `spec-flow.spec.ts` (góc nhìn), `warehouse.spec.ts`, `driver-approved-plan.spec.ts` (Duyệt từ `?revision=REV-001` — bản seed
  REV-002 đã duyệt nay không có nút Duyệt).
- Lỗi có sẵn từ LM-084, sửa để chạy được phần Planner cảm ứng: `viewer-operations-ui.spec.ts` "planner drawer works by touch" đăng nhập
  tài xế rồi mở Planner → 403; nay đăng xuất và vào lại bằng tài khoản điều phối trước nửa Planner.

### Kiểm thử

- `src/features/viewer3d/approval/planner-access.test.ts` (4), `src/features/viewer3d/panels/PlannerActions.dom.test.tsx` (4),
  `src/lib/format.test.ts` (+1: `dayMonth`).
- E2E `e2e/planner-compact.spec.ts` (3): seed đã duyệt không có nút Duyệt, "Đã duyệt lúc", một hàng ở 1.366/1.600 px → dời một kiện →
  "Duyệt bản chỉnh" → duyệt → "Đã chỉnh tay" + "Đã duyệt lúc", vẫn một hàng; `TRIP-011` (đang xếp) không Chỉnh sửa/Duyệt, một lý do;
  tablet quản lý: hai hàng 56 px, "Chỉ xem …".
- `pnpm lint` ✓ · `pnpm exec tsc -b` ✓ · `pnpm build` ✓ · `pnpm test` 99 file / 620 test ✓.
- `E2E_PORT=5195 pnpm exec playwright test` — đợt 1 (danh sách của issue): `fleet-status`, `fleet-vehicle-preview`, `plan-approval`,
  `viewer-ui`, `viewer-operations-ui`, `viewer-scene-first-ui`, `viewer-editor-ui`, `viewer-editor-obstacles`, `planner-compact` 31/31 ✓
  (hai ca cảm ứng của `viewer-operations-ui` chạy lại sau khi sửa lỗi 403 ở trên); đợt 2 (spec khác chạm Planner): `warehouse`,
  `driver-approved-plan`, `rbac`, `i18n-en` (Planner tiếng Anh 1.440/1.024/390 px không cắt chữ), `spec-flow` (desktop + tablet),
  `viewer-editor-renders`, `viewer-obstacles`, `viewer-reduced-motion-camera`, `viewer-visuals` 27/27 ✓.
- Draw call: không đổi engine; `viewer-ui` (132 → 1.000 kiện) và `viewer-operations-ui` vẫn < 100 draw call, `viewer-obstacles` vẫn +2.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 5 "Thanh tiêu đề màn", thêm: *Planner từ 1.366 px: thanh trên 56 px là hàng điều khiển duy nhất (mã chuyến, MOCK RESULT, chỉ số,
  Xếp/Dỡ, điểm giao, góc nhìn, trạng thái duyệt, Chỉnh sửa, So sánh, Duyệt); hẹp hơn thì điều khiển mô phỏng và Chỉnh sửa xuống thanh công
  cụ riêng (tablet hai hàng 56 px). Thêm gì vào hàng này phải đo lại ở 1.366 px (`planner-compact.spec.ts`).*
- Mục 7 "Operations và scene dùng chung", đoạn Planner: *Bản đã duyệt chưa có dời/xoay: không có nút Duyệt, hiện "Đã duyệt lúc HH:mm
  dd/MM"; có thì "Duyệt bản chỉnh". Lý do chặn Duyệt ở tooltip + `aria-describedby` của nút, không in ở thanh. Pha chuyến khác `planning`
  hoặc thiếu `plans.approve`: không Chỉnh sửa, không Duyệt, một dòng lý do (`viewer.lock`). Hộp thông tin chỉ mở từ nút "Chi tiết / Hiển
  thị" ở góc khung 3D và thẻ kiện; thanh công cụ không lặp lại lối vào.*
- Mục 5 hoặc mục 2 (Radix): *Thanh công cụ Planner dùng `PlannerSelect` (Select Radix, 56 px cảm ứng); ô chọn kiện (tới 1.000 dòng) giữ
  `<select>` gốc.*
- Mục 6 "Định dạng số và ngày": *`format.dayMonth` ("14/09" · "Sep 14") cắt năm khỏi mẫu ngày đầy đủ — CLDR tiếng Việt cho mẫu ngày + tháng
  là "dd-MM".*

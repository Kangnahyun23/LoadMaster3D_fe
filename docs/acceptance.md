# Nghiệm thu MVP theo Build Spec (LM-072)

Ngày: 16/09/2026 · Nhánh `feat/spec-mvp`. Bằng chứng là test chạy tự động trong CI (`pnpm test`, `pnpm test:e2e`) trừ
chỗ ghi "chạy tay". Đường dẫn E2E: `e2e/`, unit/DOM: `src/**` và `tests/`.

Ký hiệu: ✅ đạt, có test · 🟨 đạt một phần, ghi rõ phần thiếu và nơi theo dõi.

## 1. Spec mục 15 — Acceptance criteria

| # | Dòng checklist | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Tạo xe bằng cm/kg | ✅ | `e2e/spec-flow.spec.ts` (tạo "Truck 6m", ô cm/kg, dòng đội xe `600 × 240 × 250 cm · 5.000 kg`); `src/features/fleet/VehicleDetailPage.dom.test.tsx` |
| 2 | Thêm/sửa/xoá/nhân bản kiện | ✅ | `spec-flow` (thêm + nhân bản, xoá ở kịch bản lỗi dữ liệu, sửa ở kịch bản lỗi thời); `src/features/trips/PackageFormPanel.dom.test.tsx` |
| 3 | Mọi field hiển thị đơn vị | ✅ | `spec-flow` (form xe, bảng vật cản, form kiện) |
| 4 | Validation chặn dữ liệu không hợp lệ | ✅ | `spec-flow` kịch bản lỗi dữ liệu (không lưu kiện không có hướng; nút Tối ưu tắt); `src/domain/constraints/validate-*.test.ts` |
| 5 | Tự tính tổng khối lượng và thể tích | ✅ | `spec-flow` (`4,8 m³ · 800 kg` → `9,6 m³ · 1.600 kg`); `src/features/trips/trip-summary.test.ts` |
| 6 | Quantity mở rộng thành instance riêng | ✅ | `spec-flow` (`8 / 8`, `PKG-001-02`); `src/domain/cargo/cargo.test.ts` |
| 7 | Mock service trả đúng `OptimizationResult` | ✅ | `spec-flow` (revision qua `optimizationResultSchema`); `src/services/optimization/mock-optimization*.test.ts` |
| 8 | Viewer đúng tỷ lệ xe, hàng, vật cản | ✅ | `spec-flow` (vật cản cm trong danh sách `sr-only`); `e2e/viewer-obstacles.spec.ts`, `e2e/viewer-benchmark-cm.spec.ts` |
| 9 | Rotate, zoom, pan, reset camera | ✅ | `spec-flow` (desktop); `e2e/viewer-reduced-motion-camera.spec.ts` |
| 10 | Click kiện hiện đúng cm/kg | ✅ | `spec-flow`; `e2e/i18n-en.spec.ts` (bản en) |
| 11 | Hai kiện chạm mặt không báo overlap | ✅ | `spec-flow` ("Không có lỗi hay cảnh báo"); `src/domain/geometry/intersection.test.ts` (ca cộng dồn số thực) |
| 12 | Kiện vượt biên / overlap vật cản bị cảnh báo | ✅ | Vượt biên và chồng kiện: `e2e/viewer-editor-ui.spec.ts` ("Không thể đặt"). Chồng vật cản: `e2e/viewer-editor-obstacles.spec.ts` (LM-073, 19/09/2026) + seam engine `tests/viewer-editor-engine.test.ts`, `src/domain/constraints/obstacles.test.ts`. |
| 13 | Hiện kiện chưa xếp và lý do | ✅ | `spec-flow` kịch bản kết quả một phần |
| 14 | Hiện volume/payload utilization | ✅ | `spec-flow` (26,7% / 32,0%); `e2e/plan-approval.spec.ts` (tab Chỉ số) |
| 15 | Mock result có nhãn rõ ràng | ✅ | `spec-flow`, `plan-approval`, `e2e/warehouse.spec.ts` (badge MOCK RESULT) |
| 16 | Unit test volume, orientation, boundary, overlap | ✅ | `src/domain/metrics/metrics.test.ts`, `src/domain/geometry/orientation.test.ts`, `src/domain/constraints/boundary.test.ts`, `src/domain/geometry/intersection.test.ts` |
| 17 | Thay mock bằng API service không sửa UI chính | ✅ (kiến trúc) | UI chỉ gọi hook → `features/optimization/optimization-api.ts` → `createOptimizationService` (interface `OptimizationService`, `src/services/optimization`). Không có test trình duyệt cho tính chất này; kiểm bằng review: component chỉ import **kiểu** và lớp lỗi của interface (`OptimizationProgress`, `OptimizationServiceError`), không import bản mock — chọn service nằm ở `-api.ts`. |

## 2. PRD mục 12 — Tiêu chí bổ sung

| Dòng | Kết quả | Bằng chứng |
|---|---|---|
| Không còn mm trong state, payload, mock, test; chỉ `scene/units.ts` đổi scale | ✅ | LM-062: gỡ `LoadPlan` mm; tìm `mm`/`Mm` trong `src/` chỉ còn chú thích lịch sử (`docs/issues/LM-062-go-mock-mm-code-thua.md`) |
| Planner, kho, tài xế cùng đọc một kết quả đã duyệt | ✅ | `e2e/warehouse.spec.ts` (Duyệt ở Planner → `/kho` bước 1 = `loadingOrder 1`); `e2e/driver-approved-plan.spec.ts` (thứ tự dỡ = `unloadingOrder`) |
| Editor chặn commit khi engine báo lỗi; hoàn tác được mọi lệnh | ✅ | `e2e/viewer-editor-ui.spec.ts` ("Không thể đặt", "Hoàn tác"); `tests/viewer-editor-engine.test.ts` |
| Chuyển vi ↔ en ở mọi màn đợt 1 không mất dữ liệu đang nhập | ✅ | `spec-flow` (đổi en giữa form, dữ liệu giữ, số định dạng en); `e2e/i18n-en.spec.ts`; kho/tài xế đổi giữa phiên giữ bước/điểm giao (LM-071); cổng `src/lib/i18n/no-hardcoded-vietnamese.test.ts` cho toàn `src/` |
| Không còn nút bấm vào mà không làm gì / chỉ báo "đang chờ" | ✅ | LM-053: `notifyPendingFeature` đã xoá; `src/app/NavRail.dom.test.tsx`, `src/features/warehouse/useLoadingSession.dom.test.tsx`, `src/features/driver/DriverStopPage.dom.test.tsx`; danh sách/form chuyến ghi thật (`TripFormPage.dom.test.tsx`) |
| Tải trục hiện "Sẽ có sau", không số giả | ✅ | `features/viewer3d/overlays/AxleLoadPanel.tsx`; `e2e/viewer-operations-ui.spec.ts` (hộp Duyệt không có "tải trục") |
| Draw call dưới 100 ở 1.000 kiện | ✅ | `e2e/viewer-benchmark-cm.spec.ts` (mọi tier, 132 → 1.000 kiện, draw call không đổi theo số kiện); số đo `docs/benchmarks/viewer-2026-09-16.json` |

## 3. Số đo cuối

Xem `docs/benchmarks/` (ngày 16/09/2026): cổng constraint engine D-29 và draw call / tam giác / FPS viewer theo tier.
Chromium headless + SwiftShader, không phải thiết bị thật.

## 4. Nợ kỹ thuật và phần chờ backend

| ID | Nợ | Ghi chú |
|---|---|---|
| N-1 | ~~Thiếu E2E kéo kiện vào vật cản trong editor~~ | Đóng 19/09/2026 — [LM-073](issues/LM-073-e2e-keo-kien-vao-vat-can.md) |
| N-2 | Màn điều phối chỉ hỗ trợ desktop (nút 40 px trên tablet) | Quyết định 16/09/2026, AGENTS mục 5 |
| N-3 | ~~Chi tiết chuyến chật ở 1.440 px (tên điểm giao bị cắt, bảng kiện cuộn ngang)~~ | Đóng 20/09/2026 — [LM-095](issues/LM-095-bo-cuc-1366-het-cat-chu.md): vừa 1.366–1.600 px, E2E `layout-1366.spec.ts` |
| N-4 | Kho bỏ fixture `?debug&packages=N`; hiệu năng 3D kho chỉ đo trên 132 kiện seed | LM-060 |
| N-5 | JS tăng 6,9 kB ở phase 4 (màn kho/tài xế mới) | LM-062 |
| N-6 | Draft chỉnh tay không lưu qua trang; kho/tài xế giữ tiến độ chỉ trong phiên | Chờ backend |
| N-7 | Phân quyền mới là giả lập ở FE (LM-084); phiên ở `sessionStorage`; kho mock không kiểm người ghi dỡ hàng có đúng tài xế | Chờ backend/auth — server phải kiểm lại |
| N-8 | Contract `OptimizationRequest/Result`, revision, trạng thái duyệt, `constraintWarnings` có cấu trúc | LM-002, PRD mục 14 |
| N-9 | Tải trục, trọng tâm toàn xe, kiểm tra đường đưa hàng vào | Spec mục 17; "Sẽ có sau" |
| N-10 | Chưa đo FPS trên thiết bị thật (tablet kho, điện thoại tài xế) | Số đo hiện là SwiftShader |

## 5. Đợt 6 — 5 vai trò (LM-080 → LM-101, 19–20/09/2026)

Thước đo: bảng 5 vai trò ở AGENTS mục 1 (D-40). Bằng chứng là test tự động trừ chỗ ghi "chạy tay". Kịch bản đầu-cuối
`e2e/workday.spec.ts` đi hết một ngày làm việc trên cùng một kho: điều phối tạo chuyến, thêm kiện, tối ưu, duyệt → kho xếp (báo thiếu 1)
→ tài xế giao (1 sự cố) → quản lý thấy chuyến trong kỳ và xuất .xlsx → quản trị đọc đủ 10 sự kiện của chuyến, đúng người làm.

| Vai trò | Có trong đợt 6 | Bằng chứng |
|---|---|---|
| Điều phối | Chuyến có ngày chạy, tài xế, 10 trạng thái, lọc/tìm bỏ dấu/sắp xếp/phân trang; tiến trình + kiện thiếu + sự cố ở chi tiết; khoá sửa từ pha xếp; huỷ có lý do; nhập kiện CSV/.xlsx có xem trước; sơ đồ tuyến; đội xe có trạng thái và bảo dưỡng; Planner một hàng điều khiển, không Duyệt lại bản đã duyệt | `trip-lifecycle`, `package-import`, `fleet-status`, `planner-compact`, `plan-compare-404`, `layout-1366` (1.366 và 1.600 px), `workday`; DOM `TripDetailPage`, `RouteDiagram`, `OptimizationSetupPage` |
| Kho (tablet) | Danh sách chuyến chờ xếp/đang xếp; phiên xếp ghi tiến độ và kiện thiếu vào kho, mở lại làm tiếp; bản lỗi thời không vào phiên; 3D ẩn kiện thiếu; màn xếp xong | `warehouse-progress` (@tablet), `warehouse`, `workday`; DOM `WarehouseTripsPage`, `LoadingStepPage` |
| Tài xế (điện thoại) | "Chuyến của tôi"; bắt đầu giao; đánh dấu dỡ; gọi khách (`tel:`); báo sự cố (hỏng/thiếu/từ chối/khác); hoàn tất điểm; tổng kết chuyến | `driver-delivery` (@phone), `driver-approved-plan`, `workday`. **Thử trên điện thoại thật: chờ người dùng (D-57)** |
| Quản lý | Bảng điều khiển lọc kỳ, 5 KPI có nguồn, 3 biểu đồ từ kho, bảng chuyến trong kỳ, xuất .xlsx 3 sheet; xem chuyến/phương án/đội xe chỉ đọc | `manager-dashboard`, `rbac`, `workday`; unit `dashboard-summary` (số tính tay) |
| Quản trị | Người dùng: tạo (mật khẩu tạm hiện một lần), sửa, khoá/mở, xoá, đặt lại mật khẩu, ma trận quyền; nhật ký `/nhat-ky` lọc ngày/người/nhóm/mã | `admin-users`, `admin-audit`, `rbac`, `workday` |
| Chung | Phân quyền giả lập + 403; hồ sơ + đổi mật khẩu; chuông thông báo theo vai trò; tìm nhanh Ctrl+K; tiêu đề tab theo màn; 404 về đúng màn chính; toast không che nút header | `rbac`, `profile`, `notifications`, `quick-search`, `plan-compare-404`, `i18n-en` |

Kiểm tra cuối đợt (20/09/2026): `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm test` **776/776** ✅ · `pnpm test:e2e` **80/80** ✅ (15,6 phút)
· `pnpm test:bench` ✅ (chạy tay, 1.000 kiện p95 33,8 ms / 1,7 ms) · CI ✅ (79 xanh, 1 flaky — xem N-17). Ảnh bàn giao vi/en (48 ảnh) chụp lại bằng `node tests/handoff-screenshots.mjs` (chạy tay, cần
dev server). Chưa làm: thử màn tài xế trên điện thoại thật (D-57) — người dùng tự thử.

### Nợ còn lại sau đợt 6

| ID | Nợ | Ghi chú |
|---|---|---|
| N-11 | Dữ liệu vẫn in-memory: tải lại trang mất mọi thay đổi (D-41 chọn không giả lập lưu bền) | Chờ backend |
| N-12 | Danh sách chuyến ở 1.366 px vẫn cắt tuyến dài (chủ ý, bảng dày); ô ngày hiện định dạng theo trình duyệt | LM-095 |
| N-13 | Nav rail của quản trị cao ~880 px: màn thấp hơn thì rail cuộn | LM-099 |
| N-14 | "Đã đọc" của thông báo chỉ giữ trong tab | Chờ backend |
| N-17 | Trên CI, cú bấm đầu mở menu thao tác ở màn Người dùng đôi khi không ăn (không dựng lại được ở máy dev, kể cả bóp CPU 20×); E2E bấm lại cho tới khi menu mở | LM-101 |
| N-16 | Test hiệu năng 3D ở CI chạy dưới 4 FPS (SwiftShader, 2 nhân): chỉ khẳng định "loop dừng hay chưa", không khẳng định FPS | LM-101 |
| N-15 | CI chưa chạy `pnpm test:bench` (cổng ngân sách constraint engine chạy tay) | Gói bàn giao 17/09 |

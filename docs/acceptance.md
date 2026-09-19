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
| N-7 | Chưa phân quyền theo vai trò; phiên ở `sessionStorage` | Chờ backend/auth |
| N-8 | Contract `OptimizationRequest/Result`, revision, trạng thái duyệt, `constraintWarnings` có cấu trúc | LM-002, PRD mục 14 |
| N-9 | Tải trục, trọng tâm toàn xe, kiểm tra đường đưa hàng vào | Spec mục 17; "Sẽ có sau" |
| N-10 | Chưa đo FPS trên thiết bị thật (tablet kho, điện thoại tài xế) | Số đo hiện là SwiftShader |

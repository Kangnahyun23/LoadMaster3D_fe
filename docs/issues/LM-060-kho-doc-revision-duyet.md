---
id: LM-060
title: Màn kho đọc revision đã duyệt, làm theo loadingOrder
phase: 4
labels: [warehouse, data]
depends_on: [LM-030, LM-050]
estimate: 1d
prd: [D-14]
---

# LM-060 — Kho đọc kết quả đã duyệt

## Bối cảnh

`features/warehouse/LoadingStepPage.tsx` đọc `LOAD_PLAN` (mm) hoặc benchmark plan của viewer3d; `useLoadingSession` giữ bước hiện tại.

## Việc cần làm

- [x] `features/warehouse/warehouse-api.ts` + hook: lấy revision approved mới nhất của chuyến được giao cho kho (seed LM-026). Chưa có bản duyệt → trạng thái rỗng giải thích.
- [x] Bước theo `loadingOrder`; `PositionViewer` nhận view model LM-030.
- [x] `describe-step.ts`, `PackageInstructionCard`, `OrientationFigure`: khoảng cách cm theo locale, hướng đặt 6 mã (hình SVG đúng mã), vật cản gần nhất nếu kiện nằm cạnh.
- [x] Nhãn "Thứ tự tính lại ở FE" nếu revision `ordersRecomputed`.
- [x] Gỡ import `viewer3d/benchmark.mock` khỏi `warehouse`.
- [x] Ẩn "Ghi nhận sai lệch" / "Kiện này không có ở kho" nếu vẫn chưa có chức năng (D-20).

## Tiêu chí nghiệm thu

- [x] Duyệt revision ở Planner rồi mở `/kho`: bước 1 là kiện có `loadingOrder = 1`.
- [x] Chữ ≥ 16px, nút 56px, lối thoát nhìn thấy được (AGENTS mục 10) vẫn giữ.

## Kết quả (16/09/2026)

- Dữ liệu: [warehouse-api.ts](../../src/features/warehouse/warehouse-api.ts) → [useWarehousePlanQuery.ts](../../src/features/warehouse/useWarehousePlanQuery.ts)
  (`staleTime: 0` để vừa Duyệt xong mở kho là đọc bản mới). Chọn phương án thuần ở [select-plan.ts](../../src/features/warehouse/select-plan.ts):
  `?chuyen=<mã>` nếu có, không thì chuyến đầu tiên theo thứ tự kho có bản duyệt; bản duyệt mới nhất (`approvedAt`); chuyến chỉ định
  chưa có bản duyệt → `null` (không lấy chuyến khác thay). Bản lỗi thời (`isStale`) vẫn hiện, kèm cảnh báo `role="alert"`.
- Màn: [LoadingStepPage.tsx](../../src/features/warehouse/LoadingStepPage.tsx) dựng scene cm bằng `adaptResult`, bắt đầu ở bước 1 (bỏ
  `INITIAL_STEP = 47` của design); [WarehouseEmpty.tsx](../../src/features/warehouse/WarehouseEmpty.tsx) cho chưa duyệt/lỗi tải, có nút
  thoát 56px và link tới `/chuyen`; [PlanNotices.tsx](../../src/features/warehouse/PlanNotices.tsx): MOCK RESULT, "Thứ tự tính lại ở FE",
  cảnh báo lỗi thời — chữ 16px nên không dùng `Badge` 12px.
- [PositionViewer.tsx](../../src/features/viewer3d/PositionViewer.tsx) nhận `ViewerSceneModel` thay `LoadPlan`; không còn gọi `adaptLoadPlan`.
- [describe-step.ts](../../src/features/warehouse/describe-step.ts) trả số/mã, không câu chữ: `measureStep` (lớp, kiện dưới, cách vách trước/trái/phải,
  cửa sau, sàn — cm, so sánh qua `eq/lt/gt`, `roundCm` ở hiệu), `nearestObstacle` (khe hộp–hộp ≤ 5 cm), `stepNote` (dễ vỡ, dưới dễ vỡ,
  nặng ≥ 50 kg, không đứng thẳng, mặc định), `orientationHint` (trục chứa cạnh cao danh nghĩa theo mã). Card dịch qua nhánh `warehouse`
  của từ điển vi/en và format bằng `useFormat()`.
- [OrientationFigure.tsx](../../src/features/warehouse/OrientationFigure.tsx): kiện đúng tỉ lệ kích thước đã xoay (cạnh dài nhất ≤ 3 đơn vị),
  mũi tên đen ra cửa sau, mũi tên xanh từ mặt trên gốc theo trục của `H` trong mã (Z với LWH/WLH, Y với LHW/WHL, X với HLW/HWL), mã in trên hình.
- "Kiện này không có ở kho" giữ (LM-053: nó thật sự bỏ qua bước). Gỡ import `load-plan.mock`, `types/load-plan` và `viewer3d/benchmark.mock`
  khỏi `features/warehouse`; bản thân các mock mm để LM-062 dọn.
- **Lệch có chủ ý:** màn kho không còn `?debug&packages=N` (fixture benchmark); E2E hiệu năng kho đo trên chuyến seed 132 kiện. Phần vỏ màn
  cũ ("Xác nhận đã xếp", toast bỏ qua, lớp phủ) chưa dịch — thuộc LM-071.
- Test: [select-plan.test.ts](../../src/features/warehouse/select-plan.test.ts) (5), [describe-step.test.ts](../../src/features/warehouse/describe-step.test.ts) (7),
  [LoadingStepPage.dom.test.tsx](../../src/features/warehouse/LoadingStepPage.dom.test.tsx) (5, trên kho dùng chung thật: seed, rỗng, cm/hướng/vật cản,
  bỏ qua bước, lỗi thời), [useLoadingSession.dom.test.tsx](../../src/features/warehouse/useLoadingSession.dom.test.tsx) chuyển sang scene seed.
  E2E mới [warehouse.spec.ts](../../e2e/warehouse.spec.ts) (desktop + tablet: Duyệt ở Planner → `/kho` phía client → bước 1 = `loadingOrder 1`,
  xác nhận → `loadingOrder 2`; tablet: nút/lối thoát ≥ 56px, chữ màn kho ≥ 16px; chuyến chưa duyệt → trạng thái rỗng). Cập nhật
  `spec-flow.spec.ts` (kho khẳng định kiện `loadingOrder = 1` của TRIP-001 vừa duyệt), `viewer-ui.spec.ts`, `viewer-operations-ui.spec.ts`.
- Còn lại: nhãn trong khung 3D ("Cửa sau · Hướng dỡ") nhỏ hơn 16px — thuộc engine chung, không đổi ở issue này.

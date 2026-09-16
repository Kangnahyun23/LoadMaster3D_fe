---
id: LM-047
title: Màn Thiết lập tối ưu /chuyen/:tripId/toi-uu và validation summary
phase: 3
labels: [optimization, form]
depends_on: [LM-017, LM-028, LM-041, LM-044]
estimate: 1.5d
prd: [D-23, D-38]
spec: [9.4]
---

# LM-047 — Thiết lập tối ưu

## Việc cần làm

- [x] Route lazy `/chuyen/:tripId/toi-uu`, có nav rail, header 72px; mở từ nút ở chi tiết chuyến.
- [x] Chọn xe (Select từ `useVehiclesQuery`, hiện tóm tắt kích thước/tải/cửa/vật cản).
- [x] Danh sách kiện rút gọn (tổng hợp + liên kết về bảng kiện).
- [x] Form RHF: phương pháp (mặc định `MOCK`; `EP_DBLF`, `GA`, `SA`, `BBMP_DCS_PQNET` hiển thị nhưng disabled kèm lý do), thời gian giới hạn (giây), random seed, Enforce LIFO, Ưu tiên trọng tâm thấp.
- [x] Validation summary: gom `validateRequest` theo nhóm Xe / Kiện / Tải trọng; mỗi mục bấm được để tới field (trang xe hoặc panel kiện).
- [x] Nút primary **Tối ưu** disabled khi còn `error`; vượt tải chỉ là cảnh báo trừ `MUST_LOAD_PAYLOAD_EXCEEDED` (D-23).
- [x] `features/optimization/optimization-api.ts` dựng `OptimizationRequest` từ chuyến + xe + form.

## Tiêu chí nghiệm thu

- [x] Kiện không có hướng → nút Tối ưu disabled, summary chỉ đúng kiện.
- [x] Tổng 5.320 kg > 5.000 kg nhưng không vượt với mustLoad → nút vẫn bật, hiện cảnh báo.
- [x] Không có chữ "AI" trong màn.

## Kết quả (16/09/2026)

- Route lazy `/chuyen/:tripId/toi-uu` → [OptimizationSetupPage.tsx](../../src/features/optimization/OptimizationSetupPage.tsx); nút "Chạy tối ưu" ở chi tiết chuyến và "Chạy thêm phương án" ở So sánh dẫn tới đây (giữ `?mo-phong=loi`).
- Chọn xe đổi `trip.vehicleId` qua mutation ([SetupContextPanels.tsx](../../src/features/optimization/SetupContextPanels.tsx)), kèm tóm tắt lòng thùng/tải/cửa/vật cản và liên kết sửa xe; tóm tắt hàng + liên kết về bảng kiện.
- Form RHF + zod: phương pháp (chỉ `MOCK` bật, bốn phương pháp còn lại khoá kèm lý do), thời gian giới hạn 1–600 s, random seed, LIFO, trọng tâm thấp.
- [optimization-request.ts](../../src/features/optimization/optimization-request.ts): `buildOptimizationRequest` và `groupRequestIssues` gom `validateRequest` theo Xe / Kiện / Tải trọng, mỗi mục là liên kết tới nơi sửa — trang xe, `/chuyen/:tripId?kien=<mã>` (chi tiết chuyến mở panel kiện đó), hoặc chi tiết chuyến. `canRun` chỉ chặn bởi `error` (D-23).
- Test: [optimization-request.test.ts](../../src/features/optimization/optimization-request.test.ts) (kiện không có hướng chặn và trỏ đúng kiện; 5.320 kg > 5.000 kg không bắt buộc vẫn chạy; `MUST_LOAD_PAYLOAD_EXCEEDED` chặn; lỗi cửa trỏ trang xe), [OptimizationSetupPage.dom.test.tsx](../../src/features/optimization/OptimizationSetupPage.dom.test.tsx) (seed sẵn sàng, không có chữ "AI"; thêm kiện hỏng → nút khoá, summary đúng một liên kết).

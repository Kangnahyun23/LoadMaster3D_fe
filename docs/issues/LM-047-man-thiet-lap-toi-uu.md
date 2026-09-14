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

- [ ] Route lazy `/chuyen/:tripId/toi-uu`, có nav rail, header 72px; mở từ nút ở chi tiết chuyến.
- [ ] Chọn xe (Select từ `useVehiclesQuery`, hiện tóm tắt kích thước/tải/cửa/vật cản).
- [ ] Danh sách kiện rút gọn (tổng hợp + liên kết về bảng kiện).
- [ ] Form RHF: phương pháp (mặc định `MOCK`; `EP_DBLF`, `GA`, `SA`, `BBMP_DCS_PQNET` hiển thị nhưng disabled kèm lý do), thời gian giới hạn (giây), random seed, Enforce LIFO, Ưu tiên trọng tâm thấp.
- [ ] Validation summary: gom `validateRequest` theo nhóm Xe / Kiện / Tải trọng; mỗi mục bấm được để tới field (trang xe hoặc panel kiện).
- [ ] Nút primary **Tối ưu** disabled khi còn `error`; vượt tải chỉ là cảnh báo trừ `MUST_LOAD_PAYLOAD_EXCEEDED` (D-23).
- [ ] `features/optimization/optimization-api.ts` dựng `OptimizationRequest` từ chuyến + xe + form.

## Tiêu chí nghiệm thu

- [ ] Kiện không có hướng → nút Tối ưu disabled, summary chỉ đúng kiện.
- [ ] Tổng 5.320 kg > 5.000 kg nhưng không vượt với mustLoad → nút vẫn bật, hiện cảnh báo.
- [ ] Không có chữ "AI" trong màn.

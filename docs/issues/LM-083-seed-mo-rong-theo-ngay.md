---
id: LM-083
title: Seed mở rộng neo theo ngày hiện tại — 8 xe, 12 người, 15 chuyến 30 ngày
phase: 6
labels: [data, seed]
depends_on: [LM-082]
estimate: 1.5d
prd: [D-44]
---

# LM-083 — Seed mở rộng

## Việc cần làm

- [x] `createMockDb({ today })`: seed tính ngày tương đối từ ngày neo (giờ Việt Nam); app neo theo hôm nay, test truyền ngày cố định.
- [x] 8 xe (4 xe cũ giữ nguyên mã và thông số, 1 xe bảo dưỡng), 12 người dùng (đủ 5 vai trò, 1 tài khoản bị khoá), 15 chuyến:
      hoàn thành (7, có sự cố giao và kiện thiếu), huỷ (1), đang giao (1), đã xếp xong (1), đang xếp (1), đã duyệt (chuyến chính),
      đã tối ưu (1), cần xem lại (1), nháp (1). Điểm giao có SĐT. Dữ liệu tiếng Việt thật, không "Sample".
- [x] `TRIP-2026-0914` giữ nguyên xe, điểm giao, kiện, `REV-001`/`REV-002`; là chuyến đã duyệt của ngày neo, gán tài xế demo.
- [x] Revision dựng bằng `runMockOptimization` (tất định); tiến độ kho/giao và nhật ký lịch sử khớp dữ liệu chuyến.
- [x] Đo thời gian dựng seed; ghi vào kết quả issue.

## Tiêu chí nghiệm thu

- [x] Test seed: đủ số lượng, đủ trạng thái, mọi placement seed qua được constraint engine, sự kiện có người làm hợp lệ.
- [x] Test cũ phụ thuộc chuyến chính vẫn xanh (ngày neo `2026-09-14`).

## Kết quả (19/09/2026)

`createMockDb({ today })`: `getMockDb()` neo hôm nay (giờ Việt Nam); Vitest và `createMockDb()` mặc định neo 14/09/2026. Seed:
8 xe (VEHICLE-008 bảo dưỡng), 12 người dùng (US-0008 bị khoá), 15 chuyến từ 27 ngày trước tới 2 ngày sau: 7 hoàn thành (TRIP-003 thiếu
1 kiện ở kho, TRIP-005 hàng hỏng, TRIP-007 khách từ chối), 1 huỷ, TRIP-009 đang giao (điểm 1/3 xong), TRIP-010 đã xếp xong cho tài xế
demo, TRIP-011 đang xếp 110/280, chuyến chính đã duyệt, TRIP-012 đã tối ưu, TRIP-013 cần xem lại, TRIP-014 nháp. 20 khách có SĐT,
17 loại hàng. 115 sự kiện nhật ký lịch sử khớp dữ liệu.

**Số đo:** dựng seed 0,31 s (Vitest, Ryzen 7 5800H), một lần mỗi ngày neo rồi nhân bản. Mọi revision seed: 0 lỗi constraint engine,
0 kiện chưa xếp; lấp đầy thể tích 27–51 %, tải 24–79 %. Tổng seed neo 14/09: 2.863 kiện, 55.305 kg.

Test `seed.test.ts` thêm 4 ca (15 chuyến đủ trạng thái, mọi phương án hợp lệ, tiến độ khớp spec, 12 người dùng và nhật ký chỉ có người thật).
Test cũ cập nhật mã mới (`VEHICLE-009`, `TRIP-015`, `REV-028`…) và tổng dashboard.

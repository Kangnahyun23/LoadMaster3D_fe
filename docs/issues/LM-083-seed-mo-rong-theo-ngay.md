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

- [ ] `createMockDb({ today })`: seed tính ngày tương đối từ ngày neo (giờ Việt Nam); app neo theo hôm nay, test truyền ngày cố định.
- [ ] 8 xe (4 xe cũ giữ nguyên mã và thông số, 1 xe bảo dưỡng), 12 người dùng (đủ 5 vai trò, 1 tài khoản bị khoá), 15 chuyến:
      hoàn thành (7, có sự cố giao và kiện thiếu), huỷ (1), đang giao (1), đã xếp xong (1), đang xếp (1), đã duyệt (chuyến chính),
      đã tối ưu (1), cần xem lại (1), nháp (1). Điểm giao có SĐT. Dữ liệu tiếng Việt thật, không "Sample".
- [ ] `TRIP-2026-0914` giữ nguyên xe, điểm giao, kiện, `REV-001`/`REV-002`; là chuyến đã duyệt của ngày neo, gán tài xế demo.
- [ ] Revision dựng bằng `runMockOptimization` (tất định); tiến độ kho/giao và nhật ký lịch sử khớp dữ liệu chuyến.
- [ ] Đo thời gian dựng seed; ghi vào kết quả issue.

## Tiêu chí nghiệm thu

- [ ] Test seed: đủ số lượng, đủ trạng thái, mọi placement seed qua được constraint engine, sự kiện có người làm hợp lệ.
- [ ] Test cũ phụ thuộc chuyến chính vẫn xanh (ngày neo `2026-09-14`).

---
id: LM-051
title: Màn So sánh phương án chuyển thành so sánh revision
phase: 3
labels: [trips, spec-compliance]
depends_on: [LM-026, LM-049]
estimate: 1d
prd: [D-37]
---

# LM-051 — So sánh revision

## Việc cần làm

- [ ] `PlanComparisonPage` đọc danh sách revision của chuyến qua Query; bỏ `lib/plan-comparison.mock.ts` (dữ liệu "GA 500 thế hệ" giả).
- [ ] Mỗi thẻ: phương pháp, seed, thiết lập (LIFO, trọng tâm thấp, thời gian), tỷ lệ thể tích/tải, đã/chưa xếp, thời gian chạy, trạng thái (mới nhất / đã duyệt / lỗi thời), badge MOCK RESULT.
- [ ] Ảnh thu nhỏ SVG đẳng cự dựng từ placement thật (`PlanThumbnail` nhận placements), giới hạn số khối vẽ để nhẹ.
- [ ] Chọn revision → mở Planner với `?revision=`. Chỉ một nút primary trên màn (sửa lỗi hiện có: `PlanCard` được chọn cũng dùng primary).
- [ ] Chuyến chỉ có ≤ 1 revision: trạng thái rỗng giải thích và dẫn tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [ ] Số liệu thẻ khớp `result.metrics`.
- [ ] Không còn dữ liệu thuật toán giả trong repo.

---
id: LM-086
title: Kho — chọn chuyến, ghi tiến độ và kiện thiếu vào kho, xếp xong chuyển trạng thái
phase: 6
labels: [warehouse, touch]
depends_on: [LM-083, LM-084]
estimate: 1.5d
prd: [D-45, D-46, D-47]
---

# LM-086 — Kho

## Việc cần làm

- [ ] `/kho`: danh sách chuyến đã duyệt chờ xếp và đang xếp (ngày, xe, số kiện, tiến độ), nút 56 px "Bắt đầu xếp" / "Tiếp tục (x/y)".
      Bản duyệt lỗi thời: hiện cảnh báo, không cho bắt đầu, nói chờ điều phối duyệt lại. Rỗng: trạng thái rỗng thật.
- [ ] `/kho?chuyen=`: vào lần đầu → `startLoading`; xác nhận → `recordLoadingStep(loaded)`; "Kiện này không có ở kho" → hộp xác nhận → `missing`;
      bước cuối → `completeLoading`. Mở lại trong phiên thì tiếp tục ở kiện chưa ghi đầu tiên.
- [ ] Màn xếp xong: số kiện đã xếp, danh sách kiện thiếu, nút về danh sách.
- [ ] Thoát: ở danh sách là đăng xuất (màn chính của kho); trong phiên là về danh sách.
- [ ] Từ điển nhánh `warehouse`; không từ vựng kỹ thuật mới.

## Tiêu chí nghiệm thu

- [ ] E2E tablet: đăng nhập kho → chọn chuyến chính → xếp 2 kiện, báo thiếu 1 → rời màn → vào lại tiếp tục đúng bước;
      điều phối thấy chuyến "Đang xếp hàng" và kiện thiếu.

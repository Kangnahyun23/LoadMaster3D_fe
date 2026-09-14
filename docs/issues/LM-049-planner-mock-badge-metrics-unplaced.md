---
id: LM-049
title: Planner hiển thị revision — MOCK RESULT, metrics, danh sách chưa xếp
phase: 3
labels: [viewer3d, spec-compliance]
depends_on: [LM-030, LM-036, LM-037, LM-048]
estimate: 1.5d
prd: [D-38]
spec: [9.5, 10]
---

# LM-049 — Planner hiển thị kết quả

## Việc cần làm

- [ ] `ViewerPage` đọc `?revision=<jobId>` qua Query (mặc định revision mới nhất của chuyến); bỏ `LOAD_PLAN`, `PLANS` mock.
- [ ] `ViewerHeader`: badge **MOCK RESULT** khi `isMockResult` (không dịch), tỷ lệ thể tích, tỷ lệ tải trọng, số đã xếp / tổng, thời gian chạy; nhãn "Đã chỉnh tay" nếu có draft.
- [ ] Inspector tab "Chỉ số": đủ metrics Spec; tab "Chưa xếp": danh sách `unplacedPackages` với `reasonCode` dịch qua từ điển + `message`, lọc theo lý do, bấm để xem thông tin kiện gốc.
- [ ] Danh sách kiện có lọc theo điểm giao, trạng thái cảnh báo, tìm theo mã.
- [ ] Chi tiết kiện: kích thước đã xoay (cm), khối lượng (kg), hướng, `supportRatio`, `constraintWarnings` (qua `formatIssue`), thứ tự xếp, thứ tự dỡ.
- [ ] Nút "Xem toàn xe" (reset camera) và bốn góc nhìn phối cảnh / trên / bên hông / cửa sau đúng Spec 10.
- [ ] Trạng thái rỗng khi chuyến chưa có revision: `EmptyState` dẫn tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [ ] Checklist Spec 15: viewer đúng tỷ lệ, rotate/zoom/pan/reset, click kiện hiện đúng cm/kg, hiện kiện chưa xếp và lý do, hiện utilization, nhãn mock rõ.
- [ ] Không còn import `@/lib/load-plan.mock` trong `viewer3d`.

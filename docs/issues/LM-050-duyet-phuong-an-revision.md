---
id: LM-050
title: Duyệt phương án — chặn theo lỗi/mustLoad/lỗi thời, tính lại thứ tự, tạo revision approved
phase: 3
labels: [viewer3d, workflow]
depends_on: [LM-022, LM-026, LM-035, LM-049]
estimate: 1.5d
prd: [D-24, D-31, D-32]
---

# LM-050 — Duyệt phương án

## Việc cần làm

- [ ] `ApprovePlanDialog` dùng `approvalBlockers` (LM-023): còn `error`, kiện `mustLoad` chưa xếp, revision lỗi thời (`isStale`). Có blocker → nút Duyệt disabled, lý do hiện cạnh nút và trong dialog.
- [ ] Dialog tóm tắt: metrics, số cảnh báo theo nhóm, có chỉnh tay hay không, thứ tự sẽ được tính lại.
- [ ] Xác nhận → `useApproveRevisionMutation` gọi `approveRevision(jobId, draft.patches)`: áp draft, `recomputeOrders`, tính lại metrics và `supportRatio`/`constraintWarnings`, lưu revision approved mới (`isMockResult` giữ nguyên, `manuallyEdited`, `ordersRecomputed`).
- [ ] Gỡ `notifyPendingFeature('Duyệt phương án…')`.
- [ ] Sau duyệt: toast thành công, chuyển sang revision approved, draft rỗng.
- [ ] Banner "Kết quả đã lỗi thời — xe hoặc kiện đã thay đổi" với nút tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [ ] Test: revision có kiện `mustLoad` chưa xếp không duyệt được; sửa kiện rồi quay lại thì không duyệt được.
- [ ] Revision nguồn không đổi sau khi duyệt; kho đọc được bản approved.

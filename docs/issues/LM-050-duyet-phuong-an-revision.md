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

- [x] `ApprovePlanDialog` dùng `approvalBlockers` (LM-023): còn `error`, kiện `mustLoad` chưa xếp, revision lỗi thời (`isStale`). Có blocker → nút Duyệt disabled, lý do hiện cạnh nút và trong dialog.
- [x] Dialog tóm tắt: metrics, số cảnh báo theo nhóm, có chỉnh tay hay không, thứ tự sẽ được tính lại.
- [x] Xác nhận → `useApproveRevisionMutation` gọi `approveRevision(jobId, draft.patches)`: áp draft, `recomputeOrders`, tính lại metrics và `supportRatio`/`constraintWarnings`, lưu revision approved mới (`isMockResult` giữ nguyên, `manuallyEdited`, `ordersRecomputed`).
- [x] Gỡ `notifyPendingFeature('Duyệt phương án…')`.
- [x] Sau duyệt: toast thành công, chuyển sang revision approved, draft rỗng.
- [x] Banner "Kết quả đã lỗi thời — xe hoặc kiện đã thay đổi" với nút tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [x] Test: revision có kiện `mustLoad` chưa xếp không duyệt được; sửa kiện rồi quay lại thì không duyệt được.
- [x] Revision nguồn không đổi sau khi duyệt; kho đọc được bản approved.

## Kết quả (16/09/2026)

- [plan-approval.ts](../../src/features/viewer3d/approval/plan-approval.ts): dựng constraint engine trên snapshot, áp patch của draft (`commitMove`), `evaluateAll` → `approvalBlockers` (lỗi `error`, `mustLoad` chưa xếp, lỗi thời). Trả thêm cảnh báo và danh sách patch gửi đi.
- [useViewerApproval.ts](../../src/features/viewer3d/approval/useViewerApproval.ts): lý do chặn cho header, `useApproveRevisionMutation` gọi `approveRevision(revisionId, patches)` của kho (áp draft, tính lại thứ tự và metrics, lưu revision approved mới). Xong: toast, mở `?revision=<mã revision mới>` (replace), phiên mới draft rỗng.
- [ApprovePlanDialog.tsx](../../src/features/viewer3d/ApprovePlanDialog.tsx): metrics thật, blocker qua `formatIssue`, số cảnh báo, số kiện chỉnh tay, câu "thứ tự sẽ tính lại", kiểm vận hành (LIFO, thứ tự điểm giao). Nút Duyệt trong dialog disabled khi có blocker hoặc không có revision (fixture benchmark).
- Banner lỗi thời trong [ViewerSession.tsx](../../src/features/viewer3d/ViewerSession.tsx) dẫn tới Thiết lập tối ưu.
- **Lệch có chủ ý:** nút "Duyệt phương án" ở header vẫn bấm được khi bị chặn — lý do hiện cạnh nút, và dialog liệt kê đủ blocker; nút xác nhận trong dialog mới disabled. Disable ở header thì người dùng không đọc được danh sách lỗi.
- `notifyPendingFeature` của Duyệt đã gỡ cùng ViewerPage cũ.
- Test: [viewer-approval.test.ts](../../tests/viewer-approval.test.ts) (seed duyệt được; `mustLoad` chưa xếp chặn; lỗi thời chặn; draft chồng lấn chặn và sinh patch). E2E [plan-approval.spec.ts](../../e2e/plan-approval.spec.ts): Duyệt seed tạo revision mới; sửa kiện → banner lỗi thời, nút xác nhận disabled. Revision nguồn giữ nguyên do kho bất biến (LM-026).

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

- [x] `ViewerPage` đọc `?revision=<jobId>` qua Query (mặc định revision mới nhất của chuyến); bỏ `LOAD_PLAN`, `PLANS` mock.
- [x] `ViewerHeader`: badge **MOCK RESULT** khi `isMockResult` (không dịch), tỷ lệ thể tích, tỷ lệ tải trọng, số đã xếp / tổng, thời gian chạy; nhãn "Đã chỉnh tay" nếu có draft.
- [x] Inspector tab "Chỉ số": đủ metrics Spec; tab "Chưa xếp": danh sách `unplacedPackages` với `reasonCode` dịch qua từ điển + `message`, lọc theo lý do, bấm để xem thông tin kiện gốc.
- [x] Danh sách kiện có lọc theo điểm giao, trạng thái cảnh báo, tìm theo mã.
- [x] Chi tiết kiện: kích thước đã xoay (cm), khối lượng (kg), hướng, `supportRatio`, `constraintWarnings` (qua `formatIssue`), thứ tự xếp, thứ tự dỡ.
- [x] Nút "Xem toàn xe" (reset camera) và bốn góc nhìn phối cảnh / trên / bên hông / cửa sau đúng Spec 10.
- [x] Trạng thái rỗng khi chuyến chưa có revision: `EmptyState` dẫn tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [x] Checklist Spec 15: viewer đúng tỷ lệ, rotate/zoom/pan/reset, click kiện hiện đúng cm/kg, hiện kiện chưa xếp và lý do, hiện utilization, nhãn mock rõ.
- [x] Không còn import `@/lib/load-plan.mock` trong `viewer3d`.

## Kết quả (16/09/2026)

- [ViewerPage.tsx](../../src/features/viewer3d/ViewerPage.tsx) chỉ chọn nguồn: revision của chuyến qua `usePlanSourceQuery` hoặc fixture benchmark; phiên Planner tách sang [ViewerSession.tsx](../../src/features/viewer3d/ViewerSession.tsx). `?revision=` nhận **mã revision** (đúng bản đó) hoặc `jobId` (bản mới nhất của job — bản đã duyệt thắng). Chuyến chưa có revision: `EmptyState` dẫn tới Thiết lập tối ưu. Không còn `PLANS`/`LOAD_PLAN` trong Planner.
- `ViewerSceneModel` thêm `metrics` và `revision { id, jobId, method, approved, manuallyEdited, stale }`; placement giữ `supportRatio`, `constraintWarnings`; kiện chưa xếp giữ `message`.
- [ViewerHeader.tsx](../../src/features/viewer3d/ViewerHeader.tsx): MOCK RESULT, Đã duyệt, Đã chỉnh tay, tỷ lệ thể tích / tải trọng, đã xếp / tổng, thời gian chạy — số lấy thẳng từ `result.metrics`.
- Inspector: tab **Chỉ số** ([PlanMetricsPanel.tsx](../../src/features/viewer3d/panels/PlanMetricsPanel.tsx), đủ metrics Spec kể cả trọng tâm nếu có); Danh sách thêm tab **Đã xếp** ([PlacedPackageList.tsx](../../src/features/viewer3d/panels/PlacedPackageList.tsx): tìm mã, lọc điểm giao, chỉ kiện có cảnh báo, tối đa 100 dòng sau lọc); tab Chưa xếp lọc theo lý do, hiện `message` khi khác mã, mã kiện mở kiện gốc ở Chi tiết chuyến (`?kien=`).
- Chi tiết kiện: thêm tỷ lệ đỡ đáy và danh sách lỗi/cảnh báo ràng buộc của kiện (kiểm lại bằng constraint engine theo draft hiện tại, câu qua `formatIssue`); thứ tự xếp/dỡ đã có từ LM-036.
- Góc nhìn và "Xem toàn xe" đã có từ phase 2 (thanh công cụ, HUD).
- Test: [PlacedPackageList.dom.test.tsx](../../src/features/viewer3d/panels/PlacedPackageList.dom.test.tsx) (seed thật), [viewer-plan-source.test.ts](../../tests/viewer-plan-source.test.ts); E2E [plan-approval.spec.ts](../../e2e/plan-approval.spec.ts) mở tab Chỉ số.

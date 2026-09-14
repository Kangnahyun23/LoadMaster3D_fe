---
id: LM-026
title: Mock repository in-memory — xe, chuyến, kiện, revision, duyệt + seed
phase: 1
labels: [data, mock]
depends_on: [LM-010, LM-024]
estimate: 1.5d
prd: [D-06, D-14, D-31]
---

# LM-026 — Mock repository và revision

## Bối cảnh

D-06: dữ liệu dùng chung đi qua mock repository → `-api.ts` → TanStack Query. D-31: kết quả là revision bất biến. D-14: kho và tài xế đọc bản đã duyệt.

## Việc cần làm

- [ ] `src/lib/mock-db/` (dùng chung ≥ 2 feature): store in-memory có hàm CRUD bất đồng bộ + độ trễ giả; không phụ thuộc React.
- [ ] Bộ sưu tập: `vehicles` (VehicleConfig), `trips` (điểm giao, `vehicleId`, danh sách `CargoPackage`, `inputVersion` tăng mỗi khi xe/kiện đổi), `revisions` (`{ jobId, tripId, request, result, inputVersion, createdAt, draftPatches?, approvedAt?, manuallyEdited, ordersRecomputed }`).
- [ ] `isStale(revision, trip) = revision.inputVersion !== trip.inputVersion` (cũng tăng khi xe gắn với chuyến bị sửa).
- [ ] `approveRevision(jobId, patches)` tạo revision approved **mới** (áp draft, tính lại thứ tự LM-022, giữ `isMockResult`), không sửa revision nguồn.
- [ ] Seed: xe mẫu Spec "Truck 6m" + 2–3 xe khác; một chuyến mẫu có ~130 kiện đã tối ưu và đã duyệt (thay `LOAD_PLAN` mm) để `/kho`, `/tai-xe` có dữ liệu ngay.
- [ ] Dữ liệu tên người/địa điểm tiếng Việt thật, không Lorem.

## Tiêu chí nghiệm thu

- [ ] Test: sửa kiện sau khi tối ưu → revision cũ `isStale`; duyệt tạo revision mới, revision nguồn không đổi.
- [ ] Seed được sinh tất định (chạy lại cho cùng ID).

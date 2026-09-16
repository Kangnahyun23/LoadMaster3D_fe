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

- [x] `PlanComparisonPage` đọc danh sách revision của chuyến qua Query; bỏ `lib/plan-comparison.mock.ts` (dữ liệu "GA 500 thế hệ" giả). *(File còn một export `PLANS` rỗng cho `ViewerPage`, xem Kết quả.)*
- [x] Mỗi thẻ: phương pháp, seed, thiết lập (LIFO, trọng tâm thấp, thời gian), tỷ lệ thể tích/tải, đã/chưa xếp, thời gian chạy, trạng thái (mới nhất / đã duyệt / lỗi thời), badge MOCK RESULT.
- [x] Ảnh thu nhỏ SVG đẳng cự dựng từ placement thật (`PlanThumbnail` nhận placements), giới hạn số khối vẽ để nhẹ.
- [x] Chọn revision → mở Planner với `?revision=`. Chỉ một nút primary trên màn (sửa lỗi hiện có: `PlanCard` được chọn cũng dùng primary).
- [x] Chuyến chỉ có ≤ 1 revision: trạng thái rỗng giải thích và dẫn tới Thiết lập tối ưu.

## Tiêu chí nghiệm thu

- [x] Số liệu thẻ khớp `result.metrics`.
- [x] Không còn dữ liệu thuật toán giả trong repo.

## Kết quả (16/09/2026)

**Dữ liệu.** `fetchTripRevisions` trong `trips-api.ts` → `useTripRevisionsQuery` (khoá `['trips', tripId, 'revisions']`, nên
mutation chuyến/kiện/xe và lần tối ưu mới đều làm mới màn). `revision-comparison.ts` (thuần) dựng view model thẻ từ
`request.settings` + `result.metrics`: trạng thái mới nhất / đã duyệt / lỗi thời (`isStale`), `sourceRevisionId` và
`approvedAs` để bản duyệt và bản nguồn (chung `jobId`) phân biệt bằng mã revision; `bestValues` chỉ đánh dấu chỉ số
khác nhau giữa các thẻ (thể tích, đã xếp, chưa xếp, thời gian chạy).

**Màn.** Thẻ theo thứ tự tạo, cuộn ngang khi nhiều revision. Nút chọn trong thẻ luôn là nút phụ (`aria-pressed`); hành
động primary duy nhất ở chân trang "Mở REV-… trong 3D" → `plannerPath` (chuyển từ `manager/plan-link.ts` lên
`lib/planner-path.ts` vì hai feature dùng). Mặc định chọn bản đã duyệt mới nhất, rồi bản mới nhất — cùng quy tắc Planner.
< 2 revision: `EmptyState` với primary "Thiết lập tối ưu", thêm link phụ mở revision duy nhất nếu có. Chữ qua
`trips.compare.*` (vi/en), số qua `useFormat()`; seed hiện nguyên chữ số vì là mã, không phải đại lượng.

**Ảnh thu nhỏ.** `revision-thumbnail.ts` đổi placement (đã áp hướng) cm → m, tô màu theo điểm giao của instance
(`expandPackages`), trần `THUMBNAIL_MAX_BOXES = 150`; vượt trần giữ khối có góc xa gốc nhất (gần người nhìn, che khối
khác) và ghi "Vẽ N / M kiện". Khung nhìn qua `fitViewBox` theo lòng thùng của chính revision.

**Gỡ dữ liệu giả.** `trip-detail.mock.ts` xoá. `plan-comparison.mock.ts` chỉ còn `PLANS = []` để `viewer3d/ViewerPage.tsx`
(ngoài phạm vi issue này) biên dịch — Planner hiện nhãn "Phương án" thay "Phương án C — GA có ràng buộc LIFO"; chủ
ViewerPage gỡ import rồi xoá file. Hình học hình minh hoạ đăng nhập chuyển sang `features/auth/login-artwork-boxes.ts`
(chỉ nhánh LIFO đang dùng, hình giữ nguyên). `/thanh-phan` hộp thoại duyệt dùng số seed REV-002 (40,8% · 5.844 kg ·
132 / 132), bỏ dòng tải trục và ghim giả. AGENTS mục 3 và mục 6 sửa theo.

**Lưu ý.** Planner chọn revision mới nhất của `jobId`, nên link từ thẻ bản nguồn (REV-001) mở bản đã duyệt (REV-002)
cùng job. Muốn mở đúng bản nguồn cần tham số theo mã revision — việc của Planner (LM-049/LM-030).

**Kiểm thử.** `revision-comparison.test.ts` (3 ca) và `revision-thumbnail.test.ts` (2 ca, số tính tay).
`PlanComparisonPage.dom.test.tsx` trên kho dùng chung, không mock module: thẻ REV-001/REV-002 khớp `result.metrics`
(40,8% · 61,5% · 132 kiện · 0 ms · seed 20260914), bản duyệt "Duyệt từ REV-001" / bản nguồn "Đã duyệt thành REV-002",
href Planner, đổi lựa chọn vẫn đúng một nút primary; chuyến 0 và 1 revision hiện trạng thái rỗng.
`pnpm lint`, `pnpm build`, `CI=1 pnpm test` (67 file / 463 test) và `CI=1 E2E_PORT=5197 pnpm test:e2e` (32 test) đều xanh.

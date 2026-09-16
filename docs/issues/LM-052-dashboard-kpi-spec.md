---
id: LM-052
title: Dashboard — KPI theo Spec, job gần nhất, kế hoạch gần đây
phase: 3
labels: [manager, data]
depends_on: [LM-026, LM-040]
estimate: 1d
prd: [D-05, D-20]
spec: [9.1]
---

# LM-052 — Dashboard

## Việc cần làm

- [x] `features/manager/dashboard-api.ts` + hook: số xe, tổng số kiện, tổng khối lượng (kg), job gần nhất, 5 kế hoạch gần đây — tính từ mock repository, không gõ cứng.
- [x] KpiTile cho 3 số đầu; thẻ job gần nhất (chuyến, phương pháp, trạng thái, utilization, thời gian chạy, MOCK RESULT); bảng kế hoạch gần đây dẫn tới Planner.
- [x] Nút primary duy nhất **Tạo kế hoạch xếp** → `/chuyen/moi`.
- [x] Biểu đồ hiện có (`FillRateChart`, `AlgorithmChart`, `PlanVsActualTable`): giữ nếu dữ liệu tính được từ revision; nếu không có nguồn thật thì gỡ (không trình bày số giả như thật).
- [x] Ẩn bộ lọc và "Xuất báo cáo" chưa hoạt động (D-20).
- [x] Sửa format số tự nối chuỗi (`toFixed().replace`) sang `useFormat()`.

## Tiêu chí nghiệm thu

- [x] Tạo thêm kiện rồi quay về Dashboard: tổng số kiện và khối lượng cập nhật.
- [x] Dashboard không có số nào không truy được về dữ liệu repository.

## Kết quả (16/09/2026)

**Lớp dữ liệu.** `dashboard-summary.ts` là hàm thuần `deriveDashboardSummary({ vehicles, trips, revisions })`:
đếm xe, mở `quantity` thành instance bằng `expandPackages` để lấy tổng số kiện, cộng khối lượng rồi `roundKg`,
và gộp revision theo `jobId` (một job có bản tối ưu và bản đã duyệt dùng chung `jobId`, D-31) để "5 kế hoạch gần đây"
là 5 lần tối ưu chứ không phải 5 bản ghi. `dashboard-api.ts` là nơi duy nhất trong `manager` đọc kho
(`getMockDb`), `useDashboardQuery.ts` bọc bằng TanStack Query — đúng đường đi của mục 9.

**Màn hình.** Header 72px với đúng một nút primary **Tạo kế hoạch xếp** → `/chuyen/moi`. Ba ô KPI (số xe,
tổng số kiện, tổng khối lượng), mỗi ô có một dòng ghi chú nói số đến từ đâu; ô là `role="group"` có nhãn nên
đọc màn hình và test đều lấy đúng số của ô. Thẻ **Lần tối ưu gần nhất** hiện chuyến, phương pháp, trạng thái,
tỷ lệ lấp đầy, tỷ lệ tải trọng, thời gian chạy, thời điểm, badge **MOCK RESULT** (không dịch) và **Đã duyệt**,
kèm nút phụ *Mở phương án*. Bảng **Kế hoạch gần đây** dẫn sang Planner theo
`/chuyen/:tripId/phuong-an?revision=<jobId>` (`plan-link.ts`). Ba trạng thái đang tải / lỗi (EmptyState + *Thử lại*) /
chưa có revision nào đều thật; màn chạy được khi kho không có revision.

**Đã gỡ (D-20, không có nguồn số thật).** `FillRateChart` (kho không có chuỗi theo tuần), `AlgorithmChart`
(chỉ có phương pháp MOCK, không có so sánh thuật toán), `PlanVsActualTable` (không có số **thực tế** để đặt cạnh
kế hoạch) và `dashboard.mock.ts`. Cùng lý do, `KpiTile` bỏ chip "so với kỳ trước": kho không có kỳ trước.
Cũng gỡ hai bộ lọc giả và nút *Xuất báo cáo* (ba lời gọi `notifyPendingFeature` cuối cùng của màn này).
`/thanh-phan` cập nhật theo: mẫu KpiTile dùng số seed thật, hàng biểu đồ bỏ đi. Thư viện `recharts` giữ lại
trong `package.json` cho biểu đồ có nguồn thật sau — luật ghi ở AGENTS mục 2 và mục 6 ("Không bịa số").

**Chữ và số.** Toàn bộ chuỗi mới qua từ điển `manager.*` (vi/en); số, phần trăm, khối lượng và ngày giờ qua
`useFormat()`. Không còn `toFixed().replace` nào trong `src/features/manager`.

**Kiểm thử.** `dashboard-summary.test.ts` (unit, 4 ca: tổng số/khối lượng, kho rỗng, gộp theo `jobId`, 5 job mới nhất).
`DashboardPage.dom.test.tsx` mount màn thật trên kho thật (không mock module nào): khẳng định 4 xe · 132 kiện ·
5.844 kg của seed, badge MOCK RESULT, link Planner và link `/chuyen/moi`; ca thứ hai thêm một dòng kiện qua
`updateTrip` rồi mở lại màn — 134 kiện · 5.864 kg, đúng tiêu chí nghiệm thu.
`pnpm lint`, `pnpm build`, `CI=1 pnpm test` (58 file / 433 test) và `CI=1 E2E_PORT=5194 pnpm test:e2e` (28 test) đều xanh.

**Lưu ý cho issue sau.** Repo chưa có `useMutation` nào ghi vào kho (màn chuyến và đội xe còn dùng `useState`),
nên hiện chưa có chỗ nào phải `invalidateQueries`. Khi LM-045/LM-046 thêm mutation tạo/sửa kiện và xe,
nhớ invalidate luôn khoá `['dashboard']` để màn này cập nhật ngay trong phiên.

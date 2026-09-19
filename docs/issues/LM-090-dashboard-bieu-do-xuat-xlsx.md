---
id: LM-090
title: Bảng điều khiển — lọc kỳ, KPI theo kỳ, 3 biểu đồ, xuất .xlsx
phase: 6
labels: [manager, charts, export]
depends_on: [LM-083, LM-084]
estimate: 2d
prd: [D-48]
---

# LM-090 — Dashboard

## Việc cần làm

- [x] Lọc kỳ: 7 ngày / 30 ngày / tháng này / tuỳ chọn; giữ trên URL.
- [x] KPI theo kỳ, mỗi ô có dòng nói nguồn: số chuyến (hoàn thành / tổng), lấp đầy thể tích trung bình (bản đã duyệt), khối lượng đã giao,
      tỷ lệ kiện giao không sự cố, xe đang chạy hôm nay.
- [x] 3 biểu đồ recharts (chunk riêng): lấp đầy theo ngày, chuyến theo trạng thái, khối lượng theo xe. Màu từ token; có bảng số thay thế cho
      trình đọc màn hình; kỳ không có dữ liệu thì trạng thái rỗng, không vẽ trục trống.
- [x] Bảng chuyến gần đây trong kỳ (dẫn tới chi tiết chuyến / Planner).
- [x] Xuất .xlsx (`write-excel-file`, tải lười): sheet Tổng quan, Chuyến, Theo xe; tên file có kỳ. Quyền `reports.export`.
- [x] Một nút primary: điều phối "Tạo kế hoạch xếp"; quản lý (không có quyền tạo) "Xuất báo cáo".
- [ ] AGENTS mục 2 và 6 cập nhật luật biểu đồ (D-48) — agent không sửa AGENTS; câu đề xuất ở cuối mục Kết quả để người điều phối áp.

## Tiêu chí nghiệm thu

- [x] Unit test tổng hợp theo kỳ bằng số tính tay; DOM test đổi kỳ; E2E xuất file có đúng sheet.

## Kết quả (19/09/2026)

### Đã làm

- **Kỳ** (`dashboard-period.ts`, hàm thuần): `?ky=7-ngay|30-ngay|thang-nay|tuy-chon` (+ `tu`, `den` cho tuỳ chọn); mặc định 30 ngày
  không ghi lên URL. 7/30 ngày tính lùi gồm hôm nay, tháng này là trọn tháng lịch (gồm ngày chưa tới), tuỳ chọn: đầu thiếu/sai lấy theo
  30 ngày, hai đầu ngược thì đảo. Chuyến thuộc kỳ theo **ngày chạy**. `useDashboardPeriod` ghi URL bằng `replace`; chuyển sang tuỳ chọn thì
  hai ô ngày bắt đầu từ khoảng đang xem. Hàng lọc (`PeriodFilter`: `SegmentedControl` + hai ô ngày giữ bản nháp như `FilterBar`) nằm trên
  mọi KPI/biểu đồ/bảng và hiện khoảng ngày đã giải ("21/08/2026 – 19/09/2026").
- **Dữ liệu**: `dashboard-api.ts` đọc kho **một lần** (chuyến + revision từng chuyến, xe, trạng thái xe, người dùng, `today` giờ VN);
  `useDashboardQuery(selection)` giữ khoá `['dashboard']` (mutation chuyến vẫn làm mới), kỳ chỉ đổi `select` → đổi kỳ tính lại tức thì, không
  nhấp nháy. `staleTime: 0` để tiến độ kho/giao mới nhất khi mở màn.
- **Tổng hợp** (`trip-facts.ts` + `dashboard-summary.ts`, hàm thuần `summarizeDashboard(data, period)`):
  - Chuyến hoàn thành / tổng (tổng gồm chuyến huỷ).
  - Lấp đầy thể tích TB = trung bình `volumeUtilizationPercent` của **bản đã duyệt mới nhất**, chuyến không huỷ; cờ MOCK RESULT khi có bản mock.
  - Khối lượng đã giao = cộng khối lượng các kiện trong `delivery.stops[].unloadedIds` (hàng hỏng khách vẫn nhận tính đã giao, từ chối không).
  - Kiện giao không sự cố = kiện của các **điểm giao đã hoàn tất** (`stopItemIds`, trừ kiện kho báo thiếu) không có sự cố gắn vào;
    sự cố của cả điểm (không gắn kiện) tính cho mọi kiện của điểm đó. Chưa có điểm hoàn tất → "—" kèm lý do, không hiện 0%.
  - Xe đang chạy hôm nay = `listVehicleStates` `in_use` / tổng xe — trạng thái lúc này, ô ghi rõ "không theo kỳ".
  - Chuỗi biểu đồ: mỗi ngày của kỳ một điểm (ngày không có bản duyệt là `null`, không bịa 0), chuyến theo trạng thái theo vòng đời (chỉ
    trạng thái có chuyến), theo xe (xe có chuyến trong kỳ, khối lượng đã giao giảm dần).
- **Màn** `DashboardPage`: header một primary theo quyền (`trips.edit` → "Tạo kế hoạch xếp" primary + "Xuất báo cáo" secondary nếu có
  `reports.export`; quản lý → "Xuất báo cáo" primary; điều phối không có nút xuất). `KpiRow` 5 ô `KpiTile` (thêm prop `badge` cho MOCK RESULT,
  API cũ giữ nguyên cho `/thanh-phan`). Kỳ không có chuyến: KPI vẫn hiện (0 / "—"), `EmptyState` thay biểu đồ và bảng.
- **Biểu đồ** (`DashboardCharts` tải lười bằng `lazy()` → `recharts` ở chunk riêng 360 kB, KPI hiện trước; skeleton giữ đúng khung):
  `FillByDayChart` (cột theo ngày, trục 0–100%), `TripsByStatusChart`, `WeightByVehicleChart` (cột ngang, số ở đầu cột). Một chuỗi mỗi
  biểu đồ → một màu `var(--primary)`, không chú giải (tiêu đề nói hình vẽ gì); tám màu điểm giao không dùng; lưới `--border` 1 px liền; nhãn
  trục micro 11 px (số mono); cột ≤ 24 px bo 4 px đầu dữ liệu; tắt animation. Tooltip theo token (giá trị trước, nhãn sau, bóng `--e2`).
  `ChartCard`: `figure` có tiêu đề (h2), hình `aria-hidden` + `accessibilityLayer={false}`, **bảng số `sr-only`** ngay sau với cùng giá trị;
  kỳ không có dữ liệu cho biểu đồ đó → một câu thay hình, không vẽ trục trống.
- **Chuyến trong kỳ** (`RecentTripsTable`, 10 chuyến ngày chạy gần nhất): tên dẫn `/chuyen/:id`, cột Phương án dẫn Planner
  (`plannerPath`, bản duyệt mới nhất, không có thì bản mới nhất; nhãn máy đọc "Mở phương án của …"), trạng thái `StatusBadge`, lấp đầy, đã giao.
- **Xuất .xlsx**: `dashboard-report.ts` (hàm thuần, chỉ `import type` từ thư viện) dựng 3 sheet theo ngôn ngữ đang chọn — Tổng quan
  (kỳ, giờ xuất, 6 chỉ số kèm đơn vị và nguồn, dòng MOCK RESULT khi có), Chuyến (mọi chuyến của kỳ: mã, tên, ngày chạy là ô ngày Excel,
  xe, tài xế, trạng thái, số kiện, khối lượng hàng, lấp đầy bản duyệt, đã giao, số sự cố), Theo xe. Số giữ là số (định dạng `#,##0`,
  `#,##0.00`, `0.0`) để Excel tính tiếp. `useExportReport` `import('write-excel-file/browser')` khi bấm (chunk riêng 70 kB), tên file
  `bao-cao-van-hanh_<từ>_<đến>.xlsx` (en: `operations-report_…`); toast chỉ báo sau khi trình duyệt nhận file.
- `lib/format.ts`: thêm `dayMonth` ("04/09" · "Sep 4") cho nhãn trục — bỏ năm khỏi ngày đầy đủ của ngôn ngữ vì tuỳ chọn ngày + tháng
  riêng của Intl vi-VN ra "04-09".
- Gỡ `LatestJobCard.tsx`, `RecentPlansTable.tsx` (thẻ "Lần tối ưu gần nhất" không theo kỳ); từ điển nhánh `manager` viết lại (vi/en).

### File

`src/features/manager/`: `DashboardPage.tsx`, `KpiRow.tsx`, `KpiTile.tsx`, `PeriodFilter.tsx`, `DashboardCharts.tsx`, `ChartCard.tsx`,
`chart-style.tsx`, `FillByDayChart.tsx`, `TripsByStatusChart.tsx`, `WeightByVehicleChart.tsx`, `RecentTripsTable.tsx`, `dashboard-api.ts`,
`dashboard-period.ts`, `dashboard-summary.ts`, `trip-facts.ts`, `dashboard-report.ts`, `useDashboardQuery.ts`, `useDashboardPeriod.ts`,
`useExportReport.ts` · `src/lib/format.ts` · `src/lib/i18n/{vi,en}/manager.ts` · `src/test/dashboard-data.ts` (kho thu nhỏ dựng tay)
· `e2e/manager-dashboard.spec.ts`.

### Kiểm thử

- Unit: `dashboard-period.test.ts` (5 — 7/30 ngày, tháng này gồm năm nhuận/tháng 12, tuỳ chọn đảo/thiếu/sai, ngày qua ranh giới tháng,
  đọc URL), `dashboard-summary.test.ts` (5 — KPI, 3 chuỗi, dòng chuyến, kỳ rỗng, không MOCK khi kết quả thật; số cộng tay từ bảng trong
  `src/test/dashboard-data.ts`), `dashboard-report.test.ts` (4 — tên sheet vi/en, số Tổng quan, dòng Chuyến, Theo xe), `format.test.ts` (+1).
- DOM: `DashboardPage.dom.test.tsx` (7, thay 2 test cũ) — KPI 30 ngày từ seed (7 / 12 chuyến, 3 / 8 xe, MOCK RESULT), đổi 7 ngày/tháng
  này/tuỳ chọn + URL, kỳ rỗng, bảng số `sr-only` của 3 biểu đồ, liên kết chi tiết/Planner, nút primary theo vai trò. Giả `Date`
  (`vi.useFakeTimers({ toFake: ['Date'] })`) để "hôm nay" của kỳ trùng ngày neo seed 14/09.
- E2E `e2e/manager-dashboard.spec.ts` (1, desktop): quản lý đổi 7 ngày (URL `?ky=7-ngay`, KPI 1 / 5), bấm "Xuất báo cáo", bắt `download`,
  tên `bao-cao-van-hanh_<hôm nay − 6>_<hôm nay>.xlsx`, đọc lại bằng `read-excel-file/node`: 3 sheet đúng tên, sheet Chuyến 5 dòng + tiêu đề.

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 97 file / 618 test ✅ · `E2E_PORT=5194 pnpm exec playwright test
e2e/manager-dashboard.spec.ts` 1/1 ✅ · `vite build` ✅ (DashboardPage 16 kB, DashboardCharts 360 kB, write-excel-file 70 kB — ba chunk tách).

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 2, dòng `recharts`: *recharts — 3 biểu đồ bảng điều khiển (LM-090, D-48), chỉ import trong `features/manager/DashboardCharts` (tải
  lười). Thêm: `write-excel-file` — xuất báo cáo .xlsx, `import('write-excel-file/browser')` khi bấm; `read-excel-file` — nhập kiện (LM-093).*
- Mục 6 "Không bịa số", thay gạch đầu dòng LM-052 thứ nhất: *(đã điều chỉnh 19/09/2026, LM-090, D-48) Biểu đồ được phép khi kho có chuỗi thật:
  bảng điều khiển có 3 biểu đồ (lấp đầy theo ngày, chuyến theo trạng thái, khối lượng đã giao theo xe) tính bằng hàm thuần
  `summarizeDashboard` từ chuyến, revision đã duyệt, tiến độ giao và trạng thái xe của kho. Ngày không có số để trống, không nối, không
  điền 0; kỳ không có dữ liệu hiện câu rỗng thay trục trống; tỷ lệ chưa tính được hiện "—" kèm lý do. Mỗi KPI một dòng nói nguồn; số lấy
  từ kết quả mock mang MOCK RESULT. Vẫn không có "so với kỳ trước", thuật toán so sánh, hay "kế hoạch vs thực tế".*
- Mục 5 hoặc 7 (biểu đồ): *Biểu đồ 2D dùng token qua `var()`: một chuỗi một màu `--primary`, không chú giải; tám màu điểm giao chỉ cho điểm
  giao; lưới `--border` 1 px liền; nhãn trục micro 11 px, số mono; cột ≤ 24 px bo 4 px đầu dữ liệu; tắt animation; tooltip là lớp nổi
  (bóng `--e2`). Hình `aria-hidden`, có bảng số `sr-only` cùng giá trị (`ChartCard`/`ChartTable`).*
- Mục 9 "Kiểm thử": *Màn tính theo "hôm nay" (kỳ của bảng điều khiển) giả đồng hồ bằng `vi.useFakeTimers({ toFake: ['Date'] })` về ngày neo
  seed; chỉ giả `Date` để `setTimeout` (độ trễ kho, `findBy…`) vẫn chạy thật.*
- Mục 6 "Định dạng số và ngày": *`format.dayMonth` cho nhãn trục biểu đồ (bỏ năm khỏi ngày đầy đủ, không dùng tuỳ chọn ngày + tháng riêng
  của Intl vì vi-VN ra "04-09").*

import type { DashboardSummary } from './dashboard-summary'
import { FillByDayChart } from './FillByDayChart'

/**
 * Điểm tải lười của `recharts` (AGENTS mục 2, mục 9 "Chia chunk"): `DashboardPage` import file này qua `lazy()`, nên thư viện
 * biểu đồ nằm ở chunk riêng và phần còn lại của màn hiện trước. Từ V2 chỉ biểu đồ lấp đầy theo ngày (trục thời gian) còn dùng
 * `recharts`; hai biểu đồ phần-trên-tổng là hàng thanh HTML (`ShareBars`) vẽ ngay.
 */
export function DashboardCharts({ summary, className }: { summary: DashboardSummary; className?: string }) {
  return <FillByDayChart className={className} days={summary.fillByDay} isMockResult={summary.fill.isMockResult} />
}

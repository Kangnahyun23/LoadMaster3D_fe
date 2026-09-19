import type { DashboardSummary } from './dashboard-summary'
import { FillByDayChart } from './FillByDayChart'
import { TripsByStatusChart } from './TripsByStatusChart'
import { WeightByVehicleChart } from './WeightByVehicleChart'

/**
 * Ba biểu đồ của bảng điều khiển (LM-090, D-48). File này là điểm tải lười của `recharts`: `DashboardPage` import nó qua
 * `lazy()`, nên thư viện biểu đồ nằm ở chunk riêng và KPI hiện trước khi biểu đồ tải xong.
 */
export function DashboardCharts({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid flex-none gap-4 xl:grid-cols-2">
      <FillByDayChart className="xl:col-span-2" days={summary.fillByDay} isMockResult={summary.fill.isMockResult} />
      <TripsByStatusChart entries={summary.tripsByStatus} />
      <WeightByVehicleChart vehicles={summary.byVehicle} />
    </div>
  )
}

import { Calendar, ChevronDown, Download, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { notifyPendingFeature } from '@/lib/pending-feature'
import { AlgorithmChart, AlgorithmLegend } from './AlgorithmChart'
import { FillRateChart } from './FillRateChart'
import { KpiTile } from './KpiTile'
import { PlanVsActualTable } from './PlanVsActualTable'
import { KPIS, PERIOD_LABEL, TOTAL_TRIPS } from './dashboard.mock'

/**
 * Bảng điều khiển của manager.
 * Một hành động chính duy nhất trên màn: "Xuất báo cáo" (CLAUDE.md mục 5).
 */
export function DashboardPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-3 border-b border-border bg-bg px-8">
        <h1 className="mr-3 text-h2 font-semibold tracking-[-0.01em]">
          Bảng điều khiển
        </h1>

        <FilterButton
          icon={Calendar}
          onClick={() => notifyPendingFeature('Bộ lọc khoảng thời gian')}
        >
          30 ngày qua
        </FilterButton>
        <FilterButton icon={Truck} onClick={() => notifyPendingFeature('Bộ lọc theo xe')}>
          Tất cả xe <span className="font-mono text-text-3">12</span>
        </FilterButton>

        <span className="ml-1 text-caption text-text-3">{PERIOD_LABEL}</span>

        <div className="flex-1" />

        <Button
          variant="secondary"
          className="h-9 px-3.5"
          onClick={() =>
            notifyPendingFeature('Xuất báo cáo', 'Cần dịch vụ kết xuất Excel/PDF phía máy chủ.')
          }
        >
          <Download strokeWidth={1.5} />
          Xuất báo cáo
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 p-6 px-8">
        <div className="grid flex-none grid-cols-4 gap-4">
          {KPIS.map((kpi) => (
            <KpiTile key={kpi.label} kpi={kpi} />
          ))}
        </div>

        <div className="grid flex-none grid-cols-2 gap-4">
          <ChartCard
            title="Tỷ lệ lấp đầy theo tuần"
            aside={
              <span className="text-caption text-text-3">
                12 tuần gần nhất · trung bình các chuyến hoàn thành
              </span>
            }
          >
            <FillRateChart />
          </ChartCard>

          <ChartCard title="So sánh thuật toán" aside={<AlgorithmLegend />}>
            <AlgorithmChart />
          </ChartCard>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-11 flex-none items-center justify-between border-b border-border px-4">
            <div className="flex items-baseline gap-2">
              <span className="text-body font-medium">Kế hoạch với thực tế</span>
              <span className="text-caption text-text-3">
                theo chuyến · 30 ngày qua
              </span>
            </div>
            <Link to="/chuyen" className="text-body font-medium text-primary">
              Xem tất cả {TOTAL_TRIPS} chuyến
            </Link>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <PlanVsActualTable />
          </div>
        </Card>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  aside,
  children,
}: {
  title: string
  aside: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="flex flex-col gap-3 px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body font-medium">{title}</span>
        {aside}
      </div>
      {children}
    </Card>
  )
}

function FilterButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-bg px-3 text-body font-medium text-text transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Icon className="size-4 text-text-3" strokeWidth={1.5} />
      {children}
      <ChevronDown className="size-3.5 text-text-3" strokeWidth={1.5} />
    </button>
  )
}

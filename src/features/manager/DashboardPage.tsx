import { Download, Plus } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCan } from '@/features/auth/useCan'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { DashboardSummary } from './dashboard-summary'
import { KpiRow } from './KpiRow'
import { PeriodFilter } from './PeriodFilter'
import { RecentTripsTable } from './RecentTripsTable'
import { useDashboardPeriod } from './useDashboardPeriod'
import { useDashboardQuery } from './useDashboardQuery'
import { useExportReport } from './useExportReport'

/** `recharts` nằm ở chunk riêng: KPI và bảng hiện ngay, biểu đồ theo sau (AGENTS mục 9 "Chia chunk"). */
const DashboardCharts = lazy(() => import('./DashboardCharts').then((m) => ({ default: m.DashboardCharts })))

/**
 * Bảng điều khiển (LM-052, LM-090): lọc kỳ trên URL, 5 KPI theo kỳ, 3 biểu đồ, chuyến trong kỳ và xuất báo cáo .xlsx. Mọi số
 * tính từ kho qua `useDashboardQuery` (D-48). Đúng một nút primary (mục 5): người lập kế hoạch (`trips.edit`) có "Tạo kế hoạch
 * xếp", xuất báo cáo là nút phụ; quản lý chỉ xem nên "Xuất báo cáo" là hành động chính.
 */
export function DashboardPage() {
  const t = useT()
  const can = useCan()
  const period = useDashboardPeriod()
  const query = useDashboardQuery(period.selection)
  const exportReport = useExportReport()
  const canCreate = can('trips.edit')
  const canExport = can('reports.export')
  const summary = query.data

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-3 border-b border-border bg-bg px-8">
        <h1 className="text-h2 font-semibold tracking-[-0.01em]">{t('manager.title')}</h1>
        <div className="flex-1" />
        {canExport ? (
          <Button
            variant={canCreate ? 'secondary' : 'primary'}
            loading={exportReport.isPending}
            disabled={!summary || exportReport.isPending}
            onClick={() => {
              if (summary) exportReport.mutate(summary)
            }}
          >
            {exportReport.isPending ? null : <Download strokeWidth={1.5} aria-hidden />}
            {t('manager.export.button')}
          </Button>
        ) : null}
        {canCreate ? (
          <Button asChild>
            <Link to="/chuyen/moi">
              <Plus strokeWidth={1.5} aria-hidden />
              {t('manager.createPlan')}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-6 px-8">
        <PeriodFilter
          selection={period.selection}
          range={summary?.period}
          onPresetChange={(preset) => period.setPreset(preset, summary?.period)}
          onDateChange={period.setCustomDate}
        />
        {query.isPending ? (
          <p className="text-body text-text-2">{t('manager.loading')}</p>
        ) : query.isError ? (
          <EmptyState
            title={t('manager.errorTitle')}
            description={t('manager.errorDescription')}
            action={
              <Button variant="secondary" onClick={() => void query.refetch()}>
                {t('manager.retry')}
              </Button>
            }
          />
        ) : (
          <DashboardContent summary={query.data} />
        )}
      </div>
    </div>
  )
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const t = useT()
  return (
    <>
      <KpiRow summary={summary} />
      {summary.tripCount === 0 ? (
        <EmptyState title={t('manager.empty.title')} description={t('manager.empty.description')} />
      ) : (
        <>
          <Suspense fallback={<ChartsSkeleton />}>
            <DashboardCharts summary={summary} />
          </Suspense>
          <RecentTripsTable trips={summary.trips} />
        </>
      )}
    </>
  )
}

/** Giữ chỗ đúng khung ba biểu đồ trong lúc tải chunk `recharts`, để bảng bên dưới không nhảy. */
function ChartsSkeleton() {
  return (
    <div className="grid flex-none gap-4 xl:grid-cols-2">
      {['xl:col-span-2', '', ''].map((span, index) => (
        <Card key={index} className={cn('flex flex-col gap-4 px-5 py-4', span)}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-60 w-full" />
        </Card>
      ))}
    </div>
  )
}

import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useFormat, useT } from '@/lib/i18n'
import { KpiTile } from './KpiTile'
import { LatestJobCard } from './LatestJobCard'
import { RecentPlansTable } from './RecentPlansTable'
import { RECENT_PLAN_LIMIT, type DashboardSummary } from './dashboard-summary'
import { useDashboardQuery } from './useDashboardQuery'

/**
 * Bảng điều khiển của quản lý (LM-052). Mọi số đều tính từ mock repository qua `useDashboardQuery`;
 * màn không có bộ lọc hay nút xuất báo cáo vì hai thứ đó chưa hoạt động (D-20).
 * Hành động chính duy nhất: tạo kế hoạch xếp (mục 5).
 */
export function DashboardPage() {
  const t = useT()
  const query = useDashboardQuery()

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-3 border-b border-border bg-bg px-8">
        <h1 className="text-h2 font-semibold tracking-[-0.01em]">{t('manager.title')}</h1>
        <div className="flex-1" />
        <Button asChild>
          <Link to="/chuyen/moi">{t('manager.createPlan')}</Link>
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-6 px-8">
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
  const format = useFormat()

  return (
    <>
      <div className="grid flex-none grid-cols-1 gap-4 md:grid-cols-3">
        <KpiTile
          label={t('manager.kpi.vehicles')}
          value={format.integer(summary.vehicleCount)}
          unit={t('manager.kpi.vehiclesUnit')}
          note={t('manager.kpi.vehiclesNote')}
        />
        <KpiTile
          label={t('manager.kpi.packages')}
          value={format.integer(summary.packageCount)}
          unit={t('manager.kpi.packagesUnit')}
          note={t('manager.kpi.packagesNote', { count: summary.tripCount })}
        />
        <KpiTile
          label={t('manager.kpi.weight')}
          value={format.weight(summary.totalWeightKg)}
          note={t('manager.kpi.weightNote')}
        />
      </div>

      {summary.latestPlan ? (
        <LatestJobCard plan={summary.latestPlan} />
      ) : (
        <EmptyState
          title={t('manager.latest.emptyTitle')}
          description={t('manager.latest.emptyDescription')}
        />
      )}

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex h-11 flex-none items-center gap-2 border-b border-border px-4">
          <span className="text-body font-medium">{t('manager.recent.title')}</span>
          <span className="text-caption text-text-3">
            {t('manager.recent.subtitle', { count: RECENT_PLAN_LIMIT })}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <RecentPlansTable plans={summary.recentPlans} />
        </div>
      </Card>
    </>
  )
}

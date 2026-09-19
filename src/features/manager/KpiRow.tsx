import { Badge } from '@/components/ui/Badge'
import { useFormat, useT } from '@/lib/i18n'
import type { DashboardSummary } from './dashboard-summary'
import { KpiTile } from './KpiTile'

/**
 * Năm KPI của kỳ (LM-090), mỗi ô một dòng nói nguồn trong kho. Kỳ chưa có số để tính tỷ lệ thì ô hiện "—" kèm lý do,
 * không hiện 0% như thể đã đo được.
 */
export function KpiRow({ summary }: { summary: DashboardSummary }) {
  const t = useT()
  const format = useFormat()
  const { fill, delivery, vehicles } = summary

  return (
    <div className="grid flex-none grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <KpiTile
        label={t('manager.kpi.trips')}
        value={format.integer(summary.completedCount)}
        unit={t('manager.kpi.tripsUnit', { total: format.integer(summary.tripCount) })}
        note={t('manager.kpi.tripsNote')}
      />
      <KpiTile
        label={t('manager.kpi.fill')}
        value={fill.averagePercent === null ? t('manager.noValue') : format.percent(fill.averagePercent)}
        note={fill.averagePercent === null ? t('manager.kpi.fillEmpty') : t('manager.kpi.fillNote', { count: fill.planCount })}
        badge={fill.isMockResult ? <Badge tone="warning">MOCK RESULT</Badge> : null}
      />
      <KpiTile
        label={t('manager.kpi.delivered')}
        value={format.integer(Math.round(summary.deliveredWeightKg))}
        unit={t('manager.kpi.deliveredUnit')}
        note={t('manager.kpi.deliveredNote')}
      />
      <KpiTile
        label={t('manager.kpi.clean')}
        value={delivery.cleanPercent === null ? t('manager.noValue') : format.percent(delivery.cleanPercent)}
        note={
          delivery.cleanPercent === null
            ? t('manager.kpi.cleanEmpty')
            : t('manager.kpi.cleanNote', { clean: format.integer(delivery.cleanItems), total: format.integer(delivery.finishedItems) })
        }
      />
      <KpiTile
        label={t('manager.kpi.vehicles')}
        value={format.integer(vehicles.inUse)}
        unit={t('manager.kpi.vehiclesUnit', { total: format.integer(vehicles.total) })}
        note={t('manager.kpi.vehiclesNote')}
      />
    </div>
  )
}

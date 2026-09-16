import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useFormat, useT } from '@/lib/i18n'
import type { DashboardPlan } from './dashboard-summary'
import { plannerPath } from '@/lib/planner-path'

/**
 * Thẻ job tối ưu gần nhất: chuyến, phương pháp, trạng thái, tỷ lệ lấp đầy và thời gian chạy lấy thẳng từ
 * `OptimizationResult` của revision. Kết quả mock mang nhãn MOCK RESULT, không dịch (Spec mục 9).
 */
export function LatestJobCard({ plan }: { plan: DashboardPlan }) {
  const t = useT()
  const format = useFormat()
  const createdAt = t('manager.dateTime', {
    time: format.time(plan.createdAt),
    date: format.date(plan.createdAt),
  })

  return (
    <Card className="flex flex-col gap-4 px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body font-medium">{t('manager.latest.title')}</span>
        {plan.isMockResult ? <Badge tone="warning">MOCK RESULT</Badge> : null}
        {plan.approved ? <Badge tone="success">{t('manager.status.approved')}</Badge> : null}
        <span className="ml-auto font-mono text-caption text-text-3">{plan.jobId}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-caption text-text-3">{plan.tripId}</span>
        <span className="text-h3 font-semibold">{plan.tripName}</span>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3 xl:grid-cols-6">
        <Field label={t('manager.latest.method')} value={plan.method} mono />
        <Field
          label={t('manager.latest.status')}
          value={t(plan.status === 'COMPLETED' ? 'manager.status.COMPLETED' : 'manager.status.FAILED')}
        />
        <Field
          label={t('manager.latest.volume')}
          value={format.percent(plan.volumeUtilizationPercent)}
          mono
        />
        <Field
          label={t('manager.latest.payload')}
          value={format.percent(plan.payloadUtilizationPercent)}
          mono
        />
        <Field
          label={t('manager.latest.runtimeLabel')}
          value={t('manager.runtime', { value: format.integer(plan.runtimeMs) })}
          mono
        />
        <Field label={t('manager.latest.createdAt')} value={createdAt} mono />
      </dl>

      <Button variant="secondary" asChild className="self-start">
        <Link to={plannerPath(plan)}>{t('manager.latest.open')}</Link>
      </Button>
    </Card>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-caption text-text-3">{label}</dt>
      <dd className={mono ? 'font-mono text-body font-medium' : 'text-body font-medium'}>{value}</dd>
    </div>
  )
}

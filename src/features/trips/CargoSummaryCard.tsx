import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useFormat, useT } from '@/lib/i18n'
import type { CargoSummary } from './trip-summary'

/** Tóm tắt hàng hoá: 3 số lớn + 2 thanh sử dụng thùng, tính từ kiện của chuyến và xe đang gán (LM-044). */
export function CargoSummaryCard({ summary }: { summary: CargoSummary }) {
  const t = useT()
  const format = useFormat()
  return (
    <Card className="flex flex-col gap-4 p-5">
      <span className="text-caption font-medium text-text-3">{t('trips.cargoSummary')}</span>

      {/* Ba cột khi đủ chỗ, không thì hai: số và đơn vị không bị bẻ dòng ở cột thông tin hẹp (LM-095) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(108px,1fr))] gap-3">
        <Metric label={t('trips.instances')} value={format.integer(summary.instances)} />
        <Metric label={t('trips.volume')} value={format.volumeM3(summary.volumeCm3)} />
        <Metric label={t('trips.weight')} value={format.weight(summary.weightKg)} />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <ProgressBar label={t('trips.volumeUsage')} value={summary.volumePercent} />
        <ProgressBar
          label={t('trips.payloadUsage')}
          value={summary.payloadPercent}
          tone={summary.overPayload ? 'danger' : 'primary'}
        />
        {summary.overPayload ? (
          <p className="text-caption text-badge-danger-fg">{t('trips.overPayload')}</p>
        ) : null}
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-text-3">{label}</span>
      <span className="font-mono text-[22px] leading-7 font-semibold tracking-[-0.01em] whitespace-nowrap">{value}</span>
    </div>
  )
}

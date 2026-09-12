import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDecimal, formatInteger } from '@/lib/format'
import { CARGO_SUMMARY } from './trip-detail.mock'

/** Tóm tắt hàng hoá: 3 số lớn + 2 thanh sử dụng thùng. */
export function CargoSummaryCard() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <span className="text-caption font-medium text-text-3">
        Tóm tắt hàng hoá
      </span>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Kiện" value={formatInteger(CARGO_SUMMARY.packageCount)} />
        <Metric
          label="Thể tích"
          value={formatDecimal(CARGO_SUMMARY.volumeM3)}
          unit="m³"
        />
        <Metric
          label="Khối lượng"
          value={formatInteger(CARGO_SUMMARY.weightKg)}
          unit="kg"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <ProgressBar
          label="Thể tích sử dụng"
          value={CARGO_SUMMARY.volumeUsage}
        />
        <ProgressBar
          label="Tải trọng sử dụng"
          value={CARGO_SUMMARY.payloadUsage}
        />
      </div>
    </Card>
  )
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-text-3">{label}</span>
      <span className="font-mono text-h2 font-semibold tracking-[-0.01em]">
        {value}
        {unit ? (
          <span className="ml-1 font-sans text-caption font-normal text-text-3">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  )
}

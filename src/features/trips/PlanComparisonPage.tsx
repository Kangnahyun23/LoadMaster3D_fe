import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { OptimizationDialog } from '@/features/optimization/OptimizationDialog'
import { useOptimizationJob } from '@/features/optimization/useOptimizationJob'
import { formatInteger } from '@/lib/format'
import { CARD_HEIGHTS, METRIC_LABELS, PlanCard } from './PlanCard'
import {
  bestValues,
  DEFAULT_PLAN_KEY,
  ORDER_COUNT,
  PLANS,
  type PlanKey,
} from '@/lib/plan-comparison.mock'
import { TRIP, VEHICLE } from './trip-detail.mock'

/**
 * So sánh ba phương án cạnh nhau. Hành động chính duy nhất:
 * "Xem phương án … trong 3D". Chọn phương án bằng nút trong từng cột.
 */
export function PlanComparisonPage() {
  const params = useParams()
  const tripId = params.tripId ?? TRIP.id
  const [selectedKey, setSelectedKey] = useState<PlanKey>(DEFAULT_PLAN_KEY)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { progress, start } = useOptimizationJob()

  const best = useMemo(() => bestValues(PLANS), [])
  const selected = PLANS.find((p) => p.key === selectedKey) ?? PLANS[0]
  const totalCount = PLANS[0]?.totalCount ?? 0

  function handleRunAnother() {
    start()
    setDialogOpen(true)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-8">
        <Link
          to={`/chuyen/${tripId}`}
          aria-label="Quay lại chi tiết chuyến"
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-h2 font-semibold tracking-[-0.01em]">So sánh phương án</h1>
          <span className="text-caption text-text-3">
            <span className="font-mono">{tripId}</span> · {VEHICLE.name} · {formatInteger(totalCount)} kiện ·{' '}
            {formatInteger(PLANS.length)} phương án
          </span>
        </div>
        <div className="flex-1" />
        <span className="inline-flex items-center gap-2 text-caption text-text-3">
          <span aria-hidden className="size-3 rounded-[3px] border border-badge-info-border bg-primary-bg" />
          Giá trị tốt nhất mỗi hàng
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[168px_repeat(3,minmax(0,1fr))] items-start gap-4 overflow-auto px-8 py-6">
        <div className="flex flex-col pt-px" aria-hidden>
          <div style={{ height: CARD_HEIGHTS.thumbnail }} />
          <div style={{ height: CARD_HEIGHTS.title }} />
          {METRIC_LABELS.map((label) => (
            <div
              key={label}
              className="flex items-center border-t border-border pr-3 text-body text-text-2"
              style={{ height: CARD_HEIGHTS.metric }}
            >
              {label}
            </div>
          ))}
        </div>

        {PLANS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            best={best}
            selected={plan.key === selectedKey}
            onSelect={setSelectedKey}
          />
        ))}
      </div>

      <div className="flex h-16 flex-none items-center justify-between border-t border-border bg-bg px-8">
        <span className="text-caption text-text-3">
          Phương án đang chọn:{' '}
          <span className="font-medium text-text">
            {selected?.name} — {selected?.algorithm}
          </span>{' '}
          · Tất cả phương án dùng cùng {formatInteger(ORDER_COUNT)} đơn hàng và cấu hình xe.
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRunAnother}>
            Chạy thêm phương án
          </Button>
          <Button variant="primary" asChild>
            <Link to={`/chuyen/${tripId}/phuong-an?plan=${selectedKey}`}>
              Xem phương án {selectedKey} trong 3D
              <ArrowRight strokeWidth={1.5} />
            </Link>
          </Button>
        </div>
      </div>

      <OptimizationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        progress={progress}
        onViewPlan={() => setDialogOpen(false)}
      />
    </div>
  )
}

import { Check, ChevronLeft, Columns2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { OptimizationResult } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'

/**
 * Thanh trên của Planner (LM-049). Cao 56px — bản mỏng dành riêng cho màn 3D (AGENTS mục 5). Số lấy thẳng từ
 * `result.metrics` của revision; không có revision (fixture benchmark) thì chỉ hiện số kiện của scene.
 */
export function ViewerHeader({ tripId, metrics, placedCount, totalCount, isMockResult, approved, manuallyEdited, blockedReason, onApprove }: {
  tripId: string
  metrics: OptimizationResult['metrics'] | null
  placedCount: number
  totalCount: number
  /** Spec: mọi kết quả từ mock mang nhãn MOCK RESULT, không dịch. */
  isMockResult: boolean
  approved: boolean
  /** Có draft chỉnh tay trong phiên, hoặc revision đã mang chỉnh tay. */
  manuallyEdited: boolean
  /** Lý do chặn Duyệt (LM-050) — hiện cạnh nút; `null` là duyệt được. */
  blockedReason: string | null
  onApprove: () => void
}) {
  const t = useT()
  const format = useFormat()
  return (
    <header className="flex h-14 flex-none items-center gap-2 border-b border-border bg-bg px-2 xl:gap-4 xl:px-5">
      <Link
        to={`/chuyen/${tripId}`}
        aria-label="Quay lại chuyến"
        className="grid size-14 shrink-0 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:size-11"
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
      </Link>

      <h1 className="hidden font-mono text-[18px] leading-6 font-semibold tracking-[-0.02em] xl:block">{tripId}</h1>
      {isMockResult ? <Badge tone="warning">MOCK RESULT</Badge> : null}
      {approved ? <Badge tone="success">{t('viewer.plan.approved')}</Badge> : null}
      {manuallyEdited ? <Badge tone="info">{t('viewer.plan.manuallyEdited')}</Badge> : null}

      <span aria-hidden className="hidden h-6 w-px bg-border xl:block" />

      <dl className="hidden items-center gap-5 xl:flex">
        {metrics ? <>
          <Stat label={t('viewer.plan.volume')}><span className="font-semibold text-primary">{format.percent(metrics.volumeUtilizationPercent)}</span></Stat>
          <Stat label={t('viewer.plan.payload')}>{format.percent(metrics.payloadUtilizationPercent)}</Stat>
        </> : null}
        <Stat label={t('viewer.plan.placed')}>
          {format.integer(placedCount)} <span className="font-normal text-text-3">/ {format.integer(totalCount)}</span>
        </Stat>
        {metrics ? <Stat label={t('viewer.plan.runtime')}>{t('viewer.plan.metrics.runtimeValue', { ms: format.integer(metrics.runtimeMs) })}</Stat> : null}
      </dl>

      <div className="flex-1" />

      {blockedReason ? <span role="status" className="hidden max-w-72 text-caption text-badge-danger-fg xl:block">{blockedReason}</span> : null}
      <div className="flex gap-2">
        <Button variant="secondary" className="hidden h-10 px-3.5 xl:flex" asChild>
          <Link to={`/chuyen/${tripId}/so-sanh`}>
            <Columns2 strokeWidth={1.5} />
            {t('viewer.plan.compare')}
          </Link>
        </Button>
        <Button variant="primary" className="h-14 px-4 text-body-lg xl:h-10 xl:text-body" onClick={onApprove}>
          <Check strokeWidth={1.5} />
          {t('viewer.plan.approve')}
        </Button>
      </div>
    </header>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] leading-3.5 text-text-3">{label}</dt>
      <dd className="font-mono text-body leading-4.5 font-medium">{children}</dd>
    </div>
  )
}

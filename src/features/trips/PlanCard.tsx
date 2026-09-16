import { Check, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { PlanThumbnail } from './PlanThumbnail'
import type { ComparedMetric, RevisionCardModel, bestValues } from './revision-comparison'

type Best = ReturnType<typeof bestValues>

/**
 * Một cột revision. Thẻ đang chọn nổi bằng viền primary + vòng 1px, không bóng (mục 5); nút chọn luôn là nút phụ vì
 * màn chỉ có một nút primary ở chân trang (LM-051). Giá trị tốt nhất của hàng nền primary-bg + dấu tích.
 */
export function PlanCard({
  card,
  best,
  selected,
  onSelect,
}: {
  card: RevisionCardModel
  best: Best
  selected: boolean
  onSelect: (id: string) => void
}) {
  const t = useT()
  const format = useFormat()
  const isBest = (metric: ComparedMetric) => best[metric] === card[metric]
  const { revision } = card
  const note = card.sourceRevisionId
    ? t('trips.compare.approvedFrom', { id: card.sourceRevisionId })
    : card.approvedAs.length > 0
      ? t('trips.compare.approvedAs', { ids: card.approvedAs.join(', ') })
      : t('trips.compare.createdAt', { time: format.time(card.createdAt), date: format.date(card.createdAt) })

  return (
    <article
      aria-label={card.id}
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-md border bg-bg',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border',
      )}
    >
      <PlanThumbnail
        revisionId={card.id}
        request={revision.request}
        placements={revision.result.placements}
        totalCount={card.placedCount + card.unplacedCount}
      />

      <div className="flex h-27 flex-col gap-1.5 px-5 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-h3 font-semibold">{card.id}</span>
          <span className="truncate font-mono text-caption text-text-3">{t('trips.compare.jobId', { jobId: card.jobId })}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {card.isMockResult ? <Badge tone="warning">MOCK RESULT</Badge> : null}
          {card.latest ? <Badge tone="info">{t('trips.compare.status.latest')}</Badge> : null}
          {card.approved ? <Badge tone="success">{t('trips.compare.status.approved')}</Badge> : null}
          {card.stale ? <Badge tone="danger">{t('trips.compare.status.stale')}</Badge> : null}
        </div>
        <span className="truncate text-caption text-text-3">{note}</span>
      </div>

      <Heading>{t('trips.compare.settings')}</Heading>
      <Row label={t('trips.compare.method')} mono={false}>{t(`optimization.methods.${card.method}`)}</Row>
      <Row label={t('trips.compare.randomSeed')}>
        {card.randomSeed === undefined ? t('trips.compare.noSeed') : String(card.randomSeed)}
      </Row>
      <Row label={t('trips.compare.enforceLifo')} mono={false}>
        {t(card.enforceLifo ? 'trips.compare.on' : 'trips.compare.off')}
      </Row>
      <Row label={t('trips.compare.lowCenterOfGravity')} mono={false}>
        {t(card.prioritizeLowCenterOfGravity ? 'trips.compare.on' : 'trips.compare.off')}
      </Row>
      <Row label={t('trips.compare.timeLimit')}>
        {t('trips.compare.seconds', { value: format.integer(card.timeLimitSeconds) })}
      </Row>

      <Heading>{t('trips.compare.results')}</Heading>
      <Row label={t('trips.compare.volume')} best={isBest('volumeUtilizationPercent')}>
        {format.percent(card.volumeUtilizationPercent)}
      </Row>
      <Row label={t('trips.compare.payload')}>{format.percent(card.payloadUtilizationPercent)}</Row>
      <Row label={t('trips.compare.placed')} best={isBest('placedCount')}>
        {t('trips.compare.packages', { value: format.integer(card.placedCount) })}
      </Row>
      <Row label={t('trips.compare.unplaced')} best={isBest('unplacedCount')}>
        <span className={cn(card.unplacedCount > 0 && 'text-badge-warning-fg')}>
          {t('trips.compare.packages', { value: format.integer(card.unplacedCount) })}
        </span>
      </Row>
      <Row label={t('trips.compare.runtime')} best={isBest('runtimeMs')}>
        {t('trips.compare.milliseconds', { value: format.integer(card.runtimeMs) })}
      </Row>

      <div className="mt-auto border-t border-border px-5 py-4">
        <Button variant="secondary" block aria-pressed={selected} onClick={() => onSelect(card.id)}>
          {selected ? <Check strokeWidth={2} /> : null}
          {selected ? t('trips.compare.selected') : t('trips.compare.select')}
        </Button>
      </div>
    </article>
  )
}

function Heading({ children }: { children: ReactNode }) {
  return <div className="border-t border-border bg-surface px-5 py-1.5 text-caption font-medium text-text-2">{children}</div>
}

function Row({
  label,
  best = false,
  mono = true,
  children,
}: {
  label: string
  best?: boolean
  mono?: boolean
  children: ReactNode
}) {
  const t = useT()
  return (
    <div className={cn('flex h-11 items-center justify-between gap-3 border-t border-border px-5', best && 'bg-primary-bg')}>
      <span className="text-caption text-text-3">{label}</span>
      <span className={cn('inline-flex min-w-0 items-center gap-2 text-body font-medium', mono && 'font-mono')}>
        {best ? <CircleCheck className="size-3.5 flex-none text-primary" strokeWidth={1.5} aria-label={t('trips.compare.best')} /> : null}
        <span className="truncate">{children}</span>
      </span>
    </div>
  )
}

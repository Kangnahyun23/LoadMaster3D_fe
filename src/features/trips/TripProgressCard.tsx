import { CircleCheck, CircleX } from 'lucide-react'
import { useMemo } from 'react'
import { StopLabel } from '@/components/StopLabel'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { Trip } from '@/lib/mock-db'
import { useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { missingPackages, tripProgress, type ProgressStep } from './trip-progress'
import { useTripActivityQuery } from './useTripsQuery'

/**
 * Thẻ Tiến trình ở Chi tiết chuyến (LM-088, D-47): các mốc của vòng đời chuyến kèm giờ và người làm, số kiện đã xếp / tổng, số điểm
 * đã giao / tổng; dưới đó là kiện kho báo thiếu và sự cố giao hàng (loại, kiện, ghi chú). Mọi số lấy từ kho.
 */
export function TripProgressCard({ trip }: { trip: Trip }) {
  const t = useT()
  const format = useFormat()
  const activity = useTripActivityQuery(trip.id)
  const data = activity.data
  const steps = useMemo(() => (data ? tripProgress(trip, data.revisions, data.events) : []), [trip, data])
  const names = useMemo(() => new Map(data?.users.map((user) => [user.id, user.fullName])), [data])
  const missing = useMemo(() => missingPackages(trip), [trip])
  const issues = trip.delivery?.issues ?? []
  const nameOf = (id: string | null | undefined) => (id ? names.get(id) ?? id : null)

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-caption font-medium text-text-3">{t('trips.progress.title')}</h2>
      {activity.isPending ? (
        <div role="status" aria-label={t('trips.detail.loading')} className="grid h-24 place-items-center"><Spinner /></div>
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {steps.map((step, index) => (
            <ProgressItem key={step.kind} step={step} last={index === steps.length - 1} actor={nameOf(step.actorId)} />
          ))}
        </ol>
      )}

      {missing.length > 0 ? (
        <section className="flex flex-col gap-2 border-t border-border pt-3">
          <h3 className="text-caption font-medium text-badge-warning-fg">{t('trips.progress.missingTitle', { count: missing.length })}</h3>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {missing.map((item) => (
              <li key={item.packageInstanceId} className="flex flex-col text-caption">
                <span className="font-mono font-medium text-text">{item.packageInstanceId}</span>
                <span className="text-text-2">{item.name} · <StopLabel number={item.deliveryStop} /> · <span className="font-mono">{format.time(item.at)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {issues.length > 0 ? (
        <section className="flex flex-col gap-2 border-t border-border pt-3">
          <h3 className="text-caption font-medium text-badge-danger-fg">{t('trips.progress.issuesTitle', { count: issues.length })}</h3>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {issues.map((issue) => (
              <li key={issue.id} className="flex flex-col gap-0.5 text-caption">
                <span className="font-medium text-text">
                  {t(`common.deliveryIssueKinds.${issue.kind}`)} · <StopLabel number={issue.stopNumber} />
                </span>
                <span className="font-mono text-text-2">{issue.packageInstanceId ?? t('trips.progress.wholeStop')}</span>
                {issue.note ? <span className="text-text-2">{issue.note}</span> : null}
                <span className="text-text-3">
                  <span className="font-mono">{t('trips.progress.at', { time: format.time(issue.at), date: format.date(issue.at) })}</span>
                  {nameOf(issue.reportedBy) ? ` · ${nameOf(issue.reportedBy)}` : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Card>
  )
}

function ProgressItem({ step, last, actor }: { step: ProgressStep; last: boolean; actor: string | null }) {
  const t = useT()
  const format = useFormat()
  const { loading, delivery } = step
  const counts = loading
    ? [
        t('trips.progress.loadingCount', { loaded: format.integer(loading.loaded), total: format.integer(loading.total) }),
        ...(loading.missing > 0 ? [t('trips.progress.missingCount', { count: loading.missing })] : []),
      ].join(' · ')
    : delivery
      ? t('trips.progress.deliveryCount', { done: format.integer(delivery.done), total: format.integer(delivery.total) })
      : null

  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {last ? null : <span aria-hidden className="absolute top-6 bottom-1 left-2.5 w-px bg-border" />}
      <StepMarker step={step} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={cn('text-body', step.state === 'pending' ? 'text-text-3' : 'font-medium text-text')}>
          {t(`trips.progress.steps.${step.kind}`)}
          <span className="sr-only">, {t(`trips.progress.state.${step.state}`)}</span>
        </span>
        {counts ? <span className="text-caption text-text-2">{counts}</span> : null}
        {step.at ? (
          <span className="text-caption text-text-3">
            <span className="font-mono">{t('trips.progress.at', { time: format.time(step.at), date: format.date(step.at) })}</span>
            {actor ? ` · ${actor}` : null}
          </span>
        ) : null}
        {step.reason ? <span className="text-caption text-text-2">{t('trips.progress.reason', { reason: step.reason })}</span> : null}
      </div>
    </li>
  )
}

/** Mốc 20px: xong là dấu tích, đang diễn ra là chấm có vòng, chưa tới là vòng rỗng, huỷ là dấu X. */
function StepMarker({ step }: { step: ProgressStep }) {
  if (step.kind === 'cancelled') return <CircleX aria-hidden className="size-5 flex-none text-danger" strokeWidth={1.5} />
  if (step.state === 'done') return <CircleCheck aria-hidden className="size-5 flex-none text-success" strokeWidth={1.5} />
  if (step.state === 'current') {
    return (
      <span aria-hidden className="grid size-5 flex-none place-items-center rounded-full border-2 border-primary bg-bg">
        <span className="size-2 rounded-full bg-primary" />
      </span>
    )
  }
  return <span aria-hidden className="size-5 flex-none rounded-full border-2 border-border bg-bg" />
}

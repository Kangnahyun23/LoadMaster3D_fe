import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useT } from '@/lib/i18n'
import { plannerPath } from '@/lib/planner-path'
import { PlanCard } from './PlanCard'
import { bestValues, defaultRevisionId, revisionCards, type RevisionCardModel } from './revision-comparison'
import { useTripRevisionsQuery } from './useTripsQuery'

/**
 * So sánh các revision đã lưu của chuyến (LM-051, D-37): mỗi thẻ đọc thiết lập và metrics thật của một revision.
 * Hành động chính duy nhất: mở revision đang chọn trong Planner (`?revision=<mã revision>`). Chưa đủ hai revision thì hiện
 * trạng thái rỗng dẫn tới Thiết lập tối ưu.
 */
export function PlanComparisonPage() {
  const { tripId = '' } = useParams()
  const t = useT()
  const query = useTripRevisionsQuery(tripId)
  const cards = useMemo(() => (query.data ? revisionCards(query.data.trip, query.data.revisions) : []), [query.data])

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-8">
        <Link
          to={`/chuyen/${tripId}`}
          aria-label={t('trips.compare.back')}
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="text-h1 font-semibold">{t('trips.compare.title')}</h1>
          <span className="truncate text-caption text-text-3">
            <span className="font-mono">{tripId}</span>
            {query.data ? ` · ${query.data.trip.name} · ${t('trips.compare.subtitle', { count: cards.length })}` : null}
          </span>
        </div>
      </header>

      {query.isPending ? (
        <div role="status" aria-label={t('trips.compare.loading')} className="grid flex-1 place-items-center">
          <Spinner />
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-start gap-4 px-8 py-6">
          <span className="text-body-lg font-semibold">{t('trips.compare.errorTitle')}</span>
          <Button variant="secondary" asChild>
            <Link to="/chuyen">{t('trips.compare.backToTrips')}</Link>
          </Button>
        </div>
      ) : cards.length < 2 ? (
        <NotEnoughRevisions tripId={tripId} cards={cards} />
      ) : (
        <Comparison tripId={tripId} cards={cards} />
      )}
    </div>
  )
}

function NotEnoughRevisions({ tripId, cards }: { tripId: string; cards: readonly RevisionCardModel[] }) {
  const t = useT()
  const only = cards[0]
  return (
    <div className="px-8 py-6">
      <EmptyState
        title={t('trips.compare.emptyTitle')}
        description={t('trips.compare.emptyDescription', { count: cards.length })}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {only ? (
              <Button variant="secondary" asChild>
                <Link to={plannerPath({ tripId, jobId: only.jobId, revisionId: only.id })}>{t('trips.compare.openOnly')}</Link>
              </Button>
            ) : null}
            <Button variant="primary" asChild>
              <Link to={`/chuyen/${tripId}/toi-uu`}>{t('trips.compare.emptyAction')}</Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}

function Comparison({ tripId, cards }: { tripId: string; cards: readonly RevisionCardModel[] }) {
  const t = useT()
  const [chosenId, setChosenId] = useState<string>()
  const best = useMemo(() => bestValues(cards), [cards])
  const selected = cards.find((card) => card.id === chosenId) ?? cards.find((card) => card.id === defaultRevisionId(cards))

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-8 py-6">
        {Object.keys(best).length > 0 ? (
          <span className="inline-flex items-center gap-2 self-end text-caption text-text-3">
            <span aria-hidden className="size-3 rounded-[3px] border border-badge-info-border bg-primary-bg" />
            {t('trips.compare.bestHint')}
          </span>
        ) : null}
        <div className="grid auto-cols-[minmax(300px,1fr)] grid-flow-col items-stretch gap-4">
          {cards.map((card) => (
            <PlanCard key={card.id} card={card} best={best} selected={card.id === selected?.id} onSelect={setChosenId} />
          ))}
        </div>
      </div>

      <div className="flex h-16 flex-none items-center justify-between gap-4 border-t border-border bg-bg px-8">
        <span className="truncate text-caption text-text-3">
          {selected ? t('trips.compare.selectedLabel', { id: selected.id }) : null}
        </span>
        <div className="flex flex-none gap-2">
          <Button variant="secondary" asChild>
            <Link to={`/chuyen/${tripId}/toi-uu`}>{t('trips.compare.runMore')}</Link>
          </Button>
          {selected ? (
            <Button variant="primary" asChild>
              <Link to={plannerPath({ tripId, jobId: selected.jobId, revisionId: selected.id })}>
                {t('trips.compare.open', { id: selected.id })}
                <ArrowRight strokeWidth={1.5} />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </>
  )
}

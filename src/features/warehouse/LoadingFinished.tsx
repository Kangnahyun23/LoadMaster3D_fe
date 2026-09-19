import { CircleCheck } from 'lucide-react'
import { Link } from 'react-router'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { ExitIconButton } from '@/features/auth/ExitControl'
import { useFormat, useT } from '@/lib/i18n'
import type { Revision, Trip } from '@/lib/mock-db'
import { loadingProgress } from './loading-session'
import { useSessionModel } from './useSessionModel'
import { loadingSessionPath } from './warehouse-trips'

/**
 * Màn "Xếp xong" (LM-086): số kiện đã xếp trên tổng, danh sách kiện kho báo thiếu, nút về danh sách chuyến. Mọi số đọc từ tiến độ
 * trong kho (D-47). Mở lại chuyến đã xếp xong (kể cả khi xe đã đi giao) cũng ra màn này.
 */
export function LoadingFinished({ trip, plan }: { trip: Trip; plan: Revision }) {
  const t = useT()
  const format = useFormat()
  const model = useSessionModel(trip, plan)
  const progress = loadingProgress(model.placements, trip.loading)

  return (
    <div className="flex h-dvh flex-col bg-bg text-body-lg">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border pr-6 pl-3">
        <ExitIconButton screenHome={loadingSessionPath(trip.id)} contextual={`/chuyen/${trip.id}`} label={t('warehouse.header.exit')} iconClassName="size-7" />
        <span className="min-w-0 flex-1 truncate font-mono text-[18px] leading-6 font-semibold">{trip.id}</span>
        <LanguageSwitch size="touch" className="flex-none" />
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex max-w-200 flex-col items-start gap-4">
          <h1 className="flex items-center gap-3 text-h1 font-semibold">
            <CircleCheck className="size-6 flex-none text-success" strokeWidth={1.5} aria-hidden />
            {t('warehouse.finished.title', { tripId: trip.id })}
          </h1>
          <p className="m-0 text-h2 font-medium">
            {t('warehouse.finished.loaded', { loaded: format.integer(progress.loaded), total: format.integer(progress.total) })}
          </p>
          {trip.phase === 'loaded' ? <p className="m-0 text-text-2">{t('warehouse.finished.description')}</p> : null}
          {progress.missing.length > 0 ? (
            <section aria-labelledby="kien-thieu" className="flex w-full flex-col gap-2">
              <h2 id="kien-thieu" className="text-h2 font-semibold">{t('warehouse.finished.missingTitle', { count: progress.missing.length })}</h2>
              <ul className="m-0 flex list-none flex-col overflow-hidden rounded-md border border-border p-0">
                {progress.missing.map((placement) => (
                  <li key={placement.id} className="flex flex-wrap items-baseline gap-x-3 border-b border-border px-4 py-3 last:border-b-0">
                    <span className="font-mono font-semibold">{placement.id}</span>
                    <span className="text-text-2">{placement.name} · {t('common.stop', { number: placement.stop })}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="m-0 text-text-2">{t('warehouse.finished.noMissing')}</p>
          )}
          <Button asChild variant="primary" size="touch">
            <Link to="/kho">{t('warehouse.backToList')}</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

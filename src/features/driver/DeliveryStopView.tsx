import { ArrowRight, ChevronLeft, Navigation } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Spinner'
import type { ViewerSceneModel } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { DeliveryItemRow } from './DeliveryItemRow'
import type { StopDelivery } from './driver-plan'
import { useDeliveryStop } from './useDeliveryStop'

const DriverCargoViewer = lazy(() => import('@/features/viewer3d/DriverCargoViewer').then((m) => ({ default: m.DriverCargoViewer })))

/**
 * Màn tài xế tại điểm giao — điện thoại, một tay, ngoài trời. Vùng chạm 56px, chữ 16px, hành động chính duy nhất: "Hoàn tất điểm giao".
 * Kiện và thứ tự dỡ lấy từ revision đã duyệt (LM-061); điểm giao hiện tại chỉ giữ trong phiên.
 *
 * Lệch có chủ ý khỏi design: nút chỉ đường trong design màu primary — mỗi màn chỉ một nút primary (mục 5) nên đổi sang secondary;
 * nhãn nút chính viết hoa trong design — mục 5 cấm; bỏ thanh tab đáy vì các tab khác chưa có màn (LM-053, D-20); bỏ nút gọi và
 * huy hiệu "chờ đồng bộ" vì chuyến không có số điện thoại và màn không đồng bộ gì (D-20).
 */
export function DeliveryStopView({ model, stops }: { model: ViewerSceneModel; stops: readonly StopDelivery[] }) {
  const t = useT()
  const state = useDeliveryStop(stops)
  const [cargoOpen, setCargoOpen] = useState(false)
  const stop = state.stop
  if (!stop) return null

  return (
    <Dialog open={cargoOpen} onOpenChange={setCargoOpen}>
    <div className="flex h-dvh flex-col bg-bg text-body-lg">
      <header className="flex flex-none flex-col gap-2.5 border-b border-border bg-bg px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <div className="flex items-center gap-1.5">
          <Link
            to="/chuyen"
            aria-label={t('driver.exit')}
            className="-ml-2 grid size-14 flex-none place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
          </Link>
          <span
            className="grid size-8 flex-none place-items-center rounded-full font-mono text-body-lg font-semibold leading-none"
            style={{ background: stopColor(stop.number), color: stopForeground(stop.number) }}
            aria-hidden
          >
            {stop.number}
          </span>
          <h1 className="min-w-0 flex-1 text-h2 font-semibold">{t('driver.stopTitle', { number: stop.number, total: stops.length })}</h1>
          <LanguageSwitch size="touch" className="flex-none [&>svg]:hidden min-[400px]:[&>svg]:block" />
        </div>
        <div className="flex gap-1" aria-hidden>
          {stops.map(({ number }) => (
            <span
              key={number}
              className={cn('h-1 flex-1 rounded-xs', number < stop.number && 'bg-success', number > stop.number && 'bg-border')}
              style={number === stop.number ? { background: stopColor(number) } : undefined}
            />
          ))}
        </div>
      </header>

      {model.revision?.stale ? (
        <div role="alert" className="flex-none border-b border-badge-warning-border bg-badge-warning-bg px-4 py-2 text-badge-warning-fg">
          {t('driver.stale')}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pt-3 pb-4">
        <div className="flex flex-none items-center gap-3 rounded-md border border-border bg-bg p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-h2 font-semibold">{stop.name}</span>
            <span className="text-body-lg leading-5.5 text-pretty text-text-2">{stop.address}</span>
          </div>
          <Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={t('driver.directions', { name: stop.name })} asChild>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`} target="_blank" rel="noreferrer">
              <Navigation strokeWidth={2} />
            </a>
          </Button>
        </div>

        <div className="flex flex-none flex-col gap-1.5 px-0.5 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{t('driver.summary', { total: state.total, done: state.doneCount })}</span>
            <span className="font-mono font-medium text-text-3">{state.percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={state.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('driver.progress')}
            className="h-2 overflow-hidden rounded-full border border-border bg-surface"
          >
            <div className="h-full bg-success transition-[width] duration-(--dur-md) ease-decelerate" style={{ width: `${state.percent}%` }} />
          </div>
        </div>

        <DialogTrigger asChild><Button variant="secondary" size="touch" block>{t('driver.viewCargo')}</Button></DialogTrigger>
        {stop.items.length > 0 ? (
          <ul aria-label={stop.name} className="m-0 flex flex-none list-none flex-col overflow-hidden rounded-md border border-border bg-bg p-0">
            {stop.items.map((item) => (
              <DeliveryItemRow key={item.id} item={item} done={state.done.has(item.id)} onToggle={state.toggle} />
            ))}
          </ul>
        ) : (
          <p className="flex-none rounded-md border border-border bg-surface p-4 text-text-2">{t('driver.noItems')}</p>
        )}

        <span className="flex-none py-1 text-center text-text-3">{t('driver.remaining', { count: state.remaining })}</span>
      </div>

      <div className="flex-none border-t border-border bg-bg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button variant="primary" block className="h-15 gap-2.5 text-[18px] [&_svg]:size-5.5" onClick={state.complete}>
          {t('driver.complete')}
          <ArrowRight strokeWidth={2.5} />
        </Button>
      </div>
    </div>
    {cargoOpen ? <DialogContent className="fixed inset-0 h-dvh max-h-dvh w-full max-w-full rounded-none">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
        <DialogTitle className="text-h3 font-semibold">{t('driver.cargo.title')}</DialogTitle>
        <DialogClose asChild><Button variant="secondary" size="touch">{t('driver.cargo.close')}</Button></DialogClose>
      </div>
      <DialogDescription className="sr-only">{t('driver.cargo.description')}</DialogDescription>
      <Suspense fallback={<div className="grid flex-1 place-items-center bg-canvas-1"><Spinner tone="light" /></div>}>
        <DriverCargoViewer model={model} stopNumber={stop.number} doneIds={state.done} />
      </Suspense>
    </DialogContent> : null}
    </Dialog>
  )
}

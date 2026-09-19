import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ExitIconButton } from '@/features/auth/ExitControl'
import { useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { StopDelivery } from './driver-plan'

/** Đường dẫn các màn trong một chuyến của tài xế: khác màn chính `/tai-xe` nên tài xế thoát là về danh sách (`exitAction`). */
export const DRIVER_TRIP_SCREEN = '/tai-xe/diem-giao'

/**
 * Thanh trên của màn điểm giao: lối về danh sách chuyến (56px), số điểm có màu điểm giao kèm số (mục 10), nút chuyển ngôn ngữ, và dải
 * tiến độ theo điểm — điểm đã hoàn tất trong kho màu xanh, điểm hiện tại màu của điểm.
 */
export function DriverStopHeader({ stop, stops, completedStops }: {
  stop: Pick<StopDelivery, 'number'>
  stops: readonly Pick<StopDelivery, 'number'>[]
  completedStops: ReadonlySet<number>
}) {
  const t = useT()
  return (
    <header className="flex flex-none flex-col gap-2.5 border-b border-border bg-bg px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
      <div className="flex items-center gap-1.5">
        <ExitIconButton screenHome={DRIVER_TRIP_SCREEN} contextual="/tai-xe" label={t('driver.toTrips')} className="-ml-2" iconClassName="size-6" />
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
            className={cn('h-1 flex-1 rounded-xs', completedStops.has(number) ? 'bg-success' : number !== stop.number && 'bg-border')}
            style={number === stop.number && !completedStops.has(number) ? { background: stopColor(number) } : undefined}
          />
        ))}
      </div>
    </header>
  )
}

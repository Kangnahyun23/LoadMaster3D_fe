import { ArrowRight, ChevronLeft, CloudOff, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { formatInteger } from '@/lib/format'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { DeliveryItemRow } from './DeliveryItemRow'
import { DELIVERY_STOP } from './driver.mock'
import { DriverTabBar } from './DriverTabBar'
import { useDeliveryStop } from './useDeliveryStop'

/**
 * Màn tài xế tại điểm giao — điện thoại, một tay, ngoài trời.
 * Vùng chạm 56px, chữ 16px, hành động chính duy nhất: "Hoàn tất điểm giao".
 *
 * Lệch có chủ ý khỏi design: nút chỉ đường trong design màu primary — mỗi màn
 * chỉ một nút primary (mục 5) nên đổi sang secondary; nhãn nút chính viết hoa
 * trong design — mục 5 cấm; thanh đáy bỏ bóng đổ vì không phải lớp nổi.
 */
export function DriverStopPage() {
  const stop = DELIVERY_STOP
  const state = useDeliveryStop(stop)

  return (
    <div className="flex h-dvh flex-col bg-bg text-body-lg">
      <header className="flex flex-none flex-col gap-2.5 border-b border-border bg-bg px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link
              to="/chuyen"
              aria-label="Thoát màn hình tài xế"
              className="-ml-2 grid size-11 flex-none place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
            </Link>
            <span
              className="grid size-8 flex-none place-items-center rounded-full font-mono text-body-lg font-semibold leading-none"
              style={{ background: stopColor(stop.number), color: stopForeground(stop.number) }}
            >
              {stop.number}
            </span>
            <h1 className="text-h2 font-semibold">
              Điểm <span className="font-mono">{stop.number} / {stop.totalStops}</span>
            </h1>
          </div>
          {stop.pendingSyncCount > 0 ? (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-badge-warning-border bg-badge-warning-bg px-2.5 text-body-lg font-medium leading-none whitespace-nowrap text-badge-warning-fg">
              <CloudOff className="size-4" strokeWidth={2} aria-hidden />
              {formatInteger(stop.pendingSyncCount)} thao tác chờ đồng bộ
            </span>
          ) : null}
        </div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: stop.totalStops }, (_, index) => {
            const n = index + 1
            return (
              <span
                key={n}
                className={cn('h-1 flex-1 rounded-xs', n < stop.number && 'bg-success', n > stop.number && 'bg-border')}
                style={n === stop.number ? { background: stopColor(n) } : undefined}
              />
            )
          })}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pt-3 pb-4">
        <div className="flex flex-none items-center gap-3 rounded-md border border-border bg-bg p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-h2 font-semibold">{stop.customer}</span>
            <span className="text-body-lg leading-5.5 text-pretty text-text-2">{stop.address}</span>
          </div>
          <Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={`Gọi ${stop.phone}`} asChild>
            <a href={`tel:${stop.phone.replace(/\s/g, '')}`}>
              <Phone strokeWidth={2} />
            </a>
          </Button>
          <Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label="Chỉ đường" asChild>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`} target="_blank" rel="noreferrer">
              <Navigation strokeWidth={2} />
            </a>
          </Button>
        </div>

        <div className="flex flex-none flex-col gap-1.5 px-0.5 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">
              Cần dỡ <span className="font-mono">{formatInteger(state.total)}</span> kiện · Đã dỡ{' '}
              <span className="font-mono text-badge-success-fg">{formatInteger(state.doneCount)}</span>
            </span>
            <span className="font-mono font-medium text-text-3">{state.percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={state.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ dỡ hàng"
            className="h-2 overflow-hidden rounded-full border border-border bg-surface"
          >
            <div className="h-full bg-success transition-[width] duration-(--dur-md) ease-decelerate" style={{ width: `${state.percent}%` }} />
          </div>
        </div>

        <ul className="m-0 flex flex-none list-none flex-col overflow-hidden rounded-md border border-border bg-bg p-0">
          {stop.items.map((item) => (
            <DeliveryItemRow
              key={item.id}
              item={item}
              status={state.rejected.has(item.id) ? 'rejected' : state.done.has(item.id) ? 'done' : 'pending'}
              onToggle={state.toggle}
            />
          ))}
        </ul>

        <span className="flex-none px-0 py-1 text-center text-text-3">
          Còn {formatInteger(state.remaining)} kiện chưa dỡ
        </span>
      </div>

      <div className="flex-none border-t border-border bg-bg">
        <div className="px-4 py-3">
          <Button variant="primary" block className="h-15 gap-2.5 text-[18px] [&_svg]:size-5.5" onClick={state.complete}>
            Hoàn tất điểm giao
            <ArrowRight strokeWidth={2.5} />
          </Button>
        </div>
        <DriverTabBar />
      </div>
    </div>
  )
}

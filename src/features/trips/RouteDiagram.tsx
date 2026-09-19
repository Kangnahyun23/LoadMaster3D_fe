import { Warehouse } from 'lucide-react'
import { useId } from 'react'
import type { Formatter } from '@/lib/format'
import type { DeliveryProgress } from '@/lib/mock-db'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { StopRow } from './trip-summary'

/** Quá 6 điểm giao thì mỗi điểm rộng cố định và khung cuộn ngang; từ 6 trở xuống thì chia đều chiều rộng. */
const SCROLL_AFTER = 6

type StopState = { kind: 'done'; at: string } | { kind: 'current' } | { kind: 'pending' }

/** Trạng thái giao của từng điểm: điểm đã hoàn tất, điểm chưa hoàn tất đầu tiên là điểm đang giao (khi chuyến chưa xong). */
function stopStates(stops: readonly StopRow[], delivery: DeliveryProgress | undefined): (StopState | null)[] {
  if (!delivery) return stops.map(() => null)
  const progress = new Map(delivery.stops.map((stop) => [stop.number, stop]))
  const current = delivery.completedAt === undefined ? delivery.stops.find((stop) => stop.completedAt === undefined)?.number : undefined
  return stops.map(({ number }) => {
    const completedAt = progress.get(number)?.completedAt
    if (completedAt !== undefined) return { kind: 'done', at: completedAt }
    return number === current ? { kind: 'current' } : { kind: 'pending' }
  })
}

/**
 * Sơ đồ tuyến ở Chi tiết chuyến (LM-097, D-50): kho xuất phát → điểm 1 → … theo thứ tự giao, mỗi điểm một vòng màu định danh luôn
 * kèm số, tên, số kiện và khối lượng. `delivery` chỉ truyền khi chuyến đang giao hoặc đã hoàn thành: điểm đã giao có dấu hoàn tất và
 * đoạn đường tới nó liền nét. SVG tự vẽ, không địa lý, không thư viện bản đồ. Trình đọc màn hình đọc từng điểm theo thứ tự kèm trạng thái.
 */
export function RouteDiagram({ stops, delivery }: { stops: readonly StopRow[]; delivery?: DeliveryProgress }) {
  const t = useT()
  const format = useFormat()
  const titleId = useId()
  const wide = stops.length > SCROLL_AFTER
  const states = stopStates(stops, delivery)
  // Ô không có đệm ngang để đoạn đường nối liền giữa hai ô; chữ tự lùi vào bằng `px-1`
  const item = cn('flex flex-col items-center gap-1.5 text-center', wide ? 'w-36 flex-none' : 'min-w-24 flex-1')

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <h2 id={titleId} className="px-1 text-h3 font-semibold">{t('trips.route.title')}</h2>
      <div className="overflow-x-auto rounded-md border border-border bg-bg">
        <ol aria-label={t('trips.route.label', { count: stops.length })} className={cn('m-0 flex list-none px-2 py-4', wide ? 'w-max' : 'w-full')}>
          <li className={item}>
            <div aria-hidden className="flex w-full flex-col items-center gap-1.5">
              <svg className="h-10 w-full overflow-visible">
                {stops.length > 0 ? <Leg from="50%" to="100%" state={states[0] ?? null} /> : null}
                <svg x="50%" y="20" overflow="visible">
                  <rect x="-14" y="-14" width="28" height="28" rx="6" className="fill-surface stroke-text-3" strokeWidth="1.5" />
                  <Warehouse x={-9} y={-9} width={18} height={18} strokeWidth={1.5} className="text-text-2" />
                </svg>
              </svg>
              <span className="w-full truncate px-1 text-caption font-medium">{t('trips.route.depot')}</span>
            </div>
            <span className="sr-only">{t('trips.route.depot')}</span>
          </li>
          {stops.map((stop, index) => {
            const state = states[index] ?? null
            const packages = t('common.packageCount', { count: stop.packageCount })
            const weight = format.weight(stop.weightKg)
            return (
              <li key={stop.id} className={item}>
                <div aria-hidden className="flex w-full flex-col items-center gap-1.5">
                  <svg className="h-10 w-full overflow-visible">
                    <Leg from="0" to="50%" state={state} />
                    {index < stops.length - 1 ? <Leg from="50%" to="100%" state={states[index + 1] ?? null} /> : null}
                    <svg x="50%" y="20" overflow="visible">
                      <circle r="14" fill={stopColor(stop.number)} />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={stopForeground(stop.number)}
                        className="font-mono text-caption font-semibold"
                      >
                        {stop.number}
                      </text>
                      {state?.kind === 'done' ? (
                        <g transform="translate(11 -11)">
                          <circle r="7" className="fill-success stroke-bg" strokeWidth="2" />
                          <path d="M -3 0 L -1 2 L 3 -2" fill="none" className="stroke-bg" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      ) : null}
                    </svg>
                  </svg>
                  <span className="w-full truncate px-1 text-caption font-medium" title={stop.name}>{stop.name}</span>
                  <span className="px-1 font-mono text-caption whitespace-nowrap text-text-3">{packages} · {weight}</span>
                  {state ? <StateText state={state} /> : null}
                </div>
                <span className="sr-only">
                  {t('trips.route.stop', { number: stop.number, total: stops.length, name: stop.name, packages, weight })}
                  {state ? `, ${stateLabel(state, t, format)}` : null}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/** Nửa đoạn đường trong ô của một điểm: tới điểm đã giao thì liền nét màu hoàn tất, còn lại nét đứt. */
function Leg({ from, to, state }: { from: string; to: string; state: StopState | null }) {
  const done = state?.kind === 'done'
  return (
    <line
      x1={from}
      x2={to}
      y1="20"
      y2="20"
      strokeWidth="2"
      strokeDasharray={done ? undefined : '4 4'}
      className={done ? 'stroke-success' : 'stroke-text-disabled'}
    />
  )
}

function StateText({ state }: { state: StopState }) {
  const t = useT()
  const format = useFormat()
  if (state.kind === 'done') {
    return <span className="text-caption text-badge-success-fg">{t('trips.route.state.done', { time: format.time(state.at) })}</span>
  }
  if (state.kind === 'current') return <span className="text-caption font-medium text-badge-cyan-fg">{t('trips.route.state.current')}</span>
  return <span className="text-caption text-text-3">{t('trips.route.state.pending')}</span>
}

function stateLabel(state: StopState, t: TFunction, format: Formatter): string {
  if (state.kind === 'done') return t('trips.route.stateA11y.done', { time: format.time(state.at) })
  return state.kind === 'current' ? t('trips.route.stateA11y.current') : t('trips.route.stateA11y.pending')
}

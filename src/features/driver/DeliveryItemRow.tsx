import { Check, Package } from 'lucide-react'
import { useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { DeliveryItem } from './driver-plan'

/**
 * Một dòng kiện hàng cần dỡ, cao tối thiểu 80px, nút tròn 56px bên phải để bấm được khi đeo găng.
 * Thứ tự dỡ là `unloadingOrder` của phương án đã duyệt.
 */
export function DeliveryItemRow({
  item,
  done,
  onToggle,
}: {
  item: DeliveryItem
  done: boolean
  onToggle: (id: string) => void
}) {
  const t = useT()
  const format = useFormat()
  const where = t('driver.item.where', { area: t(`driver.item.area.${item.area}`), layer: t(`driver.item.layer.${item.layer}`) })

  return (
    <li
      data-package-id={item.id}
      className={cn('flex min-h-20 items-center gap-3 border-b border-border py-3 pr-3 pl-4 last:border-b-0', done ? 'bg-surface' : 'bg-bg')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className={cn('font-mono text-body-lg leading-5.5 font-semibold', done ? 'text-text-3 line-through' : 'text-text')}>
            {item.id}
          </span>
          <span className="font-mono text-body-lg leading-5.5 text-text-3">{t('driver.item.order', { order: item.unloadingOrder })}</span>
        </div>
        <span className={cn('truncate text-body-lg leading-5.5', done ? 'text-text-3' : 'text-text-2')}>
          {item.name} · <span className="font-mono">{format.weight(item.weightKg)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-body-lg leading-5.5 text-text-3">
          <Package className="size-4 flex-none" strokeWidth={2} aria-hidden />
          {where}
        </span>
      </div>

      <button
        type="button"
        aria-label={t(done ? 'driver.item.unmarkDone' : 'driver.item.markDone', { id: item.id })}
        aria-pressed={done}
        onClick={() => onToggle(item.id)}
        className={cn(
          'grid size-14 flex-none place-items-center rounded-full',
          'transition-colors duration-(--dur-fast) ease-standard',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          done ? 'bg-success text-white' : 'border-2 border-success bg-bg text-badge-success-fg',
        )}
      >
        {done ? <Check className="size-7" strokeWidth={3} aria-hidden /> : <span className="text-body-lg leading-none font-semibold">{t('driver.item.done')}</span>}
      </button>
    </li>
  )
}

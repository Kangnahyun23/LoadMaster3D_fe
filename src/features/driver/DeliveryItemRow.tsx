import { Check, Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryItem } from './driver.mock'

type Status = 'pending' | 'done' | 'rejected'

/**
 * Một dòng kiện hàng cần dỡ, cao tối thiểu 80px, nút tròn 56px bên phải
 * để bấm được khi đeo găng. Kiện bị từ chối khoá nút.
 */
export function DeliveryItemRow({
  item,
  status,
  onToggle,
}: {
  item: DeliveryItem
  status: Status
  onToggle: (id: string) => void
}) {
  const done = status === 'done'
  const rejected = status === 'rejected'

  return (
    <li
      className={cn(
        'flex min-h-20 items-center gap-3 border-b border-border py-3 pr-3 pl-4',
        rejected ? 'bg-badge-danger-bg' : done ? 'bg-surface' : 'bg-bg',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'font-mono text-body-lg leading-5.5 font-semibold',
              done ? 'text-text-3 line-through' : 'text-text',
            )}
          >
            {item.id}
          </span>
          {rejected ? (
            <span className="inline-flex h-7 items-center rounded-full border border-badge-danger-border bg-badge-danger-bg px-2 text-body-lg font-semibold leading-none whitespace-nowrap text-badge-danger-fg">
              Khách từ chối nhận
            </span>
          ) : null}
        </div>
        <span className={cn('truncate text-body-lg leading-5.5', done ? 'text-text-3' : 'text-text-2')}>
          {item.description}
        </span>
        <span className="inline-flex items-center gap-1.5 text-body-lg leading-5.5 text-text-3">
          <Package className="size-4 flex-none" strokeWidth={2} aria-hidden />
          {item.where}
        </span>
      </div>

      <button
        type="button"
        aria-label={rejected ? `${item.id} khách từ chối nhận` : done ? `Bỏ đánh dấu đã dỡ ${item.id}` : `Đánh dấu đã dỡ ${item.id}`}
        aria-pressed={done}
        disabled={rejected}
        onClick={() => onToggle(item.id)}
        className={cn(
          'grid size-14 flex-none place-items-center rounded-full',
          'transition-colors duration-(--dur-fast) ease-standard',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          done && 'bg-success text-white',
          rejected && 'border-2 border-badge-danger-border bg-bg text-danger',
          status === 'pending' && 'border-2 border-success bg-bg text-badge-success-fg',
        )}
      >
        {done ? <Check className="size-7" strokeWidth={3} aria-hidden /> : null}
        {rejected ? <X className="size-6" strokeWidth={2.5} aria-hidden /> : null}
        {status === 'pending' ? <span className="text-body-lg leading-none font-semibold">Đã dỡ</span> : null}
      </button>
    </li>
  )
}

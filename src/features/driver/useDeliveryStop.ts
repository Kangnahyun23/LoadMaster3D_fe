import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n'
import type { StopDelivery } from './driver-plan'

/**
 * Phiên giao hàng trong trình duyệt (LM-061): bắt đầu ở điểm 1, đánh dấu từng kiện đã dỡ, "Hoàn tất điểm giao" chuyển sang điểm kế tiếp.
 * Chỉ giữ trong phiên của màn — không lưu, không đồng bộ, nên không báo điều gì ngoài việc đã làm ở đây.
 */
export function useDeliveryStop(stops: readonly StopDelivery[]) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set())
  const stop = stops[Math.min(index, stops.length - 1)]

  const toggle = useCallback((id: string) => {
    setDone((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const total = stop?.items.length ?? 0
  const doneCount = stop?.items.filter((item) => done.has(item.id)).length ?? 0
  const remaining = total - doneCount
  const percent = total === 0 ? 100 : Math.round((doneCount / total) * 100)
  const isLast = index >= stops.length - 1

  const complete = useCallback(() => {
    if (!stop) return
    if (remaining > 0) {
      toast.warning(t('driver.remaining', { count: remaining }), { description: t('driver.incompleteDescription') })
      return
    }
    toast.success(t('driver.stopDone', { number: stop.number }), {
      description: isLast ? t('driver.lastStop') : t('driver.nextStop', { number: stop.number + 1 }),
    })
    if (!isLast) setIndex(index + 1)
  }, [stop, remaining, isLast, index, t])

  return { stop, done, toggle, total, doneCount, remaining, percent, complete }
}

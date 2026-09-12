import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { DeliveryStop } from './driver.mock'

/**
 * Trạng thái dỡ hàng tại một điểm giao. Đánh dấu từng kiện đã dỡ;
 * kiện khách từ chối thì khoá lại, không đổi được từ màn này.
 */
export function useDeliveryStop(stop: DeliveryStop) {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set(stop.initiallyDone))
  const rejected = useMemo(() => new Set(stop.rejected), [stop.rejected])

  const toggle = useCallback(
    (id: string) => {
      if (rejected.has(id)) return
      setDone((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [rejected],
  )

  const total = stop.items.length
  const doneCount = done.size
  const remaining = total - doneCount - rejected.size
  const percent = Math.round((doneCount / total) * 100)

  const complete = useCallback(() => {
    if (remaining > 0) {
      toast.warning(`Còn ${remaining} kiện chưa dỡ`, {
        description: 'Đánh dấu hết các kiện hoặc ghi nhận khách từ chối trước khi hoàn tất.',
      })
      return
    }
    toast.success(`Đã hoàn tất điểm giao ${stop.number}`, {
      description: 'Sẽ đồng bộ khi có mạng. Chuyển sang điểm kế tiếp.',
    })
  }, [remaining, stop.number])

  return { done, rejected, toggle, total, doneCount, remaining, percent, complete }
}

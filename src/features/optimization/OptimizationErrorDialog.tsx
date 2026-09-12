import { OctagonAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { formatInteger } from '@/lib/format'
import type { OptimizationFailure } from './useOptimizationJob'

/** Hộp thoại khi bộ tối ưu không tìm được phương án khả thi. */
export function OptimizationErrorDialog({
  open,
  onOpenChange,
  failure,
  onAdjustTrip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  failure: OptimizationFailure
  onAdjustTrip: () => void
}) {
  const excessKg = failure.totalKg - failure.payloadKg

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-5 px-7 pt-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-badge-danger-bg text-danger">
              <OctagonAlert className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-h2 font-semibold">Không tìm được phương án khả thi</DialogTitle>
              <DialogDescription className="text-body text-pretty text-text-2">
                Đã chạy {formatInteger(failure.generations)} vòng tối ưu trong {formatInteger(failure.seconds)} giây. Hàng hoá
                hiện tại không thể xếp vừa xe {failure.vehicleName} vì các lý do sau:
              </DialogDescription>
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col overflow-hidden rounded-md border border-border p-0">
            {failure.oversizedCount > 0 ? (
              <Reason action="Xem kiện" actionLabel={`Xem ${formatInteger(failure.oversizedCount)} kiện`}>
                <span className="font-mono font-semibold">{formatInteger(failure.oversizedCount)}</span> kiện vượt kích
                thước lòng thùng
              </Reason>
            ) : null}
            {excessKg > 0 ? (
              <Reason action="Đổi xe" actionLabel="Đổi xe">
                Tổng khối lượng vượt tải trọng{' '}
                <span className="font-mono font-semibold">{formatInteger(excessKg)} kg</span>{' '}
                <span className="text-text-3">
                  ({formatInteger(failure.totalKg)} / {formatInteger(failure.payloadKg)} kg)
                </span>
              </Reason>
            ) : null}
          </ul>

          <p className="text-caption text-text-3">
            Gợi ý: tách 2–3 đơn nặng nhất sang chuyến khác hoặc chọn xe tải trọng lớn hơn.
          </p>
        </div>

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="ghost">Đóng</Button>
          </DialogClose>
          <Button variant="primary" onClick={onAdjustTrip}>
            Điều chỉnh chuyến hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Reason({
  children,
  actionLabel,
}: {
  children: React.ReactNode
  action: string
  actionLabel: string
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span aria-hidden className="size-2 flex-none rounded-full bg-danger" />
      <span className="flex-1 text-body">{children}</span>
      <button type="button" className="text-body font-medium whitespace-nowrap text-primary">
        {actionLabel}
      </button>
    </li>
  )
}

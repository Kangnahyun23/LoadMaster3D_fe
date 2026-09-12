import { Check, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { formatDecimal, formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'

export type ApprovalCheck = {
  tone: 'success' | 'warning' | 'danger'
  text: string
}

/** Hộp thoại xác nhận duyệt phương án: tóm tắt ba số và các điểm cần biết. */
export function ApprovePlanDialog({
  open,
  onOpenChange,
  planLabel,
  fillRate,
  weightKg,
  placedCount,
  totalCount,
  checks,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  planLabel: string
  fillRate: number
  weightKg: number
  placedCount: number
  totalCount: number
  checks: ApprovalCheck[]
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-140">
        <div className="flex flex-col gap-4 px-6 pt-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-h2 font-semibold">Duyệt phương án này?</DialogTitle>
            <DialogDescription className="text-body text-pretty text-text-2">
              {planLabel} sẽ được khoá và gửi phiếu xếp tới kho. Sau khi duyệt, thay đổi cần chạy tối ưu lại.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Lấp đầy">
              <span className="text-primary">{formatDecimal(fillRate)}%</span>
            </Stat>
            <Stat label="Tải trọng">
              {formatInteger(weightKg)} <Unit>kg</Unit>
            </Stat>
            <Stat label="Kiện đã xếp">
              {formatInteger(placedCount)} <Unit>/ {formatInteger(totalCount)}</Unit>
            </Stat>
          </div>

          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body text-text-2">
            {checks.map((check) => (
              <li key={check.text} className="flex items-center gap-2">
                {check.tone === 'success' ? (
                  <Check className="size-3.5 flex-none text-success" strokeWidth={2.5} aria-label="Đạt" />
                ) : (
                  <TriangleAlert
                    className={cn('size-3.5 flex-none', check.tone === 'danger' ? 'text-danger' : 'text-warning')}
                    strokeWidth={2.5}
                    aria-label={check.tone === 'danger' ? 'Không đạt' : 'Lưu ý'}
                  />
                )}
                {check.text}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="justify-end px-6">
          <DialogClose asChild>
            <Button variant="secondary">Huỷ</Button>
          </DialogClose>
          <Button variant="primary" onClick={onConfirm}>
            <Check strokeWidth={2} />
            Duyệt và gửi kho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface p-3">
      <span className="text-caption text-text-3">{label}</span>
      <span className="font-mono text-h2 font-semibold">{children}</span>
    </div>
  )
}

function Unit({ children }: { children: ReactNode }) {
  return <span className="font-sans text-caption font-normal text-text-3">{children}</span>
}

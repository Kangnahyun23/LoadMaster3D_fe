import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'

/**
 * Hỏi xác nhận trước một thao tác không hoàn tác được: rời trang khi form đang sửa, xoá xe (LM-041).
 * Dùng Dialog của repo, không dùng `confirm()` của trình duyệt.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  danger = false,
  pending = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  cancelLabel: string
  confirmLabel: string
  danger?: boolean
  pending?: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-120">
        <div className="flex flex-col gap-2 px-7 pt-6 pb-2">
          <DialogTitle className="text-h2 font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-body text-text-2">{description}</DialogDescription>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, type RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { dataErrorMessage, useT } from '@/lib/i18n'
import { useCancelTripMutation } from './useTripsQuery'

type CancelValues = { reason: string }

/**
 * Huỷ chuyến trước khi giao (D-45, LM-088): lý do bắt buộc, nút nguy hiểm. Kho từ chối (pha không huỷ được, thiếu lý do) thì câu lỗi
 * hiện ngay trong hộp thoại, không đóng. Đóng hộp thoại trả tiêu điểm về nút mở menu thao tác.
 */
export function CancelTripDialog({ tripId, open, onOpenChange, returnFocusTo }: {
  tripId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusTo?: RefObject<HTMLElement | null>
}) {
  const t = useT()
  const cancel = useCancelTripMutation(tripId)
  const schema = useMemo(() => z.object({
    reason: z.string().trim().min(1, t('trips.cancel.reasonRequired')).max(300, t('trips.cancel.tooLong')),
  }), [t])
  const form = useForm<CancelValues>({ resolver: zodResolver(schema), defaultValues: { reason: '' } })

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset()
      cancel.reset()
    }
    onOpenChange(next)
  }

  function handleSubmit({ reason }: CancelValues) {
    cancel.mutate(reason, {
      onSuccess: () => {
        toast.success(t('trips.cancel.done', { id: tripId }))
        handleOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-120"
        onCloseAutoFocus={(event) => {
          if (!returnFocusTo?.current) return
          event.preventDefault()
          returnFocusTo.current.focus()
        }}
      >
        <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-4 px-7 pt-6 pb-2">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-h2 font-semibold">{t('trips.cancel.title', { id: tripId })}</DialogTitle>
              <DialogDescription className="text-body text-text-2">{t('trips.cancel.description')}</DialogDescription>
            </div>
            <Textarea
              label={t('trips.cancel.reason')}
              placeholder={t('trips.cancel.reasonPlaceholder')}
              error={form.formState.errors.reason?.message}
              {...form.register('reason')}
            />
            {cancel.isError ? (
              <p role="alert" className="text-caption text-danger">{dataErrorMessage(cancel.error, t)}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              {t('trips.cancel.keep')}
            </Button>
            <Button type="submit" variant="danger" loading={cancel.isPending}>
              {t('trips.cancel.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

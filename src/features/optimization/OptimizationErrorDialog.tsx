import { OctagonAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { useT } from '@/lib/i18n'
import type { OptimizationServiceErrorCode } from '@/services/optimization'

export type OptimizationFailure =
  | { readonly kind: 'service'; readonly code: OptimizationServiceErrorCode }
  | { readonly kind: 'failed'; readonly messages: readonly string[] }

/**
 * Tối ưu không ra kết quả (LM-048): lỗi service (không phản hồi, quá giờ, worker dừng) có nút Thử lại; `status: FAILED`
 * liệt kê lỗi đầu vào đã dịch. Không còn nút lý do không làm gì (D-20).
 */
export function OptimizationErrorDialog({ failure, onRetry, onClose }: {
  failure: OptimizationFailure
  onRetry: () => void
  onClose: () => void
}) {
  const t = useT()
  const service = failure.kind === 'service'
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <div className="flex flex-col gap-4 px-7 pt-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-badge-danger-bg text-danger">
              <OctagonAlert className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-h2 font-semibold">
                {service ? t('optimization.error.title') : t('optimization.error.failedTitle')}
              </DialogTitle>
              <DialogDescription className="text-body text-pretty text-text-2">
                {service ? t(`optimization.error.${failure.code}`) : t('optimization.error.failedDescription')}
              </DialogDescription>
            </div>
          </div>
          {failure.kind === 'failed' ? (
            <ul className="m-0 flex list-none flex-col overflow-hidden rounded-md border border-border p-0">
              {failure.messages.map((message) => (
                <li key={message} className="border-b border-border px-4 py-3 text-body last:border-b-0">{message}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <DialogFooter className="justify-end">
          <Button variant="ghost" onClick={onClose}>{t('optimization.error.close')}</Button>
          {service ? <Button variant="primary" onClick={onRetry}>{t('optimization.error.retry')}</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

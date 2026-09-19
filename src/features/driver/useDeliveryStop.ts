import { toast } from 'sonner'
import { dataErrorMessage, useT } from '@/lib/i18n'
import type { DeliveryView } from './delivery-progress'
import type { IssueFormValues } from './issue-form.schema'
import {
  useCompleteStopMutation,
  useRecordUnloadMutation,
  useReportIssueMutation,
  useStartDeliveryMutation,
  useUnloadPending,
} from './useDriverQueries'

/**
 * Thao tác của tài xế ở điểm giao (LM-087), ghi thẳng vào kho (D-47): bắt đầu giao, đánh dấu / bỏ đánh dấu kiện đã dỡ, báo sự cố,
 * hoàn tất điểm. Toast chỉ nói việc kho đã ghi; ghi lỗi thì nói lỗi của kho. Dùng promise (không dùng callback theo lượt `mutate`)
 * cho việc cần báo sau khi màn đã đổi, ví dụ hoàn tất điểm cuối mở màn tổng kết.
 */
export function useDeliveryStop(tripId: string, view: DeliveryView | undefined, stopCount: number) {
  const t = useT()
  const start = useStartDeliveryMutation(tripId)
  const unload = useRecordUnloadMutation(tripId)
  const unloadPending = useUnloadPending(tripId)
  const report = useReportIssueMutation(tripId)
  const complete = useCompleteStopMutation(tripId)

  function showError(error: unknown) {
    toast.error(dataErrorMessage(error, t))
  }

  function toggle(id: string) {
    if (view?.mode !== 'delivering') return
    const entry = view.items.find(({ item }) => item.id === id)
    if (!entry) return
    unload.mutate({ stopNumber: view.stop.number, packageInstanceId: id, unloaded: !entry.unloaded }, { onError: showError })
  }

  function startDelivery() {
    void start.mutateAsync().catch(showError)
  }

  /** `true` khi kho đã ghi sự cố. */
  async function reportIssue({ packageInstanceId, kind, note }: IssueFormValues): Promise<boolean> {
    if (!view) return false
    try {
      await report.mutateAsync({ stopNumber: view.stop.number, packageInstanceId, kind, note })
      toast.success(t('driver.issue.recorded', { id: packageInstanceId }))
      return true
    } catch (error) {
      showError(error)
      return false
    }
  }

  function completeStop() {
    if (!view) return
    const number = view.stop.number
    void complete.mutateAsync(number).then(
      () => toast.success(t('driver.stopDone', { number }), {
        description: number >= stopCount ? t('driver.lastStop') : t('driver.nextStop', { number: number + 1 }),
      }),
      showError,
    )
  }

  return {
    toggle,
    unloadPending,
    startDelivery,
    starting: start.isPending,
    reportIssue,
    reporting: report.isPending,
    completeStop,
    completing: complete.isPending,
  }
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { useT } from '@/lib/i18n'
import { DELIVERY_ISSUE_KINDS } from '@/lib/mock-db'
import type { ItemProgress } from './delivery-progress'
import { ISSUE_NOTE_MAX, isIssueFormError, issueFormSchema, type IssueFormInput, type IssueFormValues } from './issue-form.schema'

type IssueFormProps = {
  stopNumber: number
  /** Kiện của điểm đang giao; chọn sẵn kiện chưa dỡ, chưa có sự cố đầu tiên. */
  items: readonly ItemProgress[]
  pending: boolean
  /** Ghi sự cố vào kho; hộp đóng khi ghi xong (nơi gọi đóng). */
  onSubmit: (values: IssueFormValues) => Promise<void>
}

/**
 * Hộp "Báo sự cố" (LM-087, D-47): chọn kiện, loại sự cố (hỏng / thiếu / khách từ chối / khác) và ghi chú; "Khác" bắt buộc ghi chú.
 * Điện thoại: chữ 16px, ô chọn và nút 56px, bốn loại là bốn ô bấm lớn (mục 10). Form dựng lại mỗi lần mở để kiện chọn sẵn đúng lúc mở.
 */
export function ReportIssueDialog({ open, onOpenChange, ...form }: IssueFormProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        // Khung hộp thoại 640px không co theo lưới của lớp phủ: trên điện thoại giới hạn bằng bề ngang màn trừ lề 24px mỗi bên
        <DialogContent className="w-[min(40rem,calc(100vw-3rem))]">
          <IssueForm {...form} />
        </DialogContent>
      ) : null}
    </Dialog>
  )
}

function IssueForm({ stopNumber, items, pending, onSubmit }: IssueFormProps) {
  const t = useT()
  const id = useId()
  const preselected = items.find((entry) => !entry.unloaded && entry.issue === undefined) ?? items[0]
  const form = useForm<IssueFormInput, unknown, IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: { packageInstanceId: preselected?.item.id ?? '', note: '' },
  })
  const { errors } = form.formState

  function message(code: string | undefined): string | undefined {
    if (!isIssueFormError(code)) return undefined
    return code === 'noteTooLong' ? t('driver.issue.errors.noteTooLong', { max: ISSUE_NOTE_MAX }) : t(`driver.issue.errors.${code}`)
  }
  const packageError = message(errors.packageInstanceId?.message)
  const kindError = message(errors.kind?.message)
  const noteError = message(errors.note?.message)

  return (
    <form noValidate className="text-body-lg" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-h2 font-semibold">{t('driver.issue.title', { number: stopNumber })}</DialogTitle>
          <DialogDescription className="text-body-lg text-pretty text-text-2">{t('driver.issue.description')}</DialogDescription>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-kien`} className="font-medium">{t('driver.issue.package')}</label>
          <select
            id={`${id}-kien`}
            aria-invalid={packageError ? true : undefined}
            className="h-14 w-full rounded-md border border-border bg-bg px-3 font-mono text-body-lg outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            {...form.register('packageInstanceId')}
          >
            {items.map(({ item }) => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}
          </select>
          {packageError ? <span className="text-danger">{packageError}</span> : null}
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-invalid={kindError ? true : undefined}>
          <legend className="mb-1.5 p-0 font-medium">{t('driver.issue.kind')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_ISSUE_KINDS.map((kind) => (
              <label
                key={kind}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-border px-3 has-checked:border-primary has-checked:bg-primary-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
              >
                <input type="radio" value={kind} className="size-5 flex-none accent-primary outline-none" {...form.register('kind')} />
                {t(`driver.issue.kinds.${kind}`)}
              </label>
            ))}
          </div>
          {kindError ? <span className="text-danger">{kindError}</span> : null}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-ghi-chu`} className="font-medium">{t('driver.issue.note')}</label>
          <Textarea
            id={`${id}-ghi-chu`}
            rows={3}
            className="text-body-lg"
            aria-invalid={noteError ? true : undefined}
            aria-describedby={`${id}-ghi-chu-mo-ta`}
            {...form.register('note')}
          />
          <span id={`${id}-ghi-chu-mo-ta`} className={noteError ? 'text-danger' : 'text-text-3'}>{noteError ?? t('driver.issue.noteHint')}</span>
        </div>
      </div>

      <DialogFooter className="justify-end px-5 sm:px-6">
        <DialogClose asChild>
          <Button type="button" variant="secondary" size="touch">{t('driver.issue.cancel')}</Button>
        </DialogClose>
        <Button type="submit" variant="primary" size="touch" loading={pending}>{t('driver.issue.submit')}</Button>
      </DialogFooter>
    </form>
  )
}

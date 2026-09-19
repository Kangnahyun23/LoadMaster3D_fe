import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useT } from '@/lib/i18n'
import type { TemporaryPassword } from '@/lib/mock-db'

/**
 * Mật khẩu tạm của tài khoản vừa tạo hoặc vừa đặt lại (D-42): kho trả về đúng một lần, đóng hộp thoại là không xem lại được.
 * Ô chỉ đọc để chọn và chép tay khi trình duyệt chặn nút Sao chép.
 */
export function TemporaryPasswordDialog({
  result,
  reason,
  onClose,
}: {
  /** Vắng thì hộp thoại đóng. */
  result: TemporaryPassword | undefined
  reason: 'created' | 'reset'
  onClose: () => void
}) {
  const t = useT()

  async function handleCopy(password: string) {
    try {
      await navigator.clipboard.writeText(password)
      toast.success(t('admin.users.password.copied'))
    } catch {
      toast.error(t('admin.users.password.copyFailed'))
    }
  }

  return (
    <Dialog open={result !== undefined} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="w-120">
        {result ? (
          <>
            <div className="flex flex-col gap-4 px-7 pt-6 pb-2">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-h2 font-semibold">
                  {reason === 'created'
                    ? t('admin.users.password.createdTitle', { name: result.user.fullName })
                    : t('admin.users.password.resetTitle', { name: result.user.fullName })}
                </DialogTitle>
                <DialogDescription className="text-body text-text-2">
                  {t('admin.users.password.description', { email: result.user.email })}
                </DialogDescription>
              </div>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    label={t('admin.users.password.label')}
                    readOnly
                    value={result.temporaryPassword}
                    className="font-mono"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={() => void handleCopy(result.temporaryPassword)}>
                  <Copy strokeWidth={1.5} aria-hidden />
                  {t('admin.users.password.copy')}
                </Button>
              </div>
            </div>
            <DialogFooter className="justify-end">
              <Button type="button" variant="primary" onClick={onClose}>
                {t('admin.users.password.done')}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

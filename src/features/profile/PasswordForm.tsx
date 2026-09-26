import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { dataErrorMessage, useT } from '@/lib/i18n'
import { MIN_PASSWORD_LENGTH } from '@/lib/mock-db'
import { isIncorrectPassword } from './profile-api'
import { passwordSchema, PROFILE_ERRORS, translateProfileError, type PasswordValues } from './profile-form.schema'
import { cn } from '@/lib/utils'
import { FORM_ALERT, SECTION_TEXT, SECTION_TITLE, TOUCH_CONTROL } from './profile-styles'
import { useChangePasswordMutation } from './useProfileMutations'

const EMPTY: PasswordValues = { currentPassword: '', nextPassword: '', confirmPassword: '' }

/**
 * Đổi mật khẩu của chính mình (LM-096, D-42): mật khẩu hiện tại, mật khẩu mới (tối thiểu theo kho), nhập lại. Kho báo sai mật
 * khẩu hiện tại thì lỗi hiện tại đúng ô đó và con trỏ quay về ô; đổi xong thì xoá cả ba ô.
 */
export function PasswordForm({ className }: { className?: string }) {
  const t = useT()
  const titleId = useId()
  const change = useChangePasswordMutation()
  const [failure, setFailure] = useState<unknown>(null)
  const form = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY })
  const { errors, isSubmitting } = form.formState

  async function handleValid({ currentPassword, nextPassword }: PasswordValues) {
    setFailure(null)
    try {
      await change.mutateAsync({ currentPassword, nextPassword })
      form.reset(EMPTY)
      toast.success(t('profile.password.changed'))
    } catch (error) {
      if (isIncorrectPassword(error)) form.setError('currentPassword', { message: PROFILE_ERRORS.currentIncorrect }, { shouldFocus: true })
      else setFailure(error)
    }
  }

  return (
    <section aria-labelledby={titleId} className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className={SECTION_TITLE}>{t('profile.password.title')}</h2>
        <p className={SECTION_TEXT}>{t('profile.password.description')}</p>
      </div>

      <form noValidate onSubmit={form.handleSubmit(handleValid)} className="flex flex-col gap-5">
        {/* Mật khẩu hiện tại một dòng riêng (nửa bề rộng, thẳng cột với Họ và tên), hai ô mật khẩu mới cạnh nhau */}
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <Input
              label={t('profile.password.current')}
              type="password"
              autoComplete="current-password"
              className={TOUCH_CONTROL}
              error={translateProfileError(t, errors.currentPassword?.message)}
              {...form.register('currentPassword')}
            />
          </div>
          <Input
            label={t('profile.password.next')}
            type="password"
            autoComplete="new-password"
            className={TOUCH_CONTROL}
            hint={t('profile.password.nextHint', { min: MIN_PASSWORD_LENGTH })}
            error={translateProfileError(t, errors.nextPassword?.message)}
            {...form.register('nextPassword')}
          />
          <Input
            label={t('profile.password.confirm')}
            type="password"
            autoComplete="new-password"
            className={TOUCH_CONTROL}
            error={translateProfileError(t, errors.confirmPassword?.message)}
            {...form.register('confirmPassword')}
          />
        </div>

        {failure ? <p role="alert" className={FORM_ALERT}>{dataErrorMessage(failure, t)}</p> : null}

        <div>
          <Button type="submit" variant="secondary" loading={isSubmitting} className={TOUCH_CONTROL}>
            {t('profile.password.submit')}
          </Button>
        </div>
      </form>
    </section>
  )
}

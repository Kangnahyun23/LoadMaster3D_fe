import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { dataErrorMessage, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { User } from '@/types/user'
import { profileSchema, translateProfileError, type ProfileInput, type ProfileValues } from './profile-form.schema'
import { FORM_ALERT, TOUCH_CONTROL } from './profile-styles'
import { useSaveProfileMutation } from './useProfileMutations'

/**
 * Thông tin cá nhân (LM-096): họ tên và số điện thoại sửa được; email, vai trò, kho trực thuộc chỉ đọc vì do quản trị viên đổi.
 * Lưu xong thì form lấy giá trị kho vừa lưu (số điện thoại dạng "0901 234 567") làm mốc, nút Lưu tắt tới lần sửa sau.
 */
export function ProfileDetailsForm({ user }: { user: User }) {
  const t = useT()
  const titleId = useId()
  const save = useSaveProfileMutation()
  const form = useForm<ProfileInput, unknown, ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone },
  })
  const { errors, isDirty, isSubmitting } = form.formState

  async function handleValid(values: ProfileValues) {
    try {
      const saved = await save.mutateAsync(values)
      form.reset({ fullName: saved.fullName, phone: saved.phone })
      toast.success(t('profile.details.saved'))
    } catch {
      // Câu lỗi hiện dưới form từ `save.error`; dữ liệu đang nhập giữ nguyên
    }
  }

  const readOnly = [
    { label: t('profile.details.email'), value: user.email, wide: true },
    { label: t('profile.details.role'), value: t(`roles.${user.role}`), wide: false },
    { label: t('profile.details.depot'), value: user.depot, wide: false },
  ]

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="text-h3 font-semibold">{t('profile.details.title')}</h2>
        <p className="text-text-2">{t('profile.details.description')}</p>
      </div>

      <form noValidate onSubmit={form.handleSubmit(handleValid)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('profile.details.fullName')}
            autoComplete="name"
            className={TOUCH_CONTROL}
            error={translateProfileError(t, errors.fullName?.message)}
            {...form.register('fullName')}
          />
          <Input
            label={t('profile.details.phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={cn('font-mono', TOUCH_CONTROL)}
            error={translateProfileError(t, errors.phone?.message)}
            {...form.register('phone')}
          />
        </div>

        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          {readOnly.map(({ label, value, wide }) => (
            <div key={label} className={cn('flex min-w-0 flex-col gap-1.5', wide && 'sm:col-span-2')}>
              <dt className="text-body font-medium text-text">{label}</dt>
              <dd className="m-0 flex min-h-10 items-center rounded-md border border-border bg-surface px-3 break-all text-text-2 pointer-coarse:min-h-14">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {save.isError ? <p role="alert" className={FORM_ALERT}>{dataErrorMessage(save.error, t)}</p> : null}

        <div>
          {/* Nút chính duy nhất của màn (mục 5); đổi mật khẩu dùng nút phụ */}
          <Button type="submit" loading={isSubmitting} disabled={!isDirty || isSubmitting} className={TOUCH_CONTROL}>
            {t('profile.details.save')}
          </Button>
        </div>
      </form>
    </section>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { useT } from '@/lib/i18n'
import { ROLES, USER_STATUSES, type Role, type User } from '@/types/user'
import {
  translateUserFormError,
  userFormSchema,
  type UserFormInput,
  type UserFormValues,
} from './user-form.schema'

const EMPTY: UserFormInput = {
  fullName: '',
  email: '',
  phone: '',
  role: 'dispatcher',
  status: 'active',
  depot: '',
}

function toFormValues(user: User): UserFormInput {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    depot: user.depot,
  }
}

/** Thêm hoặc sửa người dùng. Truyền `user` để sửa, bỏ trống để thêm mới. */
export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  onSubmit: (values: UserFormValues) => void
}) {
  const t = useT()
  const isEdit = Boolean(user)

  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY,
  })

  const { reset } = form
  useEffect(() => {
    if (open) reset(user ? toFormValues(user) : EMPTY)
  }, [open, user, reset])

  const errors = form.formState.errors
  const role = useWatch({ control: form.control, name: 'role' }) as Role
  const roleOptions = ROLES.map((value) => ({ value, label: t(`roles.${value}`) }))
  const statusOptions = USER_STATUSES.map((value) => ({ value, label: t(`admin.users.status.${value}`) }))

  function handleValid(values: UserFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-140">
        <form noValidate onSubmit={form.handleSubmit(handleValid)}>
          <div className="flex flex-col gap-5 px-6 pt-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-h2 font-semibold">
                {isEdit ? t('admin.users.form.editTitle') : t('admin.users.form.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-body text-text-2">
                {isEdit ? t('admin.users.form.editDescription') : t('admin.users.form.createDescription')}
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label={t('admin.users.form.fullName')} placeholder={t('admin.users.form.fullNamePlaceholder')} error={translateUserFormError(t, errors.fullName?.message)} {...form.register('fullName')} />
              <Input label={t('admin.users.form.phone')} placeholder="0901234567" className="font-mono" error={translateUserFormError(t, errors.phone?.message)} {...form.register('phone')} />
              <Input label={t('admin.users.form.email')} type="email" placeholder={t('admin.users.form.emailPlaceholder')} error={translateUserFormError(t, errors.email?.message)} {...form.register('email')} />
              <Input label={t('admin.users.form.depot')} placeholder={t('admin.users.form.depotPlaceholder')} error={translateUserFormError(t, errors.depot?.message)} {...form.register('depot')} />
              <SelectField
                control={form.control}
                name="role"
                label={t('admin.users.form.role')}
                options={roleOptions}
                hint={t('admin.users.form.device', { device: t(`admin.users.devices.${role}`) })}
              />
              <SelectField control={form.control} name="status" label={t('admin.users.form.status')} options={statusOptions} />
            </div>
          </div>

          <DialogFooter className="justify-end px-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">{t('admin.users.form.cancel')}</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              {isEdit ? t('admin.users.form.save') : t('admin.users.form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

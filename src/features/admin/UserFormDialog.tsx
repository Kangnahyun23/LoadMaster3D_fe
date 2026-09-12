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
import { optionsFromLabels, SelectField } from '@/components/ui/SelectField'
import { ROLE_DEVICES, ROLE_LABELS, USER_STATUS_LABELS, type Role, type User } from '@/types/user'
import {
  userFormSchema,
  type UserFormInput,
  type UserFormValues,
} from './user-form.schema'

const ROLE_OPTIONS = optionsFromLabels(ROLE_LABELS)
const STATUS_OPTIONS = optionsFromLabels(USER_STATUS_LABELS)

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
                {isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
              </DialogTitle>
              <DialogDescription className="text-body text-text-2">
                {isEdit
                  ? 'Thay đổi có hiệu lực ở lần đăng nhập kế tiếp của người dùng.'
                  : 'Người dùng mới sẽ nhận email đặt mật khẩu lần đầu.'}
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Họ và tên" placeholder="Nguyễn Thanh Tùng" error={errors.fullName?.message} {...form.register('fullName')} />
              <Input label="Số điện thoại" placeholder="0901234567" className="font-mono" error={errors.phone?.message} {...form.register('phone')} />
              <Input label="Email" type="email" placeholder="ten@loadmaster.vn" error={errors.email?.message} {...form.register('email')} />
              <Input label="Kho / chi nhánh" placeholder="Kho Long Bình" error={errors.depot?.message} {...form.register('depot')} />
              <SelectField
                control={form.control}
                name="role"
                label="Vai trò"
                options={ROLE_OPTIONS}
                hint={ROLE_DEVICES[role] ? `Thiết bị chính: ${ROLE_DEVICES[role]}` : undefined}
              />
              <SelectField control={form.control} name="status" label="Trạng thái" options={STATUS_OPTIONS} />
            </div>
          </div>

          <DialogFooter className="justify-end px-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Huỷ</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

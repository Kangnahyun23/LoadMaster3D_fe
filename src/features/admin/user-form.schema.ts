import { z } from 'zod'
import type { MessageKey, TFunction } from '@/lib/i18n'
import { ROLES, USER_STATUSES } from '@/types/user'

/** Số điện thoại Việt Nam: 10 chữ số bắt đầu bằng 0, cho phép khoảng trắng. */
const PHONE_PATTERN = /^0\d{9}$/

/**
 * Schema giữ key từ điển thay vì câu chữ (như form đăng nhập); hộp thoại dịch lúc hiển thị,
 * nên đổi ngôn ngữ khi lỗi đang hiện thì lỗi đổi theo.
 */
const ERRORS = {
  fullNameRequired: 'admin.users.errors.fullNameRequired',
  fullNameTooLong: 'admin.users.errors.fullNameTooLong',
  emailRequired: 'admin.users.errors.emailRequired',
  emailInvalid: 'admin.users.errors.emailInvalid',
  phoneRequired: 'admin.users.errors.phoneRequired',
  phoneInvalid: 'admin.users.errors.phoneInvalid',
  roleRequired: 'admin.users.errors.roleRequired',
  statusRequired: 'admin.users.errors.statusRequired',
  depotRequired: 'admin.users.errors.depotRequired',
} as const satisfies Record<string, MessageKey>

export const userFormSchema = z.object({
  fullName: z.string().trim().min(1, ERRORS.fullNameRequired).max(80, ERRORS.fullNameTooLong),
  email: z.string().trim().min(1, ERRORS.emailRequired).email(ERRORS.emailInvalid),
  phone: z
    .string()
    .trim()
    .min(1, ERRORS.phoneRequired)
    .transform((value) => value.replace(/\s/g, ''))
    .refine((value) => PHONE_PATTERN.test(value), ERRORS.phoneInvalid),
  role: z.enum(ROLES, { error: ERRORS.roleRequired }),
  status: z.enum(USER_STATUSES, { error: ERRORS.statusRequired }),
  depot: z.string().trim().min(1, ERRORS.depotRequired),
})

/** Dịch message của schema; message không phải key của schema thì bỏ qua. */
export function translateUserFormError(t: TFunction, message: string | undefined): string | undefined {
  const key = Object.values(ERRORS).find((candidate) => candidate === message)
  return key ? t(key) : undefined
}

export type UserFormValues = z.infer<typeof userFormSchema>
/** Giá trị trước khi zod chuẩn hoá số điện thoại — dùng cho defaultValues. */
export type UserFormInput = z.input<typeof userFormSchema>

import { z } from 'zod'
import type { MessageKey, TFunction } from '@/lib/i18n'
import { MIN_PASSWORD_LENGTH } from '@/lib/mock-db'
import { formatPhone, PHONE_PATTERN, phoneDigits } from '@/lib/phone'

/**
 * Hai form của màn Hồ sơ (LM-096). Schema giữ key từ điển thay vì câu (như form tài khoản của quản trị); form dịch lúc hiển thị,
 * nên đổi ngôn ngữ khi lỗi đang hiện thì lỗi đổi theo. Độ dài tối thiểu của mật khẩu lấy từ kho, cùng số kho kiểm lại.
 */
const ERRORS = {
  fullNameRequired: 'profile.errors.fullNameRequired',
  fullNameTooLong: 'profile.errors.fullNameTooLong',
  phoneRequired: 'profile.errors.phoneRequired',
  phoneInvalid: 'profile.errors.phoneInvalid',
  currentRequired: 'profile.errors.currentRequired',
  currentIncorrect: 'profile.errors.currentIncorrect',
  confirmMismatch: 'profile.errors.confirmMismatch',
} as const satisfies Record<string, MessageKey>

/** Câu duy nhất có tham số (`{min}`), dịch riêng. */
const NEXT_TOO_SHORT = 'profile.errors.nextTooShort' satisfies MessageKey

export const PROFILE_ERRORS = { ...ERRORS, nextTooShort: NEXT_TOO_SHORT } as const

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, ERRORS.fullNameRequired).max(80, ERRORS.fullNameTooLong),
  phone: z
    .string()
    .trim()
    .min(1, ERRORS.phoneRequired)
    .transform(phoneDigits)
    .refine((value) => PHONE_PATTERN.test(value), ERRORS.phoneInvalid)
    .transform(formatPhone),
})

export type ProfileInput = z.input<typeof profileSchema>
export type ProfileValues = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, ERRORS.currentRequired),
    nextPassword: z.string().min(MIN_PASSWORD_LENGTH, NEXT_TOO_SHORT),
    confirmPassword: z.string(),
  })
  .refine((values) => values.confirmPassword === values.nextPassword, {
    error: ERRORS.confirmMismatch,
    path: ['confirmPassword'],
  })

export type PasswordValues = z.infer<typeof passwordSchema>

/** Dịch message của schema (hoặc lỗi kho đặt vào ô); message không phải key của màn thì bỏ qua. */
export function translateProfileError(t: TFunction, message: string | undefined): string | undefined {
  if (message === NEXT_TOO_SHORT) return t(NEXT_TOO_SHORT, { min: MIN_PASSWORD_LENGTH })
  const key = Object.values(ERRORS).find((candidate) => candidate === message)
  return key ? t(key) : undefined
}

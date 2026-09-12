import { z } from 'zod'

/** Số điện thoại Việt Nam: 10 chữ số bắt đầu bằng 0, cho phép khoảng trắng. */
const PHONE_PATTERN = /^0\d{9}$/

export const userFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Nhập họ tên')
    .max(80, 'Họ tên tối đa 80 ký tự'),
  email: z
    .string()
    .trim()
    .min(1, 'Nhập email')
    .email('Email không đúng định dạng'),
  phone: z
    .string()
    .trim()
    .min(1, 'Nhập số điện thoại')
    .transform((value) => value.replace(/\s/g, ''))
    .refine((value) => PHONE_PATTERN.test(value), 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0'),
  role: z.enum(['dispatcher', 'warehouse', 'driver', 'manager', 'admin'], {
    error: 'Chọn vai trò',
  }),
  status: z.enum(['active', 'suspended'], { error: 'Chọn trạng thái' }),
  depot: z.string().trim().min(1, 'Nhập kho hoặc chi nhánh'),
})

export type UserFormValues = z.infer<typeof userFormSchema>
/** Giá trị trước khi zod chuẩn hoá số điện thoại — dùng cho defaultValues. */
export type UserFormInput = z.input<typeof userFormSchema>

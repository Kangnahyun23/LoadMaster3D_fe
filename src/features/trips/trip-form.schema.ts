import { z } from 'zod'

/** Ngày chạy chỉ nhận yyyy-MM-dd từ <input type="date">. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const tripFormSchema = z.object({
  date: z
    .string()
    .min(1, 'Chọn ngày chạy')
    .regex(ISO_DATE, 'Ngày không hợp lệ'),
  depot: z.string().trim().min(1, 'Nhập kho xuất phát'),
  vehicleId: z.string().min(1, 'Chọn xe'),
  note: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
})

export type TripFormValues = z.infer<typeof tripFormSchema>

/** yyyy-MM-dd → dd/MM/yyyy để hiển thị theo mục 6. */
export function isoToDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return year && month && day ? `${day}/${month}/${year}` : iso
}

/** dd/MM/yyyy → yyyy-MM-dd để đổ vào <input type="date">. */
export function displayDateToIso(display: string): string {
  const [day, month, year] = display.split('/')
  return year && month && day ? `${year}-${month}-${day}` : ''
}

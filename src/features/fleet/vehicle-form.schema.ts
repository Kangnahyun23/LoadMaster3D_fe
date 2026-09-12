import { z } from 'zod'

/** Giới hạn hợp lý cho xe tải và container chạy đường bộ Việt Nam. */
const DIMENSION_MM = { min: 1000, max: 16000 } as const
const PAYLOAD_KG = { min: 100, max: 40000 } as const

/** Biển số Việt Nam: 2 số + 1–2 chữ + dấu gạch + 4–5 số, ví dụ 60C-446.32 */
const PLATE_PATTERN = /^\d{2}[A-Z]{1,2}-\d{3}\.?\d{2}$/

const positiveMm = (label: string) =>
  z
    .number({ error: `Nhập ${label}` })
    .int(`${label} phải là số nguyên (mm)`)
    .min(DIMENSION_MM.min, `${label} tối thiểu ${DIMENSION_MM.min} mm`)
    .max(DIMENSION_MM.max, `${label} tối đa ${DIMENSION_MM.max} mm`)

export const vehicleFormSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên xe').max(80, 'Tên xe tối đa 80 ký tự'),
  plate: z
    .string()
    .trim()
    .min(1, 'Nhập biển số')
    .regex(PLATE_PATTERN, 'Biển số không đúng định dạng, ví dụ 60C-446.32'),
  bodyType: z.enum(['thung_kin', 'thung_bat', 'container'], { error: 'Chọn loại thùng' }),
  innerLengthMm: positiveMm('Chiều dài lòng thùng'),
  innerWidthMm: positiveMm('Chiều rộng lòng thùng'),
  innerHeightMm: positiveMm('Chiều cao lòng thùng'),
  payloadKg: z
    .number({ error: 'Nhập tải trọng' })
    .int('Tải trọng phải là số nguyên (kg)')
    .min(PAYLOAD_KG.min, `Tải trọng tối thiểu ${PAYLOAD_KG.min} kg`)
    .max(PAYLOAD_KG.max, `Tải trọng tối đa ${PAYLOAD_KG.max} kg`),
  frontAxleKg: z.number({ error: 'Nhập tải trọng trục trước' }).int().min(0),
  rearAxleKg: z.number({ error: 'Nhập tải trọng trục sau' }).int().min(0),
  depot: z.string().trim().min(1, 'Nhập kho trực thuộc'),
  status: z.enum(['san_sang', 'dang_chay', 'bao_duong', 'ngung'], { error: 'Chọn trạng thái' }),
  assignedDriver: z.string().trim().max(80).optional(),
})

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

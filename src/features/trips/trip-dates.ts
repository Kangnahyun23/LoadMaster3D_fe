import { vnDate } from '@/lib/mock-db'

/**
 * Ngày chạy `YYYY-MM-DD` thành mốc nửa đêm **giờ máy** để `format.date` in đúng ngày đó ở mọi múi giờ. `new Date('2026-09-14')` là
 * nửa đêm UTC: máy ở múi giờ âm in ra 13/09.
 */
export function dateOnly(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

/** Hôm nay theo giờ Việt Nam, `YYYY-MM-DD`: ngày chạy mặc định của chuyến mới. */
export function todayInVietnam(): string {
  return vnDate(new Date())
}

import { z } from 'zod'
import type { TFunction } from '@/lib/i18n'
import type { Trip } from '@/lib/mock-db'
import { todayInVietnam } from './trip-dates'

/** Giá trị "Chưa gán" của ô chọn tài xế: Radix Select không nhận `value=""` cho một dòng chọn được. */
export const UNASSIGNED = 'none'

/** Số điện thoại dạng hiển thị (`0901 234 567`, `+84 28 3775 1122`): chữ số, dấu cách, `+ - . ( )`. */
const PHONE = /^[0-9+().\s-]*$/

/**
 * Form khung chuyến (LM-053, LM-088): tên, ngày chạy, tài xế, xe và điểm giao (tên, địa chỉ, số điện thoại, người liên hệ) — đúng
 * các trường kho lưu (`Trip`). Kiện thêm ở Chi tiết chuyến. Tạo mới cần ít nhất một điểm giao; sửa chỉ đổi chữ của điểm giao hiện có
 * (sắp xếp/xoá ở Chi tiết chuyến để kiện được đánh số lại cùng lúc). Câu lỗi lấy từ từ điển nên schema dựng theo `t`.
 */
export function createTripFormSchema(t: TFunction, { withStops }: { withStops: boolean }) {
  const stop = z.object({
    name: z.string().trim().min(1, t('trips.create.stopNameRequired')).max(120, t('trips.create.tooLong')),
    address: z.string().trim().max(200, t('trips.create.tooLong')),
    phone: z.string().trim().max(20, t('trips.create.tooLong')).regex(PHONE, t('trips.create.phoneInvalid')),
    contactName: z.string().trim().max(120, t('trips.create.tooLong')),
  })
  return z.object({
    name: z.string().trim().min(1, t('trips.create.nameRequired')).max(120, t('trips.create.tooLong')),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('trips.create.dateRequired')),
    vehicleId: z.string().min(1, t('trips.create.vehicleRequired')),
    driverId: z.string(),
    stops: withStops ? z.array(stop).min(1, t('trips.create.stopsRequired')) : z.array(stop),
  })
}

export type TripFormValues = z.infer<ReturnType<typeof createTripFormSchema>>

/** Giá trị ban đầu: chuyến mới chạy hôm nay, chưa gán tài xế, một điểm giao trống; sửa thì lấy từ chuyến. */
export function tripFormDefaults(existing?: Trip): TripFormValues {
  if (!existing) {
    return {
      name: '', scheduledDate: todayInVietnam(), vehicleId: '', driverId: UNASSIGNED,
      stops: [{ name: '', address: '', phone: '', contactName: '' }],
    }
  }
  return {
    name: existing.name,
    scheduledDate: existing.scheduledDate,
    vehicleId: existing.vehicleId,
    driverId: existing.driverId ?? UNASSIGNED,
    stops: existing.stops.map((stop) => ({ name: stop.name, address: stop.address, phone: stop.phone ?? '', contactName: stop.contactName ?? '' })),
  }
}

/** Mã tài xế ghi vào kho: "Chưa gán" là `null`. */
export function driverIdOf(value: string): string | null {
  return value === UNASSIGNED || value === '' ? null : value
}

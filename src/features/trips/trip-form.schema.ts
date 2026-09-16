import { z } from 'zod'
import type { TFunction } from '@/lib/i18n'

/**
 * Form khung chuyến (LM-053): tên, xe và điểm giao — đúng các trường kho lưu (`Trip`). Kiện thêm ở Chi tiết chuyến.
 * Sửa chuyến chỉ đổi tên và xe; điểm giao sắp xếp/xoá ở Chi tiết chuyến để kiện được đánh số lại cùng lúc.
 * Câu lỗi lấy từ từ điển nên schema dựng theo `t` của ngôn ngữ đang chọn.
 */
export function createTripFormSchema(t: TFunction, { withStops }: { withStops: boolean }) {
  const stop = z.object({
    name: z.string().trim().min(1, t('trips.create.stopNameRequired')).max(120, t('trips.create.tooLong')),
    address: z.string().trim().max(200, t('trips.create.tooLong')),
  })
  return z.object({
    name: z.string().trim().min(1, t('trips.create.nameRequired')).max(120, t('trips.create.tooLong')),
    vehicleId: z.string().min(1, t('trips.create.vehicleRequired')),
    stops: withStops ? z.array(stop).min(1, t('trips.create.stopsRequired')) : z.array(stop),
  })
}

export type TripFormValues = z.infer<ReturnType<typeof createTripFormSchema>>

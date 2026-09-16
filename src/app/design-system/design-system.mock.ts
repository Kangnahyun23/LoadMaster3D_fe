import type { VehicleAxle } from '@/domain/models'
import type { DeliveryItem } from '@/features/driver/driver-plan'
import type { StopRow } from '@/features/trips/trip-summary'

/**
 * Dữ liệu mẫu tiếng Việt cho hai trang tài liệu bàn giao (LM-071). Đây là dữ liệu, không phải chữ giao diện:
 * tên điểm giao, địa chỉ, tên hàng, loại xe giữ nguyên ở mọi ngôn ngữ như dữ liệu thật trong kho.
 */

export const SAMPLE_DRIVER_ITEM: DeliveryItem = {
  id: 'PKG-002-12', packageId: 'PKG-002', name: 'Thùng sữa tươi tiệt trùng 48 hộp', weightKg: 52, unloadingOrder: 3, area: 'door', layer: 'upper',
}

export const SAMPLE_STOP: StopRow = {
  id: 'STOP-1', number: 1, name: 'Công ty TNHH Thực phẩm Sài Gòn',
  address: '12 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh', packageCount: 38, weightKg: 2400,
}

export const SAMPLE_STOP_NAME = 'Bách Hoá Xanh'

export const SAMPLE_VEHICLE_TYPES = [
  'Xe tải 1,25 tấn — thùng kín',
  'Xe tải 2,5 tấn — thùng kín',
  'Xe tải 5 tấn — thùng bạt',
  'Container 20 DC',
  'Container 40 HC',
]

export const SAMPLE_AXLES: VehicleAxle[] = [
  { id: 'AXLE-01', name: 'Trục trước', positionXCm: -120, emptyLoadKg: 2100, maxLoadKg: 4000 },
  { id: 'AXLE-02', name: 'Trục sau', positionXCm: 430, emptyLoadKg: 2900, maxLoadKg: 5500 },
]

/** Câu mẫu cho thang chữ: cố ý là tiếng Việt có dấu để kiểm tra font ở mọi ngôn ngữ giao diện. */
export const TYPE_SAMPLES = {
  display: 'Xếp hàng lên xe tải — nhanh và chuẩn',
  h1: 'Kế hoạch chuyến giao ở Hồ Chí Minh',
  h2: 'Từng lớp kiện hàng, từng điểm dỡ',
  h3: 'Mẫu dấu: ẫ ộ ở ừ ẳ ễ ỡ ự ệ ầ ẩ ố',
  bodyLg: 'Kiện dễ vỡ được xếp ở lớp trên cùng; kiện nặng đặt sát vách và giữa trục để giữ trọng tâm ổn định.',
  body: 'Chuyến TRIP-2026-0914 gồm 7 đơn hàng, 132 kiện, giao 4 điểm từ Q.7 tới Biên Hoà.',
  caption: 'Cập nhật lúc 14:30 · 14/09/2026',
} as const

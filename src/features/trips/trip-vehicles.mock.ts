import type { VehicleSpec } from '@/types/load-plan'

/**
 * Xe cho ô chọn của form chuyến cũ — **mm**, dữ liệu mẫu, chưa nối kho (LM-043 sẽ chuyển màn này sang
 * `trips-api.ts` đọc chuyến và xe thật). Trước đây nằm ở `features/fleet/vehicles.mock.ts`; Đội xe nay đọc
 * `VehicleConfig` (cm) qua kho mock (LM-040), nên mock mm chỉ còn một nơi dùng và về đúng feature đó
 * (AGENTS mục 3). Code mới không thêm giá trị mm.
 */

/** Trạng thái khai thác của xe, chỉ dùng để lọc ô chọn. */
export type TripVehicleStatus = 'san_sang' | 'dang_chay' | 'bao_duong' | 'ngung'

export type TripVehicle = VehicleSpec & {
  id: string
  status: TripVehicleStatus
  /** Tên tài xế thường chạy xe này; null khi chưa gán */
  assignedDriver: string | null
}

export const TRIP_VEHICLES: TripVehicle[] = [
  {
    id: 'XE-0001',
    name: 'Hyundai HD210',
    plate: '60C-446.32',
    innerLengthMm: 7200,
    innerWidthMm: 2350,
    innerHeightMm: 2400,
    payloadKg: 9500,
    status: 'dang_chay',
    assignedDriver: 'Phạm Quốc Dũng',
  },
  {
    id: 'XE-0002',
    name: 'Isuzu NQR 550',
    plate: '51C-284.19',
    innerLengthMm: 5700,
    innerWidthMm: 2100,
    innerHeightMm: 2150,
    payloadKg: 5500,
    status: 'san_sang',
    assignedDriver: 'Ngô Văn Bảo',
  },
  {
    id: 'XE-0003',
    name: 'Hino FC9J',
    plate: '51C-190.07',
    innerLengthMm: 6200,
    innerWidthMm: 2200,
    innerHeightMm: 2200,
    payloadKg: 6400,
    status: 'bao_duong',
    assignedDriver: null,
  },
  {
    id: 'XE-0004',
    name: 'Thaco Ollin 720',
    plate: '51D-118.62',
    innerLengthMm: 6100,
    innerWidthMm: 2100,
    innerHeightMm: 2100,
    payloadKg: 7200,
    status: 'san_sang',
    assignedDriver: 'Đặng Hoài Nam',
  },
  {
    id: 'XE-0005',
    name: 'Container 40 HC',
    plate: '51R-772.40',
    innerLengthMm: 12030,
    innerWidthMm: 2350,
    innerHeightMm: 2690,
    payloadKg: 28000,
    status: 'ngung',
    assignedDriver: null,
  },
]

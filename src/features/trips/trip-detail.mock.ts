import type { TripStatus } from '@/types/trip'

/** Dữ liệu mẫu cho màn chi tiết chuyến, lấy nguyên từ bản design. */

export type Vehicle = {
  name: string
  plate: string
  /** Lòng thùng, đơn vị mm */
  innerLengthMm: number
  innerWidthMm: number
  innerHeightMm: number
  /** Tải trọng cho phép, kg */
  payloadKg: number
  loadingDoor: string
}

export type DeliveryStop = {
  id: string
  name: string
  address: string
  /** Số kiện giao tại điểm này */
  packageCount: number
  weightKg: number
}

export type Order = {
  id: string
  customer: string
  packageCount: number
  weightKg: number
  /** Số thứ tự điểm giao, 1-based */
  stop: number
}

export const TRIP = {
  id: 'TRIP-2026-0914',
  status: 'nhap' as TripStatus,
  date: '14/09/2026',
  depot: 'Kho Long Bình',
  lastOptimisedAt: null as string | null,
}

export const VEHICLE: Vehicle = {
  name: 'Hyundai HD210',
  plate: '60C-446.32',
  innerLengthMm: 7200,
  innerWidthMm: 2350,
  innerHeightMm: 2400,
  payloadKg: 9500,
  loadingDoor: 'Cửa sau',
}

export const CARGO_SUMMARY = {
  packageCount: 132,
  volumeM3: 18.4,
  weightKg: 8240,
  /** % thể tích thùng đã dùng */
  volumeUsage: 78,
  /** % tải trọng đã dùng */
  payloadUsage: 87,
}

export const STOPS: DeliveryStop[] = [
  {
    id: 'stop-1',
    name: 'Công ty TNHH Thực phẩm Sài Gòn',
    address: '12 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh',
    packageCount: 38,
    weightKg: 2400,
  },
  {
    id: 'stop-2',
    name: 'Siêu thị Co.opmart Bình Dương',
    address: '30 Đại lộ Bình Dương, Thủ Dầu Một',
    packageCount: 46,
    weightKg: 3080,
  },
  {
    id: 'stop-3',
    name: 'Kho Bách Hoá Xanh Dĩ An',
    address: '215 Quốc lộ 1K, P. Đông Hoà, Dĩ An',
    packageCount: 27,
    weightKg: 1640,
  },
  {
    id: 'stop-4',
    name: 'Nhà thuốc Long Châu Biên Hoà',
    address: '58 Võ Thị Sáu, P. Quyết Thắng, Biên Hoà',
    packageCount: 21,
    weightKg: 1120,
  },
]

export const ORDERS: Order[] = [
  {
    id: 'DH-51027',
    customer: 'Thực phẩm Sài Gòn',
    packageCount: 14,
    weightKg: 920,
    stop: 1,
  },
  {
    id: 'DH-51028',
    customer: 'Thực phẩm Sài Gòn',
    packageCount: 24,
    weightKg: 1480,
    stop: 1,
  },
  {
    id: 'DH-51031',
    customer: 'Co.opmart Bình Dương',
    packageCount: 30,
    weightKg: 1960,
    stop: 2,
  },
  {
    id: 'DH-51032',
    customer: 'Co.opmart Bình Dương',
    packageCount: 16,
    weightKg: 1120,
    stop: 2,
  },
  {
    id: 'DH-51035',
    customer: 'Bách Hoá Xanh Dĩ An',
    packageCount: 27,
    weightKg: 1640,
    stop: 3,
  },
  {
    id: 'DH-51036',
    customer: 'Long Châu Biên Hoà',
    packageCount: 9,
    weightKg: 340,
    stop: 4,
  },
  {
    id: 'DH-51037',
    customer: 'Long Châu Biên Hoà',
    packageCount: 12,
    weightKg: 780,
    stop: 4,
  },
]

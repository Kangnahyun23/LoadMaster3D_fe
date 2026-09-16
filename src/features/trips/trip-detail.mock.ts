import type { TripStatus } from '@/types/trip'

/** Dữ liệu mẫu còn lại của màn so sánh phương án; gỡ hẳn ở LM-051. */

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

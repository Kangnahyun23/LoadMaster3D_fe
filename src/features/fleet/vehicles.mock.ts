import type { VehicleSpec } from '@/types/load-plan'

/** Trạng thái khai thác của xe. */
export type VehicleStatus = 'san_sang' | 'dang_chay' | 'bao_duong' | 'ngung'

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  san_sang: 'Sẵn sàng',
  dang_chay: 'Đang chạy',
  bao_duong: 'Bảo dưỡng',
  ngung: 'Ngừng khai thác',
}

export type BodyType = 'thung_kin' | 'thung_bat' | 'container'

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  thung_kin: 'Thùng kín',
  thung_bat: 'Thùng bạt',
  container: 'Container',
}

export type Vehicle = VehicleSpec & {
  id: string
  bodyType: BodyType
  status: VehicleStatus
  depot: string
  /** Tên tài xế thường chạy xe này; null khi chưa gán */
  assignedDriver: string | null
}

/** Xe đang dùng trong phương án mẫu — giữ đúng thông số của load-plan.mock. */
export const VEHICLES: Vehicle[] = [
  {
    id: 'XE-0001',
    name: 'Hyundai HD210',
    plate: '60C-446.32',
    bodyType: 'thung_kin',
    innerLengthMm: 7200,
    innerWidthMm: 2350,
    innerHeightMm: 2400,
    payloadKg: 9500,
    frontAxle: { loadKg: 0, capacityKg: 4000 },
    rearAxle: { loadKg: 0, capacityKg: 5500 },
    status: 'dang_chay',
    depot: 'Kho Long Bình',
    assignedDriver: 'Phạm Quốc Dũng',
  },
  {
    id: 'XE-0002',
    name: 'Isuzu NQR 550',
    plate: '51C-284.19',
    bodyType: 'thung_kin',
    innerLengthMm: 5700,
    innerWidthMm: 2100,
    innerHeightMm: 2150,
    payloadKg: 5500,
    frontAxle: { loadKg: 0, capacityKg: 2400 },
    rearAxle: { loadKg: 0, capacityKg: 3400 },
    status: 'san_sang',
    depot: 'Kho Long Bình',
    assignedDriver: 'Ngô Văn Bảo',
  },
  {
    id: 'XE-0003',
    name: 'Hino FC9J',
    plate: '51C-190.07',
    bodyType: 'thung_bat',
    innerLengthMm: 6200,
    innerWidthMm: 2200,
    innerHeightMm: 2200,
    payloadKg: 6400,
    frontAxle: { loadKg: 0, capacityKg: 2800 },
    rearAxle: { loadKg: 0, capacityKg: 3900 },
    status: 'bao_duong',
    depot: 'Kho Sóng Thần',
    assignedDriver: null,
  },
  {
    id: 'XE-0004',
    name: 'Thaco Ollin 720',
    plate: '51D-118.62',
    bodyType: 'thung_bat',
    innerLengthMm: 6100,
    innerWidthMm: 2100,
    innerHeightMm: 2100,
    payloadKg: 7200,
    frontAxle: { loadKg: 0, capacityKg: 3000 },
    rearAxle: { loadKg: 0, capacityKg: 4400 },
    status: 'san_sang',
    depot: 'Kho Sóng Thần',
    assignedDriver: 'Đặng Hoài Nam',
  },
  {
    id: 'XE-0005',
    name: 'Container 40 HC',
    plate: '51R-772.40',
    bodyType: 'container',
    innerLengthMm: 12030,
    innerWidthMm: 2350,
    innerHeightMm: 2690,
    payloadKg: 28000,
    frontAxle: { loadKg: 0, capacityKg: 9000 },
    rearAxle: { loadKg: 0, capacityKg: 19000 },
    status: 'ngung',
    depot: 'Cảng Cát Lái',
    assignedDriver: null,
  },
]

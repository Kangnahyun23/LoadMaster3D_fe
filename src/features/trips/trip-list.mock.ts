import type { TripStatus } from '@/types/trip'

/** Một dòng trong danh sách chuyến. */
export type TripSummary = {
  id: string
  date: string
  plate: string
  truck: string
  /** Kho xuất phát → các điểm giao, rút gọn */
  route: string
  stopCount: number
  /** Tỷ lệ lấp đầy theo phương án, %; null khi chưa tối ưu */
  fillRate: number | null
  status: TripStatus
}

export const TRIPS: TripSummary[] = [
  { id: 'TRIP-2026-0914', date: '14/09/2026', plate: '60C-446.32', truck: 'Hyundai HD210', route: 'Kho Long Bình → Q.7 → Thủ Dầu Một → Dĩ An → Biên Hoà', stopCount: 4, fillRate: 87.4, status: 'da_toi_uu' },
  { id: 'TRIP-2026-0913', date: '13/09/2026', plate: '51C-284.19', truck: 'Isuzu NQR 550', route: 'Kho Long Bình → Q.9 → Q.12', stopCount: 2, fillRate: null, status: 'nhap' },
  { id: 'TRIP-2026-0912', date: '12/09/2026', plate: '51D-118.62', truck: 'Thaco Ollin 720', route: 'Kho Sóng Thần → Bình Chánh → Củ Chi → Hóc Môn', stopCount: 3, fillRate: 81.9, status: 'dang_toi_uu' },
  { id: 'TRIP-2026-0911', date: '11/09/2026', plate: '60C-446.32', truck: 'Hyundai HD210', route: 'Kho Long Bình → Q.7 → Nhà Bè → Cần Giuộc', stopCount: 3, fillRate: 86.1, status: 'dang_giao' },
  { id: 'TRIP-2026-0910', date: '10/09/2026', plate: '51C-284.19', truck: 'Isuzu NQR 550', route: 'Kho Long Bình → Thủ Đức → Dĩ An', stopCount: 2, fillRate: 84.2, status: 'hoan_thanh' },
  { id: 'TRIP-2026-0909', date: '09/09/2026', plate: '51C-190.07', truck: 'Hino FC9J', route: 'Kho Sóng Thần → Biên Hoà → Long Thành → Nhơn Trạch', stopCount: 3, fillRate: 82.3, status: 'can_xem_lai' },
  { id: 'TRIP-2026-0908', date: '08/09/2026', plate: '60C-446.32', truck: 'Hyundai HD210', route: 'Kho Long Bình → Q.1 → Q.3 → Q.10 → Tân Bình', stopCount: 4, fillRate: 83.0, status: 'hoan_thanh' },
  { id: 'TRIP-2026-0907', date: '07/09/2026', plate: '51D-118.62', truck: 'Thaco Ollin 720', route: 'Kho Sóng Thần → Bến Cát → Tân Uyên', stopCount: 2, fillRate: 76.8, status: 'da_huy' },
]

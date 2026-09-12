import { LOAD_PLAN } from '@/lib/load-plan.mock'

/**
 * Điểm giao 2/4 của TRIP-2026-0914 nhìn từ phía tài xế.
 * Danh sách kiện lấy từ phương án (điểm 2), mô tả hàng hoá theo đơn.
 */

export type DeliveryItem = {
  id: string
  orderId: string
  description: string
  /** Vị trí trong thùng, để tài xế tìm nhanh */
  where: string
}

export type DeliveryStop = {
  number: number
  totalStops: number
  customer: string
  address: string
  phone: string
  items: DeliveryItem[]
  /** Kiện đã dỡ trước khi mở màn */
  initiallyDone: string[]
  /** Kiện khách từ chối nhận */
  rejected: string[]
  /** Thao tác ghi khi mất mạng, chờ đồng bộ */
  pendingSyncCount: number
}

const STOP_NUMBER = 2

/** Mặt hàng theo đơn của Co.opmart Bình Dương, xoay vòng cho từng kiện. */
const GOODS_BY_ORDER: Record<string, string[]> = {
  'DH-51031': [
    'Thùng sữa tươi 12 hộp',
    'Thùng mì gói 30 gói',
    'Nước suối 24 chai',
    'Dầu ăn 5 L × 4 can',
    'Bánh kẹo tổng hợp',
  ],
  'DH-51032': [
    'Gạo 25 kg',
    'Nước giặt 3,8 L × 6',
    'Giấy vệ sinh 10 cuộn × 4',
    'Nước mắm 900 ml × 12',
    'Cà phê hoà tan 50 gói',
  ],
}

function whereText(x: number, z: number, lengthMm: number): string {
  const area = x + lengthMm > 5500 ? 'Gần cửa' : x < 1500 ? 'Sát vách trước' : 'Giữa xe'
  const layer = z === 0 ? 'sàn' : z < 900 ? 'lớp dưới' : 'lớp trên'
  return `${area}, ${layer}`
}

const items: DeliveryItem[] = LOAD_PLAN.placements
  .filter((p) => p.stop === STOP_NUMBER)
  .sort((a, b) => b.step - a.step) // kiện gần cửa (xếp sau) dỡ trước
  .map((p, index) => {
    const goods = GOODS_BY_ORDER[p.orderId] ?? ['Hàng tổng hợp']
    return {
      id: p.id,
      orderId: p.orderId,
      description: goods[index % goods.length] ?? 'Hàng tổng hợp',
      where: whereText(p.position.x, p.position.z, p.lengthMm),
    }
  })

const ids = items.map((i) => i.id)

export const DELIVERY_STOP: DeliveryStop = {
  number: STOP_NUMBER,
  totalStops: 4,
  customer: 'Siêu thị Co.opmart Bình Dương',
  address: '30 Đại lộ Bình Dương, Thủ Dầu Một',
  phone: '0274 3822 190',
  items,
  initiallyDone: [...ids.slice(0, 3), ...ids.slice(30, 36)],
  rejected: ids.slice(3, 4),
  pendingSyncCount: 3,
}

import type { IsoBox } from '@/lib/isometric'
import { stopColor } from '@/lib/stops'

/** Ba phương án đã chạy cho TRIP-2026-0914, lấy từ bản design. */

export type PlanKey = 'A' | 'B' | 'C'

/** Cách bộ tối ưu xếp hàng — quyết định dáng ảnh thu nhỏ. */
export type PackingStyle = 'heuristic' | 'ga' | 'lifo'

export type PlanSummary = {
  key: PlanKey
  name: string
  algorithm: string
  style: PackingStyle
  placedCount: number
  totalCount: number
  /** Tỷ lệ lấp đầy, % */
  fillRate: number
  weightKg: number
  unplacedCount: number
  runtimeSeconds: number
  /** Tuân thủ thứ tự dỡ hàng (điểm giao đầu ở gần cửa) */
  lifoCompliant: boolean
}

export const PAYLOAD_KG = 9500
export const ORDER_COUNT = 7

export const PLANS: PlanSummary[] = [
  {
    key: 'A',
    name: 'Phương án A',
    algorithm: 'Heuristic cơ bản',
    style: 'heuristic',
    placedCount: 127,
    totalCount: 132,
    fillRate: 82.1,
    weightKg: 7640,
    unplacedCount: 5,
    runtimeSeconds: 8,
    lifoCompliant: false,
  },
  {
    key: 'B',
    name: 'Phương án B',
    algorithm: 'GA 500 thế hệ',
    style: 'ga',
    placedCount: 132,
    totalCount: 132,
    fillRate: 89.6,
    weightKg: 8240,
    unplacedCount: 0,
    runtimeSeconds: 47,
    lifoCompliant: false,
  },
  {
    key: 'C',
    name: 'Phương án C',
    algorithm: 'GA có ràng buộc LIFO',
    style: 'lifo',
    placedCount: 132,
    totalCount: 132,
    fillRate: 87.4,
    weightKg: 8240,
    unplacedCount: 0,
    runtimeSeconds: 42,
    lifoCompliant: true,
  },
]

export const DEFAULT_PLAN_KEY: PlanKey = 'C'

/** Giá trị tốt nhất của từng chỉ số, để tô nền và gắn dấu tích. */
export function bestValues(plans: PlanSummary[]) {
  return {
    fillRate: Math.max(...plans.map((p) => p.fillRate)),
    weightKg: Math.max(...plans.map((p) => p.weightKg)),
    unplacedCount: Math.min(...plans.map((p) => p.unplacedCount)),
    runtimeSeconds: Math.min(...plans.map((p) => p.runtimeSeconds)),
  }
}

/* ---------- ảnh thu nhỏ ---------- */

export const THUMBNAIL_CONTAINER = { length: 7.2, width: 2.35, height: 2.4 }

const COLUMN_LENGTHS = [0.78, 0.82, 0.58, 0.66, 0.6, 0.7, 0.62, 0.68, 0.7, 0.6]
const ROWS: Array<[y: number, width: number]> = [
  [0.05, 0.72],
  [0.82, 0.74],
  [1.61, 0.7],
]

/** Số điểm giao theo vị trí dọc thùng khi xếp LIFO: sâu nhất là điểm 4. */
function stopByPosition(x: number): number {
  if (x < 1.7) return 4
  if (x < 3.7) return 3
  if (x < 5.7) return 2
  return 1
}

/**
 * Sinh khối hàng cho ảnh thu nhỏ, khác nhau theo cách xếp:
 * heuristic bỏ trống vài chỗ và trộn điểm giao, GA xếp kín nhưng trộn
 * điểm giao, LIFO xếp theo điểm giao từ sâu ra cửa.
 */
export function thumbnailBoxes(style: PackingStyle): IsoBox[] {
  const boxes: IsoBox[] = []
  let x = 0.06

  COLUMN_LENGTHS.forEach((columnLength, ci) => {
    if (x + columnLength > THUMBNAIL_CONTAINER.length - 0.05) return

    ROWS.forEach(([y, width], ri) => {
      const stop =
        style === 'lifo'
          ? stopByPosition(x)
          : ((ci * 7 + ri * 3 + (style === 'heuristic' ? 1 : 0)) % 4) + 1
      const color = stopColor(stop)

      const skipBottom =
        style === 'heuristic' &&
        ((ci === 3 && ri === 1) || (ci === 6 && ri === 2) || (ci === 8 && ri === 0))
      const baseHeight = 0.98 + ((ci + ri) % 2) * 0.1

      if (!skipBottom) {
        boxes.push({ x, y, z: 0, length: columnLength, width, height: baseHeight, color })
      }

      const hasUpper =
        style === 'heuristic'
          ? (ci + ri) % 3 !== 0 && !skipBottom && ci < 8
          : style === 'ga'
            ? !(ci === 9 && ri === 1)
            : !(ci >= 8 && ri === 1)

      if (hasUpper) {
        boxes.push({
          x,
          y,
          z: baseHeight + 0.02,
          length: columnLength,
          width,
          height: 0.8 + ((ci + ri + 1) % 2) * 0.12,
          color,
        })
      }
    })

    x += columnLength + 0.06
  })

  return boxes
}

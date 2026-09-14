import { Color } from 'three'
import { stopColor } from '@/lib/stops'
import { readToken } from '@/lib/tokens'
import type { ColorMode, Placement } from '@/types/load-plan'

/**
 * Màu kiện theo chế độ tô:
 * - theo điểm giao: 8 màu Okabe–Ito, đúng vai trò định danh điểm giao (mục 5)
 * - theo đơn hàng: giữ sắc của điểm giao, đổi độ sáng theo đơn trong điểm đó,
 *   nên vẫn đọc được điểm giao mà không cần thêm bảng màu mới
 * - theo khối lượng: dải một sắc từ `--primary-bg` tới `--primary` rồi tối dần,
 *   toàn bộ suy ra từ token
 */

export type ColorContext = {
  orderIndexByStop: Map<string, number>
  orderCountByStop: Map<number, number>
  minWeightKg: number
  maxWeightKg: number
}

export function createColorContext(plan: { placements: readonly Placement[] }): ColorContext {
  const orderIndexByStop = new Map<string, number>()
  const orderCountByStop = new Map<number, number>()

  for (const p of plan.placements) {
    if (orderIndexByStop.has(p.orderId)) continue
    const index = orderCountByStop.get(p.stop) ?? 0
    orderIndexByStop.set(p.orderId, index)
    orderCountByStop.set(p.stop, index + 1)
  }

  const weights = plan.placements.map((p) => p.weightKg)
  return {
    orderIndexByStop,
    orderCountByStop,
    minWeightKg: weights.length ? Math.min(...weights) : 0,
    maxWeightKg: weights.length ? Math.max(...weights) : 0,
  }
}

const scratch = new Color()
const scratchLight = new Color()
const scratchDark = new Color()

export function weightColor(t: number): string {
  scratchLight.set(readToken('--primary-bg') || '#eff6ff')
  scratch.set(readToken('--primary') || '#2563eb')
  scratchDark.copy(scratch).multiplyScalar(0.55)

  // Đầu nhẹ không bắt đầu từ nền nhạt thuần để kiện nhẹ nhất vẫn có mặt/cạnh
  // phân biệt được trên canvas tối. Nửa đầu: nhạt → primary. Nửa sau: primary → tối.
  const eased = 0.18 + t * 0.82
  if (eased < 0.6) {
    return `#${scratchLight.lerp(scratch, eased / 0.6).getHexString()}`
  }
  return `#${scratch.lerp(scratchDark, (eased - 0.6) / 0.4).getHexString()}`
}

export function placementColor(
  placement: Placement,
  mode: ColorMode,
  context: ColorContext,
): string {
  switch (mode) {
    case 'diem-giao':
      return stopColor(placement.stop)

    case 'don-hang': {
      const index = context.orderIndexByStop.get(placement.orderId) ?? 0
      const count = context.orderCountByStop.get(placement.stop) ?? 1
      // Đơn đầu giữ nguyên màu, các đơn sau tối dần từng nấc.
      const factor = count <= 1 ? 1 : 1 - (index / (count - 1)) * 0.35
      scratch.set(stopColor(placement.stop)).multiplyScalar(factor)
      return `#${scratch.getHexString()}`
    }

    case 'khoi-luong': {
      const range = context.maxWeightKg - context.minWeightKg || 1
      const t = (placement.weightKg - context.minWeightKg) / range
      return weightColor(t)
    }
  }
}

/** Làm tối màu cho kiện nằm ngoài lát cắt, khớp mức 45% của bản design. */
export function dimColor(hex: string): string {
  scratch.set(hex).multiplyScalar(0.45)
  return `#${scratch.getHexString()}`
}

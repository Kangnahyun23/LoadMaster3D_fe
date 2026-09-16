import { Color } from 'three'
import { stopColor } from '@/lib/stops'
import { readToken } from '@/lib/tokens'
import type { ColorMode } from '@/features/viewer3d/viewer-types'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'

/**
 * Màu kiện theo chế độ tô:
 * - theo điểm giao: 8 màu Okabe–Ito, đúng vai trò định danh điểm giao (mục 5)
 * - theo kiện gốc (LM-030, contract không có đơn hàng): giữ sắc của điểm giao, đổi độ sáng theo `packageId` trong điểm đó,
 *   nên vẫn đọc được điểm giao mà không cần thêm bảng màu mới
 * - theo khối lượng: dải một sắc từ `--primary-bg` tới `--primary` rồi tối dần,
 *   toàn bộ suy ra từ token
 */

export type ColorContext = {
  packageIndexById: Map<string, number>
  packageCountByStop: Map<number, number>
  minWeightKg: number
  maxWeightKg: number
}

export function createColorContext(plan: { placements: readonly ScenePlacement[] }): ColorContext {
  const packageIndexById = new Map<string, number>()
  const packageCountByStop = new Map<number, number>()

  for (const p of plan.placements) {
    if (packageIndexById.has(p.packageId)) continue
    const index = packageCountByStop.get(p.stop) ?? 0
    packageIndexById.set(p.packageId, index)
    packageCountByStop.set(p.stop, index + 1)
  }

  const weights = plan.placements.map((p) => p.weightKg)
  return {
    packageIndexById,
    packageCountByStop,
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
  placement: ScenePlacement,
  mode: ColorMode,
  context: ColorContext,
): string {
  switch (mode) {
    case 'diem-giao':
      return stopColor(placement.stop)

    case 'kien-goc': {
      const index = context.packageIndexById.get(placement.packageId) ?? 0
      const count = context.packageCountByStop.get(placement.stop) ?? 1
      // Kiện gốc đầu giữ nguyên màu, các kiện gốc sau tối dần từng nấc.
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

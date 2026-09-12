import { formatDimensions } from '@/lib/format'
import { findBelow, layerOf, PACKAGING_LABELS } from '@/lib/placement'
import type { Orientation, Placement, VehicleSpec } from '@/types/load-plan'

/** Câu chữ hướng dẫn cho công nhân kho, suy ra từ dữ liệu phương án. */

const ORIENTATION_TEXT: Record<Orientation, string> = {
  0: 'Nằm ngang, mặt dài hướng ra cửa',
  1: 'Nằm ngang, mặt ngắn hướng ra cửa',
  2: 'Dựng đứng, mặt cao hướng ra cửa',
}

/** Khe hở giữa hai kiện trong cùng hàng, khớp bộ xếp mẫu. */
const ROW_GAP_MM = 20

export type StepNote = {
  tone: 'warning' | 'neutral'
  text: string
}

export function describePosition(
  p: Placement,
  all: Placement[],
  vehicle: VehicleSpec,
): string {
  const row = Math.floor(p.position.y / (p.widthMm + ROW_GAP_MM)) + 1
  const layer = layerOf(p, all)
  const below = findBelow(p, all)

  let third: string
  // Gạch nối không ngắt để mã kiện không bị bẻ đôi khi ô hẹp.
  if (below) third = `Trên ${below.id.replace('-', '‑')}`
  else if (p.position.y <= ROW_GAP_MM) third = 'Sát vách trái'
  else if (p.position.y + p.widthMm >= vehicle.innerWidthMm - ROW_GAP_MM) third = 'Sát vách phải'
  else third = 'Giữa thùng'

  return `Hàng ${row}, Lớp ${layer}, ${third}`
}

export function describeOrientation(p: Placement): string {
  return ORIENTATION_TEXT[p.orientation]
}

export function stepNote(p: Placement, all: Placement[]): StepNote {
  if (p.fragile) {
    return { tone: 'warning', text: 'Dễ vỡ — không đặt vật nặng lên trên' }
  }
  const below = findBelow(p, all)
  if (below?.fragile) {
    return { tone: 'neutral', text: 'Nhẹ — được đặt lên kiện dễ vỡ' }
  }
  if (p.weightKg >= 50) {
    return { tone: 'neutral', text: 'Nặng — hai người khiêng hoặc dùng xe nâng tay' }
  }
  return { tone: 'neutral', text: 'Mặt có nhãn hướng lên, đặt khít kiện bên cạnh' }
}

export function describeDimensions(p: Placement): string {
  return `${PACKAGING_LABELS[p.packaging]} ${formatDimensions(p.lengthMm, p.widthMm, p.heightMm)}`
}

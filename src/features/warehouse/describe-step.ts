import { formatDimensions, formatInteger } from '@/lib/format'
import { findBelow, layerOf, PACKAGING_LABELS } from '@/lib/placement'
import type { Orientation, Placement, VehicleSpec } from '@/types/load-plan'

/** Câu chữ hướng dẫn cho công nhân kho, suy ra từ dữ liệu phương án. */

const ORIENTATION_TEXT: Record<Orientation, string> = {
  0: 'Hướng chuẩn · D×R×C',
  1: 'Đổi dài/rộng · R×D×C',
  2: 'Đổi dài/cao · C×R×D',
}

export type StepNote = {
  tone: 'warning' | 'neutral'
  text: string
}

export function describePosition(
  p: Placement,
  all: Placement[],
  vehicle: VehicleSpec,
): string {
  const layer = layerOf(p, all)
  const below = findBelow(p, all)
  const rear = vehicle.innerLengthMm - p.position.x - p.lengthMm
  return `Lớp ${layer} · Cách cửa ${formatInteger(rear)} mm${below ? ` · Phía dưới: ${below.id}` : ''}`
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
    return { tone: 'warning', text: 'Phía dưới có kiện dễ vỡ — kiểm tra cách nâng đỡ' }
  }
  if (p.weightKg >= 50) {
    return { tone: 'neutral', text: 'Nặng — hai người khiêng hoặc dùng xe nâng tay' }
  }
  return { tone: 'neutral', text: 'Mặt có nhãn hướng lên, đặt khít kiện bên cạnh' }
}

export function describeDimensions(p: Placement): string {
  return `${PACKAGING_LABELS[p.packaging]} ${formatDimensions(p.lengthMm, p.widthMm, p.heightMm)}`
}

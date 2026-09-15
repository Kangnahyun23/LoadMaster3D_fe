import type { ScenePlacement, PositionCm } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { roundCm } from '@/domain/geometry'
import { formatRatioAsPercent } from '@/lib/format'

export type Axis = keyof PositionCm
export const AXES: readonly Axis[] = ['x', 'y', 'z']
export const EDITOR_RULES = Object.freeze({
  gridCm: 5, snapThresholdCm: 2, contactToleranceCm: 0.2, supportWarningRatio: 0.8,
  historyLimit: 200,
})
/** LM-034: nút dịch chuyển đi đúng 1, 5 hoặc 10 cm. */
export const EDITOR_NUDGE_STEPS_CM = [1, 5, 10] as const
export const extent = (p: ScenePlacement, axis: Axis) =>
  axis === 'x' ? p.lengthCm : axis === 'y' ? p.widthCm : p.heightCm
export const limit = (v: VehicleConfig, axis: Axis) =>
  axis === 'x' ? v.innerLengthCm : axis === 'y' ? v.innerWidthCm : v.innerHeightCm
export const overlapsAxis = (a: ScenePlacement, b: ScenePlacement, axis: Axis) =>
  a.position[axis] < b.position[axis] + extent(b, axis) &&
  b.position[axis] < a.position[axis] + extent(a, axis)
export const overlaps = (a: ScenePlacement, b: ScenePlacement) => AXES.every((axis) => overlapsAxis(a, b, axis))
/** Editor commit đi qua `roundCm` (bội 0,1 cm) tại biên, không làm tròn giữa gesture. */
export const roundPosition = (p: PositionCm): { x: number; y: number; z: number } =>
  ({ x: roundCm(p.x), y: roundCm(p.y), z: roundCm(p.z) })

type Rectangle = { x1: number; x2: number; y1: number; y2: number }

/** Union of clipped footprints: shared/overlapping surfaces never count twice. */
function unionArea(rects: Rectangle[]): number {
  const xs = [...new Set(rects.flatMap((r) => [r.x1, r.x2]))].sort((a, b) => a - b)
  let area = 0
  for (let i = 1; i < xs.length; i++) {
    const x1 = xs[i - 1]!, x2 = xs[i]!
    const intervals = rects.filter((r) => r.x1 < x2 && r.x2 > x1).sort((a, b) => a.y1 - b.y1)
    let covered = 0, end = -Infinity
    for (const r of intervals) {
      covered += Math.max(0, r.y2 - Math.max(end, r.y1))
      end = Math.max(end, r.y2)
    }
    area += (x2 - x1) * covered
  }
  return area
}

export function supportCoverage(p: ScenePlacement, placements: readonly ScenePlacement[]) {
  if (p.position.z >= 0 && p.position.z <= EDITOR_RULES.contactToleranceCm) {
    return { ratio: 1, supportingIds: [] as string[], fragileIds: [] as string[] }
  }
  const supporting = placements.filter((q) => q.id !== p.id &&
    Math.abs(q.position.z + q.heightCm - p.position.z) <= EDITOR_RULES.contactToleranceCm &&
    q.position.z < p.position.z && overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y'))
  const rects = supporting.map((q) => ({
    x1: Math.max(p.position.x, q.position.x), x2: Math.min(p.position.x + p.lengthCm, q.position.x + q.lengthCm),
    y1: Math.max(p.position.y, q.position.y), y2: Math.min(p.position.y + p.widthCm, q.position.y + q.widthCm),
  }))
  return {
    ratio: Math.min(1, unionArea(rects) / (p.lengthCm * p.widthCm)),
    supportingIds: supporting.map((q) => q.id), fragileIds: supporting.filter((q) => q.fragile).map((q) => q.id),
  }
}

export type GeometryResult = {
  valid: boolean
  errors: string[]
  advisories: string[]
  supportRatio: number
  overlapIds: string[]
}

/** Editor assistance only; neither support coverage nor fragile contact solves stability. */
export function validatePlacement(
  p: ScenePlacement, placements: readonly ScenePlacement[], vehicle: VehicleConfig, manuallyChanged = false,
): GeometryResult {
  const errors: string[] = []
  if (AXES.some((axis) => !Number.isFinite(p.position[axis]) || p.position[axis] !== roundCm(p.position[axis]) ||
    !Number.isFinite(extent(p, axis)) || extent(p, axis) <= 0)) {
    return { valid: false, errors: ['Vị trí phải là bội 0,1 cm và kích thước phải lớn hơn 0.'], advisories: [], supportRatio: 0, overlapIds: [] }
  }
  if (p.position.x < 0) errors.push('Vượt vách trước')
  if (p.position.x + p.lengthCm > vehicle.innerLengthCm) errors.push('Vượt cửa sau')
  if (p.position.y < 0 || p.position.y + p.widthCm > vehicle.innerWidthCm) errors.push('Vượt vách bên')
  if (p.position.z < 0) errors.push('Thấp hơn sàn')
  if (p.position.z + p.heightCm > vehicle.innerHeightCm) errors.push('Vượt trần thùng')
  const overlapIds: string[] = []
  for (const q of placements) if (q.id !== p.id && overlaps(p, q)) overlapIds.push(q.id)
  if (overlapIds.length) errors.push(`Chồng lấn ${overlapIds.slice(0, 3).join(', ')}${overlapIds.length > 3 ? '…' : ''}`)
  const support = supportCoverage(p, placements)
  const advisories: string[] = []
  if (support.ratio < EDITOR_RULES.supportWarningRatio) {
    advisories.push(`Đáy chỉ được nâng đỡ ${formatRatioAsPercent(support.ratio)}`)
  }
  if (support.fragileIds.length) advisories.push(`Đặt trên kiện dễ vỡ: ${support.fragileIds.slice(0, 3).join(', ')}`)
  if (p.fragile && placements.some((q) => q.id !== p.id && q.position.z > p.position.z &&
    Math.abs(q.position.z - p.position.z - p.heightCm) <= EDITOR_RULES.contactToleranceCm &&
    overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y'))) advisories.push('Kiện dễ vỡ đang đỡ hàng phía trên')
  if (manuallyChanged) advisories.push('Vị trí hoặc hướng đặt đã chỉnh thủ công')
  return { valid: errors.length === 0, errors, advisories, supportRatio: support.ratio, overlapIds }
}

import type { Placement, PositionMm, VehicleSpec } from '@/types/load-plan'
import { formatRatioAsPercent } from '../../../lib/format.ts'

export type Axis = keyof PositionMm
export const AXES: readonly Axis[] = ['x', 'y', 'z']
export const EDITOR_RULES = Object.freeze({
  gridMm: 50, snapThresholdMm: 20, contactToleranceMm: 2, supportWarningRatio: 0.8,
  historyLimit: 200,
})
export const extent = (p: Placement, axis: Axis) =>
  axis === 'x' ? p.lengthMm : axis === 'y' ? p.widthMm : p.heightMm
export const limit = (v: VehicleSpec, axis: Axis) =>
  axis === 'x' ? v.innerLengthMm : axis === 'y' ? v.innerWidthMm : v.innerHeightMm
export const overlapsAxis = (a: Placement, b: Placement, axis: Axis) =>
  a.position[axis] < b.position[axis] + extent(b, axis) &&
  b.position[axis] < a.position[axis] + extent(a, axis)
export const overlaps = (a: Placement, b: Placement) => AXES.every((axis) => overlapsAxis(a, b, axis))
export const integerPosition = (p: PositionMm): PositionMm =>
  ({ x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) })

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

export function supportCoverage(p: Placement, placements: readonly Placement[]) {
  if (p.position.z >= 0 && p.position.z <= EDITOR_RULES.contactToleranceMm) {
    return { ratio: 1, supportingIds: [] as string[], fragileIds: [] as string[] }
  }
  const supporting = placements.filter((q) => q.id !== p.id &&
    Math.abs(q.position.z + q.heightMm - p.position.z) <= EDITOR_RULES.contactToleranceMm &&
    q.position.z < p.position.z && overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y'))
  const rects = supporting.map((q) => ({
    x1: Math.max(p.position.x, q.position.x), x2: Math.min(p.position.x + p.lengthMm, q.position.x + q.lengthMm),
    y1: Math.max(p.position.y, q.position.y), y2: Math.min(p.position.y + p.widthMm, q.position.y + q.widthMm),
  }))
  return {
    ratio: Math.min(1, unionArea(rects) / (p.lengthMm * p.widthMm)),
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
  p: Placement, placements: readonly Placement[], vehicle: VehicleSpec, manuallyChanged = false,
): GeometryResult {
  const errors: string[] = []
  if (AXES.some((axis) => !Number.isFinite(p.position[axis]) || !Number.isInteger(p.position[axis]) ||
    !Number.isFinite(extent(p, axis)) || extent(p, axis) <= 0)) {
    return { valid: false, errors: ['Vị trí phải là số mm nguyên và kích thước phải lớn hơn 0.'], advisories: [], supportRatio: 0, overlapIds: [] }
  }
  if (p.position.x < 0) errors.push('Vượt vách trước')
  if (p.position.x + p.lengthMm > vehicle.innerLengthMm) errors.push('Vượt cửa sau')
  if (p.position.y < 0 || p.position.y + p.widthMm > vehicle.innerWidthMm) errors.push('Vượt vách bên')
  if (p.position.z < 0) errors.push('Thấp hơn sàn')
  if (p.position.z + p.heightMm > vehicle.innerHeightMm) errors.push('Vượt trần thùng')
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
    Math.abs(q.position.z - p.position.z - p.heightMm) <= EDITOR_RULES.contactToleranceMm &&
    overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y'))) advisories.push('Kiện dễ vỡ đang đỡ hàng phía trên')
  if (manuallyChanged) advisories.push('Vị trí hoặc hướng đặt đã chỉnh thủ công')
  return { valid: errors.length === 0, errors, advisories, supportRatio: support.ratio, overlapIds }
}

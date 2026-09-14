import type { Placement, PositionMm, VehicleSpec } from '@/types/load-plan'
import { AXES, extent, overlapsAxis } from './geometry'
import type { SnapTarget } from './snapping'

export type FeedbackBox = { position: PositionMm; lengthMm: number; widthMm: number; heightMm: number }
export type MeasurementGuide = { from: PositionMm; to: PositionMm; label: string; mm: number }
export function editorMeasurements(p: Placement, placements: readonly Placement[], v: VehicleSpec): MeasurementGuide[] {
  const center = { x: p.position.x + p.lengthMm / 2, y: p.position.y + p.widthMm / 2, z: p.position.z }
  const rear = v.innerLengthMm - p.position.x - p.lengthMm < p.position.x
  const right = v.innerWidthMm - p.position.y - p.widthMm < p.position.y
  const below = placements.filter((q) => q.id !== p.id && q.position.z + q.heightMm <= p.position.z &&
    overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y')).sort((a, b) => b.position.z + b.heightMm - a.position.z - a.heightMm)[0]
  const level = below ? below.position.z + below.heightMm : 0
  return [
    { from: { ...center, x: rear ? p.position.x + p.lengthMm : p.position.x }, to: { ...center, x: rear ? v.innerLengthMm : 0 }, label: rear ? 'Cửa' : 'Vách trước', mm: rear ? v.innerLengthMm - p.position.x - p.lengthMm : p.position.x },
    { from: { ...center, y: right ? p.position.y + p.widthMm : p.position.y }, to: { ...center, y: right ? v.innerWidthMm : 0 }, label: right ? 'Vách phải' : 'Vách trái', mm: right ? v.innerWidthMm - p.position.y - p.widthMm : p.position.y },
    { from: center, to: { ...center, z: level }, label: below ? 'Mặt đỡ' : 'Sàn', mm: p.position.z - level },
  ]
}

export function snapFeedbackBoxes(p: Placement, targets: readonly SnapTarget[], placements: readonly Placement[]): FeedbackBox[] {
  return targets.slice(0, 3).map((target) => {
    const face = placements.find((q) => q.id === target.placementId) ?? p
    const position = { ...face.position, [target.axis]: target.coordinateMm - 2 }
    return { position, lengthMm: target.axis === 'x' ? 4 : face.lengthMm,
      widthMm: target.axis === 'y' ? 4 : face.widthMm, heightMm: target.axis === 'z' ? 4 : face.heightMm }
  })
}

/** Intersections only; at most four regions are rendered, all IDs remain in validation text. */
export function overlapRegions(p: Placement, placements: readonly Placement[], ids: readonly string[]): FeedbackBox[] {
  return ids.slice(0, 4).flatMap((id) => {
    const q = placements.find((p) => p.id === id)
    if (!q) return []
    const position = { x: 0, y: 0, z: 0 }, dimensions = { x: 0, y: 0, z: 0 }
    for (const axis of AXES) {
      position[axis] = Math.max(p.position[axis], q.position[axis])
      dimensions[axis] = Math.max(0, Math.min(p.position[axis] + extent(p, axis), q.position[axis] + extent(q, axis)) - position[axis])
    }
    return [{ position, lengthMm: dimensions.x, widthMm: dimensions.y, heightMm: dimensions.z }]
  })
}

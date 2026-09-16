import type { ScenePlacement, PositionCm } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { AXES, extent, overlapsAxis } from './geometry'
import type { SnapTarget } from './snapping'

export type FeedbackBox = { position: PositionCm; lengthCm: number; widthCm: number; heightCm: number }
/** Mã nhãn đường đo, dịch ở `viewer.editor.guides` (LM-070). */
export type MeasurementLabel = 'door' | 'frontWall' | 'rightWall' | 'leftWall' | 'support' | 'floor'
export type MeasurementGuide = { from: PositionCm; to: PositionCm; label: MeasurementLabel; cm: number }
export function editorMeasurements(p: ScenePlacement, placements: readonly ScenePlacement[], v: VehicleConfig): MeasurementGuide[] {
  const center = { x: p.position.x + p.lengthCm / 2, y: p.position.y + p.widthCm / 2, z: p.position.z }
  const rear = v.innerLengthCm - p.position.x - p.lengthCm < p.position.x
  const right = v.innerWidthCm - p.position.y - p.widthCm < p.position.y
  const below = placements.filter((q) => q.id !== p.id && q.position.z + q.heightCm <= p.position.z &&
    overlapsAxis(p, q, 'x') && overlapsAxis(p, q, 'y')).sort((a, b) => b.position.z + b.heightCm - a.position.z - a.heightCm)[0]
  const level = below ? below.position.z + below.heightCm : 0
  return [
    { from: { ...center, x: rear ? p.position.x + p.lengthCm : p.position.x }, to: { ...center, x: rear ? v.innerLengthCm : 0 }, label: rear ? 'door' : 'frontWall', cm: rear ? v.innerLengthCm - p.position.x - p.lengthCm : p.position.x },
    { from: { ...center, y: right ? p.position.y + p.widthCm : p.position.y }, to: { ...center, y: right ? v.innerWidthCm : 0 }, label: right ? 'rightWall' : 'leftWall', cm: right ? v.innerWidthCm - p.position.y - p.widthCm : p.position.y },
    { from: center, to: { ...center, z: level }, label: below ? 'support' : 'floor', cm: p.position.z - level },
  ]
}

export function snapFeedbackBoxes(p: ScenePlacement, targets: readonly SnapTarget[], placements: readonly ScenePlacement[]): FeedbackBox[] {
  return targets.slice(0, 3).map((target) => {
    const face = placements.find((q) => q.id === target.placementId) ?? p
    const position = { ...face.position, [target.axis]: target.coordinateCm - 0.2 }
    return { position, lengthCm: target.axis === 'x' ? 0.4 : face.lengthCm,
      widthCm: target.axis === 'y' ? 0.4 : face.widthCm, heightCm: target.axis === 'z' ? 0.4 : face.heightCm }
  })
}

/** Intersections only; at most four regions are rendered, all IDs remain in validation text. */
export function overlapRegions(p: ScenePlacement, placements: readonly ScenePlacement[], ids: readonly string[]): FeedbackBox[] {
  return ids.slice(0, 4).flatMap((id) => {
    const q = placements.find((p) => p.id === id)
    if (!q) return []
    const position = { x: 0, y: 0, z: 0 }, dimensions = { x: 0, y: 0, z: 0 }
    for (const axis of AXES) {
      position[axis] = Math.max(p.position[axis], q.position[axis])
      dimensions[axis] = Math.max(0, Math.min(p.position[axis] + extent(p, axis), q.position[axis] + extent(q, axis)) - position[axis])
    }
    return [{ position, lengthCm: dimensions.x, widthCm: dimensions.y, heightCm: dimensions.z }]
  })
}

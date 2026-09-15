import type { ScenePlacement, PositionCm } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { AXES, EDITOR_RULES, extent, limit, roundPosition, type Axis } from './geometry'
export type SnapTarget = { axis: Axis; coordinateCm: number; source: string; placementId?: string }

/** All thresholds and face distances are cm. Fixed axes stay fixed during a gesture. */
export function snapPosition(
  p: ScenePlacement, requested: PositionCm, placements: readonly ScenePlacement[], vehicle: VehicleConfig,
  axes: readonly Axis[] = AXES,
): { position: PositionCm; sources: string[]; targets: SnapTarget[] } {
  const position = roundPosition(requested)
  const sources: string[] = []
  const targets: SnapTarget[] = []
  for (const axis of axes) {
    const size = extent(p, axis)
    const candidates: { value: number; coordinateCm: number; source: string; placementId?: string }[] = [
      { value: 0, coordinateCm: 0, source: axis === 'z' ? 'Sàn' : 'Vách thùng' },
      { value: limit(vehicle, axis) - size, coordinateCm: limit(vehicle, axis), source: axis === 'z' ? 'Trần thùng' : 'Vách thùng' },
    ]
    for (const q of placements) {
      if (q.id === p.id) continue
      // Only nearby, projected faces are magnetic; remote boxes cannot attract a drag.
      if (!AXES.filter((a) => a !== axis).every((a) =>
        position[a] <= q.position[a] + extent(q, a) + EDITOR_RULES.snapThresholdCm &&
        position[a] + extent(p, a) >= q.position[a] - EDITOR_RULES.snapThresholdCm)) continue
      for (const value of [q.position[axis] - size, q.position[axis] + extent(q, axis)]) {
        candidates.push({ value, coordinateCm: value === q.position[axis] - size ? q.position[axis] : value, source: `Mặt kiện ${q.id}`, placementId: q.id })
      }
    }
    // Physical faces win ties with the grid.
    const grid = Math.round(position[axis] / EDITOR_RULES.gridCm) * EDITOR_RULES.gridCm
    candidates.push({ value: grid, coordinateCm: grid, source: 'Lưới' })
    let best: typeof candidates[number] | undefined
    let distance = EDITOR_RULES.snapThresholdCm + 1
    for (const candidate of candidates) {
      const delta = Math.abs(candidate.value - position[axis])
      if (candidate.value >= 0 && candidate.value + size <= limit(vehicle, axis) && delta < distance) {
        best = candidate
        distance = delta
      }
    }
    if (best && distance <= EDITOR_RULES.snapThresholdCm) {
      position[axis] = best.value
      sources.push(`${axis.toUpperCase()}: ${best.source}`)
      targets.push({ axis, coordinateCm: best.coordinateCm, source: best.source, placementId: best.placementId })
    }
  }
  return { position, sources, targets }
}

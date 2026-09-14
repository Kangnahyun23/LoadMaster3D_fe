import type { Placement, PositionMm, VehicleSpec } from '@/types/load-plan'
import { AXES, EDITOR_RULES, extent, integerPosition, limit, type Axis } from './geometry.ts'

/** All thresholds and face distances are mm. Fixed axes stay fixed during a gesture. */
export function snapPosition(
  p: Placement, requested: PositionMm, placements: readonly Placement[], vehicle: VehicleSpec,
  axes: readonly Axis[] = AXES,
): { position: PositionMm; sources: string[] } {
  const position = integerPosition(requested)
  const sources: string[] = []
  for (const axis of axes) {
    const size = extent(p, axis)
    const candidates = [
      { value: 0, source: axis === 'z' ? 'Sàn' : 'Vách thùng' },
      { value: limit(vehicle, axis) - size, source: axis === 'z' ? 'Trần thùng' : 'Vách thùng' },
    ]
    for (const q of placements) {
      if (q.id === p.id) continue
      // Only nearby, projected faces are magnetic; remote boxes cannot attract a drag.
      if (!AXES.filter((a) => a !== axis).every((a) =>
        position[a] <= q.position[a] + extent(q, a) + EDITOR_RULES.snapThresholdMm &&
        position[a] + extent(p, a) >= q.position[a] - EDITOR_RULES.snapThresholdMm)) continue
      for (const value of [q.position[axis] - size, q.position[axis] + extent(q, axis)]) {
        candidates.push({ value, source: `Mặt kiện ${q.id}` })
      }
    }
    // Physical faces win ties with the grid.
    candidates.push({ value: Math.round(position[axis] / EDITOR_RULES.gridMm) * EDITOR_RULES.gridMm, source: 'Lưới' })
    let best: typeof candidates[number] | undefined
    let distance = EDITOR_RULES.snapThresholdMm + 1
    for (const candidate of candidates) {
      const delta = Math.abs(candidate.value - position[axis])
      if (candidate.value >= 0 && candidate.value + size <= limit(vehicle, axis) && delta < distance) {
        best = candidate
        distance = delta
      }
    }
    if (best && distance <= EDITOR_RULES.snapThresholdMm) {
      position[axis] = best.value
      sources.push(`${axis.toUpperCase()}: ${best.source}`)
    }
  }
  return { position, sources }
}

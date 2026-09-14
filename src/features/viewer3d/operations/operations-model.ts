import type { Placement, PositionMm, VehicleSpec } from '@/types/load-plan'

export function stopOrderConsistent(placements: readonly Placement[]): boolean {
  const ordered = [...placements].sort((a, b) => a.step - b.step || a.id.localeCompare(b.id))
  return ordered.every((p, i) => i === 0 || ordered[i - 1]!.stop >= p.stop)
}

/** Suggested only: stops ascend; within a stop prefer high boxes, then rearward faces. */
export function suggestedUnloadOrder(placements: readonly Placement[]): Placement[] {
  return [...placements].sort((a, b) => a.stop - b.stop ||
    b.position.z + b.heightMm - a.position.z - a.heightMm ||
    b.position.x + b.lengthMm - a.position.x - a.lengthMm ||
    a.position.y - b.position.y || a.id.localeCompare(b.id))
}

/**
 * Straight +X extraction corridor from the rear face to the rear door, in mm.
 * Strict overlap of Y/Z projections; touching a horizontal/side face is not a blocker.
 * This ignores handling clearance, people, forklifts and rotations: advisory, not feasibility proof.
 */
export function potentialBlockers(target: Placement, placements: readonly Placement[], vehicle: VehicleSpec): Placement[] {
  const start = target.position.x + target.lengthMm
  if (start >= vehicle.innerLengthMm) return []
  return placements.filter((p) => p.id !== target.id && p.position.x < vehicle.innerLengthMm &&
    p.position.x + p.lengthMm > start &&
    p.position.y < target.position.y + target.widthMm && p.position.y + p.widthMm > target.position.y &&
    p.position.z < target.position.z + target.heightMm && p.position.z + p.heightMm > target.position.z)
    .sort((a, b) => a.position.x - b.position.x || a.id.localeCompare(b.id))
}

/** At the start of each stop, earlier stops are assumed delivered. No official unload sequence exists. */
export function accessibilitySummary(placements: readonly Placement[], vehicle: VehicleSpec): number {
  return placements.filter((p) => potentialBlockers(p, placements.filter((q) => q.stop >= p.stop), vehicle).length > 0).length
}

export function cargoCenterOfMass(placements: readonly Placement[]): { position: PositionMm; weightKg: number } | null {
  let weightKg = 0, x = 0, y = 0, z = 0
  for (const p of placements) {
    if (!Number.isFinite(p.weightKg) || p.weightKg <= 0) continue
    weightKg += p.weightKg
    x += (p.position.x + p.lengthMm / 2) * p.weightKg
    y += (p.position.y + p.widthMm / 2) * p.weightKg
    z += (p.position.z + p.heightMm / 2) * p.weightKg
  }
  return weightKg ? { position: { x: x / weightKg, y: y / weightKg, z: z / weightKg }, weightKg } : null
}

export type DistributionBin = { fromMm: number; toMm: number; portions: { stop: number; ratio: number }[] }
/** Volume in each longitudinal bin. Interleaved stops remain mixed instead of invented blocks. */
export function stopDistribution(placements: readonly Placement[], lengthMm: number, count = 24): DistributionBin[] {
  if (lengthMm <= 0 || count <= 0) return []
  return Array.from({ length: count }, (_, i) => {
    const fromMm = i * lengthMm / count, toMm = (i + 1) * lengthMm / count
    const volumes = new Map<number, number>()
    for (const p of placements) {
      const overlap = Math.max(0, Math.min(toMm, p.position.x + p.lengthMm) - Math.max(fromMm, p.position.x))
      if (overlap) volumes.set(p.stop, (volumes.get(p.stop) ?? 0) + overlap * p.widthMm * p.heightMm)
    }
    const sum = [...volumes.values()].reduce((a, b) => a + b, 0)
    return { fromMm, toMm, portions: [...volumes].sort(([a], [b]) => a - b).map(([stop, volume]) => ({ stop, ratio: volume / sum })) }
  })
}

export function timelineBins(ordered: readonly Placement[], maxBins = 80) {
  const width = Math.max(1, Math.ceil(ordered.length / maxBins))
  const bins = []
  for (let i = 0; i < ordered.length; i += width) {
    const group = ordered.slice(i, i + width)
    const stops = new Map<number, number>()
    group.forEach((p) => stops.set(p.stop, (stops.get(p.stop) ?? 0) + 1))
    bins.push({ start: i, end: i + group.length, heightMm: Math.max(...group.map((p) => p.heightMm)),
      stops: [...stops].map(([stop, count]) => ({ stop, ratio: count / group.length })) })
  }
  return bins
}

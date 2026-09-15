import type { ScenePlacement, PositionCm } from '@/features/viewer3d/scene-input'

export function stopOrderConsistent(placements: readonly ScenePlacement[]): boolean {
  const ordered = [...placements].sort((a, b) => a.step - b.step || a.id.localeCompare(b.id))
  return ordered.every((p, i) => i === 0 || ordered[i - 1]!.stop >= p.stop)
}

export function cargoCenterOfMass(placements: readonly ScenePlacement[]): { position: PositionCm; weightKg: number } | null {
  let weightKg = 0, x = 0, y = 0, z = 0
  for (const p of placements) {
    if (!Number.isFinite(p.weightKg) || p.weightKg <= 0) continue
    weightKg += p.weightKg
    x += (p.position.x + p.lengthCm / 2) * p.weightKg
    y += (p.position.y + p.widthCm / 2) * p.weightKg
    z += (p.position.z + p.heightCm / 2) * p.weightKg
  }
  return weightKg ? { position: { x: x / weightKg, y: y / weightKg, z: z / weightKg }, weightKg } : null
}

export type DistributionBin = { fromCm: number; toCm: number; portions: { stop: number; ratio: number }[] }
/** Volume in each longitudinal bin. Interleaved stops remain mixed instead of invented blocks. */
export function stopDistribution(placements: readonly ScenePlacement[], lengthCm: number, count = 24): DistributionBin[] {
  if (lengthCm <= 0 || count <= 0) return []
  return Array.from({ length: count }, (_, i) => {
    const fromCm = i * lengthCm / count, toCm = (i + 1) * lengthCm / count
    const volumes = new Map<number, number>()
    for (const p of placements) {
      const overlap = Math.max(0, Math.min(toCm, p.position.x + p.lengthCm) - Math.max(fromCm, p.position.x))
      if (overlap) volumes.set(p.stop, (volumes.get(p.stop) ?? 0) + overlap * p.widthCm * p.heightCm)
    }
    const sum = [...volumes.values()].reduce((a, b) => a + b, 0)
    return { fromCm, toCm, portions: [...volumes].sort(([a], [b]) => a - b).map(([stop, volume]) => ({ stop, ratio: volume / sum })) }
  })
}

export function timelineBins(ordered: readonly ScenePlacement[], maxBins = 80) {
  const width = Math.max(1, Math.ceil(ordered.length / maxBins))
  const bins = []
  for (let i = 0; i < ordered.length; i += width) {
    const group = ordered.slice(i, i + width)
    const stops = new Map<number, number>()
    group.forEach((p) => stops.set(p.stop, (stops.get(p.stop) ?? 0) + 1))
    bins.push({ start: i, end: i + group.length, heightCm: Math.max(...group.map((p) => p.heightCm)),
      stops: [...stops].map(([stop, count]) => ({ stop, ratio: count / group.length })) })
  }
  return bins
}

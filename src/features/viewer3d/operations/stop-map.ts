import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { stopDistribution } from './operations-model'

/** Business centimetres laid out in Three axes: X along length, Y up, Z across width.
 * A 10 cm lane inset inside the floor, 0.4 cm above it; never vehicle/chassis geometry.
 */
export function interiorStopMap(placements: readonly ScenePlacement[], vehicle: VehicleConfig) {
  const width = vehicle.innerWidthCm, length = vehicle.innerLengthCm
  if (width <= 0 || length <= 0) return []
  const margin = Math.min(2, width / 10), lane = Math.min(10, width - margin * 2)
  return stopDistribution(placements, length).flatMap((bin) => {
    let offset = 0
    return bin.portions.map((part) => {
      const x1 = bin.fromCm, x2 = Math.max(x1, bin.toCm - Math.min(0.2, length / 1000))
      const z1 = margin + offset * lane, z2 = margin + (offset + part.ratio) * lane
      offset += part.ratio
      return { stop: part.stop, vertices: [x1, 0.4, z1, x2, 0.4, z1, x2, 0.4, z2, x1, 0.4, z1, x2, 0.4, z2, x1, 0.4, z2] }
    })
  })
}

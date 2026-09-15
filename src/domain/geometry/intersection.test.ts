import { expect, test } from 'vitest'
import { overlapArea2D, overlapVolume, type Box } from '@/domain/geometry'

/** Wheel arch OBS-001 of the Spec §12 truck: inner-left corner, 120 × 30 × 45 cm. */
const WHEEL_ARCH: Box = { xCm: 0, yCm: 0, zCm: 0, lengthCm: 120, widthCm: 30, heightCm: 45 }

/** Spec §12 sample "Carton A", 120 × 60 × 45 cm, at the origin unless moved. */
function carton(position: Partial<Pick<Box, 'xCm' | 'yCm' | 'zCm'>> = {}, size: Partial<Box> = {}): Box {
  return { xCm: 0, yCm: 0, zCm: 0, lengthCm: 120, widthCm: 60, heightCm: 45, ...position, ...size }
}

test('Carton A at (60, 10) covers 60 × 20 = 1,200 cm² of the wheel arch footprint', () => {
  expect(overlapArea2D(carton({ xCm: 60, yCm: 10 }), WHEEL_ARCH)).toBe(1200)
})

test('footprints that only share an edge have no overlap area, even when the edge position drifts', () => {
  // A ends at 100.4 + 120.7, which evaluates to 221.10000000000002: a raw subtraction leaves a 1.7e-12 cm² sliver
  const a = carton({ xCm: 100.4 }, { lengthCm: 120.7 })
  expect(overlapArea2D(a, carton({ xCm: 221.1 }))).toBe(0)
})

test('Carton A at (60, 10, 30) sinks 60 × 20 × 15 = 18,000 cm³ into the wheel arch', () => {
  expect(overlapVolume(carton({ xCm: 60, yCm: 10, zCm: 30 }), WHEEL_ARCH)).toBe(18_000)
})

test('a carton stacked on another has no overlap volume, even when the shared face drifts', () => {
  // the lower top is 100.4 + 120.7 = 221.10000000000002: a raw subtraction leaves a 2e-10 cm³ sliver
  const lower = carton({ zCm: 100.4 }, { heightCm: 120.7 })
  expect(overlapVolume(lower, carton({ zCm: 221.1 }))).toBe(0)
})

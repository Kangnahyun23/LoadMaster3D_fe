import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT } from '@/domain/fixtures/spec-samples'
import { obstacleToBox, placementToBox, type PackagePlacement, type VehicleObstacle } from '@/domain/models'

test('an obstacle maps to the box it occupies in the cargo space', () => {
  // cooling unit on the front wall of Truck 6m, right under its 250 cm ceiling; every number differs so no axis can be swapped unnoticed
  const coolingUnit: VehicleObstacle = {
    id: 'OBS-002',
    type: 'COOLING_UNIT',
    xCm: 0,
    yCm: 40,
    zCm: 190,
    lengthCm: 50,
    widthCm: 160,
    heightCm: 60,
    loadBearing: false,
  }
  expect(obstacleToBox(coolingUnit)).toStrictEqual({ xCm: 0, yCm: 40, zCm: 190, lengthCm: 50, widthCm: 160, heightCm: 60 })
})

test('a placement maps to the box of its placed size, which already reflects the chosen orientation', () => {
  // Carton A turned to WLH (60 × 120 × 45 cm) on top of two tiers; every number differs so no axis can be swapped unnoticed
  const turned: PackagePlacement = {
    ...SPEC_CARTON_A_PLACEMENT,
    orientation: 'WLH',
    xCm: 240,
    yCm: 100,
    zCm: 90,
    placedLengthCm: 60,
    placedWidthCm: 120,
    placedHeightCm: 45,
  }
  expect(placementToBox(turned)).toStrictEqual({ xCm: 240, yCm: 100, zCm: 90, lengthCm: 60, widthCm: 120, heightCm: 45 })
})

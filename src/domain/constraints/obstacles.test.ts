import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { obstacleIssues } from '@/domain/constraints'
import type { VehicleObstacle } from '@/domain/models'

const [LEFT_WHEEL_ARCH] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]

/** Truck 6m with a second wheel arch on the right wall and a cooling unit under the ceiling at the front wall. */
const TRUCK_WITH_THREE_OBSTACLES = {
  ...SPEC_TRUCK_6M,
  obstacles: [
    LEFT_WHEEL_ARCH,
    { ...LEFT_WHEEL_ARCH, id: 'OBS-002', yCm: 210 },
    { id: 'OBS-003', type: 'COOLING_UNIT', xCm: 0, yCm: 0, zCm: 200, lengthCm: 40, widthCm: 240, heightCm: 50, loadBearing: false },
  ],
} satisfies typeof SPEC_TRUCK_6M

test('Spec §12 Carton A placed at the origin overlaps the wheel arch OBS-001', () => {
  const atOrigin = { ...SPEC_CARTON_A_PLACEMENT, xCm: 0 }
  expect(obstacleIssues(atOrigin, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'OBSTACLE_OVERLAP', severity: 'error', packageInstanceId: 'PKG-001-01', params: { obstacleId: 'OBS-001' } },
  ])
})

test('the Spec §12 sample placement at x = 120 only touches the wheel arch face and has no obstacle issue', () => {
  expect(obstacleIssues(SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M)).toStrictEqual([])
})

test('a floor pallet spanning the full width at the front wall overlaps both wheel arches: one issue each, in vehicle order', () => {
  const pallet = { ...SPEC_CARTON_A_PLACEMENT, xCm: 0, placedLengthCm: 100, placedWidthCm: 240 }
  expect(obstacleIssues(pallet, TRUCK_WITH_THREE_OBSTACLES).map(({ code, params }) => [code, params.obstacleId])).toStrictEqual([
    ['OBSTACLE_OVERLAP', 'OBS-001'],
    ['OBSTACLE_OVERLAP', 'OBS-002'],
  ])
})

/** Carton A over the wheel arch at z = 45: its bottom lies on the arch top, half of its base over the arch. */
const ON_WHEEL_ARCH = { ...SPEC_CARTON_A_PLACEMENT, xCm: 0, zCm: 45 }

test('Spec §7.6: Carton A resting on top of the non-load-bearing wheel arch OBS-001 is an error', () => {
  expect(obstacleIssues(ON_WHEEL_ARCH, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'NON_BEARING_SUPPORT', severity: 'error', packageInstanceId: 'PKG-001-01', params: { obstacleId: 'OBS-001' } },
  ])
})

test('a carton 0.2 cm above the wheel arch top still rests on it, 0.3 cm above it does not', () => {
  // 45.2 − 45 evaluates to 0.20000000000000284: the 0.2 cm contact tolerance is compared through EPSILON
  const codesAt = (zCm: number) => obstacleIssues({ ...ON_WHEEL_ARCH, zCm }, SPEC_TRUCK_6M).map(({ code }) => code)
  expect([codesAt(45.2), codesAt(45.3)]).toStrictEqual([['NON_BEARING_SUPPORT'], []])
})

test('a carton at z = 45 whose base only touches the wheel arch top along the edge y = 30 is not resting on it', () => {
  const besideArch = { ...ON_WHEEL_ARCH, yCm: 30 }
  expect(obstacleIssues(besideArch, SPEC_TRUCK_6M)).toStrictEqual([])
})

test('resting on top of a load-bearing wheel arch is allowed', () => {
  const bearingArch = { ...SPEC_TRUCK_6M, obstacles: [{ ...LEFT_WHEEL_ARCH, loadBearing: true }] }
  expect(obstacleIssues(ON_WHEEL_ARCH, bearingArch)).toStrictEqual([])
})

import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { createPlacementLayout, supportIssues, supportRatio } from '@/domain/constraints'
import type { PackagePlacement, VehicleConfig, VehicleObstacle } from '@/domain/models'

type Triple = [number, number, number]

/** A contract placement with its own id, position (x, y, z) and placed size (l, w, h) in cm. */
function placed(packageInstanceId: string, [xCm, yCm, zCm]: Triple, [placedLengthCm, placedWidthCm, placedHeightCm]: Triple) {
  return { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId, xCm, yCm, zCm, placedLengthCm, placedWidthCm, placedHeightCm }
}

/** Support ratio of `placement` in a plan holding it and `others`, in Truck 6m unless another vehicle is given. */
function ratioAmong(placement: PackagePlacement, others: PackagePlacement[] = [], vehicle: VehicleConfig = SPEC_TRUCK_6M) {
  return supportRatio(placement, createPlacementLayout(vehicle, [...others, placement]))
}

test('a package on the floor, or within the 0.2 cm contact tolerance above it, is fully supported; 0.3 cm up it is not', () => {
  const cartonAt = (zCm: number) => placed('PKG-001-01', [300, 0, zCm], [120, 60, 45])
  expect([0, 0.2, 0.3].map((zCm) => ratioAmong(cartonAt(zCm)))).toStrictEqual([1, 1, 0])
})

/**
 * Spec §13 "PKG-008 support ratio 0.62 is below the required 0.80", rebuilt by hand: PKG-008 (100 × 50 cm base at x 300..400,
 * y 100..150) sits on PKG-009 (x 242..362, y 90..150, top at 60). PKG-009 covers x 300..362 across the full 50 cm width,
 * so 62 × 50 = 3,100 of 5,000 cm² are supported.
 */
const PKG_009 = placed('PKG-009', [242, 90, 0], [120, 60, 60])
const PKG_008 = placed('PKG-008', [300, 100, 60], [100, 50, 40])

test('PKG-008 overhanging PKG-009 by 38 cm has 62 × 50 cm of its 100 × 50 cm base supported: ratio 0.62', () => {
  expect(ratioAmong(PKG_008, [PKG_009])).toBe(0.62)
})

test('two supports that overlap each other are not counted twice under PKG-008: 1,800 + 2,450 − 450 = 3,800 cm², ratio 0.76', () => {
  // an invalid plan (the supports overlap, e.g. mid-drag in the editor) must still not inflate the ratio to 0.85
  const left = placed('PKG-010', [300, 100, 0], [60, 30, 60]) // x 300..360, y 100..130
  const right = placed('PKG-011', [330, 115, 0], [70, 35, 60]) // x 330..400, y 115..150: shares 30 × 15 cm with left
  expect(ratioAmong(PKG_008, [left, right])).toBe(0.76)
})

test('the top of a load-bearing obstacle supports a package, the top of a non-load-bearing one does not (Spec §7.6)', () => {
  const onWheelArch = placed('PKG-001-01', [0, 0, 45], [120, 60, 45]) // 120 × 30 cm of its 120 × 60 cm base over OBS-001
  const [wheelArch] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]
  const bearingArchTruck = { ...SPEC_TRUCK_6M, obstacles: [{ ...wheelArch, loadBearing: true }] }
  expect([ratioAmong(onWheelArch), ratioAmong(onWheelArch, [], bearingArchTruck)]).toStrictEqual([0, 0.5])
})

test('a package previewed on top of its own current position is not supported by itself', () => {
  const onFloor = placed('PKG-001-01', [300, 0, 0], [120, 60, 45])
  const liftedOntoItself = { ...onFloor, zCm: 45 }
  expect(supportRatio(liftedOntoItself, createPlacementLayout(SPEC_TRUCK_6M, [onFloor]))).toBe(0)
})

test('a package resting on a support with the same base never exceeds a ratio of 1, even when the base edge drifts', () => {
  // both span x 100.4..221.10000000000002: the covered 120.70000000000002 × 60 cm over a 120.7 × 60 cm base is 1.0000000000000002
  const below = placed('PKG-013', [100.4, 100, 0], [120.7, 60, 45])
  const above = placed('PKG-012', [100.4, 100, 45], [120.7, 60, 45])
  expect(ratioAmong(above, [below])).toBe(1)
})

test('Spec §13 "PKG-008 support ratio 0.62 is below the required 0.80." is exactly what supportIssues reports', () => {
  const layout = createPlacementLayout(SPEC_TRUCK_6M, [PKG_009, PKG_008])
  expect(supportIssues(PKG_008, 0.8, layout)).toStrictEqual([
    { code: 'SUPPORT_BELOW_MIN', severity: 'warning', packageInstanceId: 'PKG-008', params: { ratio: 0.62, required: 0.8 } },
  ])
})

test('a package supported on exactly its required 80% gets no warning, even when the computed ratio drifts below 0.8', () => {
  // 49.6 of 62 cm is exactly 80%, but (169.6 − 120) × 60 / (62 × 60) computes to 0.7999999999999998
  const support = placed('PKG-015', [120, 0, 0], [49.6, 60, 45])
  const overhanging = placed('PKG-014', [120, 0, 45], [62, 60, 40])
  const layout = createPlacementLayout(SPEC_TRUCK_6M, [support, overhanging])
  expect(supportIssues(overhanging, 0.8, layout)).toStrictEqual([])
})

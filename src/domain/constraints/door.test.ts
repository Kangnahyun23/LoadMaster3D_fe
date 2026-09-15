import { expect, test } from 'vitest'
import { checkDoorClearance } from '@/domain/constraints'
import { SPEC_CARTON_A, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { CargoPackage } from '@/domain/models'

/** Carton A of Spec §12 (kept upright, allows LWH and WLH) with some fields replaced. */
function cargo(changes: Partial<CargoPackage>): CargoPackage {
  return { ...SPEC_CARTON_A, ...changes }
}

/** A 240 × 230 × 120 cm crate kept upright: fits the 240 cm wide interior, but is 230 cm (LWH) or 240 cm (WLH) wide. */
const PKG_003 = cargo({ id: 'PKG-003', lengthCm: 240, widthCm: 230, heightCm: 120 })

test('the Spec §12 sample Carton A, 120 × 60 × 45 cm, passes the 220 × 230 cm rear door of Truck 6m', () => {
  expect(checkDoorClearance(SPEC_CARTON_A, SPEC_TRUCK_6M)).toStrictEqual([])
})

test('Spec §13 "Package PKG-003 cannot pass through the 220 × 230 cm door." when no orientation is narrow enough', () => {
  expect(checkDoorClearance(PKG_003, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'DOOR_TOO_SMALL', severity: 'error', params: { packageId: 'PKG-003', doorWidthCm: 220, doorHeightCm: 230 } },
  ])
})

test('a package kept upright that stands 240 cm tall cannot pass a door 230 cm high, however narrow it is', () => {
  const tallRoll = cargo({ id: 'PKG-004', lengthCm: 100, widthCm: 100, heightCm: 240 })
  expect(checkDoorClearance(tallRoll, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'DOOR_TOO_SMALL', severity: 'error', params: { packageId: 'PKG-004', doorWidthCm: 220, doorHeightCm: 230 } },
  ])
})

test('laid on its side as LHW, PKG-003 is 120 cm wide and 230 cm high and passes, unless it must be kept upright', () => {
  const layable = cargo({ ...PKG_003, allowedOrientations: ['LWH', 'WLH', 'LHW'] })
  expect([
    checkDoorClearance({ ...layable, keepUpright: false }, SPEC_TRUCK_6M),
    checkDoorClearance({ ...layable, keepUpright: true }, SPEC_TRUCK_6M).map(({ code }) => code),
  ]).toStrictEqual([[], ['DOOR_TOO_SMALL']])
})

test('the clearance gap is added to both the width and the height a package needs at the door (Spec §7.4)', () => {
  const wide = cargo({ id: 'PKG-005', lengthCm: 216, widthCm: 216, heightCm: 100 })
  const tall = cargo({ id: 'PKG-006', lengthCm: 100, widthCm: 100, heightCm: 226 })
  const withClearance = { ...SPEC_TRUCK_6M, clearanceCm: 5 }
  const codes = (pkg: CargoPackage, vehicle: typeof SPEC_TRUCK_6M) => checkDoorClearance(pkg, vehicle).map(({ code }) => code)
  expect([
    codes(wide, SPEC_TRUCK_6M),
    codes(tall, SPEC_TRUCK_6M),
    codes(wide, withClearance),
    codes(tall, withClearance),
  ]).toStrictEqual([[], [], ['DOOR_TOO_SMALL'], ['DOOR_TOO_SMALL']])
})

test('a package that fills the door exactly with its clearance passes, even when the sum drifts in floating point', () => {
  // 219.8 + 0.3 evaluates to 220.10000000000002 and 229.8 + 0.3 to 230.10000000000002, in both upright orientations
  const snugDoor = { ...SPEC_TRUCK_6M, doorWidthCm: 220.1, doorHeightCm: 230.1, clearanceCm: 0.3 }
  const snug = cargo({ id: 'PKG-007', lengthCm: 219.8, widthCm: 219.8, heightCm: 229.8 })
  expect(checkDoorClearance(snug, snugDoor)).toStrictEqual([])
})

test('a package with no usable orientation gets no door issue: NO_ALLOWED_ORIENTATION reports it on its own', () => {
  expect([
    checkDoorClearance(cargo({ ...PKG_003, allowedOrientations: [] }), SPEC_TRUCK_6M),
    checkDoorClearance(cargo({ ...PKG_003, allowedOrientations: ['LHW'], keepUpright: true }), SPEC_TRUCK_6M),
  ]).toStrictEqual([[], []])
})

test('a door whose width or height is not above 0 cm flags no package: validateVehicle reports that input alone', () => {
  expect([
    checkDoorClearance(PKG_003, { ...SPEC_TRUCK_6M, doorWidthCm: 0 }),
    checkDoorClearance(PKG_003, { ...SPEC_TRUCK_6M, doorHeightCm: -230 }),
  ]).toStrictEqual([[], []])
})

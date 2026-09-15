import { expect, test } from 'vitest'
import { validateVehicle } from '@/domain/constraints'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { VehicleConfig, VehicleObstacle } from '@/domain/models'

/** Truck 6m of Spec §12 with some fields replaced. */
function truck(changes: Partial<VehicleConfig>): VehicleConfig {
  return { ...SPEC_TRUCK_6M, ...changes }
}

/** A wheel arch like OBS-001 of Spec §12 (0, 0, 0, 120 × 30 × 45 cm, not load-bearing) with some fields replaced. */
function obstacle(changes: Partial<VehicleObstacle>): VehicleObstacle {
  const wheelArch: VehicleObstacle = {
    id: 'OBS-001',
    type: 'WHEEL_ARCH',
    xCm: 0,
    yCm: 0,
    zCm: 0,
    lengthCm: 120,
    widthCm: 30,
    heightCm: 45,
    loadBearing: false,
  }
  return { ...wheelArch, ...changes }
}

test('the Spec §12 sample vehicle Truck 6m, with its wheel arch flush in the front left corner, has no issue', () => {
  expect(validateVehicle(SPEC_TRUCK_6M)).toStrictEqual([])
})

test('Spec §13 "Inner length must be greater than 0 cm." points at the inner length field', () => {
  expect(validateVehicle(truck({ innerLengthCm: 0 }))).toStrictEqual([
    { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerLengthCm', params: { entity: 'vehicle' } },
  ])
})

test('every size and the payload must be above 0 (Spec §9.2), each reported at its own field in form order', () => {
  // NaN is what an emptied numeric input holds; each door stays within its interior side so only positivity fails
  const unset = { innerLengthCm: 0, innerWidthCm: 0, innerHeightCm: Number.NaN, maxPayloadKg: -5000, doorWidthCm: -220, doorHeightCm: 0 }
  const notPositive = (field: string) => ({ code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field, params: { entity: 'vehicle' } })
  expect(validateVehicle(truck(unset))).toStrictEqual([
    notPositive('innerLengthCm'),
    notPositive('innerWidthCm'),
    notPositive('innerHeightCm'),
    notPositive('maxPayloadKg'),
    notPositive('doorWidthCm'),
    notPositive('doorHeightCm'),
  ])
})

test('Spec §13 "Door width 250 cm cannot exceed vehicle inner width 240 cm." carries both widths at the door width field', () => {
  expect(validateVehicle(truck({ doorWidthCm: 250 }))).toStrictEqual([
    { code: 'DOOR_EXCEEDS_INNER', severity: 'error', field: 'doorWidthCm', params: { axis: 'y', doorCm: 250, innerCm: 240 } },
  ])
})

test('a door taller than the interior is reported on z; a flush door is not, even when it drifts wider in floating point', () => {
  // 100.4 + 120.7 evaluates to 221.10000000000002, the width of a 221.1 cm interior
  const flushDoor = truck({ innerWidthCm: 221.1, doorWidthCm: 100.4 + 120.7, doorHeightCm: 250 })
  expect([validateVehicle(truck({ doorHeightCm: 260 })), validateVehicle(flushDoor)]).toStrictEqual([
    [{ code: 'DOOR_EXCEEDS_INNER', severity: 'error', field: 'doorHeightCm', params: { axis: 'z', doorCm: 260, innerCm: 250 } }],
    [],
  ])
})

test('an inner width that is not above 0 cm is reported alone, without comparing the 220 cm door against it', () => {
  expect(validateVehicle(truck({ innerWidthCm: 0 }))).toStrictEqual([
    { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerWidthCm', params: { entity: 'vehicle' } },
  ])
})

test('every obstacle size must be above 0 cm, reported at that field of the obstacle row, with the obstacle id', () => {
  const flatArch = obstacle({ id: 'OBS-002', xCm: 480, lengthCm: 0, heightCm: -45 })
  const notPositive = (field: string) => ({
    code: 'DIMENSION_NOT_POSITIVE',
    severity: 'error',
    field,
    params: { entity: 'obstacle', obstacleId: 'OBS-002' },
  })
  expect(validateVehicle(truck({ obstacles: [obstacle({}), flatArch] }))).toStrictEqual([
    notPositive('obstacles.1.lengthCm'),
    notPositive('obstacles.1.heightCm'),
  ])
})

test('an obstacle sticking out of the interior gets one boundary issue per crossed wall, at its row (Spec §9.2)', () => {
  // 220 + 30 = 250 cm across a 240 cm wide interior; the other starts 10 cm through the front wall and tops out at 255 cm
  const pastRightWall = obstacle({ yCm: 220 })
  const frontAndCeiling = obstacle({ id: 'OBS-002', xCm: -10, zCm: 210 })
  const exceeds = (row: number, id: string, axis: string, side: string, overCm: number) => ({
    code: 'EXCEEDS_BOUNDARY',
    severity: 'error',
    relatedIds: [id],
    field: `obstacles.${row}`,
    params: { axis, side, overCm },
  })
  expect(validateVehicle(truck({ obstacles: [pastRightWall, frontAndCeiling] }))).toStrictEqual([
    exceeds(0, 'OBS-001', 'y', 'beyondInterior', 10),
    exceeds(1, 'OBS-002', 'x', 'beforeOrigin', 10),
    exceeds(1, 'OBS-002', 'z', 'beyondInterior', 5),
  ])
})

test('an obstacle overlapping an earlier one is reported once, at its own row, naming the obstacle it overlaps', () => {
  // OBS-002 ends at x = 100.4 + 120.7 = 221.10000000000002, exactly where OBS-003 starts: touching, not overlapping
  const reservedZone = obstacle({ id: 'OBS-002', type: 'RESERVED_ZONE', xCm: 100.4, lengthCm: 120.7, widthCm: 240, heightCm: 40 })
  const rightWheelArch = obstacle({ id: 'OBS-003', xCm: 221.1, yCm: 210 })
  expect(validateVehicle(truck({ obstacles: [obstacle({}), reservedZone, rightWheelArch] }))).toStrictEqual([
    {
      code: 'OBSTACLE_OVERLAP',
      severity: 'error',
      relatedIds: ['OBS-002'],
      field: 'obstacles.1',
      params: { obstacleId: 'OBS-001' },
    },
  ])
})

test('an obstacle without a positive size is reported alone, not as overlapping the obstacle it sits in, in either row order', () => {
  const sliver = obstacle({ id: 'OBS-002', xCm: 60, yCm: 10, zCm: 10, lengthCm: 0 })
  const sliverIssue = (row: number) => ({
    code: 'DIMENSION_NOT_POSITIVE',
    severity: 'error',
    field: `obstacles.${row}.lengthCm`,
    params: { entity: 'obstacle', obstacleId: 'OBS-002' },
  })
  expect([
    validateVehicle(truck({ obstacles: [obstacle({}), sliver] })),
    validateVehicle(truck({ obstacles: [sliver, obstacle({})] })),
  ]).toStrictEqual([[sliverIssue(1)], [sliverIssue(0)]])
})

test('an inner height that is not above 0 cm is reported alone, without flagging the 45 cm wheel arch as sticking out', () => {
  expect(validateVehicle(truck({ innerHeightCm: 0 }))).toStrictEqual([
    { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerHeightCm', params: { entity: 'vehicle' } },
  ])
})

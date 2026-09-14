import { expect, test } from 'vitest'
import { eq, overlaps, roundCm, roundKg, vehicleBoundaryExcess, volumeCm3, type Box } from '@/domain/geometry'

/** Lòng thùng xe mẫu "Truck 6m" của Spec mục 12. */
const TRUCK_6M = { innerLengthCm: 600, innerWidthCm: 240, innerHeightCm: 250 }

/** Kiện mẫu "Carton A" của Spec mục 12, đặt tại gốc. */
function carton(position: Partial<Pick<Box, 'xCm' | 'yCm' | 'zCm'>> = {}, size: Partial<Box> = {}): Box {
  return { xCm: 0, yCm: 0, zCm: 0, lengthCm: 120, widthCm: 60, heightCm: 45, ...position, ...size }
}

test('roundCm snaps a length to the nearest 0.1 cm', () => {
  expect(roundCm(12.34)).toBe(12.3)
})

test('roundCm rounds exact halves away from zero, on both sides of zero', () => {
  expect([roundCm(12.35), roundCm(-12.35)]).toStrictEqual([12.4, -12.4])
})

test('roundCm treats a derived half cut short by floating-point drift as a half', () => {
  // 262.45 cm − 250 cm evaluates to 12.449999999999989 in IEEE 754
  expect(roundCm(262.45 - 250)).toBe(12.5)
})

test('roundCm never returns negative zero, which would display as "-0 cm"', () => {
  expect(Object.is(roundCm(-0.04), 0)).toBe(true)
})

test('roundKg snaps a weight to the nearest 0.01 kg, keeping halves cut short by drift', () => {
  // 1.005 * 100 evaluates to 100.49999999999999 in IEEE 754
  expect([roundKg(30.124), roundKg(1.005)]).toStrictEqual([30.12, 1.01])
})

test('eq treats values that differ only by floating-point drift as equal, but not real differences', () => {
  // 100.1 cm + 60.3 cm evaluates to 160.39999999999998
  expect([eq(100.1 + 60.3, 160.4), eq(160.4, 160.5)]).toStrictEqual([true, false])
})

test('volumeCm3 of the Spec sample carton 120 × 60 × 45 cm is 324,000 cm³', () => {
  expect(volumeCm3(carton())).toBe(324_000)
})

test('boxes that interpenetrate by 0.1 cm overlap', () => {
  expect(overlaps(carton(), carton({ xCm: 119.9 }))).toBe(true)
})

test('boxes that only share a face do not overlap (Spec §3: B may start at x = 120 where A ends)', () => {
  expect(overlaps(carton(), carton({ xCm: 120 }))).toBe(false)
})

test('boxes sharing a face do not overlap even when the face position drifts in floating point', () => {
  // A ends at 100.4 + 120.7, which evaluates to 221.10000000000002
  const a = carton({ xCm: 100.4 }, { lengthCm: 120.7 })
  expect(overlaps(a, carton({ xCm: 221.1 }))).toBe(false)
})

test('a carton stacked directly on another does not overlap it, but one sunk 0.1 cm into it does', () => {
  expect([overlaps(carton(), carton({ zCm: 45 })), overlaps(carton(), carton({ zCm: 44.9 }))]).toStrictEqual([false, true])
})

test('a placement whose top reaches 262.5 cm exceeds the 250 cm truck height by 12.5 cm (Spec §13)', () => {
  expect(vehicleBoundaryExcess(carton({ zCm: 217.5 }), TRUCK_6M).beyondInterior.zCm).toBe(12.5)
})

test('a placement starting 2 cm behind the front wall is reported as 2 cm before the origin', () => {
  expect(vehicleBoundaryExcess(carton({ xCm: -2 }), TRUCK_6M).beforeOrigin.xCm).toBe(2)
})

test('a carton touching the ceiling reports no excess even when its stacked position drifts in floating point', () => {
  // resting on tops at 100.4 + 120.7 = 221.10000000000002; top evaluates to 250.00000000000003
  const touchingCeiling = carton({ zCm: 100.4 + 120.7 }, { heightCm: 28.9 })
  expect(vehicleBoundaryExcess(touchingCeiling, TRUCK_6M)).toStrictEqual({
    beforeOrigin: { xCm: 0, yCm: 0, zCm: 0 },
    beyondInterior: { xCm: 0, yCm: 0, zCm: 0 },
  })
})

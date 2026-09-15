import { describe, expect, test } from 'vitest'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { checkCenterOfGravity } from '@/domain/metrics'

// Truck 6m: inner width 240 cm (centre line y = 120), inner height 250 cm.
describe('lateral offset against 10% of the inner width (24 cm, D-36)', () => {
  test.each([
    ['11% towards the right wall', 146.4],
    ['11% towards the left wall', 93.6],
  ])('%s warns with the offset and the limit', (_, y) => {
    expect(checkCenterOfGravity(SPEC_TRUCK_6M, { x: 300, y, z: 22.5 })).toStrictEqual([
      { code: 'COG_LATERAL', severity: 'warning', params: { offsetCm: 26.4, limitCm: 24 } },
    ])
  })

  test.each([
    ['9% towards the right wall', 141.6],
    ['9% towards the left wall', 98.4],
    ['exactly on the limit', 144],
  ])('%s does not warn', (_, y) => {
    expect(checkCenterOfGravity(SPEC_TRUCK_6M, { x: 300, y, z: 22.5 })).toStrictEqual([])
  })
})

describe('height against 50% of the inner height (125 cm, D-36)', () => {
  test('a centre of gravity at 137.5 cm warns with the height and the limit', () => {
    expect(checkCenterOfGravity(SPEC_TRUCK_6M, { x: 300, y: 120, z: 137.5 })).toStrictEqual([
      { code: 'COG_HIGH', severity: 'warning', params: { heightCm: 137.5, limitCm: 125 } },
    ])
  })

  test('a centre of gravity exactly at 125 cm does not warn', () => {
    expect(checkCenterOfGravity(SPEC_TRUCK_6M, { x: 300, y: 120, z: 125 })).toStrictEqual([])
  })
})

test('a load that is both off-centre and high gets both warnings', () => {
  expect(checkCenterOfGravity(SPEC_TRUCK_6M, { x: 300, y: 146.4, z: 137.5 }).map((issue) => issue.code))
    .toStrictEqual(['COG_LATERAL', 'COG_HIGH'])
})

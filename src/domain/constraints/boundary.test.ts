import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { boundaryIssues } from '@/domain/constraints'

test('the Spec §12 sample placement, fully inside Truck 6m, has no boundary issue', () => {
  expect(boundaryIssues(SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M)).toStrictEqual([])
})

test('a placement starting 2 cm in front of the front wall exceeds the boundary on x, before the origin, by 2 cm', () => {
  const throughFrontWall = { ...SPEC_CARTON_A_PLACEMENT, xCm: -2 }
  expect(boundaryIssues(throughFrontWall, SPEC_TRUCK_6M)).toStrictEqual([
    {
      code: 'EXCEEDS_BOUNDARY',
      severity: 'error',
      packageInstanceId: 'PKG-001-01',
      params: { axis: 'x', side: 'beforeOrigin', overCm: 2 },
    },
  ])
})

test('a placement crossing several walls gets one issue per wall, listed by axis x, y, z with the origin side first', () => {
  // 615 cm long from x = -5 cm (through the front wall by 5 cm and the rear door by 10 cm), 4.5 cm through the left wall
  const tooLongAndLeft = { ...SPEC_CARTON_A_PLACEMENT, xCm: -5, placedLengthCm: 615, yCm: -4.5 }
  const exceeds = (axis: string, side: string, overCm: number) => ({ axis, side, overCm })
  expect(boundaryIssues(tooLongAndLeft, SPEC_TRUCK_6M).map(({ params }) => params)).toStrictEqual([
    exceeds('x', 'beforeOrigin', 5),
    exceeds('x', 'beyondInterior', 10),
    exceeds('y', 'beforeOrigin', 4.5),
  ])
})

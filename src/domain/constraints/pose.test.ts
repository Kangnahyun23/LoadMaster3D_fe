import { expect, test } from 'vitest'
import { applyPose } from '@/domain/constraints'
import { SPEC_CARTON_A, SPEC_CARTON_A_PLACEMENT } from '@/domain/fixtures/spec-samples'

test('a new pose rounds the position to 0.1 cm and takes the placed size from the orientation of the source package', () => {
  // Carton A is 120 × 60 × 45 cm; WLH swaps length and width
  expect(applyPose(SPEC_CARTON_A_PLACEMENT, { xCm: 250.04, yCm: 60.06, zCm: 0, orientation: 'WLH' }, SPEC_CARTON_A)).toStrictEqual({
    ...SPEC_CARTON_A_PLACEMENT,
    xCm: 250,
    yCm: 60.1,
    zCm: 0,
    orientation: 'WLH',
    placedLengthCm: 60,
    placedWidthCm: 120,
    placedHeightCm: 45,
  })
})

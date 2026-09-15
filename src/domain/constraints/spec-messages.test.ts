import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { boundaryIssues, CONSTRAINT_CODES, type ConstraintIssue } from '@/domain/constraints'
import type { ModelIssueCode } from '@/domain/models'

/** One Spec §13 sentence and the issue it is rebuilt from (D-28): a code and raw params, never the sentence itself. */
type Spec13Row = {
  sentence: string
  issue: ConstraintIssue
  /**
   * Input rules the LM-010 schema already rejects field by field, with this code at this path (asserted in
   * vehicle.test.ts and package.test.ts). The issue is the same rule reported outside the form, with its numbers.
   */
  schemaTwin?: { code: ModelIssueCode; path: readonly (string | number)[] }
}

/** Carton A (45 cm tall) placed at z = 217.5 cm in Truck 6m: its top reaches 262.5 cm under a 250 cm ceiling. */
const PKG_004 = { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId: 'PKG-004', zCm: 217.5 }

const PKG_004_TOO_TALL: ConstraintIssue = {
  code: 'EXCEEDS_BOUNDARY',
  severity: 'error',
  packageInstanceId: 'PKG-004',
  params: { axis: 'z', side: 'beyondInterior', overCm: 12.5 },
}

/** Spec §13 in order, params taken literally from each sentence. */
const SPEC_13: readonly Spec13Row[] = [
  {
    sentence: 'Inner length must be greater than 0 cm.',
    issue: { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerLengthCm', params: { entity: 'vehicle' } },
    schemaTwin: { code: 'vehicle.dimension.positive', path: ['innerLengthCm'] },
  },
  {
    sentence: 'Door width 250 cm cannot exceed vehicle inner width 240 cm.',
    issue: {
      code: 'DOOR_EXCEEDS_INNER',
      severity: 'error',
      field: 'doorWidthCm',
      params: { axis: 'y', doorCm: 250, innerCm: 240 },
    },
    schemaTwin: { code: 'vehicle.door.exceedsInner', path: ['doorWidthCm'] },
  },
  {
    sentence: 'Package PKG-001 has no allowed orientation.',
    issue: {
      code: 'NO_ALLOWED_ORIENTATION',
      severity: 'error',
      field: 'allowedOrientations',
      params: { packageId: 'PKG-001' },
    },
    schemaTwin: { code: 'package.allowedOrientations.empty', path: ['allowedOrientations'] },
  },
  {
    sentence: 'Total cargo weight 5,320 kg exceeds vehicle payload 5,000 kg.',
    // Spec §7.3 also asks for the excess; LM-017 fixes it at 320 kg for this example
    issue: { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params: { totalKg: 5320, maxPayloadKg: 5000, overKg: 320 } },
  },
  {
    sentence: 'Package PKG-003 cannot pass through the 220 × 230 cm door.',
    issue: { code: 'DOOR_TOO_SMALL', severity: 'error', params: { packageId: 'PKG-003', doorWidthCm: 220, doorHeightCm: 230 } },
  },
  { sentence: 'Placement PKG-004 exceeds vehicle height by 12.5 cm.', issue: PKG_004_TOO_TALL },
  {
    sentence: 'PKG-006 overlaps PKG-007.',
    issue: { code: 'OVERLAP', severity: 'error', packageInstanceId: 'PKG-006', relatedIds: ['PKG-007'], params: {} },
  },
  {
    sentence: 'PKG-008 support ratio 0.62 is below the required 0.80.',
    issue: {
      code: 'SUPPORT_BELOW_MIN',
      severity: 'warning',
      packageInstanceId: 'PKG-008',
      params: { ratio: 0.62, required: 0.8 },
    },
  },
]

test('Spec §13 "Placement PKG-004 exceeds vehicle height by 12.5 cm." is exactly what boundaryIssues reports', () => {
  expect(boundaryIssues(PKG_004, SPEC_TRUCK_6M)).toStrictEqual([PKG_004_TOO_TALL])
})

test('every Spec §13 sentence maps to a code of the catalogue', () => {
  expect(CONSTRAINT_CODES).toEqual(expect.arrayContaining(SPEC_13.map(({ issue }) => issue.code)))
})

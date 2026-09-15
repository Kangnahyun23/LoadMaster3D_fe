import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { boundaryIssues, CONSTRAINT_CODES, type ConstraintCode } from '@/domain/constraints'
import type { ModelIssueCode } from '@/domain/models'
import { SPEC_13_EXAMPLES, SPEC_13_PKG_004_TOO_TALL } from '@/test/spec-13'

/**
 * Spec §13 rows whose input rule the LM-010 schema already rejects field by field, with this code at this path
 * (asserted in vehicle.test.ts and package.test.ts). The constraint issue is the same rule reported outside the form,
 * with its numbers; the sentence itself is rebuilt by `formatIssue` (LM-028).
 */
const SCHEMA_TWINS: Partial<Record<ConstraintCode, { code: ModelIssueCode; path: readonly (string | number)[] }>> = {
  DIMENSION_NOT_POSITIVE: { code: 'vehicle.dimension.positive', path: ['innerLengthCm'] },
  DOOR_EXCEEDS_INNER: { code: 'vehicle.door.exceedsInner', path: ['doorWidthCm'] },
  NO_ALLOWED_ORIENTATION: { code: 'package.allowedOrientations.empty', path: ['allowedOrientations'] },
}

/** Carton A (45 cm tall) placed at z = 217.5 cm in Truck 6m: its top reaches 262.5 cm under a 250 cm ceiling. */
const PKG_004 = { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId: 'PKG-004', zCm: 217.5 }

test('Spec §13 "Placement PKG-004 exceeds vehicle height by 12.5 cm." is exactly what boundaryIssues reports', () => {
  expect(boundaryIssues(PKG_004, SPEC_TRUCK_6M)).toStrictEqual([SPEC_13_PKG_004_TOO_TALL])
})

test('every Spec §13 sentence maps to a code of the catalogue', () => {
  expect(CONSTRAINT_CODES).toEqual(expect.arrayContaining(SPEC_13_EXAMPLES.map(({ issue }) => issue.code)))
})

test('schema twins only name Spec §13 rows', () => {
  expect(SPEC_13_EXAMPLES.map(({ issue }) => issue.code)).toEqual(expect.arrayContaining(Object.keys(SCHEMA_TWINS)))
})

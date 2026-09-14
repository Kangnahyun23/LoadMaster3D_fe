import { expect, test } from 'vitest'
import { SPEC_CARTON_A } from '@/domain/fixtures/spec-samples'
import { cargoPackageSchema } from '@/domain/models'

/** Issues for Carton A with some fields replaced; the zod message is the issue code, asserted with its path. */
function issuesWith(changes: Record<string, unknown>) {
  const { error } = cargoPackageSchema.safeParse({ ...SPEC_CARTON_A, ...changes })
  return (error?.issues ?? []).map(({ message, path }) => ({ code: message, path }))
}

test('the Spec §12 sample package "Carton A" parses unchanged', () => {
  expect(cargoPackageSchema.parse(SPEC_CARTON_A)).toStrictEqual(SPEC_CARTON_A)
})

test('a field outside the Spec contract is dropped rather than kept or rejected (D-04)', () => {
  expect(cargoPackageSchema.parse({ ...SPEC_CARTON_A, tripId: 'TRIP-2026-0911' })).toStrictEqual(SPEC_CARTON_A)
})

test('quantity must be at least 1: 0 is rejected, 1 is accepted', () => {
  expect([issuesWith({ quantity: 0 }), issuesWith({ quantity: 1 })]).toStrictEqual([
    [{ code: 'package.quantity.min', path: ['quantity'] }],
    [],
  ])
})

test('quantity must be a whole number of packages: 2.5 is rejected', () => {
  expect(issuesWith({ quantity: 2.5 })).toStrictEqual([{ code: 'package.quantity.integer', path: ['quantity'] }])
})

test('minSupportRatio must lie in [0, 1]: 1.2 and -0.1 are rejected, both bounds are accepted', () => {
  const outOfRange = [{ code: 'package.minSupportRatio.range', path: ['minSupportRatio'] }]
  expect([1.2, -0.1, 0, 1].map((minSupportRatio) => issuesWith({ minSupportRatio }))).toStrictEqual([
    outOfRange,
    outOfRange,
    [],
    [],
  ])
})

test('a package that is not stackable must carry a top load of 0 kg: 90 kg is rejected, 0 kg is accepted', () => {
  expect([
    issuesWith({ stackable: false, maxTopLoadKg: 90 }),
    issuesWith({ stackable: false, maxTopLoadKg: 0 }),
  ]).toStrictEqual([[{ code: 'package.maxTopLoadKg.notStackable', path: ['maxTopLoadKg'] }], []])
})

test('a package kept upright is rejected, not repaired, when it allows a lying orientation such as HLW (D-25)', () => {
  const withHlw = ['LWH', 'HLW']
  expect([
    issuesWith({ keepUpright: true, allowedOrientations: withHlw }),
    issuesWith({ keepUpright: false, allowedOrientations: withHlw }),
  ]).toStrictEqual([[{ code: 'package.keepUpright.orientation', path: ['allowedOrientations', 1] }], []])
})

test('a package with no allowed orientation is rejected (Spec §13: PKG-001 has no allowed orientation)', () => {
  expect(issuesWith({ allowedOrientations: [] })).toStrictEqual([
    { code: 'package.allowedOrientations.empty', path: ['allowedOrientations'] },
  ])
})

test('an orientation listed twice is rejected at its repeated occurrence', () => {
  expect(issuesWith({ allowedOrientations: ['LWH', 'WLH', 'LWH'] })).toStrictEqual([
    { code: 'package.allowedOrientations.duplicate', path: ['allowedOrientations', 2] },
  ])
})

test('every package dimension must be greater than 0 cm', () => {
  const notPositive = (field: string) => ({ code: 'package.dimension.positive', path: [field] })
  expect(issuesWith({ lengthCm: 0, widthCm: -60, heightCm: 0 })).toStrictEqual([
    notPositive('lengthCm'),
    notPositive('widthCm'),
    notPositive('heightCm'),
  ])
})

test('package weight must not be negative: -1 kg is rejected, 0 kg is accepted', () => {
  expect([issuesWith({ weightKg: -1 }), issuesWith({ weightKg: 0 })]).toStrictEqual([
    [{ code: 'package.weightKg.nonNegative', path: ['weightKg'] }],
    [],
  ])
})

test('the top load a stackable package bears must not be negative', () => {
  expect(issuesWith({ maxTopLoadKg: -5 })).toStrictEqual([{ code: 'package.maxTopLoadKg.nonNegative', path: ['maxTopLoadKg'] }])
})

test('maxStackCount is optional, but when given it must be a whole number of at least 1 tier', () => {
  expect([
    issuesWith({ maxStackCount: 0 }),
    issuesWith({ maxStackCount: 1.5 }),
    issuesWith({ maxStackCount: undefined }),
  ]).toStrictEqual([
    [{ code: 'package.maxStackCount.min', path: ['maxStackCount'] }],
    [{ code: 'package.maxStackCount.integer', path: ['maxStackCount'] }],
    [],
  ])
})

test('deliveryStop is a whole stop number starting at 1: 0 and 1.5 are rejected', () => {
  expect([issuesWith({ deliveryStop: 0 }), issuesWith({ deliveryStop: 1.5 })]).toStrictEqual([
    [{ code: 'package.deliveryStop.min', path: ['deliveryStop'] }],
    [{ code: 'package.deliveryStop.integer', path: ['deliveryStop'] }],
  ])
})

test('a length that is not a finite number, like NaN from an empty input or Infinity, gets the number type code', () => {
  const notFinite = [{ code: 'common.number.invalid', path: ['lengthCm'] }]
  expect([issuesWith({ lengthCm: Number.NaN }), issuesWith({ lengthCm: Number.POSITIVE_INFINITY })]).toStrictEqual([
    notFinite,
    notFinite,
  ])
})

test('API values of the wrong type or outside the allowed set get a type code at their field, not a zod sentence', () => {
  const wrongTypes = { name: 42, weightKg: '30', allowedOrientations: 'LWH', fragilityLevel: 'VERY_HIGH', mustLoad: 'true' }
  expect(issuesWith(wrongTypes)).toStrictEqual([
    { code: 'common.string.invalid', path: ['name'] },
    { code: 'common.number.invalid', path: ['weightKg'] },
    { code: 'common.array.invalid', path: ['allowedOrientations'] },
    { code: 'common.enum.invalid', path: ['fragilityLevel'] },
    { code: 'common.boolean.invalid', path: ['mustLoad'] },
  ])
})

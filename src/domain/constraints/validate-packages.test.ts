import { expect, test } from 'vitest'
import { validatePackages } from '@/domain/constraints'
import { SPEC_CARTON_A } from '@/domain/fixtures/spec-samples'
import type { CargoPackage } from '@/domain/models'

/** Carton A of Spec §12 (PKG-001, kept upright, allows LWH and WLH) with some fields replaced. */
function cargo(changes: Partial<CargoPackage>): CargoPackage {
  return { ...SPEC_CARTON_A, ...changes }
}

test('the Spec §12 sample package Carton A has no issue', () => {
  expect(validatePackages([SPEC_CARTON_A])).toStrictEqual([])
})

test('Spec §13 "Package PKG-001 has no allowed orientation." points at the orientation field of that package', () => {
  expect(validatePackages([cargo({ allowedOrientations: [] })])).toStrictEqual([
    { code: 'NO_ALLOWED_ORIENTATION', severity: 'error', field: 'allowedOrientations', params: { packageId: 'PKG-001' } },
  ])
})

test('a package kept upright whose list holds only lying orientations has none it can use, until keepUpright is off', () => {
  const lyingOnly = cargo({ allowedOrientations: ['LHW', 'HWL'] })
  expect([
    validatePackages([{ ...lyingOnly, keepUpright: true }]).map(({ code, field }) => [code, field]),
    validatePackages([{ ...lyingOnly, keepUpright: false }]),
  ]).toStrictEqual([[['NO_ALLOWED_ORIENTATION', 'allowedOrientations']], []])
})

test('every package dimension must be above 0 cm, reported at its field for the package it belongs to', () => {
  // NaN is what an emptied numeric input holds
  const flat = cargo({ lengthCm: 0, widthCm: -60 })
  const unmeasured = cargo({ id: 'PKG-002', heightCm: Number.NaN })
  const notPositive = (field: string, packageId: string) => ({
    code: 'DIMENSION_NOT_POSITIVE',
    severity: 'error',
    field,
    params: { entity: 'package', packageId },
  })
  expect(validatePackages([flat, unmeasured])).toStrictEqual([
    notPositive('lengthCm', 'PKG-001'),
    notPositive('widthCm', 'PKG-001'),
    notPositive('heightCm', 'PKG-002'),
  ])
})

test('a package id that collides with an instance id of another package is reported for the whole request (D-33)', () => {
  // PKG-001 × 4 expands to PKG-001-01 … PKG-001-04, and the second package is itself called PKG-001-01
  expect(validatePackages([SPEC_CARTON_A, cargo({ id: 'PKG-001-01', quantity: 1 })])).toStrictEqual([
    {
      code: 'DUPLICATE_INSTANCE_ID',
      severity: 'error',
      packageInstanceId: 'PKG-001-01',
      relatedIds: ['PKG-001', 'PKG-001-01'],
      params: { occurrences: 2 },
    },
  ])
})

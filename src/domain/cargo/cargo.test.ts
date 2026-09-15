import { expect, test } from 'vitest'
import { expandPackages, nextPackageId } from '@/domain/cargo'
import { SPEC_CARTON_A } from '@/domain/fixtures/spec-samples'
import type { CargoPackage } from '@/domain/models'

/** Carton A của Spec mục 12 dưới mã và số lượng khác, để dựng request nhiều dòng kiện. */
function cargo(id: string, quantity: number): CargoPackage {
  return { ...SPEC_CARTON_A, id, quantity }
}

function instanceIds(packages: readonly CargoPackage[]): string[] {
  return expandPackages(packages).instances.map(({ packageInstanceId }) => packageInstanceId)
}

test('the Spec sample Carton A with quantity 4 expands to PKG-001-01 … PKG-001-04 (Spec §12)', () => {
  expect(instanceIds([SPEC_CARTON_A])).toStrictEqual(['PKG-001-01', 'PKG-001-02', 'PKG-001-03', 'PKG-001-04'])
})

test('quantity 100 numbers its instances with three digits, PKG-001-001 through PKG-001-100', () => {
  const ids = instanceIds([cargo('PKG-001', 100)])
  expect([ids.length, ids[0], ids[9], ids[99]]).toStrictEqual([100, 'PKG-001-001', 'PKG-001-010', 'PKG-001-100'])
})

test('the 100 instance ids of a quantity-100 package are unique and already in string sort order', () => {
  const ids = instanceIds([cargo('PKG-001', 100)])
  expect([new Set(ids).size, ids.toSorted()]).toStrictEqual([100, ids])
})

test('instances follow the order of the request, then their number, not the order of package ids', () => {
  expect(instanceIds([cargo('PKG-002', 2), SPEC_CARTON_A])).toStrictEqual([
    'PKG-002-01',
    'PKG-002-02',
    'PKG-001-01',
    'PKG-001-02',
    'PKG-001-03',
    'PKG-001-04',
  ])
})

test('every instance traces back to the id of its package through packageIdByInstanceId', () => {
  const { packageIdByInstanceId } = expandPackages([SPEC_CARTON_A, cargo('PKG-002', 2)])
  expect([...packageIdByInstanceId]).toStrictEqual([
    ['PKG-001-01', 'PKG-001'],
    ['PKG-001-02', 'PKG-001'],
    ['PKG-001-03', 'PKG-001'],
    ['PKG-001-04', 'PKG-001'],
    ['PKG-002-01', 'PKG-002'],
    ['PKG-002-02', 'PKG-002'],
  ])
})

test('an instance carries what packing reads from its package, but not its id, name, quantity, group or notes', () => {
  const labelled: CargoPackage = { ...SPEC_CARTON_A, groupId: 'DH-2026-0915', notes: 'Tránh ẩm' }
  expect(expandPackages([labelled]).instances[0]).toStrictEqual({
    packageInstanceId: 'PKG-001-01',
    lengthCm: 120,
    widthCm: 60,
    heightCm: 45,
    weightKg: 30,
    allowedOrientations: ['LWH', 'WLH'],
    keepUpright: true,
    fragilityLevel: 'LOW',
    stackable: true,
    maxTopLoadKg: 90,
    maxStackCount: 3,
    minSupportRatio: 0.8,
    deliveryStop: 2,
    priority: 1,
    mustLoad: true,
  })
})

test('a request whose package and instance ids are all distinct reports no duplicate', () => {
  expect(expandPackages([SPEC_CARTON_A, cargo('PKG-002', 2)]).issues).toStrictEqual([])
})

test('a package whose own id is PKG-001-01 collides with the first instance of PKG-001 in the same request', () => {
  expect(expandPackages([SPEC_CARTON_A, cargo('PKG-001-01', 1)]).issues).toStrictEqual([
    {
      code: 'DUPLICATE_INSTANCE_ID',
      severity: 'error',
      packageInstanceId: 'PKG-001-01',
      relatedIds: ['PKG-001', 'PKG-001-01'],
      params: { occurrences: 2 },
    },
  ])
})

test('two packages sharing an id are reported once for that id, not again for every instance id they share', () => {
  expect(expandPackages([cargo('PKG-001', 2), cargo('PKG-001', 2)]).issues).toStrictEqual([
    {
      code: 'DUPLICATE_INSTANCE_ID',
      severity: 'error',
      packageInstanceId: 'PKG-001',
      relatedIds: ['PKG-001'],
      params: { occurrences: 2 },
    },
  ])
})

test('a collision is still reported when the colliding packages also share an id, counting every package using it', () => {
  // PKG-001-01 is the first instance of both PKG-001 packages and the id of the third package
  expect(expandPackages([cargo('PKG-001', 2), cargo('PKG-001', 2), cargo('PKG-001-01', 1)]).issues).toStrictEqual([
    {
      code: 'DUPLICATE_INSTANCE_ID',
      severity: 'error',
      packageInstanceId: 'PKG-001',
      relatedIds: ['PKG-001'],
      params: { occurrences: 2 },
    },
    {
      code: 'DUPLICATE_INSTANCE_ID',
      severity: 'error',
      packageInstanceId: 'PKG-001-01',
      relatedIds: ['PKG-001', 'PKG-001-01'],
      params: { occurrences: 3 },
    },
  ])
})

test('duplicating the Spec sample package PKG-001 gives the next id, PKG-002', () => {
  expect(nextPackageId(['PKG-001'])).toBe('PKG-002')
})

test('the next package id follows the highest existing number, wherever it sits in the list', () => {
  expect(nextPackageId(['PKG-001', 'PKG-012', 'PKG-003'])).toBe('PKG-013')
})

test('the first package id of an empty list is PKG-001, the Spec sample form', () => {
  expect(nextPackageId([])).toBe('PKG-001')
})

test('ids that are not in the PKG-number form do not affect the next package id', () => {
  expect(nextPackageId(['PKG-001', 'PKG-12A', 'KHO-A-15', 'THUNG-SUA'])).toBe('PKG-002')
})

test('a package id shaped like an instance of PKG-002 reserves that number, so the copy cannot collide with it', () => {
  // PKG-002 would expand to PKG-002-01, the id of an existing package (DUPLICATE_INSTANCE_ID)
  expect(nextPackageId(['PKG-001', 'PKG-002-01'])).toBe('PKG-003')
})

test('zero padding keeps the width of the existing ids and widens only when the number needs more digits', () => {
  expect([nextPackageId(['PKG-0009']), nextPackageId(['PKG-999'])]).toStrictEqual(['PKG-0010', 'PKG-1000'])
})

import { expect, test } from 'vitest'
import type { CargoPackage, DeliveryStop } from './trip-packages'
import { duplicatePackage, packageCountByStop, renumberDeliveryStops, stopRemoval } from './trip-packages'

const STOPS: DeliveryStop[] = [
  { id: 'STOP-1', name: 'Thực phẩm Sài Gòn', address: 'Q.7' },
  { id: 'STOP-2', name: 'Co.opmart Bình Dương', address: 'Thủ Dầu Một' },
  { id: 'STOP-3', name: 'Bách Hoá Xanh Dĩ An', address: 'Dĩ An' },
]

function pkg(id: string, deliveryStop: number, extra: Partial<CargoPackage> = {}): CargoPackage {
  return {
    id, name: `Kiện ${id}`, lengthCm: 60, widthCm: 40, heightCm: 30, weightKg: 12, quantity: 2,
    allowedOrientations: ['LWH', 'WLH'], keepUpright: true, fragilityLevel: 'NONE', stackable: true,
    maxTopLoadKg: 80, minSupportRatio: 0.8, deliveryStop, priority: 0, mustLoad: false, ...extra,
  }
}

test('reordering stops renumbers deliveryStop by where each stop moved, not by its old number', () => {
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 2), pkg('PKG-003', 3)]
  // Kéo điểm 3 lên trước điểm 2: [1, 3, 2]
  const reordered = [STOPS[0]!, STOPS[2]!, STOPS[1]!]
  expect(renumberDeliveryStops(packages, STOPS, reordered).map((p) => [p.id, p.deliveryStop]))
    .toStrictEqual([['PKG-001', 1], ['PKG-002', 3], ['PKG-003', 2]])
})

test('renumbering keeps the same array when the order did not change', () => {
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 2)]
  expect(renumberDeliveryStops(packages, STOPS, [...STOPS])).toBe(packages)
})

test('package counts per stop use quantity and are indexed 1-based like deliveryStop', () => {
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 1, { quantity: 3 }), pkg('PKG-003', 3, { quantity: 1 })]
  expect([...packageCountByStop(packages).entries()]).toStrictEqual([[1, 5], [3, 1]])
})

test('removing a stop is blocked while packages point at it, and renumbers the rest when allowed', () => {
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 2, { quantity: 4 }), pkg('PKG-003', 3)]
  const blocked = stopRemoval(packages, STOPS, 'STOP-2')
  expect([blocked.allowed, blocked.affectedPackages, blocked.affectedInstances]).toStrictEqual([false, 1, 4])
  const empty = stopRemoval([pkg('PKG-001', 1), pkg('PKG-003', 3)], STOPS, 'STOP-2')
  expect([empty.allowed, empty.stops.map((s) => s.id), empty.packages.map((p) => p.deliveryStop)])
    .toStrictEqual([true, ['STOP-1', 'STOP-3'], [1, 2]])
})

test('duplicating a package gives it the next free id and keeps every other field', () => {
  const source = pkg('PKG-007', 2, { notes: 'Xếp sát vách' })
  const copy = duplicatePackage(source, ['PKG-001', 'PKG-007', 'PKG-007-01'])
  expect(copy).toStrictEqual({ ...source, id: 'PKG-008' })
})

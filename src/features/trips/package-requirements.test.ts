import { expect, test } from 'vitest'
import { createMockDb } from '@/lib/mock-db'
import { isFragile, packageRequirements } from './package-requirements'

/** Seam: chip yêu cầu xếp của bảng kiện, suy từ trường của kiện trong seed chuyến chính (seed-trip.ts). */
async function seedPackages() {
  const [trip] = await createMockDb().listTrips()
  return new Map(trip!.packages.map((pkg) => [pkg.id, pkg]))
}

test('seed trip: glass and eggs are fragile, the fruit crate is somewhat fragile, medical supplies turn any way', async () => {
  const packages = await seedPackages()
  const requirements = (id: string) => packageRequirements(packages.get(id)!)
  // PKG-003 thuỷ tinh và PKG-005 trứng: mức Cao; PKG-004 sọt trái cây: mức Trung bình; PKG-006 thuốc: đủ 6 hướng, không giữ đứng
  expect(requirements('PKG-003')[0]).toBe('fragile')
  expect(requirements('PKG-005')[0]).toBe('fragile')
  expect(requirements('PKG-004')[0]).toBe('fragileMedium')
  expect(requirements('PKG-006')).toContain('anyOrientation')
  expect(requirements('PKG-006')).not.toContain('upright')
})

test('"fragile" is the high level only: the seed trip has 22 fragile packages (11 glass + 11 egg trays)', async () => {
  const packages = [...(await seedPackages()).values()]
  const fragile = packages.filter(isFragile)
  expect(fragile.map((pkg) => pkg.id).toSorted()).toStrictEqual(['PKG-003', 'PKG-005'])
  expect(fragile.reduce((sum, pkg) => sum + pkg.quantity, 0)).toBe(22)
})

test('a package that must stay upright and cannot carry anything lists both, fragility first', async () => {
  const pkg = (await seedPackages()).get('PKG-003')!
  expect(packageRequirements({ ...pkg, keepUpright: true, stackable: false, maxTopLoadKg: 0 })).toStrictEqual(['fragile', 'upright', 'noStack'])
})

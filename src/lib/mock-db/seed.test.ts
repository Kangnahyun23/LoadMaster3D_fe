import { expect, test } from 'vitest'
import { expandPackages } from '@/domain/cargo'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { cargoPackageSchema, vehicleConfigSchema } from '@/domain/models'
import { createMockDb } from '@/lib/mock-db'

test('a new database starts with the Spec Truck 6m followed by three Vietnamese trucks, all valid vehicle configs', async () => {
  const vehicles = await createMockDb().listVehicles()
  expect(vehicles.map(({ id, name }) => [id, name])).toStrictEqual([
    ['VEHICLE-001', 'Truck 6m'],
    ['VEHICLE-002', 'Hyundai HD210 · 60C-446.32'],
    ['VEHICLE-003', 'Isuzu NQR 550 · 51C-284.19'],
    ['VEHICLE-004', 'Hino FC9J đông lạnh · 51C-190.07'],
  ])
  expect(vehicles[0]).toStrictEqual(SPEC_TRUCK_6M)
  for (const vehicle of vehicles) expect(vehicleConfigSchema.parse(vehicle)).toStrictEqual(vehicle)
})

test('every new database starts from the same seed, with the same ids and data, and keeps its own changes', async () => {
  const first = createMockDb()
  const second = createMockDb()
  expect(await first.listVehicles()).toStrictEqual(await second.listVehicles())
  expect(await first.listTrips()).toStrictEqual(await second.listTrips())
  await first.deleteVehicle('VEHICLE-004')
  expect((await second.listVehicles()).map(({ id }) => id)).toContain('VEHICLE-004')
})

test('the sample trip carries 132 valid package instances to four real stops on the Hyundai HD210, not yet optimized', async () => {
  const db = createMockDb()
  expect((await db.listTrips()).map(({ id }) => id)).toStrictEqual(['TRIP-2026-0914'])
  const trip = await db.getTrip('TRIP-2026-0914')
  expect(trip.vehicleId).toBe('VEHICLE-002')
  expect(trip.inputVersion).toBe(1)
  expect(trip.stops.map(({ name, address }) => [name, address])).toStrictEqual([
    ['Công ty TNHH Thực phẩm Sài Gòn', '12 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh'],
    ['Siêu thị Co.opmart Bình Dương', '30 Đại lộ Bình Dương, Thủ Dầu Một'],
    ['Kho Bách Hoá Xanh Dĩ An', '215 Quốc lộ 1K, P. Đông Hoà, Dĩ An'],
    ['Nhà thuốc Long Châu Biên Hoà', '58 Võ Thị Sáu, P. Quyết Thắng, Biên Hoà'],
  ])
  for (const pkg of trip.packages) expect(cargoPackageSchema.parse(pkg)).toStrictEqual(pkg)
  const { instances, issues } = expandPackages(trip.packages)
  expect(issues).toStrictEqual([])
  expect(instances).toHaveLength(132)
  expect(new Set(instances.map(({ deliveryStop }) => deliveryStop))).toStrictEqual(new Set([1, 2, 3, 4]))
  // 38 × 48 + 35 × 52 + 11 × 13.5 + 16 × 45 + 11 × 6.5 + 21 × 60 kg, within the 9,500 kg payload of the HD210
  expect(instances.reduce((sum, { weightKg }) => sum + weightKg, 0)).toBe(5844)
  expect(await db.listRevisions(trip.id)).toStrictEqual([])
})

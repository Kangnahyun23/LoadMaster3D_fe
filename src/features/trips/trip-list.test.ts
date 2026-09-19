import { expect, test } from 'vitest'
import { createMockDb } from '@/lib/mock-db'
import { tripRow } from './trip-list'

/** Seam: dòng danh sách chuyến dựng từ dữ liệu kho (chuyến + xe + revision), không có số nào ngoài kho. */
async function seed() {
  const db = createMockDb()
  const [trip] = await db.listTrips()
  const vehicle = await db.getVehicle(trip!.vehicleId)
  return { db, trip: trip!, vehicle }
}

test('seed trip: approved revision gives its volume utilisation and the "approved" status', async () => {
  const { db, trip, vehicle } = await seed()
  const row = tripRow(trip, vehicle, await db.listRevisions(trip.id))
  expect(row).toMatchObject({
    id: 'TRIP-2026-0914', name: trip.name, vehicleName: vehicle.name, stopCount: 4,
    packageCount: 132, status: 'da_duyet',
  })
  expect(row.volumePercent).toBeCloseTo(40.8, 1)
  expect(row.route).toBe(trip.stops.map((stop) => stop.name).join(' → '))
})

test('a trip without revisions is a draft with no utilisation', async () => {
  const { db, vehicle } = await seed()
  const created = await db.createTrip({ name: 'Chuyến Q.7', vehicleId: vehicle.id, stops: [{ id: 'S1', name: 'Q.7', address: '' }], packages: [], scheduledDate: '2026-09-15' })
  expect(tripRow(created, vehicle, [])).toMatchObject({ packageCount: 0, volumePercent: null, status: 'nhap' })
})

test('changing cargo after optimisation makes the trip need review', async () => {
  const { db, trip, vehicle } = await seed()
  const changed = await db.updateTrip(trip.id, { packages: trip.packages.slice(1) })
  expect(tripRow(changed, vehicle, await db.listRevisions(trip.id)).status).toBe('can_xem_lai')
})

test('an optimised but not yet approved trip is "optimised"', async () => {
  const { db, trip, vehicle } = await seed()
  const [source] = await db.listRevisions(trip.id)
  expect(tripRow(trip, vehicle, [source!]).status).toBe('da_toi_uu')
})

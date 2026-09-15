import { expect, test } from 'vitest'
import { createMockDb } from '@/lib/mock-db'
import { twoCartonRequest, twoCartonResult, twoCartonTrip } from '@/test/mock-db-samples'

test('a created trip gets the next trip id and starts at input version 1', async () => {
  const db = createMockDb()
  expect(await db.createTrip(twoCartonTrip())).toStrictEqual({ ...twoCartonTrip(), id: 'TRIP-001', inputVersion: 1 })
  expect((await db.listTrips()).map(({ id }) => id)).toStrictEqual(['TRIP-2026-0914', 'TRIP-001'])
})

test('an update changes only the fields it gives and never the id or the input version', async () => {
  const db = createMockDb()
  const before = await db.getTrip('TRIP-2026-0914')
  const renamed = await db.updateTrip(before.id, { name: 'Tuyến Dĩ An – Biên Hoà' })
  expect(renamed).toStrictEqual({ ...before, name: 'Tuyến Dĩ An – Biên Hoà' })
  // A caller spreading an old copy of the trip must not reset the version that revisions are compared with
  const spreadOldCopy = { ...renamed, id: 'TRIP-999', inputVersion: 0 }
  expect(await db.updateTrip(before.id, spreadOldCopy)).toStrictEqual(renamed)
})

test('a trip must exist to be updated and must use an existing vehicle', async () => {
  const db = createMockDb()
  await expect(db.updateTrip('TRIP-404', { name: 'Tuyến mới' })).rejects.toMatchObject({
    code: 'NOT_FOUND',
    params: { collection: 'trips', id: 'TRIP-404' },
  })
  const missingVehicle = { code: 'NOT_FOUND', params: { collection: 'vehicles', id: 'VEHICLE-404' } }
  await expect(db.createTrip({ ...twoCartonTrip(), vehicleId: 'VEHICLE-404' })).rejects.toMatchObject(missingVehicle)
  await expect(db.updateTrip('TRIP-2026-0914', { vehicleId: 'VEHICLE-404' })).rejects.toMatchObject(missingVehicle)
})

test('revisions cannot be listed or added for a trip that does not exist', async () => {
  const db = createMockDb()
  const missingTrip = { code: 'NOT_FOUND', params: { collection: 'trips', id: 'TRIP-404' } }
  await expect(db.listRevisions('TRIP-404')).rejects.toMatchObject(missingTrip)
  const newRevision = { tripId: 'TRIP-404', request: twoCartonRequest(), result: twoCartonResult() }
  await expect(db.addRevision(newRevision)).rejects.toMatchObject(missingTrip)
})

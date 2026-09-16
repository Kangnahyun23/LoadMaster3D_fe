import { expect, test } from 'vitest'
import { createMockDb } from '@/lib/mock-db'
import { adaptResult } from './scene-input'

async function seededApproved() {
  const db = createMockDb()
  const trip = await db.getTrip('TRIP-2026-0914')
  const [, approved] = await db.listRevisions(trip.id)
  if (approved === undefined) throw new Error('seed has no approved revision')
  return { trip, approved }
}

test('adaptResult turns every placement of the approved seed revision into a cm scene placement without touching the result', async () => {
  const { trip, approved } = await seededApproved()
  const before = structuredClone(approved)
  const model = adaptResult({ trip, revision: approved })
  const [first] = approved.result.placements
  const scene = model.placementById.get(first?.packageInstanceId ?? '')
  expect({
    count: model.placements.length,
    first: scene && { position: scene.position, size: [scene.lengthCm, scene.widthCm, scene.heightCm], step: scene.step, orientation: scene.orientation },
    vehicle: model.vehicle.innerLengthCm,
    untouched: approved,
    frozen: Object.isFrozen(scene) && Object.isFrozen(scene?.position) && Object.isFrozen(model.placements),
  }).toStrictEqual({
    count: 132,
    first: first && {
      position: { x: first.xCm, y: first.yCm, z: first.zCm },
      size: [first.placedLengthCm, first.placedWidthCm, first.placedHeightCm],
      step: first.loadingOrder,
      orientation: first.orientation,
    },
    vehicle: approved.request.vehicle.innerLengthCm,
    untouched: before,
    frozen: true,
  })
})

test('adaptResult names each placement after its package and delivery stop, so stop colours follow the trip', async () => {
  const { trip, approved } = await seededApproved()
  const model = adaptResult({ trip, revision: approved })
  const packageById = new Map(approved.request.packages.map((pkg) => [pkg.id, pkg]))
  for (const placement of model.placements) {
    const pkg = packageById.get(placement.packageId)
    expect([placement.name, placement.stop]).toStrictEqual([pkg?.name, pkg?.deliveryStop])
  }
  expect(model.stops.map(({ number, name }) => [number, name])).toStrictEqual(trip.stops.map(({ name }, index) => [index + 1, name]))
})

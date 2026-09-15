import { expect, test } from 'vitest'
import { createMockDb } from '@/lib/mock-db'
import type { LoadPlan } from '@/types/load-plan'
import { adaptLoadPlan, adaptResult } from './scene-input'

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

test('adaptLoadPlan converts a legacy mm plan to cm at the boundary and maps orientation 0/1/2 to LWH/WLH/HWL', () => {
  const plan: LoadPlan = {
    tripId: 'TRIP-OLD',
    vehicle: { name: 'Hino 500', plate: '51C-123.45', innerLengthMm: 7200, innerWidthMm: 2350, innerHeightMm: 2400, payloadKg: 8000 },
    fillRate: 12.5,
    stops: [{ number: 1, name: 'Kho Tân Bình', packageCount: 1 }],
    placements: [{ id: 'PKG-1', orderId: 'DH-1', stop: 1, lengthMm: 455, widthMm: 600, heightMm: 1205, weightKg: 12, position: { x: 1205, y: 0, z: 0 },
      step: 1, orientation: 2, packaging: 'crate', fragile: true, pinned: false }],
    unplaced: [],
  }
  const model = adaptLoadPlan(plan)
  const [placement] = model.placements
  expect({
    vehicle: [model.vehicle.innerLengthCm, model.vehicle.innerWidthCm, model.vehicle.innerHeightCm, model.vehicle.maxPayloadKg],
    size: placement && [placement.lengthCm, placement.widthCm, placement.heightCm],
    position: placement?.position,
    orientation: placement?.orientation,
    // orientation 2 (C×R×D) stood the package's 120.5 cm length upright: the package itself is 120.5 long, 60 wide, 45.5 tall
    base: model.baseDimensionsById.get('PKG-1'),
  }).toStrictEqual({
    vehicle: [720, 235, 240, 8000],
    size: [45.5, 60, 120.5],
    position: { x: 120.5, y: 0, z: 0 },
    orientation: 'HWL',
    base: { lengthCm: 120.5, widthCm: 60, heightCm: 45.5 },
  })
})

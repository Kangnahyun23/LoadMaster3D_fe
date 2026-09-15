import { expect, test } from 'vitest'
import { expandPackages } from '@/domain/cargo'
import {
  applyPose,
  createConstraintEngine,
  createPlacementLayout,
  supportRatio,
  type ConstraintEngine,
  type PlacementPose,
} from '@/domain/constraints'
import { SPEC_CARTON_A, SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { effectiveOrientations, orientDimensions } from '@/domain/geometry'
import type { CargoPackage, PackagePlacement, VehicleConfig } from '@/domain/models'
import { dropAt, seededRandom } from '@/test/placements'

/** Carton A instances on the floor at y 60, one per x. */
function cartonsAt(...xs: number[]): PackagePlacement[] {
  return xs.map((xCm, index) => ({ ...SPEC_CARTON_A_PLACEMENT, packageInstanceId: `PKG-001-0${index + 1}`, xCm, yCm: 60 }))
}

function engineFor(placements: PackagePlacement[]): ConstraintEngine {
  return createConstraintEngine({ vehicle: SPEC_TRUCK_6M, packages: [SPEC_CARTON_A], placements, settings: { enforceLifo: true } })
}

const INTO_OVERLAP: PlacementPose = { xCm: 300, yCm: 60, zCm: 0, orientation: 'LWH' }

test('evaluateMove reports the plan as if the package moved, and leaves the engine as it was', () => {
  const placements = cartonsAt(240, 400)
  const engine = engineFor(placements)
  const before = engine.evaluateAll()
  const preview = engine.evaluateMove('PKG-001-02', INTO_OVERLAP)
  expect(preview.byInstanceId.get('PKG-001-02')?.map(({ code }) => code)).toStrictEqual(['OVERLAP'])
  expect({ after: engine.evaluateAll(), placements: engine.placements() }).toStrictEqual({ after: before, placements })
})

test('commitMove keeps the move, with the position rounded to 0.1 cm at the commit boundary', () => {
  const engine = engineFor(cartonsAt(240, 400))
  const committed = engine.commitMove('PKG-001-02', { ...INTO_OVERLAP, xCm: 300.04 })
  expect({
    xCm: engine.placements()[1]?.xCm,
    codes: committed.byInstanceId.get('PKG-001-02')?.map(({ code }) => code),
    again: engine.evaluateAll(),
  }).toStrictEqual({ xCm: 300, codes: ['OVERLAP'], again: committed })
})

const VEHICLE: VehicleConfig = {
  ...SPEC_TRUCK_6M,
  obstacles: [
    ...SPEC_TRUCK_6M.obstacles,
    { id: 'OBS-002', type: 'RESERVED_ZONE', xCm: 480, yCm: 180, zCm: 0, lengthCm: 120, widthCm: 60, heightCm: 40, loadBearing: true, maxTopLoadKg: 60 },
  ],
}
const PACKAGES: CargoPackage[] = [
  { ...SPEC_CARTON_A, quantity: 20 },
  { ...SPEC_CARTON_A, id: 'PKG-002', name: 'Thùng sơn', lengthCm: 60, widthCm: 40, heightCm: 30, weightKg: 18.5, quantity: 20, keepUpright: false, allowedOrientations: ['LWH', 'WLH', 'HWL'], maxTopLoadKg: 40, maxStackCount: 4, minSupportRatio: 0.7, deliveryStop: 1 },
  { ...SPEC_CARTON_A, id: 'PKG-003', name: 'Bao gạo', lengthCm: 80, widthCm: 50, heightCm: 25, weightKg: 50, quantity: 15, keepUpright: false, allowedOrientations: ['LWH', 'WLH', 'LHW', 'WHL', 'HLW', 'HWL'], stackable: false, maxTopLoadKg: 0, minSupportRatio: 0.9, deliveryStop: 3 },
]
const INSTANCES = new Map(expandPackages(PACKAGES).instances.map((instance) => [instance.packageInstanceId, instance]))

/**
 * A random allowed orientation and corner, dropped onto whatever is below (floor, obstacle tops, package tops); one pose in
 * five sinks 10 cm into it, so overlaps happen too.
 */
function randomPose(id: string, others: Iterable<PackagePlacement>, random: () => number): PlacementPose {
  const instance = INSTANCES.get(id)
  if (instance === undefined) throw new Error(id)
  const orientations = effectiveOrientations(instance)
  const orientation = orientations[Math.floor(random() * orientations.length)] ?? 'LWH'
  const { placedLengthCm, placedWidthCm, placedHeightCm } = orientDimensions(instance, orientation)
  const corner: [number, number] = [
    10 * Math.floor(random() * ((600 - placedLengthCm) / 10 + 1)),
    10 * Math.floor(random() * ((240 - placedWidthCm) / 10 + 1)),
  ]
  const { xCm, yCm, zCm } = dropAt(id, corner, [placedLengthCm, placedWidthCm, placedHeightCm], others, VEHICLE.obstacles)
  const sinkCm = random() < 0.2 ? 10 : 0
  return { xCm, yCm, zCm: Math.max(0, zCm - sinkCm), orientation }
}

test('after 500 deterministic random commits the engine reports exactly what an engine built from scratch reports', () => {
  const random = seededRandom(23_092_026)
  const placements: PackagePlacement[] = []
  for (const [index, id] of [...INSTANCES.keys()].entries()) {
    const template = { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId: id, loadingOrder: index + 1, unloadingOrder: INSTANCES.size - index }
    placements.push(applyPose(template, randomPose(id, placements, random), INSTANCES.get(id) ?? SPEC_CARTON_A))
  }
  const settings = { enforceLifo: true }
  const engine = createConstraintEngine({ vehicle: VEHICLE, packages: PACKAGES, placements, settings })
  const seenCodes = new Set<string>()
  const ids = [...INSTANCES.keys()]

  for (let move = 1; move <= 500; move += 1) {
    const id = ids[Math.floor(random() * ids.length)] ?? 'PKG-001-01'
    if (move % 25 === 0) {
      const before = engine.evaluateAll()
      engine.evaluateMove(id, randomPose(id, engine.placements(), random))
      expect(engine.evaluateAll()).toStrictEqual(before)
    }
    const committed = engine.commitMove(id, randomPose(id, engine.placements(), random))
    committed.issues.forEach(({ code }) => seenCodes.add(code))
    if (move % 50 !== 0) continue
    const rebuilt = createConstraintEngine({ vehicle: VEHICLE, packages: PACKAGES, placements: engine.placements(), settings }).evaluateAll()
    expect(committed.issues).toStrictEqual(rebuilt.issues)
    const layout = createPlacementLayout(VEHICLE, engine.placements())
    for (const placement of engine.placements()) {
      const id = placement.packageInstanceId
      expect(committed.supportRatioById.get(id)).toBe(supportRatio(placement, layout))
      expect(Math.abs((committed.loadById.get(id) ?? 0) - (rebuilt.loadById.get(id) ?? 0))).toBeLessThanOrEqual(1e-9)
    }
  }
  // the random plans must exercise the incremental paths, or matching a rebuild proves little
  const exercised = ['OVERLAP', 'SUPPORT_BELOW_MIN', 'LIFO_PARTIAL', 'TOP_LOAD_EXCEEDED', 'NOT_STACKABLE', 'LOADING_ORDER_INFEASIBLE']
  expect(exercised.filter((code) => !seenCodes.has(code))).toStrictEqual([])
}, 60_000)

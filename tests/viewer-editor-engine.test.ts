import { expect, test } from 'vitest'
import type { CargoPackage, OptimizationRequest, OptimizationResult, PackagePlacement } from '@/domain/models'
import { createEditorEngine } from '@/features/viewer3d/editor/editor-engine'
import { adaptResult, type ScenePlacement } from '@/features/viewer3d/scene-input'

const VEHICLE: OptimizationRequest['vehicle'] = {
  id: 'TRUCK', name: 'Thùng thử', innerLengthCm: 720, innerWidthCm: 235, innerHeightCm: 240, maxPayloadKg: 5000,
  doorWidthCm: 235, doorHeightCm: 240, doorPosition: 'REAR', clearanceCm: 0,
  obstacles: [{ id: 'ARCH', type: 'WHEEL_ARCH', xCm: 300, yCm: 0, zCm: 0, lengthCm: 120, widthCm: 30, heightCm: 45, loadBearing: false }],
}

function pkg(id: string, size: [number, number, number], extra: Partial<CargoPackage> = {}): CargoPackage {
  return {
    id, name: id, lengthCm: size[0], widthCm: size[1], heightCm: size[2], weightKg: 10, quantity: 1,
    allowedOrientations: ['LWH', 'WLH', 'HWL'], keepUpright: false, fragilityLevel: 'NONE', stackable: true,
    maxTopLoadKg: 100, minSupportRatio: 0.8, deliveryStop: 1, priority: 0, mustLoad: false, ...extra,
  }
}

function at(id: string, [x, y, z]: [number, number, number], [l, w, h]: [number, number, number], order: number): PackagePlacement {
  return {
    packageInstanceId: `${id}-01`, orientation: 'LWH', xCm: x, yCm: y, zCm: z, placedLengthCm: l, placedWidthCm: w, placedHeightCm: h,
    loadingOrder: order, unloadingOrder: 4 - order, supportRatio: 1, constraintWarnings: [],
  }
}

/** A không xếp chồng được, C đỡ được; B nhỏ để đặt thử lên từng mặt. */
function scene() {
  const packages = [
    pkg('A', [100, 100, 50], { stackable: false }),
    pkg('B', [50, 50, 50], { keepUpright: true }),
    pkg('C', [100, 100, 50]),
  ]
  const placements = [at('A', [0, 0, 0], [100, 100, 50], 1), at('B', [200, 0, 0], [50, 50, 50], 3), at('C', [0, 120, 0], [100, 100, 50], 2)]
  const request: OptimizationRequest = {
    vehicle: VEHICLE, packages, settings: { method: 'MOCK', timeLimitSeconds: 10, enforceLifo: false, prioritizeLowCenterOfGravity: false },
  }
  const result: OptimizationResult = {
    jobId: 'JOB', status: 'COMPLETED', method: 'MOCK', isMockResult: true, placements, unplacedPackages: [],
    metrics: {
      totalVehicleVolumeCm3: 0, usedVolumeCm3: 0, volumeUtilizationPercent: 0, maxPayloadKg: 5000, usedPayloadKg: 30,
      payloadUtilizationPercent: 0, placedCount: 3, unplacedCount: 0, runtimeMs: 0,
    },
  }
  const model = adaptResult({ trip: { id: 'TRIP', stops: [{ name: 'Kho' }] }, revision: { request, result, ordersRecomputed: false } })
  return { model, engine: createEditorEngine(model)! }
}

const moved = (p: ScenePlacement, position: ScenePlacement['position']): ScenePlacement => ({ ...p, position })
const codes = (issues: readonly { code: string }[]) => issues.map(({ code }) => code)

test('dropping on a non-stackable package or a non-bearing wheel arch is blocked with the domain code', () => {
  const { model, engine } = scene()
  const b = model.placementById.get('B-01')!
  const onA = engine.check(moved(b, { x: 0, y: 0, z: 50 }))
  const onArch = engine.check(moved(b, { x: 300, y: 0, z: 45 }))
  expect([onA.valid, codes(onA.errors)]).toStrictEqual([false, ['NOT_STACKABLE']])
  expect([onArch.valid, codes(onArch.errors)]).toStrictEqual([false, ['NON_BEARING_SUPPORT']])
})

test('support below minSupportRatio still commits, as a warning with the measured ratio', () => {
  const { model, engine } = scene()
  // B 50 cm dài đặt từ x = 80 lên C (x 0..100): chỉ 20 cm đáy được đỡ → 20 × 50 / (50 × 50) = 0,4.
  const check = engine.check(moved(model.placementById.get('B-01')!, { x: 80, y: 120, z: 50 }))
  expect([check.valid, codes(check.warnings), check.supportRatio]).toStrictEqual([true, ['SUPPORT_BELOW_MIN'], 0.4])
})

test('leaving the cargo space is an error', () => {
  const { model, engine } = scene()
  expect(codes(engine.check(moved(model.placementById.get('B-01')!, { x: 690, y: 0, z: 0 })).errors)).toStrictEqual(['EXCEEDS_BOUNDARY'])
})

test('a forbidden orientation is an error, and overlap reports the other package whichever one is the issue subject', () => {
  const { model, engine } = scene()
  const b = model.placementById.get('B-01')!
  expect(codes(engine.check({ ...b, orientation: 'HWL' }).errors)).toContain('ORIENTATION_NOT_ALLOWED')
  const overlap = engine.check(moved(b, { x: 20, y: 20, z: 0 }))
  expect([overlap.valid, overlap.overlapIds]).toStrictEqual([false, ['A-01']])
})

test('sync moves the engine to the effective draft, so later checks see edited neighbours and undo restores them', () => {
  const { model, engine } = scene()
  const [a, b, c] = model.placements
  engine.sync([a!, moved(b!, { x: 400, y: 120, z: 0 }), c!])
  expect(engine.check(moved(c!, { x: 400, y: 120, z: 0 })).overlapIds).toStrictEqual(['B-01'])
  engine.sync(model.placements)
  expect(engine.check(moved(c!, { x: 400, y: 120, z: 0 })).valid).toBe(true)
})

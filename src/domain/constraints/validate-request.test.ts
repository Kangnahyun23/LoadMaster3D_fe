import { expect, test } from 'vitest'
import { validateRequest } from '@/domain/constraints'
import { SPEC_CARTON_A, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { CargoPackage, OptimizationRequest } from '@/domain/models'

/** Carton A of Spec §12 (30 kg × 4, mustLoad, kept upright) with some fields replaced. */
function cargo(changes: Partial<CargoPackage>): CargoPackage {
  return { ...SPEC_CARTON_A, ...changes }
}

/** Truck 6m loaded with Carton A (Spec §12), optimised with MOCK, the FE-first default method (Spec §9.4). */
const SPEC_REQUEST: OptimizationRequest = {
  vehicle: SPEC_TRUCK_6M,
  packages: [SPEC_CARTON_A],
  settings: { method: 'MOCK', timeLimitSeconds: 30, randomSeed: 42, enforceLifo: true, prioritizeLowCenterOfGravity: true },
}

test('the Spec §12 sample request, Truck 6m with four Carton A, has no issue', () => {
  expect(validateRequest(SPEC_REQUEST)).toStrictEqual([])
})

test('the validation summary gathers the vehicle, package, door and payload issues of a request, in that order (Spec §9.4)', () => {
  // 4 × 30 kg Carton A, 4 × 30 kg cartons without orientation and 4 × 1,270 kg upright crates too wide for the door: 5,320 kg
  const noOrientation = cargo({ id: 'PKG-002', allowedOrientations: [] })
  const wideCrate = cargo({ id: 'PKG-003', lengthCm: 240, widthCm: 230, heightCm: 120, weightKg: 1270, mustLoad: false })
  const request = { ...SPEC_REQUEST, vehicle: { ...SPEC_TRUCK_6M, innerLengthCm: 0 }, packages: [SPEC_CARTON_A, noOrientation, wideCrate] }
  expect(validateRequest(request)).toStrictEqual([
    { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerLengthCm', params: { entity: 'vehicle' } },
    { code: 'NO_ALLOWED_ORIENTATION', severity: 'error', field: 'allowedOrientations', params: { packageId: 'PKG-002' } },
    { code: 'DOOR_TOO_SMALL', severity: 'error', params: { packageId: 'PKG-003', doorWidthCm: 220, doorHeightCm: 230 } },
    { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params: { totalKg: 5320, maxPayloadKg: 5000, overKg: 320 } },
  ])
})

test('errors come first and keep their order, so the must-load error rises above the payload warning (D-23)', () => {
  // a 250 cm door in the 240 cm wide interior; 2 × 2,600 kg must-load machines and 2 × 60 kg optional cartons
  const machines = cargo({ weightKg: 2600, quantity: 2 })
  const cartons = cargo({ id: 'PKG-002', weightKg: 60, quantity: 2, mustLoad: false })
  const request = { ...SPEC_REQUEST, vehicle: { ...SPEC_TRUCK_6M, doorWidthCm: 250 }, packages: [machines, cartons] }
  expect(validateRequest(request).map(({ code, severity }) => [code, severity])).toStrictEqual([
    ['DOOR_EXCEEDS_INNER', 'error'],
    ['MUST_LOAD_PAYLOAD_EXCEEDED', 'error'],
    ['PAYLOAD_EXCEEDED', 'warning'],
  ])
})

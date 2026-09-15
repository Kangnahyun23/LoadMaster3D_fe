import { expect, test } from 'vitest'
import { checkPayload } from '@/domain/constraints'
import { SPEC_CARTON_A, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { CargoPackage } from '@/domain/models'

/** Carton A of Spec §12 (30 kg × 4, mustLoad) with some fields replaced. */
function cargo(changes: Partial<CargoPackage>): CargoPackage {
  return { ...SPEC_CARTON_A, ...changes }
}

test('the Spec §12 sample load, four 30 kg Carton A, stays within the 5,000 kg payload of Truck 6m', () => {
  expect(checkPayload([SPEC_CARTON_A], SPEC_TRUCK_6M)).toStrictEqual([])
})

test('Spec §13 "Total cargo weight 5,320 kg exceeds vehicle payload 5,000 kg." is a warning carrying the 320 kg excess (D-23)', () => {
  // 4 × 30 kg must-load cartons and 4 × 1,300 kg optional crates
  const load = [SPEC_CARTON_A, cargo({ id: 'PKG-002', weightKg: 1300, mustLoad: false })]
  expect(checkPayload(load, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params: { totalKg: 5320, maxPayloadKg: 5000, overKg: 320 } },
  ])
})

test('must-load cargo that alone exceeds the payload is an error with its own total, next to the warning for all cargo (D-23)', () => {
  // 2 × 2,600 kg must-load machines and 2 × 60 kg optional cartons
  const load = [cargo({ weightKg: 2600, quantity: 2 }), cargo({ id: 'PKG-002', weightKg: 60, quantity: 2, mustLoad: false })]
  expect(checkPayload(load, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params: { totalKg: 5320, maxPayloadKg: 5000, overKg: 320 } },
    { code: 'MUST_LOAD_PAYLOAD_EXCEEDED', severity: 'error', params: { totalKg: 5200, maxPayloadKg: 5000, overKg: 200 } },
  ])
})

test('must-load cargo filling the payload exactly is not over it, even when its sum drifts above in floating point', () => {
  // 3 × 1,365.4 kg + 903.8 kg sums to 5000.000000000001
  const load = [cargo({ weightKg: 1365.4, quantity: 3 }), cargo({ id: 'PKG-002', weightKg: 903.8, quantity: 1 })]
  expect(checkPayload(load, SPEC_TRUCK_6M)).toStrictEqual([])
})

test('totals and excess are reported rounded to 0.01 kg, without floating-point drift', () => {
  // 2,660.1 kg + 2,660.2 kg sums to 5320.299999999999, an excess of 320.2999999999993
  const load = [cargo({ weightKg: 2660.1, quantity: 1 }), cargo({ id: 'PKG-002', weightKg: 2660.2, quantity: 1 })]
  const params = { totalKg: 5320.3, maxPayloadKg: 5000, overKg: 320.3 }
  expect(checkPayload(load, SPEC_TRUCK_6M)).toStrictEqual([
    { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params },
    { code: 'MUST_LOAD_PAYLOAD_EXCEEDED', severity: 'error', params },
  ])
})

test('a vehicle whose payload is not above 0 kg gets no payload issue: validateVehicle reports that input alone', () => {
  expect(checkPayload([SPEC_CARTON_A], { ...SPEC_TRUCK_6M, maxPayloadKg: 0 })).toStrictEqual([])
})

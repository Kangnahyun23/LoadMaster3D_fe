import { expect, test } from 'vitest'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { CargoPackage } from '@/domain/models'
import { cargoSummary, stopRows } from './trip-summary'

function pkg(id: string, deliveryStop: number, extra: Partial<CargoPackage> = {}): CargoPackage {
  return {
    id, name: `Kiện ${id}`, lengthCm: 100, widthCm: 50, heightCm: 40, weightKg: 20, quantity: 2,
    allowedOrientations: ['LWH'], keepUpright: false, fragilityLevel: 'NONE', stackable: true,
    maxTopLoadKg: 100, minSupportRatio: 0.8, deliveryStop, priority: 0, mustLoad: false, ...extra,
  }
}

const STOPS = [
  { id: 'STOP-1', name: 'Điểm 1', address: 'A' },
  { id: 'STOP-2', name: 'Điểm 2', address: 'B' },
]

test('cargo summary counts lines and instances, and compares volume and weight with the vehicle', () => {
  // Truck 6m của Spec: 600 × 240 × 250 cm = 36.000.000 cm³, tải tối đa 5.000 kg.
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 2, { quantity: 1, weightKg: 10 })]
  expect(cargoSummary(packages, SPEC_TRUCK_6M)).toStrictEqual({
    lines: 2,
    instances: 3,
    // 100 × 50 × 40 = 200.000 cm³ mỗi kiện × 3 kiện
    volumeCm3: 600_000,
    weightKg: 50,
    volumePercent: (600_000 / 36_000_000) * 100,
    payloadPercent: 1,
    overPayload: false,
  })
})

test('cargo summary flags going over the vehicle payload', () => {
  const heavy = [pkg('PKG-001', 1, { quantity: 100, weightKg: 60 })]
  const summary = cargoSummary(heavy, SPEC_TRUCK_6M)
  expect([summary.weightKg, summary.payloadPercent, summary.overPayload]).toStrictEqual([6000, 120, true])
})

test('stop rows carry the 1-based number, package count and weight of each stop', () => {
  const packages = [pkg('PKG-001', 1), pkg('PKG-002', 1, { quantity: 1 }), pkg('PKG-003', 2, { quantity: 4, weightKg: 5 })]
  expect(stopRows(STOPS, packages)).toStrictEqual([
    { ...STOPS[0], number: 1, packageCount: 3, weightKg: 60 },
    { ...STOPS[1], number: 2, packageCount: 4, weightKg: 20 },
  ])
})

test('an empty trip summarises as zeroes instead of dividing by nothing', () => {
  expect(cargoSummary([], SPEC_TRUCK_6M)).toStrictEqual({
    lines: 0, instances: 0, volumeCm3: 0, weightKg: 0, volumePercent: 0, payloadPercent: 0, overPayload: false,
  })
  expect(stopRows(STOPS, [])).toStrictEqual([
    { ...STOPS[0], number: 1, packageCount: 0, weightKg: 0 },
    { ...STOPS[1], number: 2, packageCount: 0, weightKg: 0 },
  ])
})

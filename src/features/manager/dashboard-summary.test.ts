import { expect, test } from 'vitest'
import type { OptimizationRequest, OptimizationResult, VehicleConfig } from '@/domain/models'
import type { Revision, Trip } from '@/lib/mock-db'
import { deriveDashboardSummary } from './dashboard-summary'

/** Xe rỗng: bảng điều khiển chỉ đếm số xe nên nội dung cấu hình không ảnh hưởng. */
function vehicle(id: string): VehicleConfig {
  return {
    id,
    name: id,
    innerLengthCm: 600,
    innerWidthCm: 235,
    innerHeightCm: 240,
    maxPayloadKg: 9000,
    doorWidthCm: 220,
    doorHeightCm: 230,
    doorPosition: 'REAR',
    clearanceCm: 0,
    obstacles: [],
  }
}

function trip(id: string, packages: Trip['packages']): Trip {
  return {
    id, name: `Chuyến ${id}`, vehicleId: 'VEHICLE-001', stops: [], packages, inputVersion: 1,
    scheduledDate: '2026-09-14', driverId: null, phase: 'planning', createdAt: '2026-09-13T08:00:00.000Z',
  }
}

function cargo(id: string, weightKg: number, quantity: number): Trip['packages'][number] {
  return {
    id,
    name: id,
    lengthCm: 60,
    widthCm: 40,
    heightCm: 40,
    weightKg,
    quantity,
    allowedOrientations: ['LWH'],
    keepUpright: true,
    fragilityLevel: 'NONE',
    stackable: true,
    maxTopLoadKg: 100,
    minSupportRatio: 0.8,
    deliveryStop: 1,
    priority: 1,
    mustLoad: true,
  }
}

function revision(
  id: string,
  jobId: string,
  createdAt: string,
  overrides: Partial<Revision> = {},
): Revision {
  const request = { vehicle: vehicle('VEHICLE-001'), packages: [], settings: {} } as unknown as OptimizationRequest
  const result: OptimizationResult = {
    jobId,
    status: 'COMPLETED',
    method: 'MOCK',
    isMockResult: true,
    placements: [],
    unplacedPackages: [],
    metrics: {
      totalVehicleVolumeCm3: 1000,
      usedVolumeCm3: 410,
      volumeUtilizationPercent: 41,
      maxPayloadKg: 9000,
      usedPayloadKg: 5844,
      payloadUtilizationPercent: 62,
      placedCount: 132,
      unplacedCount: 0,
      runtimeMs: 0,
    },
  }
  return {
    id,
    jobId,
    tripId: 'TRIP-A',
    request,
    result,
    inputVersion: 1,
    createdAt,
    manuallyEdited: false,
    ordersRecomputed: false,
    ...overrides,
  }
}

test('counts vehicles, package instances and total weight from the store', () => {
  const summary = deriveDashboardSummary({
    vehicles: [vehicle('VEHICLE-001'), vehicle('VEHICLE-002')],
    trips: [
      trip('TRIP-A', [cargo('PKG-001', 13.5, 11), cargo('PKG-002', 48, 2)]),
      trip('TRIP-B', [cargo('PKG-003', 6.5, 3)]),
    ],
    revisions: [],
  })

  expect(summary.vehicleCount).toBe(2)
  expect(summary.tripCount).toBe(2)
  // 11 + 2 + 3 instance; 148,5 + 96 + 19,5 kg
  expect(summary.packageCount).toBe(16)
  expect(summary.totalWeightKg).toBe(264)
})

test('an empty store has no plan and no packages', () => {
  const summary = deriveDashboardSummary({ vehicles: [], trips: [], revisions: [] })

  expect(summary).toMatchObject({ vehicleCount: 0, packageCount: 0, totalWeightKg: 0, recentPlans: [] })
  expect(summary.latestPlan).toBeUndefined()
})

test('one job shows once: the approved revision wins over the optimized one', () => {
  const summary = deriveDashboardSummary({
    vehicles: [],
    trips: [trip('TRIP-A', [])],
    revisions: [
      revision('REV-001', 'JOB-1', '2026-09-14T01:30:00.000Z'),
      revision('REV-002', 'JOB-1', '2026-09-14T02:00:00.000Z', {
        approvedAt: '2026-09-14T02:00:00.000Z',
        sourceRevisionId: 'REV-001',
      }),
    ],
  })

  expect(summary.recentPlans).toHaveLength(1)
  expect(summary.latestPlan).toMatchObject({
    revisionId: 'REV-002',
    jobId: 'JOB-1',
    tripName: 'Chuyến TRIP-A',
    approved: true,
    volumeUtilizationPercent: 41,
    runtimeMs: 0,
  })
})

test('recent plans are the five newest jobs, newest first', () => {
  const summary = deriveDashboardSummary({
    vehicles: [],
    trips: [trip('TRIP-A', [])],
    revisions: [1, 2, 3, 4, 5, 6, 7].map((n) =>
      revision(`REV-00${n}`, `JOB-${n}`, `2026-09-0${n}T00:00:00.000Z`),
    ),
  })

  expect(summary.recentPlans.map((plan) => plan.jobId)).toEqual([
    'JOB-7',
    'JOB-6',
    'JOB-5',
    'JOB-4',
    'JOB-3',
  ])
  expect(summary.latestPlan?.jobId).toBe('JOB-7')
})

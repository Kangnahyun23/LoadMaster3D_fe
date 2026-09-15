import type { OptimizationRequest } from '@/domain/models'
import { runMockOptimization } from '@/services/optimization'
import { approvedResult } from './revisions'
import { seedTrip } from './seed-trip'
import { seedVehicles } from './seed-vehicles'
import type { Revision } from './types'

let seeded: readonly Revision[] | undefined

/**
 * Chuyến mẫu đã tối ưu bằng mock service và đã duyệt không chỉnh tay (D-14), để màn kho và tài xế có dữ liệu ngay.
 * Tất định: seed ngẫu nhiên và thời điểm cố định, `runtimeMs` = 0 (không đo lần chạy lúc nạp kho). Tính một lần rồi nhân bản.
 */
export function seedRevisions(): Revision[] {
  seeded ??= buildSeedRevisions()
  return structuredClone([...seeded])
}

function buildSeedRevisions(): Revision[] {
  const trip = seedTrip()
  const vehicle = seedVehicles().find(({ id }) => id === trip.vehicleId)
  if (vehicle === undefined) throw new Error(`Seed thiếu xe ${trip.vehicleId} của chuyến ${trip.id}`)
  const request: OptimizationRequest = {
    vehicle,
    packages: trip.packages,
    settings: { method: 'MOCK', timeLimitSeconds: 30, randomSeed: 20_260_914, enforceLifo: true, prioritizeLowCenterOfGravity: false },
  }
  const result = runMockOptimization(request, { clock: () => 0 })
  const optimized: Revision = {
    id: 'REV-001',
    jobId: result.jobId,
    tripId: trip.id,
    request,
    result,
    inputVersion: trip.inputVersion,
    createdAt: '2026-09-14T01:30:00.000Z',
    manuallyEdited: false,
    ordersRecomputed: false,
  }
  const approvedAt = '2026-09-14T02:00:00.000Z'
  return [
    optimized,
    {
      ...optimized,
      id: 'REV-002',
      result: approvedResult(request, result, []),
      createdAt: approvedAt,
      draftPatches: [],
      approvedAt,
      sourceRevisionId: optimized.id,
      ordersRecomputed: true,
    },
  ]
}

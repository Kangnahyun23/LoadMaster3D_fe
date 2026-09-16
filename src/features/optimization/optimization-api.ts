import type { OptimizationRequest, OptimizationResult, VehicleConfig } from '@/domain/models'
import { getMockDb, type Revision, type Trip } from '@/lib/mock-db'
import { createOptimizationService, type OptimizationProgress } from '@/services/optimization'

/**
 * Lớp dữ liệu của Thiết lập tối ưu và job (LM-047, LM-048): nơi duy nhất trong feature biết về kho và service tối ưu.
 * API thật sau này thay thân hàm; `OptimizationService` giữ nguyên contract Spec mục 11.
 */

export type OptimizationSetup = {
  readonly trip: Trip
  readonly vehicle: VehicleConfig
  readonly vehicles: readonly VehicleConfig[]
}

export async function fetchOptimizationSetup(tripId: string): Promise<OptimizationSetup> {
  const db = getMockDb()
  const [trip, vehicles] = await Promise.all([db.getTrip(tripId), db.listVehicles()])
  return { trip, vehicle: await db.getVehicle(trip.vehicleId), vehicles }
}

export async function changeTripVehicle(tripId: string, vehicleId: string): Promise<Trip> {
  return getMockDb().updateTrip(tripId, { vehicleId })
}

export type RunInput = {
  readonly tripId: string
  readonly request: OptimizationRequest
  /** `?mo-phong=loi` (D-12): service giả lập không phản hồi. */
  readonly simulateFailure: boolean
  readonly signal?: AbortSignal
  readonly onProgress?: (progress: OptimizationProgress) => void
}

/** `revision` khi service trả kết quả chạy xong (kể cả kết quả một phần); `failed` khi request bị service từ chối. */
export type RunOutcome =
  | { readonly kind: 'saved'; readonly revision: Revision }
  | { readonly kind: 'failed'; readonly result: OptimizationResult }

/**
 * Chạy tối ưu qua `createOptimizationService` (Web Worker trong trình duyệt, D-30) rồi lưu kết quả thành revision bất biến
 * (D-31). `status: FAILED` không lưu revision. Lỗi service (`OptimizationServiceError`) và huỷ (`AbortError`) ném lên cho UI.
 */
export async function runOptimization({ tripId, request, simulateFailure, signal, onProgress }: RunInput): Promise<RunOutcome> {
  const service = createOptimizationService({ simulateFailure })
  const result = await service.optimize(request, { signal, onProgress })
  if (result.status === 'FAILED') return { kind: 'failed', result }
  const revision = await getMockDb().addRevision({ tripId, request, result })
  return { kind: 'saved', revision }
}

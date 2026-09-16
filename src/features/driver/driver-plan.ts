import { lt } from '@/domain/geometry'
import type { ScenePlacement, ViewerSceneModel } from '@/features/viewer3d/scene-input'
import { unloadSequence } from '@/features/viewer3d/operations/unloading'
import type { DeliveryStop, Revision, Trip } from '@/lib/mock-db'

/** Một chuyến và các revision của nó theo thứ tự tạo (cũ trước), như kho trả. */
export type TripRevisions = { readonly trip: Trip; readonly revisions: readonly Revision[] }

export type DriverPlan = { readonly trip: Trip; readonly revision: Revision }

/**
 * Phương án tài xế làm theo (LM-061, D-14): revision đã duyệt mới nhất. Có `tripId` (`?chuyen=`) thì chỉ xét đúng chuyến đó;
 * không có thì lấy chuyến đầu tiên theo thứ tự kho có revision đã duyệt. Không có gì để giao trả `undefined`.
 */
export function pickDriverPlan(plans: readonly TripRevisions[], tripId?: string): DriverPlan | undefined {
  for (const { trip, revisions } of plans) {
    if (tripId !== undefined && trip.id !== tripId) continue
    const revision = revisions.findLast((item) => item.approvedAt !== undefined)
    if (revision) return { trip, revision }
    if (tripId !== undefined) return undefined
  }
  return undefined
}

/** Vùng dọc thùng theo tâm kiện: một phần ba sát vách trước, giữa, một phần ba gần cửa sau. */
export type DeliveryArea = 'front' | 'middle' | 'door'
/** Lớp theo chiều cao: trên sàn, tâm thấp hơn nửa chiều cao thùng, còn lại. */
export type DeliveryLayer = 'floor' | 'lower' | 'upper'

export type DeliveryItem = {
  /** `packageInstanceId` */
  readonly id: string
  readonly packageId: string
  readonly name: string
  readonly weightKg: number
  /** `unloadingOrder` của kết quả */
  readonly unloadingOrder: number
  readonly area: DeliveryArea
  readonly layer: DeliveryLayer
}

export type StopDelivery = {
  /** Vị trí trong `Trip.stops` + 1, khớp `deliveryStop` */
  readonly number: number
  readonly name: string
  readonly address: string
  /** Kiện đã xếp của điểm, theo `unloadingOrder` */
  readonly items: readonly DeliveryItem[]
}

function areaOf(p: ScenePlacement, lengthCm: number): DeliveryArea {
  const center = p.position.x + p.lengthCm / 2
  if (lt(center, lengthCm / 3)) return 'front'
  return lt(center, (lengthCm * 2) / 3) ? 'middle' : 'door'
}

function layerOf(p: ScenePlacement, heightCm: number): DeliveryLayer {
  if (!lt(0, p.position.z)) return 'floor'
  return lt(p.position.z + p.heightCm / 2, heightCm / 2) ? 'lower' : 'upper'
}

/** Điểm giao của chuyến kèm kiện cần dỡ ở từng điểm, thứ tự dỡ lấy từ kết quả (`unloadSequence`), không suy ra. */
export function stopDeliveries(stops: readonly DeliveryStop[], model: Pick<ViewerSceneModel, 'placements' | 'vehicle'>): StopDelivery[] {
  const { innerLengthCm, innerHeightCm } = model.vehicle
  return stops.map((stop, index) => {
    const number = index + 1
    const items = unloadSequence(model.placements.filter((p) => p.stop === number)).ordered.map((p): DeliveryItem => ({
      id: p.id,
      packageId: p.packageId,
      name: p.name,
      weightKg: p.weightKg,
      unloadingOrder: p.unloadingOrder,
      area: areaOf(p, innerLengthCm),
      layer: layerOf(p, innerHeightCm),
    }))
    return { number, name: stop.name, address: stop.address, items }
  })
}

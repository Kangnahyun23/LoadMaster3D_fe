import type { LoadPlan, Orientation, Placement } from '@/types/load-plan'

export type DimensionsMm = Readonly<Pick<Placement, 'lengthMm' | 'widthMm' | 'heightMm'>>

/**
 * Boundary nội bộ: scene giữ bản sao bất biến, không nắm quyền sửa LoadPlan.
 * Mọi kích thước ở đây vẫn là mm nghiệp vụ; Three.js đổi đơn vị ở scene/units.
 */
export type ViewerSceneModel = {
  readonly tripId: string
  readonly vehicle: LoadPlan['vehicle']
  readonly fillRate: number
  readonly stops: readonly LoadPlan['stops'][number][]
  readonly placements: readonly Placement[]
  readonly unplaced: readonly LoadPlan['unplaced'][number][]
  readonly placementById: ReadonlyMap<string, Placement>
  readonly baseDimensionsById: ReadonlyMap<string, DimensionsMm>
}

/** Áp hướng đích vào kích thước nguyên bản, không áp vào kích thước đã xoay. */
export function orientDimensions(base: DimensionsMm, orientation: Orientation): DimensionsMm {
  const { lengthMm, widthMm, heightMm } = base
  switch (orientation) {
    case 0: return { lengthMm, widthMm, heightMm }
    case 1: return { lengthMm: widthMm, widthMm: lengthMm, heightMm }
    case 2: return { lengthMm: heightMm, widthMm, heightMm: lengthMm }
  }
}

/**
 * Domain trả kích thước đã áp orientation. Ba phép hoán vị hiện tại đều
 * là nghịch đảo của chính nó, nên áp lại hướng nguồn sẽ lấy được kích thước
 * nguyên bản. Nếu domain thêm hướng mới phải định nghĩa nghịch đảo tương ứng.
 */
export function canonicalDimensions(placement: Placement): DimensionsMm {
  return orientDimensions(placement, placement.orientation)
}

export function adaptLoadPlan(plan: LoadPlan): ViewerSceneModel {
  const placementById = new Map<string, Placement>()
  const baseDimensionsById = new Map<string, DimensionsMm>()
  const placements = plan.placements.map((placement) => {
    if (placementById.has(placement.id)) {
      throw new Error(`Mã kiện bị trùng trong phương án: ${placement.id}`)
    }
    const snapshot = Object.freeze({
      ...placement,
      position: Object.freeze({ ...placement.position }),
    })
    placementById.set(snapshot.id, snapshot)
    baseDimensionsById.set(snapshot.id, Object.freeze(canonicalDimensions(snapshot)))
    return snapshot
  })

  return Object.freeze({
    tripId: plan.tripId,
    vehicle: Object.freeze({
      ...plan.vehicle,
      frontAxle: Object.freeze({ ...plan.vehicle.frontAxle }),
      rearAxle: Object.freeze({ ...plan.vehicle.rearAxle }),
    }),
    fillRate: plan.fillRate,
    stops: Object.freeze(plan.stops.map((stop) => Object.freeze({ ...stop }))),
    placements: Object.freeze(placements),
    unplaced: Object.freeze(plan.unplaced.map((placement) => Object.freeze({ ...placement }))),
    placementById,
    baseDimensionsById,
  })
}

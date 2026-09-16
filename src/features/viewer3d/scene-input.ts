import { expandPackages } from '@/domain/cargo'
import type { ConstraintEngineInput } from '@/domain/constraints'
import {
  orientDimensions,
  roundCm,
  type OrientationCode,
  type OrientationRules,
  type PackageDimensions,
} from '@/domain/geometry'
import type { FragilityLevel, OptimizationResult, UnplacedPackage, VehicleConfig } from '@/domain/models'
import { isStale, type DeliveryStop, type Revision } from '@/lib/mock-db'
import type { LoadPlan, Orientation, Packaging } from '@/types/load-plan'

/**
 * Dữ liệu vào của engine 3D (LM-030, LM-031): **cm** theo hệ toạ độ Spec (x dọc thùng từ vách trong ra cửa, y ngang từ vách
 * trái, z cao từ sàn). Mọi nguồn đổi sang kiểu này đúng một lần tại biên; bên trong `viewer3d` không còn mm.
 */
export type PositionCm = { readonly x: number; readonly y: number; readonly z: number }

export type ScenePlacement = {
  /** `packageInstanceId` */
  readonly id: string
  readonly packageId: string
  readonly name: string
  /** Số thứ tự điểm giao, 1-based (`deliveryStop`) */
  readonly stop: number
  /** Kích thước đã xoay theo `orientation`, cm */
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly weightKg: number
  readonly position: PositionCm
  /** Thứ tự xếp lên xe, 1-based (`loadingOrder` của kết quả) */
  readonly step: number
  /** Thứ tự dỡ, 1-based (`unloadingOrder` của kết quả) */
  readonly unloadingOrder: number
  readonly orientation: OrientationCode
  /** Contract Spec chưa có trường bao bì: kết quả dùng một kiểu trung tính, atlas giữ cho lúc có trường (LM-030). */
  readonly packaging: Packaging
  readonly fragilityLevel: FragilityLevel
  /** `fragilityLevel = HIGH` */
  readonly fragile: boolean
  readonly stackable: boolean
  readonly pinned: boolean
  /** Tỷ lệ đỡ đáy và mã cảnh báo do engine tính trên kết quả (Spec 7.6, LM-049); phương án mm cũ: 1 và rỗng. */
  readonly supportRatio: number
  readonly constraintWarnings: readonly string[]
}

export type SceneUnplaced = {
  readonly id: string
  readonly packageId: string
  readonly name: string
  readonly stop: number
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly weightKg: number
  /** Kết quả theo contract: mã lý do, UI dịch */
  readonly reasonCode?: UnplacedPackage['reasonCode']
  /** `message` của contract — mock ghi lại mã lý do; service thật có thể ghi câu riêng. */
  readonly message?: string
  /** Phương án mm cũ: lý do đã là câu tiếng Việt */
  readonly reasonText?: string
}

export type SceneStop = { readonly number: number; readonly name: string; readonly packageCount: number }

/** Snapshot bất biến của một phương án cho engine; không nắm quyền sửa dữ liệu nguồn. */
export type ViewerSceneModel = {
  readonly tripId: string
  readonly vehicle: VehicleConfig
  /** Tỷ lệ lấp đầy thể tích, % */
  readonly fillRate: number
  readonly stops: readonly SceneStop[]
  readonly placements: readonly ScenePlacement[]
  readonly unplaced: readonly SceneUnplaced[]
  readonly placementById: ReadonlyMap<string, ScenePlacement>
  /** Kích thước danh nghĩa của kiện gốc — xoay luôn áp lên đây, không đảo ngược từ kích thước đã xoay */
  readonly baseDimensionsById: ReadonlyMap<string, PackageDimensions>
  readonly orientationRulesById: ReadonlyMap<string, OrientationRules>
  readonly isMockResult: boolean
  /** Thứ tự xếp/dỡ được tính lại ở FE khi Duyệt (D-32) */
  readonly ordersRecomputed: boolean
  /** Đầu vào constraint engine cho editor (LM-035); `null` với `LoadPlan` mm cũ — kho/tài xế không chỉnh sửa. */
  readonly engineInput: ConstraintEngineInput | null
  /** `result.metrics` của kết quả (LM-049); `null` với phương án mm cũ. */
  readonly metrics: OptimizationResult['metrics'] | null
  /** Revision nguồn (LM-049, LM-050); `null` với phương án mm cũ và fixture benchmark. */
  readonly revision: {
    readonly id: string
    readonly jobId: string
    readonly method: string
    readonly approved: boolean
    readonly manuallyEdited: boolean
    /** Xe hoặc kiện của chuyến đổi sau khi tối ưu (D-31) — Duyệt bị chặn. */
    readonly stale: boolean
  } | null
}

/** Kích thước đã xoay của kiện theo tên trường scene; luôn áp lên kích thước danh nghĩa. */
export function orientedSize(base: PackageDimensions, orientation: OrientationCode): PackageDimensions {
  const { placedLengthCm, placedWidthCm, placedHeightCm } = orientDimensions(base, orientation)
  return { lengthCm: placedLengthCm, widthCm: placedWidthCm, heightCm: placedHeightCm }
}

function indexById<T extends { readonly id: string }>(items: readonly T[]): Map<string, T> {
  const byId = new Map<string, T>()
  for (const item of items) {
    if (byId.has(item.id)) throw new Error(`Mã kiện bị trùng trong phương án: ${item.id}`)
    byId.set(item.id, item)
  }
  return byId
}

/** Revision của mock repository (LM-026) → scene cm. Kích thước, luật xoay, tên và điểm giao lấy từ kiện gốc của request. */
export type ResultSceneSource = {
  readonly trip: { readonly id: string; readonly stops: readonly Pick<DeliveryStop, 'name'>[]; readonly inputVersion?: number }
  readonly revision: Pick<Revision, 'request' | 'result' | 'ordersRecomputed'> & Partial<Pick<Revision, 'id' | 'jobId' | 'inputVersion' | 'approvedAt' | 'manuallyEdited'>>
}

export function adaptResult({ trip, revision }: ResultSceneSource): ViewerSceneModel {
  const { request, result } = revision
  const { instances, packageIdByInstanceId } = expandPackages(request.packages)
  const instanceById = new Map(instances.map((instance) => [instance.packageInstanceId, instance]))
  const nameById = new Map(request.packages.map((pkg) => [pkg.id, pkg.name]))
  const instanceOf = (id: string) => {
    const instance = instanceById.get(id)
    if (instance === undefined) throw new Error(`Placement ${id} không thuộc kiện nào của request`)
    return instance
  }
  const placements = result.placements.map((placement): ScenePlacement => {
    const instance = instanceOf(placement.packageInstanceId)
    const packageId = packageIdByInstanceId.get(placement.packageInstanceId) ?? ''
    return Object.freeze({
      id: placement.packageInstanceId,
      packageId,
      name: nameById.get(packageId) ?? packageId,
      stop: instance.deliveryStop,
      lengthCm: placement.placedLengthCm,
      widthCm: placement.placedWidthCm,
      heightCm: placement.placedHeightCm,
      weightKg: instance.weightKg,
      position: Object.freeze({ x: placement.xCm, y: placement.yCm, z: placement.zCm }),
      step: placement.loadingOrder,
      unloadingOrder: placement.unloadingOrder,
      orientation: placement.orientation,
      packaging: 'carton',
      fragilityLevel: instance.fragilityLevel,
      fragile: instance.fragilityLevel === 'HIGH',
      stackable: instance.stackable,
      pinned: false,
      supportRatio: placement.supportRatio,
      constraintWarnings: Object.freeze([...placement.constraintWarnings]),
    })
  })
  const unplaced = result.unplacedPackages.map((item): SceneUnplaced => {
    const instance = instanceOf(item.packageInstanceId)
    const packageId = packageIdByInstanceId.get(item.packageInstanceId) ?? ''
    return Object.freeze({
      id: item.packageInstanceId,
      packageId,
      name: nameById.get(packageId) ?? packageId,
      stop: instance.deliveryStop,
      lengthCm: instance.lengthCm,
      widthCm: instance.widthCm,
      heightCm: instance.heightCm,
      weightKg: instance.weightKg,
      reasonCode: item.reasonCode,
      message: item.message,
    })
  })
  return Object.freeze({
    tripId: trip.id,
    vehicle: Object.freeze({ ...request.vehicle, obstacles: request.vehicle.obstacles.map((obstacle) => Object.freeze({ ...obstacle })) }),
    fillRate: result.metrics.volumeUtilizationPercent,
    stops: Object.freeze(trip.stops.map((stop, index) => Object.freeze({
      number: index + 1,
      name: stop.name,
      packageCount: instances.filter(({ deliveryStop }) => deliveryStop === index + 1).length,
    }))),
    placements: Object.freeze(placements),
    unplaced: Object.freeze(unplaced),
    placementById: indexById(placements),
    baseDimensionsById: new Map(instances.map(({ packageInstanceId, lengthCm, widthCm, heightCm }) => [packageInstanceId, Object.freeze({ lengthCm, widthCm, heightCm })])),
    orientationRulesById: new Map(instances.map(({ packageInstanceId, allowedOrientations, keepUpright }) => [packageInstanceId, Object.freeze({ allowedOrientations, keepUpright })])),
    isMockResult: result.isMockResult,
    ordersRecomputed: revision.ordersRecomputed,
    engineInput: Object.freeze({
      vehicle: request.vehicle,
      packages: request.packages,
      placements: result.placements,
      settings: { enforceLifo: request.settings.enforceLifo },
    }),
    revision: revision.id === undefined || revision.jobId === undefined ? null : Object.freeze({
      id: revision.id,
      jobId: revision.jobId,
      method: result.method,
      approved: revision.approvedAt !== undefined,
      manuallyEdited: revision.manuallyEdited ?? false,
      stale: trip.inputVersion !== undefined && revision.inputVersion !== undefined
        && isStale({ inputVersion: revision.inputVersion }, { inputVersion: trip.inputVersion }),
    }),
    metrics: result.metrics,
  })
}

/** Ba hướng của phương án mm cũ theo mã Spec: 0 D×R×C = LWH, 1 R×D×C = WLH, 2 C×R×D = HWL. */
const LEGACY_ORIENTATION: Record<Orientation, OrientationCode> = { 0: 'LWH', 1: 'WLH', 2: 'HWL' }
const LEGACY_RULES: OrientationRules = Object.freeze({ allowedOrientations: Object.freeze(Object.values(LEGACY_ORIENTATION)), keepUpright: false })
const cm = (mm: number) => roundCm(mm / 10)

/**
 * `LoadPlan` mm cũ (kho, tài xế, fixture benchmark) → scene cm, cho tới khi các màn đó đọc revision (LM-060 → LM-062).
 * Đổi đơn vị đúng một lần ở đây. Ba hướng cũ đều là phép hoán vị tự nghịch đảo, nên kích thước gốc = áp lại chính hướng đó.
 */
export function adaptLoadPlan(plan: LoadPlan): ViewerSceneModel {
  const placements = plan.placements.map((p): ScenePlacement => {
    const [lengthCm, widthCm, heightCm] = [cm(p.lengthMm), cm(p.widthMm), cm(p.heightMm)]
    return Object.freeze({
      id: p.id,
      packageId: p.orderId,
      name: p.orderId,
      stop: p.stop,
      lengthCm,
      widthCm,
      heightCm,
      weightKg: p.weightKg,
      position: Object.freeze({ x: cm(p.position.x), y: cm(p.position.y), z: cm(p.position.z) }),
      step: p.step,
      unloadingOrder: 0,
      orientation: LEGACY_ORIENTATION[p.orientation],
      packaging: p.packaging,
      fragilityLevel: p.fragile ? 'HIGH' : 'NONE',
      fragile: p.fragile,
      stackable: true,
      pinned: p.pinned,
      supportRatio: 1,
      constraintWarnings: [],
    })
  })
  const { vehicle } = plan
  return Object.freeze({
    tripId: plan.tripId,
    vehicle: Object.freeze({
      id: plan.tripId,
      name: `${vehicle.name} · ${vehicle.plate}`,
      innerLengthCm: cm(vehicle.innerLengthMm),
      innerWidthCm: cm(vehicle.innerWidthMm),
      innerHeightCm: cm(vehicle.innerHeightMm),
      maxPayloadKg: vehicle.payloadKg,
      doorWidthCm: cm(vehicle.innerWidthMm),
      doorHeightCm: cm(vehicle.innerHeightMm),
      doorPosition: 'REAR' as const,
      clearanceCm: 0,
      obstacles: [],
    }),
    fillRate: plan.fillRate,
    stops: Object.freeze(plan.stops.map((stop) => Object.freeze({ ...stop }))),
    placements: Object.freeze(placements),
    unplaced: Object.freeze(plan.unplaced.map((u): SceneUnplaced => Object.freeze({
      id: u.id, packageId: u.orderId, name: u.orderId, stop: u.stop,
      lengthCm: cm(u.lengthMm), widthCm: cm(u.widthMm), heightCm: cm(u.heightMm), weightKg: u.weightKg, reasonText: u.reason,
    }))),
    placementById: indexById(placements),
    baseDimensionsById: new Map(placements.map((p) => [p.id, Object.freeze(orientedSize(p, p.orientation))])),
    orientationRulesById: new Map(placements.map((p) => [p.id, LEGACY_RULES])),
    isMockResult: false,
    ordersRecomputed: false,
    engineInput: null,
    revision: null,
    metrics: null,
  })
}


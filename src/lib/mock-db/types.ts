import type { PlacementPatch } from '@/domain/constraints'
import type { CargoPackage, OptimizationRequest, OptimizationResult, VehicleConfig } from '@/domain/models'

/** Điểm giao của chuyến. Vị trí trong `Trip.stops` là số điểm giao: phần tử đầu là điểm 1, khớp `CargoPackage.deliveryStop`. */
export type DeliveryStop = {
  /** Duy nhất trong chuyến. */
  id: string
  name: string
  address: string
}

export type Trip = {
  id: string
  name: string
  vehicleId: string
  stops: DeliveryStop[]
  packages: CargoPackage[]
  /** Phiên bản dữ liệu đầu vào tối ưu (xe + kiện) của chuyến; revision mang số lúc tạo để biết lỗi thời (D-31). */
  inputVersion: number
}

/** Dữ liệu tạo chuyến: kho cấp `id` và `inputVersion`. */
export type NewTrip = Omit<Trip, 'id' | 'inputVersion'>

/** Trường sửa được của chuyến; trường vắng giữ nguyên. `id` và `inputVersion` do kho quản lý, có trong đầu vào cũng bị bỏ. */
export type TripChanges = Partial<NewTrip>

/**
 * Một kết quả tối ưu của chuyến, **bất biến** (D-31): kho không có hàm sửa revision. Duyệt tạo revision mới.
 * `request` là ảnh chụp xe + kiện đã gửi tối ưu, không đổi theo dữ liệu chuyến về sau.
 */
export type Revision = {
  /** `REV-NNN`, duy nhất trong kho. Khác `jobId`: revision đã duyệt dùng chung `jobId` với revision nguồn. */
  id: string
  jobId: string
  tripId: string
  request: OptimizationRequest
  result: OptimizationResult
  /** `Trip.inputVersion` lúc tạo revision. */
  inputVersion: number
  /** Thời điểm tạo, ISO 8601. */
  createdAt: string
  /** Chỉ ở revision đã duyệt: các patch của draft áp ở lần Duyệt này, theo thứ tự gửi (rỗng nếu lần này không chỉnh). */
  draftPatches?: PlacementPatch[]
  /** Chỉ ở revision đã duyệt, ISO 8601; bằng `createdAt`. */
  approvedAt?: string
  /** Chỉ ở revision đã duyệt: revision được duyệt. */
  sourceRevisionId?: string
  /** Placement có chỉnh tay: lần Duyệt này có patch, hoặc revision nguồn đã chỉnh tay. */
  manuallyEdited: boolean
  /** Thứ tự xếp/dỡ được tính lại ở FE khi Duyệt (D-32); UI gắn nhãn khi `true`. */
  ordersRecomputed: boolean
}

/** Kết quả tối ưu cần lưu: `request` đã gửi service và `result` nhận về. `jobId` lấy từ `result`. */
export type NewRevision = Pick<Revision, 'tripId' | 'request' | 'result'>

export type MockDbOptions = {
  /** Độ trễ giả của mỗi lượt đọc/ghi, ms. Test dùng 0. */
  latencyMs?: number
}

/**
 * Kho dữ liệu in-memory thay backend (D-06). Mọi hàm bất đồng bộ như gọi mạng thật, trả bản sao, và từ chối bằng
 * `MockDbError` (mã `NOT_FOUND` khi không có bản ghi).
 */
export type MockDb = {
  /** Theo thứ tự tạo: xe seed trước. */
  listVehicles(): Promise<VehicleConfig[]>
  getVehicle(id: string): Promise<VehicleConfig>
  /** Kho cấp mã `VEHICLE-NNN` kế tiếp; `id` trong đầu vào (nếu có) bị bỏ. */
  createVehicle(input: Omit<VehicleConfig, 'id'>): Promise<VehicleConfig>
  /** Thay toàn bộ cấu hình xe theo `vehicle.id`. */
  updateVehicle(vehicle: VehicleConfig): Promise<VehicleConfig>
  deleteVehicle(id: string): Promise<void>

  /** Theo thứ tự tạo: chuyến seed trước. */
  listTrips(): Promise<Trip[]>
  getTrip(id: string): Promise<Trip>
  /** Kho cấp mã `TRIP-NNN` kế tiếp, `inputVersion` bắt đầu từ 1. Xe phải tồn tại. */
  createTrip(input: NewTrip): Promise<Trip>
  /** Xe mới (nếu đổi) phải tồn tại. */
  updateTrip(id: string, changes: TripChanges): Promise<Trip>

  /** Revision của chuyến theo thứ tự tạo, cũ trước. */
  listRevisions(tripId: string): Promise<Revision[]>
  getRevision(id: string): Promise<Revision>
  /** Lưu một kết quả tối ưu thành revision mới, mang `inputVersion` hiện tại của chuyến. Không có hàm sửa revision. */
  addRevision(input: NewRevision): Promise<Revision>
  /**
   * Duyệt (D-31, D-32): tạo revision approved **mới** — áp draft `patches`, tính lại thứ tự xếp/dỡ và metrics — revision nguồn giữ
   * nguyên. Duyệt lại một revision đã duyệt được. Từ chối: `REVISION_STALE` (chuyến đổi xe/kiện sau khi tối ưu),
   * `REVISION_NOT_COMPLETED`, `PATCH_UNKNOWN_INSTANCE` (patch cho kiện không có placement); không lưu gì khi từ chối.
   */
  approveRevision(revisionId: string, patches: readonly PlacementPatch[]): Promise<Revision>
}

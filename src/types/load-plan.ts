/**
 * Kiểu dữ liệu của phương án xếp hàng 3D.
 *
 * Hệ toạ độ nghiệp vụ (đơn vị mm, khớp nhãn "từ vách trước · vách trái · sàn"
 * trong bản design):
 *   x — dọc theo chiều dài thùng, 0 tại vách trước, tăng dần về cửa sau
 *   y — ngang thùng, 0 tại vách trái
 *   z — chiều cao, 0 tại sàn
 * Việc đổi sang hệ Y-up của Three.js nằm gọn trong `scene/units.ts`.
 */

export type PositionMm = {
  x: number
  y: number
  z: number
}

export type Packaging = 'carton' | 'pallet' | 'crate'

/** Ba hướng đặt kiện mà bộ tối ưu cho phép. */
export type Orientation = 0 | 1 | 2

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  0: 'D×R×C',
  1: 'R×D×C',
  2: 'C×R×D',
}

export type Placement = {
  id: string
  orderId: string
  /** Số thứ tự điểm giao, 1-based */
  stop: number
  /** Kích thước sau khi đã xoay theo `orientation`, mm */
  lengthMm: number
  widthMm: number
  heightMm: number
  weightKg: number
  position: PositionMm
  /** Thứ tự xếp lên xe, 1-based. Điểm giao cuối xếp trước, điểm đầu xếp sau cùng. */
  step: number
  orientation: Orientation
  packaging: Packaging
  fragile: boolean
  /** Giữ nguyên vị trí khi chạy tối ưu lại */
  pinned: boolean
}

export type UnplacedPackage = {
  id: string
  orderId: string
  stop: number
  lengthMm: number
  widthMm: number
  heightMm: number
  weightKg: number
  /** Lý do bộ tối ưu không xếp được */
  reason: string
}

export type AxleLoad = {
  loadKg: number
  capacityKg: number
}

export type VehicleSpec = {
  name: string
  plate: string
  innerLengthMm: number
  innerWidthMm: number
  innerHeightMm: number
  payloadKg: number
  frontAxle: AxleLoad
  rearAxle: AxleLoad
}

export type PlanStop = {
  number: number
  name: string
  packageCount: number
}

export type LoadPlan = {
  tripId: string
  vehicle: VehicleSpec
  /** Tỷ lệ lấp đầy do bộ tối ưu báo về, % */
  fillRate: number
  stops: PlanStop[]
  placements: Placement[]
  unplaced: UnplacedPackage[]
}

export type CameraPreset = 'truoc' | 'cua-sau' | 'ben-hong' | 'tren' | 'goc-cheo'

export type ColorMode = 'diem-giao' | 'don-hang' | 'khoi-luong'

export type PlaybackSpeed = 1 | 2 | 4

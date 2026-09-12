import type {
  LoadPlan,
  Packaging,
  Placement,
  UnplacedPackage,
  VehicleSpec,
} from '@/types/load-plan'

/**
 * Phương án mẫu cho TRIP-2026-0914 — 132 kiện, sinh ra bằng bộ xếp cột
 * đơn giản để mọi vị trí đều hợp lệ về hình học (không chồng lấn, không
 * vượt thùng). Backend thật trả về `LoadPlan` cùng cấu trúc.
 */

export const VEHICLE: VehicleSpec = {
  name: 'Hyundai HD210',
  plate: '60C-446.32',
  innerLengthMm: 7200,
  innerWidthMm: 2350,
  innerHeightMm: 2400,
  payloadKg: 9500,
  frontAxle: { loadKg: 3120, capacityKg: 4000 },
  rearAxle: { loadKg: 5120, capacityKg: 5500 },
}

/** Khe hở tối thiểu giữa các kiện và với vách, mm */
const WALL_GAP = 20
const BOX_GAP = 20
const COLUMN_GAP = 30
const STOP_GAP = 60

type BoxType = {
  lengthMm: number
  widthMm: number
  heightMm: number
  weightKg: number
  packaging: Packaging
  fragile?: boolean
}

type Column = {
  type: BoxType
  count: number
}

type StopSpec = {
  stop: number
  name: string
  orderIds: string[]
  columns: Column[]
}

/**
 * Thứ tự xếp: điểm giao cuối (4) nằm sát vách trước, xếp trước;
 * điểm giao đầu (1) sát cửa sau, xếp sau cùng.
 */
const STOP_SPECS: StopSpec[] = [
  {
    stop: 4,
    name: 'Long Châu Biên Hoà',
    orderIds: ['DH-51036', 'DH-51037'],
    columns: [
      { type: { lengthMm: 800, widthMm: 600, heightMm: 400, weightKg: 60, packaging: 'pallet' }, count: 15 },
      { type: { lengthMm: 800, widthMm: 600, heightMm: 400, weightKg: 60, packaging: 'pallet' }, count: 6 },
    ],
  },
  {
    stop: 3,
    name: 'Bách Hoá Xanh Dĩ An',
    orderIds: ['DH-51035'],
    columns: [
      { type: { lengthMm: 700, widthMm: 500, heightMm: 500, weightKg: 68, packaging: 'crate' }, count: 16 },
      { type: { lengthMm: 400, widthMm: 300, heightMm: 250, weightKg: 12.5, packaging: 'carton', fragile: true }, count: 11 },
    ],
  },
  {
    stop: 2,
    name: 'Co.opmart Bình Dương',
    orderIds: ['DH-51031', 'DH-51032'],
    columns: [
      { type: { lengthMm: 600, widthMm: 400, heightMm: 400, weightKg: 82, packaging: 'carton' }, count: 25 },
      { type: { lengthMm: 600, widthMm: 400, heightMm: 400, weightKg: 82, packaging: 'carton' }, count: 10 },
      { type: { lengthMm: 400, widthMm: 300, heightMm: 250, weightKg: 13.5, packaging: 'carton', fragile: true }, count: 11 },
    ],
  },
  {
    stop: 1,
    name: 'Thực phẩm Sài Gòn',
    orderIds: ['DH-51027', 'DH-51028'],
    columns: [
      { type: { lengthMm: 600, widthMm: 500, heightMm: 500, weightKg: 72, packaging: 'crate' }, count: 16 },
      { type: { lengthMm: 600, widthMm: 500, heightMm: 500, weightKg: 72, packaging: 'crate' }, count: 16 },
      { type: { lengthMm: 600, widthMm: 500, heightMm: 500, weightKg: 72, packaging: 'crate' }, count: 6 },
    ],
  },
]

/** Hai kiện của điểm 4 được ghim, khớp bản design (PKG-00102, PKG-00118). */
const PINNED_STEPS = new Set([2, 18])

function packageId(step: number): string {
  return `PKG-${String(100 + step).padStart(5, '0')}`
}

/**
 * Xếp một cột: đi ngang thùng trước, hết hàng thì lên lớp mới.
 * Trả về vị trí x kết thúc của cột.
 */
function packColumn(
  column: Column,
  spec: StopSpec,
  startX: number,
  nextStep: () => number,
  out: Placement[],
): number {
  const { type, count } = column
  const usableWidth = VEHICLE.innerWidthMm - WALL_GAP * 2
  const across = Math.floor((usableWidth + BOX_GAP) / (type.widthMm + BOX_GAP))

  for (let i = 0; i < count; i++) {
    const layer = Math.floor(i / across)
    const slot = i % across
    const step = nextStep()
    const orderId = spec.orderIds[i % spec.orderIds.length] ?? spec.orderIds[0] ?? ''

    out.push({
      id: packageId(step),
      orderId,
      stop: spec.stop,
      lengthMm: type.lengthMm,
      widthMm: type.widthMm,
      heightMm: type.heightMm,
      weightKg: type.weightKg,
      position: {
        x: startX,
        y: WALL_GAP + slot * (type.widthMm + BOX_GAP),
        z: layer * (type.heightMm + 10),
      },
      step,
      orientation: 0,
      packaging: type.packaging,
      fragile: type.fragile ?? false,
      pinned: PINNED_STEPS.has(step),
    })
  }

  return startX + type.lengthMm
}

function buildPlacements(): Placement[] {
  const placements: Placement[] = []
  let step = 0
  const nextStep = () => ++step
  let x = WALL_GAP

  STOP_SPECS.forEach((spec, specIndex) => {
    spec.columns.forEach((column, columnIndex) => {
      x = packColumn(column, spec, x, nextStep, placements)
      if (columnIndex < spec.columns.length - 1) x += COLUMN_GAP
    })
    if (specIndex < STOP_SPECS.length - 1) x += STOP_GAP
  })

  return placements
}

const UNPLACED: UnplacedPackage[] = [
  {
    id: 'PKG-00233',
    orderId: 'DH-51035',
    stop: 3,
    lengthMm: 600,
    widthMm: 400,
    heightMm: 400,
    weightKg: 28,
    reason: 'Vượt chiều cao còn lại',
  },
  {
    id: 'PKG-00234',
    orderId: 'DH-51035',
    stop: 3,
    lengthMm: 1200,
    widthMm: 800,
    heightMm: 300,
    weightKg: 46.5,
    reason: 'Không có mặt sàn đủ dài',
  },
  {
    id: 'PKG-00235',
    orderId: 'DH-51028',
    stop: 1,
    lengthMm: 500,
    widthMm: 500,
    heightMm: 500,
    weightKg: 31,
    reason: 'Vượt tải trọng trục sau',
  },
]

const placements = buildPlacements()

export const LOAD_PLAN: LoadPlan = {
  tripId: 'TRIP-2026-0914',
  vehicle: VEHICLE,
  fillRate: 87.4,
  stops: STOP_SPECS.map((spec) => ({
    number: spec.stop,
    name: spec.name,
    packageCount: placements.filter((p) => p.stop === spec.stop).length,
  })).sort((a, b) => a.number - b.number),
  placements,
  unplaced: UNPLACED,
}

/** Kiện được chọn sẵn khi mở màn, khớp bản design. */
export const DEFAULT_SELECTED_ID = 'PKG-00147'

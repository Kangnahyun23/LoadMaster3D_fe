import { orientDimensions, type OrientationCode } from '@/domain/geometry'
import { computeMetrics } from '@/domain/metrics'
import type { CargoPackage, OptimizationRequest, OptimizationResult, PackagePlacement, VehicleConfig } from '@/domain/models'
import type { DeliveryStop } from '@/lib/mock-db'
import type { LoadPlan, Orientation, Placement } from '@/types/load-plan'

export const BENCHMARK_COUNTS = [132, 300, 500, 1000] as const
export type BenchmarkCount = (typeof BENCHMARK_COUNTS)[number]

const GRID: Record<BenchmarkCount, readonly [number, number, number]> = {
  132: [11, 4, 3],
  300: [15, 5, 4],
  500: [20, 5, 5],
  1000: [20, 10, 5],
}
const STOP_NAMES = ['Thực phẩm Sài Gòn', 'Co.opmart Bình Dương', 'Bách Hoá Xanh Dĩ An', 'Long Châu Biên Hoà']
const SIZES = [[0.86, 0.84, 0.8], [0.7, 0.94, 0.9], [0.92, 0.75, 0.72]] as const

/** Chỉ kích hoạt trong debug; không thay dữ liệu nghiệp vụ. */
export function benchmarkCountFromSearch(search: string): BenchmarkCount | undefined {
  const params = new URLSearchParams(search)
  if (!params.has('debug')) return undefined
  const count = Number(params.get('packages'))
  return BENCHMARK_COUNTS.find((allowed) => allowed === count)
}

export type BenchmarkInput = {
  readonly trip: { readonly id: string; readonly stops: readonly DeliveryStop[] }
  readonly request: OptimizationRequest
  readonly result: OptimizationResult
  readonly ordersRecomputed: boolean
}

const BENCHMARK_ORIENTATIONS: readonly OrientationCode[] = ['LWH', 'WLH', 'HWL']
const WALL_GAP_CM = 2

/**
 * Fixture renderer cho Planner (LM-031): request + result đúng contract Spec, cm nguyên. Mỗi kiện một ô riêng nên không chồng
 * lấn, không vượt thùng; kiện gốc ghi kích thước danh nghĩa, placement ghi kích thước đã xoay theo `orientation`.
 * Không phải kết quả tối ưu và không đi qua mock repository.
 */
export function createBenchmarkInput(count: BenchmarkCount): BenchmarkInput {
  const [along, across, layers] = GRID[count]
  const vehicle: VehicleConfig = {
    id: 'BENCH-VEHICLE',
    name: 'Thùng kiểm thử hiệu năng · 60C-446.32',
    innerLengthCm: 720,
    innerWidthCm: 235,
    innerHeightCm: 240,
    maxPayloadKg: 9500,
    doorWidthCm: 235,
    doorHeightCm: 240,
    doorPosition: 'REAR',
    clearanceCm: 0,
    obstacles: [],
  }
  const cellLength = Math.floor((vehicle.innerLengthCm - WALL_GAP_CM * 2) / along)
  const cellWidth = Math.floor((vehicle.innerWidthCm - WALL_GAP_CM * 2) / across)
  const cellHeight = Math.floor(vehicle.innerHeightCm / layers)
  const packages: CargoPackage[] = []
  const placements: PackagePlacement[] = []

  for (let index = 0; index < count; index++) {
    const column = Math.floor(index / (across * layers))
    const layer = Math.floor(index / across) % layers
    const slot = index % across
    const shape = SIZES[(column + slot + layer) % SIZES.length] ?? SIZES[0]
    const orientation = BENCHMARK_ORIENTATIONS[index % BENCHMARK_ORIENTATIONS.length] ?? 'LWH'
    const placed = {
      lengthCm: Math.floor(cellLength * shape[0]),
      widthCm: Math.floor(cellWidth * shape[1]),
      heightCm: Math.floor(cellHeight * shape[2]),
    }
    // Ba hướng dùng ở đây tự nghịch đảo: áp lại hướng lên kích thước đã xoay ra kích thước danh nghĩa.
    const nominal = orientDimensions(placed, orientation)
    const id = `BENCH-${String(index + 1).padStart(5, '0')}`
    packages.push({
      id,
      name: `Kiện đo ${index + 1}`,
      lengthCm: nominal.placedLengthCm,
      widthCm: nominal.placedWidthCm,
      heightCm: nominal.placedHeightCm,
      weightKg: 2 + (index % 9) * 0.5,
      quantity: 1,
      allowedOrientations: ['LWH', 'LHW', 'WLH', 'WHL', 'HLW', 'HWL'],
      keepUpright: false,
      fragilityLevel: index % 11 === 0 ? 'HIGH' : 'NONE',
      stackable: true,
      maxTopLoadKg: 500,
      // Kiện tầng trên nhỏ hơn ô có thể thiếu đỡ: chỉ là cảnh báo, fixture vẫn đo được editor (LM-035).
      minSupportRatio: 0.8,
      deliveryStop: 4 - Math.min(3, Math.floor((column * 4) / along)),
      priority: 0,
      mustLoad: false,
    })
    placements.push({
      packageInstanceId: `${id}-01`,
      orientation,
      xCm: WALL_GAP_CM + column * cellLength,
      yCm: WALL_GAP_CM + slot * cellWidth,
      zCm: layer * cellHeight,
      placedLengthCm: placed.lengthCm,
      placedWidthCm: placed.widthCm,
      placedHeightCm: placed.heightCm,
      loadingOrder: index + 1,
      unloadingOrder: count - index,
      supportRatio: 1,
      constraintWarnings: [],
    })
  }

  const weightByInstanceId = new Map(packages.map((pkg) => [`${pkg.id}-01`, pkg.weightKg]))
  return {
    trip: {
      id: `BENCH-${count}`,
      stops: STOP_NAMES.map((name, index) => ({ id: `BENCH-STOP-${index + 1}`, name, address: name })),
    },
    request: {
      vehicle,
      packages,
      settings: { method: 'MOCK', timeLimitSeconds: 30, enforceLifo: false, prioritizeLowCenterOfGravity: false },
    },
    result: {
      jobId: `BENCH-${count}`,
      status: 'COMPLETED',
      method: 'MOCK',
      isMockResult: true,
      placements,
      unplacedPackages: [],
      metrics: computeMetrics({ vehicle, placements, weightByInstanceId, unplacedCount: 0, runtimeMs: 0 }),
    },
    ordersRecomputed: false,
  }
}

const WALL_GAP_MM = 20

/**
 * Bản mm cũ cho kho và tài xế, bỏ khi hai màn đó đọc revision (LM-060 → LM-062).
 * Mỗi kiện nằm trong một ô riêng, mọi số đo là mm nguyên. Kích thước ghi
 * vào Placement đã là kích thước sau orientation (kể cả hướng 1 và 2).
 * Đây là bộ dữ liệu đo renderer, không phải kết quả từ bộ tối ưu.
 */
export function createBenchmarkPlan(count: BenchmarkCount): LoadPlan {
  const [along, across, layers] = GRID[count]
  const vehicle: LoadPlan['vehicle'] = {
    name: 'Thùng kiểm thử hiệu năng',
    plate: '60C-446.32',
    innerLengthMm: 7200,
    innerWidthMm: 2350,
    innerHeightMm: 2400,
    payloadKg: 9500,
  }
  const cellLength = Math.floor((vehicle.innerLengthMm - WALL_GAP_MM * 2) / along)
  const cellWidth = Math.floor((vehicle.innerWidthMm - WALL_GAP_MM * 2) / across)
  const cellHeight = Math.floor(vehicle.innerHeightMm / layers)
  const placements: Placement[] = []

  for (let index = 0; index < count; index++) {
    const column = Math.floor(index / (across * layers))
    const layer = Math.floor(index / across) % layers
    const slot = index % across
    const shape = SIZES[(column + slot + layer) % SIZES.length] ?? SIZES[0]
    const stop = 4 - Math.min(3, Math.floor((column * 4) / along))
    placements.push({
      id: `BENCH-${String(index + 1).padStart(5, '0')}`,
      orderId: `DH-${51000 + stop * 10 + (index % 3)}`,
      stop,
      lengthMm: Math.floor(cellLength * shape[0]),
      widthMm: Math.floor(cellWidth * shape[1]),
      heightMm: Math.floor(cellHeight * shape[2]),
      weightKg: 2 + (index % 9) * 0.5,
      position: {
        x: WALL_GAP_MM + column * cellLength,
        y: WALL_GAP_MM + slot * cellWidth,
        z: layer * cellHeight,
      },
      step: index + 1,
      orientation: (index % 3) as Orientation,
      packaging: index % 3 === 0 ? 'crate' : 'carton',
      fragile: index % 11 === 0,
      pinned: index === 1 || index === 17,
    })
  }

  const volume = placements.reduce((sum, p) => sum + p.lengthMm * p.widthMm * p.heightMm, 0)
  return {
    tripId: `BENCH-${count}`,
    vehicle,
    fillRate: (volume / (vehicle.innerLengthMm * vehicle.innerWidthMm * vehicle.innerHeightMm)) * 100,
    stops: STOP_NAMES.map((name, index) => ({
      number: index + 1,
      name,
      packageCount: placements.filter((p) => p.stop === index + 1).length,
    })),
    placements,
    unplaced: [],
  }
}

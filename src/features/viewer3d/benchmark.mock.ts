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
const WALL_GAP_MM = 20
const SIZES = [[0.86, 0.84, 0.8], [0.7, 0.94, 0.9], [0.92, 0.75, 0.72]] as const

/** Chỉ kích hoạt trong debug; không thay LOAD_PLAN dùng ở luồng nghiệp vụ. */
export function benchmarkCountFromSearch(search: string): BenchmarkCount | undefined {
  const params = new URLSearchParams(search)
  if (!params.has('debug')) return undefined
  const count = Number(params.get('packages'))
  return BENCHMARK_COUNTS.find((allowed) => allowed === count)
}

/**
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
    frontAxle: { loadKg: 3120, capacityKg: 4000 },
    rearAxle: { loadKg: 5120, capacityKg: 5500 },
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

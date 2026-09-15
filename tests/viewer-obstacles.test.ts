import { expect, test } from 'vitest'
import { obstacleIssues, validateVehicle } from '@/domain/constraints'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { VehicleObstacle } from '@/domain/models'
import { createBenchmarkInput } from '@/features/viewer3d/benchmark.mock'
import { benchmarkObstacleCountFromSearch, withBenchmarkObstacles } from '@/features/viewer3d/benchmark-obstacles.mock'
import { OBSTACLE_EDGE_VERTICES, obstacleColorToken, obstacleEdgePositions, obstacleStyle } from '@/features/viewer3d/scene/obstacle-layout'
import { obstacleCenter, obstacleSize } from '@/features/viewer3d/scene/units'

const [WHEEL_ARCH] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]

test('the Spec wheel arch at corner (0,0,0), 120 × 30 × 45 cm maps to scene centre and size on the Three.js axes', () => {
  // Scene = cm × 0,01; Three.js [x, y, z] = nghiệp vụ [x, z, y]. Số đã chạy thử bằng node: 60×0.01 = 0.6, 22.5×0.01 = 0.225 …
  expect(obstacleCenter(WHEEL_ARCH)).toStrictEqual([0.6, 0.225, 0.15])
  expect(obstacleSize(WHEEL_ARCH)).toStrictEqual([1.2, 0.45, 0.3])
})

test('edges of every obstacle share one buffer: 12 axis-aligned segments per obstacle spanning its corner box', () => {
  const positions = obstacleEdgePositions([WHEEL_ARCH])
  expect(positions.length).toBe(OBSTACLE_EDGE_VERTICES * 3)
  const xs = positions.filter((_, i) => i % 3 === 0), ys = positions.filter((_, i) => i % 3 === 1), zs = positions.filter((_, i) => i % 3 === 2)
  expect([Math.min(...xs), Math.min(...ys), Math.min(...zs)]).toStrictEqual([0, 0, 0])
  expect([Math.max(...xs), Math.max(...ys), Math.max(...zs)].map((v) => Number(v.toFixed(6)))).toStrictEqual([1.2, 0.45, 0.3])
  for (let segment = 0; segment < 12; segment++) {
    const a = positions.slice(segment * 6, segment * 6 + 3), b = positions.slice(segment * 6 + 3, segment * 6 + 6)
    expect([0, 1, 2].filter((axis) => a[axis] !== b[axis])).toHaveLength(1)
  }
  expect(obstacleEdgePositions(Array.from({ length: 20 }, () => WHEEL_ARCH)).length).toBe(20 * OBSTACLE_EDGE_VERTICES * 3)
  expect(obstacleEdgePositions([]).length).toBe(0)
})

test('only reserved zones are hatched and the colour token follows loadBearing', () => {
  expect(['WHEEL_ARCH', 'COOLING_UNIT', 'PARTITION', 'RESERVED_ZONE'].map((type) => obstacleStyle({ type } as VehicleObstacle)))
    .toStrictEqual(['solid', 'solid', 'solid', 'hatched'])
  expect([obstacleColorToken({ loadBearing: false }), obstacleColorToken({ loadBearing: true })]).toStrictEqual(['--obstacle', '--obstacle-bearing'])
})

test('obstacle benchmark parameter is debug-only and accepts 0, 1 or 20', () => {
  expect(benchmarkObstacleCountFromSearch('?packages=132&obstacles=20')).toBe(undefined)
  expect(benchmarkObstacleCountFromSearch('?debug&packages=132')).toBe(undefined)
  expect(benchmarkObstacleCountFromSearch('?debug&obstacles=5')).toBe(undefined)
  expect([0, 1, 20].map((n) => benchmarkObstacleCountFromSearch(`?debug&obstacles=${n}`))).toStrictEqual([0, 1, 20])
})

test('obstacle fixtures are valid vehicles, keep cargo clear of obstacles and leave the default benchmark untouched', () => {
  const input = createBenchmarkInput(132)
  expect(withBenchmarkObstacles(input, 0)).toBe(input)
  for (const count of [1, 20] as const) {
    const fixture = withBenchmarkObstacles(createBenchmarkInput(132), count)
    const { vehicle } = fixture.request
    const { placements, unplacedPackages } = fixture.result
    expect(vehicle.obstacles).toHaveLength(count)
    expect(validateVehicle(vehicle)).toStrictEqual([])
    expect(placements.flatMap((placement) => obstacleIssues(placement, vehicle))).toStrictEqual([])
    expect(placements.length + unplacedPackages.length).toBe(132)
    expect(placements.map((p) => p.loadingOrder)).toStrictEqual(placements.map((_, i) => i + 1))
    expect(new Set(vehicle.obstacles.map((o) => o.type)).size).toBe(count === 1 ? 1 : 4)
  }
  expect(withBenchmarkObstacles(createBenchmarkInput(132), 1).request.vehicle.obstacles).toStrictEqual([WHEEL_ARCH])
  expect(createBenchmarkInput(132)).toStrictEqual(input)
})

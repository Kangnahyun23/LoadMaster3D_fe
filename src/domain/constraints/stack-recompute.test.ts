import { expect, test } from 'vitest'
import {
  createPlacementLayout,
  createStackGraph,
  movePlacement,
  obstacleTopLoadKg,
  recomputeColumn,
  stackIssues,
  topLoadKg,
  type StackGraph,
  type StackingProfile,
} from '@/domain/constraints'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { PackagePlacement, VehicleConfig, VehicleObstacle } from '@/domain/models'
import { placed, stackingProfile, type Triple } from '@/test/placements'

/** Park–Miller generator: the same sequence on every run. */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

const [WHEEL_ARCH] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]
/** A load-bearing arch rated for 60 kg, so obstacle loads and their issues move too. */
const TRUCK: VehicleConfig = { ...SPEC_TRUCK_6M, obstacles: [{ ...WHEEL_ARCH, loadBearing: true, maxTopLoadKg: 60 }] }
const SIZES: Triple[] = [[40, 30, 25], [60, 40, 30], [80, 60, 40]]

/** Drops a box of `size` at a random spot of a 120 × 90 cm area onto whatever is below: floor, arch top or package tops. */
function drop(id: string, size: Triple, others: Iterable<PackagePlacement>, random: () => number): PackagePlacement {
  const [length, width] = size
  const x = 10 * Math.floor(random() * 9)
  const y = 10 * Math.floor(random() * 6)
  const overlapsBase = (bx: number, by: number, bl: number, bw: number) => x < bx + bl && bx < x + length && y < by + bw && by < y + width
  let z = overlapsBase(WHEEL_ARCH.xCm, WHEEL_ARCH.yCm, WHEEL_ARCH.lengthCm, WHEEL_ARCH.widthCm) ? WHEEL_ARCH.heightCm : 0
  for (const other of others) {
    if (other.packageInstanceId !== id && overlapsBase(other.xCm, other.yCm, other.placedLengthCm, other.placedWidthCm)) {
      z = Math.max(z, other.zCm + other.placedHeightCm)
    }
  }
  return placed(id, [x, y, z], size)
}

function expectSameAsFullRebuild(graph: StackGraph, profiles: ReadonlyMap<string, StackingProfile>): void {
  const rebuilt = createStackGraph(createPlacementLayout(TRUCK, [...graph.layout.placements.values()]), profiles)
  for (const id of graph.layout.placements.keys()) {
    expect(Math.abs(topLoadKg(graph, id) - topLoadKg(rebuilt, id))).toBeLessThanOrEqual(1e-9)
  }
  expect(Math.abs(obstacleTopLoadKg(graph, 'OBS-001') - obstacleTopLoadKg(rebuilt, 'OBS-001'))).toBeLessThanOrEqual(1e-9)
  expect(stackIssues(graph)).toStrictEqual(stackIssues(rebuilt))
}

test('recomputing only the moved column matches a full rebuild after each of 200 deterministic random moves', () => {
  const random = seededRandom(20_260_915)
  const placements: PackagePlacement[] = []
  const profiles = new Map<string, StackingProfile>()
  for (let index = 0; index < 40; index += 1) {
    const id = `P${String(index).padStart(2, '0')}`
    placements.push(drop(id, SIZES[index % SIZES.length] as Triple, placements, random))
    profiles.set(id, stackingProfile(5 + Math.floor(random() * 3500) / 100, { maxTopLoadKg: 80, maxStackCount: 4 }))
  }
  const graph = createStackGraph(createPlacementLayout(TRUCK, placements), profiles)
  let movesTouchingStacks = 0

  for (let move = 0; move < 200; move += 1) {
    const id = `P${String(Math.floor(random() * 40)).padStart(2, '0')}`
    const current = graph.layout.placements.get(id) as PackagePlacement
    const target = drop(id, [current.placedLengthCm, current.placedWidthCm, current.placedHeightCm], graph.layout.placements.values(), random)
    if ((graph.supported.get(id)?.size ?? 0) > 0 || target.zCm > 0) movesTouchingStacks += 1
    movePlacement(graph.layout, target)
    recomputeColumn(graph, [id])
    expectSameAsFullRebuild(graph, profiles)
  }
  // the scenario must really move stacked packages, or the comparison proves nothing
  expect(movesTouchingStacks).toBeGreaterThan(150)
}, 30_000)

import { expect, test } from 'vitest'
import { matchesOrientation, type OrientationCode } from '@/domain/geometry'
import { BENCHMARK_COUNTS, benchmarkCountFromSearch, createBenchmarkInput } from '@/features/viewer3d/benchmark.mock'
import { adaptResult, type ScenePlacement } from '@/features/viewer3d/scene-input'
import { createViewerDraft, patchPlacement, resolveEffectiveScene } from '@/features/viewer3d/viewer-draft'
import { cargoVisibility, createInstanceLayout, sameGeometry } from '@/features/viewer3d/scene/instance-layout'
import { benchmarkScene } from '@/test/scene'

const BASE = { lengthCm: 60, widthCm: 40, heightCm: 25 }
/** Kích thước đã xoay của BASE theo từng mã, viết tay từ định nghĩa Spec 6 (chữ thứ nhất dọc X, thứ hai dọc Y, thứ ba dọc Z). */
const EXPECTED: Record<OrientationCode, readonly [number, number, number]> = {
  LWH: [60, 40, 25], LHW: [60, 25, 40], WLH: [40, 60, 25], WHL: [40, 25, 60], HLW: [25, 60, 40], HWL: [25, 40, 60],
}
const CODES = Object.keys(EXPECTED) as OrientationCode[]
const sizeOf = (p: ScenePlacement) => [p.lengthCm, p.widthCm, p.heightCm]

/** Fixture 132 kiện với kiện đầu có kích thước BASE, đang đặt theo `source`. */
function inputWithFirst(source: OrientationCode) {
  const input = createBenchmarkInput(132)
  Object.assign(input.request.packages[0]!, BASE)
  const [placedLengthCm, placedWidthCm, placedHeightCm] = EXPECTED[source]
  Object.assign(input.result.placements[0]!, { orientation: source, placedLengthCm, placedWidthCm, placedHeightCm })
  return input
}

test('every source/target pair of the 6 orientations re-orients from the nominal package size, not the placed size', () => {
  for (const source of CODES) {
    for (const target of CODES) {
      const input = inputWithFirst(source)
      const before = structuredClone(input)
      const model = adaptResult({ trip: input.trip, revision: input })
      const id = model.placements[0]!.id
      const resolved = resolveEffectiveScene(model, patchPlacement(model, createViewerDraft(), id, { orientation: target })).placementById.get(id)!
      expect(model.baseDimensionsById.get(id)).toStrictEqual(BASE)
      expect([sizeOf(resolved), resolved.orientation]).toStrictEqual([[...EXPECTED[target]], target])
      expect(input).toStrictEqual(before)
    }
  }
})

test('adapter detaches and freezes the snapshot without freezing or mutating the source result', () => {
  const input = createBenchmarkInput(132)
  const original = structuredClone(input)
  const model = adaptResult({ trip: input.trip, revision: input })
  input.result.placements[0]!.xCm = 999
  input.request.vehicle.innerLengthCm = 1
  input.trip.stops[0]!.name = 'Đã sửa dữ liệu nguồn'
  expect(model.placements[0]!.position.x).toBe(original.result.placements[0]!.xCm)
  expect(model.vehicle.innerLengthCm).toBe(original.request.vehicle.innerLengthCm)
  expect(model.stops[0]!.name).toBe(original.trip.stops[0]!.name)
  expect(Object.isFrozen(model.placements)).toBeTruthy()
  expect(Object.isFrozen(model.placements[0]!.position)).toBeTruthy()
  expect(Object.isFrozen(input.result.placements)).toBe(false)
})

test('draft merges by id, keeps unrelated source references, prunes resets and ignores unknown ids', () => {
  const model = benchmarkScene(132)
  const source = model.placements[0]!
  const empty = createViewerDraft()
  expect(patchPlacement(model, empty, 'missing', { pinned: true })).toBe(empty)
  expect(patchPlacement(model, empty, source.id, { pinned: source.pinned })).toBe(empty)
  const position = { x: 12, y: 22, z: 32 }
  let draft = patchPlacement(model, empty, source.id, { position, orientation: 'HWL' })
  position.x = 999
  draft = patchPlacement(model, draft, source.id, { pinned: !source.pinned })
  const effective = resolveEffectiveScene(model, draft)
  expect(effective.placementById.get(source.id)!.position).toStrictEqual({ x: 12, y: 22, z: 32 })
  expect(effective.placementById.get(source.id)!.orientation).toBe('HWL')
  expect(effective.placementById.get(source.id)!.pinned).toBe(!source.pinned)
  expect(effective.placements[1]).toBe(model.placements[1])
  expect(patchPlacement(model, draft, source.id, { pinned: !source.pinned })).toBe(draft)
  draft = patchPlacement(model, draft, source.id, { position: undefined })
  expect(resolveEffectiveScene(model, draft).placements[0]!.position).toBe(source.position)
  draft = patchPlacement(model, draft, source.id, { orientation: source.orientation, pinned: source.pinned })
  expect(draft.patches.size).toBe(0)
  expect(resolveEffectiveScene(model, draft).placements[0]).toBe(source)
})

test('id lookup stays correct after source order changes; duplicate identities are rejected', () => {
  const input = createBenchmarkInput(132)
  const id = input.result.placements[12]!.packageInstanceId
  input.result.placements.reverse()
  const model = adaptResult({ trip: input.trip, revision: input })
  const draft = patchPlacement(model, createViewerDraft(), id, { position: { x: 1, y: 2, z: 3 } })
  const effective = resolveEffectiveScene(model, draft)
  expect(effective.placementById.get(id)!.position).toStrictEqual({ x: 1, y: 2, z: 3 })
  expect(effective.placements.find((p) => p.id === id)).toBe(effective.placementById.get(id))
  input.result.placements.push(input.result.placements[0]!)
  expect(() => adaptResult({ trip: input.trip, revision: input })).toThrow(/Mã kiện bị trùng/)
})

function overlaps(a: ScenePlacement, b: ScenePlacement): boolean {
  return a.position.x < b.position.x + b.lengthCm && b.position.x < a.position.x + a.lengthCm &&
    a.position.y < b.position.y + b.widthCm && b.position.y < a.position.y + a.widthCm &&
    a.position.z < b.position.z + b.heightCm && b.position.z < a.position.z + a.heightCm
}

for (const count of BENCHMARK_COUNTS) {
  test(`benchmark ${count}: deterministic Spec contract in cm, bounded, distinct identities, multiple sizes/stops and no overlaps`, () => {
    const input = createBenchmarkInput(count)
    expect(input).toStrictEqual(createBenchmarkInput(count))
    const { vehicle } = input.request
    const model = adaptResult({ trip: input.trip, revision: input })
    const placements = model.placements
    expect(placements.length).toBe(count)
    expect(new Set(placements.map((p) => p.id)).size).toBe(count)
    expect(new Set(placements.map((p) => p.step)).size).toBe(count)
    expect(new Set(placements.map((p) => p.stop)).size).toBe(4)
    expect(new Set(placements.map((p) => p.orientation)).size).toBe(3)
    expect(new Set(placements.map((p) => sizeOf(p).join('/'))).size >= 3).toBeTruthy()
    input.result.placements.forEach((placement, index) => {
      expect(matchesOrientation(placement, input.request.packages[index]!), placement.packageInstanceId).toBe(true)
    })
    for (let index = 0; index < count; index++) {
      const p = placements[index]!
      expect(sizeOf(p).every((size) => Number.isInteger(size) && size > 0)).toBeTruthy()
      expect(p.position.x >= 0 && p.position.x + p.lengthCm <= vehicle.innerLengthCm).toBeTruthy()
      expect(p.position.y >= 0 && p.position.y + p.widthCm <= vehicle.innerWidthCm).toBeTruthy()
      expect(p.position.z >= 0 && p.position.z + p.heightCm <= vehicle.innerHeightCm).toBeTruthy()
      for (let other = index + 1; other < count; other++) {
        expect(!overlaps(p, placements[other]!), `${p.id} overlaps ${placements[other]!.id}`).toBeTruthy()
      }
    }
    expect(model.stops.reduce((sum, stop) => sum + stop.packageCount, 0)).toBe(count)
    // ~500.000 expect cho 1.000 kiện: vượt mặc định 5 s khi máy/CI đang tải nặng.
  }, 30_000)
}

test('benchmark parameters cannot alter normal product flow', () => {
  expect(benchmarkCountFromSearch('?packages=1000')).toBe(undefined)
  expect(benchmarkCountFromSearch('?debug')).toBe(undefined)
  expect(benchmarkCountFromSearch('?debug&packages=999')).toBe(undefined)
  expect(benchmarkCountFromSearch('?debug&packages=1000')).toBe(1000)
})

test('all 1,000 GPU slots round-trip through placement identity independent of source order', () => {
  const placements = benchmarkScene(1000).placements
  const originalOrder = placements.map((p) => p.id)
  const layout = createInstanceLayout(placements)
  const reversed = createInstanceLayout([...placements].reverse())
  const grouped = createInstanceLayout([...placements].sort((a, b) => a.stop - b.stop || b.step - a.step))
  expect(layout.instanceToPlacementId).toStrictEqual(reversed.instanceToPlacementId)
  expect(layout.instanceToPlacementId).toStrictEqual(grouped.instanceToPlacementId)
  expect(placements.map((p) => p.id)).toStrictEqual(originalOrder)
  for (const placement of placements) {
    const slot = layout.placementIdToInstance.get(placement.id)!
    expect(layout.instanceToPlacementId[slot]).toBe(placement.id)
    expect(layout.placementById.get(placement.id)).toBe(placement)
    expect(reversed.placementIdToInstance.get(placement.id)).toBe(slot)
    expect(grouped.placementIdToInstance.get(placement.id)).toBe(slot)
  }
})

test('filtered/replaced instance layouts preserve correct identity even when GPU slots change', () => {
  const placements = benchmarkScene(1000).placements
  const complete = createInstanceLayout(placements)
  const filteredPlacements = placements.filter((p) => p.step % 3 === 0)
  const filtered = createInstanceLayout(filteredPlacements)
  expect(filtered.instanceToPlacementId.length).toBe(filteredPlacements.length)
  expect(!filtered.placementIdToInstance.has(placements[0]!.id)).toBeTruthy()
  for (const placement of filteredPlacements) {
    const slot = filtered.placementIdToInstance.get(placement.id)!
    expect(filtered.instanceToPlacementId[slot]).toBe(placement.id)
    expect(filtered.placementById.get(placement.id)).toBe(placement)
  }
  const changed = { ...placements[0]!, position: { x: 12, y: 4, z: 20 } }
  const replacement = createInstanceLayout([changed, ...placements.slice(1)])
  expect(replacement.placementIdToInstance.get(changed.id)).toBe(complete.placementIdToInstance.get(changed.id))
  expect(replacement.placementById.get(changed.id)).toBe(changed)
  expect(() => createInstanceLayout([changed, changed])).toThrow(/Mã kiện trong scene bị trùng/)
  const empty = createInstanceLayout([])
  expect(empty.instanceToPlacementId).toStrictEqual([])
  expect(empty.placementIdToInstance.size).toBe(0)
})

test('matrix geometry dirty checks ignore metadata but detect every coordinate/dimension change', () => {
  const placement = benchmarkScene(132).placements[0]!
  expect(!sameGeometry(undefined, placement)).toBeTruthy()
  expect(sameGeometry(placement, { ...placement, pinned: !placement.pinned, stop: 2, weightKg: 5 })).toBeTruthy()
  for (const axis of ['x', 'y', 'z'] as const) {
    expect(!sameGeometry(placement, { ...placement, position: { ...placement.position, [axis]: placement.position[axis] + 0.1 } })).toBeTruthy()
  }
  for (const dimension of ['lengthCm', 'widthCm', 'heightCm'] as const) {
    expect(!sameGeometry(placement, { ...placement, [dimension]: placement[dimension] + 0.1 })).toBeTruthy()
  }
})

test('visibility respects full step resolution, exact slice boundary and effective geometry', () => {
  const placement = benchmarkScene(1000).placements[500]!
  const end = placement.position.x + placement.lengthCm
  expect(cargoVisibility(placement, placement.step - 1, end)).toBe('hidden')
  expect(cargoVisibility(placement, placement.step - 1, end - 0.1)).toBe('hidden')
  expect(cargoVisibility(placement, placement.step, end)).toBe('opaque')
  expect(cargoVisibility(placement, placement.step, end - 0.1)).toBe('dim')
  expect(cargoVisibility({ ...placement, position: { ...placement.position, x: placement.position.x + 0.1 } }, placement.step, end)).toBe('dim')
  expect(cargoVisibility({ ...placement, lengthCm: placement.lengthCm + 0.1 }, placement.step, end)).toBe('dim')
})

import { expect, test } from 'vitest'
import { BENCHMARK_COUNTS, benchmarkCountFromSearch, createBenchmarkPlan } from '@/features/viewer3d/benchmark.mock'
import { adaptLoadPlan, canonicalDimensions, orientDimensions } from '@/features/viewer3d/viewer-scene-model'
import { createViewerDraft, patchPlacement, resolveEffectiveScene } from '@/features/viewer3d/viewer-draft'
import { cargoVisibility, createInstanceLayout, sameGeometry } from '@/features/viewer3d/scene/instance-layout'
import type { Orientation, Placement } from '@/types/load-plan'

const ORIENTATIONS: Orientation[] = [0, 1, 2]
const BASE = { lengthMm: 600, widthMm: 400, heightMm: 250 }
const EXPECTED = [BASE, { lengthMm: 400, widthMm: 600, heightMm: 250 }, { lengthMm: 250, widthMm: 400, heightMm: 600 }]

test('all nine source/target orientations respect already-oriented domain dimensions', () => {
  for (const sourceOrientation of ORIENTATIONS) {
    for (const targetOrientation of ORIENTATIONS) {
      const plan = createBenchmarkPlan(132)
      const source = plan.placements[0]!
      Object.assign(source, EXPECTED[sourceOrientation], { orientation: sourceOrientation })
      const model = adaptLoadPlan(plan)
      const before = structuredClone(plan)
      const draft = patchPlacement(model, createViewerDraft(), source.id, { orientation: targetOrientation })
      const resolved = resolveEffectiveScene(model, draft).placementById.get(source.id)!
      expect(canonicalDimensions(source)).toStrictEqual(BASE)
      expect(orientDimensions(BASE, targetOrientation)).toStrictEqual(EXPECTED[targetOrientation])
      expect({ lengthMm: resolved.lengthMm, widthMm: resolved.widthMm, heightMm: resolved.heightMm }).toStrictEqual(EXPECTED[targetOrientation])
      expect(resolved.orientation).toBe(targetOrientation)
      expect(plan).toStrictEqual(before)
    }
  }
})

test('adapter detaches and freezes snapshot without freezing or mutating source plan', () => {
  const plan = createBenchmarkPlan(132)
  const original = structuredClone(plan)
  const model = adaptLoadPlan(plan)
  expect(model.placements).toStrictEqual(plan.placements)
  expect(model.placements[0]).not.toBe(plan.placements[0])
  expect(model.placements[0]!.position).not.toBe(plan.placements[0]!.position)
  plan.placements[0]!.position.x = 999
  plan.vehicle.frontAxle.loadKg = 0
  plan.stops[0]!.name = 'Đã sửa dữ liệu nguồn'
  expect(model.placements[0]!.position.x).toBe(original.placements[0]!.position.x)
  expect(model.vehicle.frontAxle.loadKg).toBe(original.vehicle.frontAxle.loadKg)
  expect(model.stops[0]!.name).toBe(original.stops[0]!.name)
  expect(Object.isFrozen(model.placements)).toBeTruthy()
  expect(Object.isFrozen(model.placements[0]!.position)).toBeTruthy()
  expect(!Object.isFrozen(plan)).toBeTruthy()
})

test('draft merges by id, keeps unrelated source references, prunes resets and ignores unknown ids', () => {
  const model = adaptLoadPlan(createBenchmarkPlan(132))
  const source = model.placements[0]!
  const empty = createViewerDraft()
  expect(patchPlacement(model, empty, 'missing', { pinned: true })).toBe(empty)
  expect(patchPlacement(model, empty, source.id, { pinned: source.pinned })).toBe(empty)
  const position = { x: 120, y: 220, z: 320 }
  let draft = patchPlacement(model, empty, source.id, { position, orientation: 2 })
  position.x = 999
  draft = patchPlacement(model, draft, source.id, { pinned: !source.pinned })
  const effective = resolveEffectiveScene(model, draft)
  expect(effective.placementById.get(source.id)!.position).toStrictEqual({ x: 120, y: 220, z: 320 })
  expect(effective.placementById.get(source.id)!.orientation).toBe(2)
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
  const plan = createBenchmarkPlan(132)
  const id = plan.placements[12]!.id
  plan.placements.reverse()
  const model = adaptLoadPlan(plan)
  const draft = patchPlacement(model, createViewerDraft(), id, { position: { x: 1, y: 2, z: 3 } })
  const effective = resolveEffectiveScene(model, draft)
  expect(effective.placementById.get(id)!.position).toStrictEqual({ x: 1, y: 2, z: 3 })
  expect(effective.placements.find((p) => p.id === id)).toBe(effective.placementById.get(id))
  plan.placements.push(plan.placements[0]!)
  expect(() => adaptLoadPlan(plan)).toThrow(/Mã kiện bị trùng/)
})

function overlaps(a: Placement, b: Placement): boolean {
  return a.position.x < b.position.x + b.lengthMm && b.position.x < a.position.x + a.lengthMm &&
    a.position.y < b.position.y + b.widthMm && b.position.y < a.position.y + a.widthMm &&
    a.position.z < b.position.z + b.heightMm && b.position.z < a.position.z + a.heightMm
}

for (const count of BENCHMARK_COUNTS) {
  test(`benchmark ${count}: deterministic, bounded, distinct identities, multiple sizes/stops and no overlaps`, () => {
    const plan = createBenchmarkPlan(count)
    expect(plan).toStrictEqual(createBenchmarkPlan(count))
    expect(plan.placements.length).toBe(count)
    expect(new Set(plan.placements.map((p) => p.id)).size).toBe(count)
    expect(new Set(plan.placements.map((p) => p.step)).size).toBe(count)
    expect(new Set(plan.placements.map((p) => p.stop)).size).toBe(4)
    expect(new Set(plan.placements.map((p) => p.orientation)).size).toBe(3)
    expect(new Set(plan.placements.map((p) => `${p.lengthMm}/${p.widthMm}/${p.heightMm}`)).size >= 3).toBeTruthy()
    for (let index = 0; index < count; index++) {
      const p = plan.placements[index]!
      expect(Number.isInteger(p.lengthMm) && p.lengthMm > 0).toBeTruthy()
      expect(Number.isInteger(p.widthMm) && p.widthMm > 0).toBeTruthy()
      expect(Number.isInteger(p.heightMm) && p.heightMm > 0).toBeTruthy()
      expect(p.position.x >= 0 && p.position.x + p.lengthMm <= plan.vehicle.innerLengthMm).toBeTruthy()
      expect(p.position.y >= 0 && p.position.y + p.widthMm <= plan.vehicle.innerWidthMm).toBeTruthy()
      expect(p.position.z >= 0 && p.position.z + p.heightMm <= plan.vehicle.innerHeightMm).toBeTruthy()
      for (let other = index + 1; other < count; other++) {
        expect(!overlaps(p, plan.placements[other]!), `${p.id} overlaps ${plan.placements[other]!.id}`).toBeTruthy()
      }
    }
    expect(plan.stops.reduce((sum, stop) => sum + stop.packageCount, 0)).toBe(count)
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
  const placements = createBenchmarkPlan(1000).placements
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
  const placements = createBenchmarkPlan(1000).placements
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
  const changed = { ...placements[0]!, position: { x: 120, y: 40, z: 200 } }
  const replacement = createInstanceLayout([changed, ...placements.slice(1)])
  expect(replacement.placementIdToInstance.get(changed.id)).toBe(complete.placementIdToInstance.get(changed.id))
  expect(replacement.placementById.get(changed.id)).toBe(changed)
  expect(() => createInstanceLayout([changed, changed])).toThrow(/Mã kiện trong scene bị trùng/)
  const empty = createInstanceLayout([])
  expect(empty.instanceToPlacementId).toStrictEqual([])
  expect(empty.placementIdToInstance.size).toBe(0)
})

test('matrix geometry dirty checks ignore metadata but detect every coordinate/dimension change', () => {
  const placement = createBenchmarkPlan(132).placements[0]!
  expect(!sameGeometry(undefined, placement)).toBeTruthy()
  expect(sameGeometry(placement, { ...placement, pinned: !placement.pinned, stop: 2, weightKg: 5 })).toBeTruthy()
  for (const axis of ['x', 'y', 'z'] as const) {
    expect(!sameGeometry(placement, { ...placement, position: { ...placement.position, [axis]: placement.position[axis] + 1 } })).toBeTruthy()
  }
  for (const dimension of ['lengthMm', 'widthMm', 'heightMm'] as const) {
    expect(!sameGeometry(placement, { ...placement, [dimension]: placement[dimension] + 1 })).toBeTruthy()
  }
})

test('visibility respects full step resolution, exact slice boundary and effective geometry', () => {
  const placement = createBenchmarkPlan(1000).placements[500]!
  const end = placement.position.x + placement.lengthMm
  expect(cargoVisibility(placement, placement.step - 1, end)).toBe('hidden')
  expect(cargoVisibility(placement, placement.step - 1, end - 1)).toBe('hidden')
  expect(cargoVisibility(placement, placement.step, end)).toBe('opaque')
  expect(cargoVisibility(placement, placement.step, end - 1)).toBe('dim')
  expect(cargoVisibility({ ...placement, position: { ...placement.position, x: placement.position.x + 1 } }, placement.step, end)).toBe('dim')
  expect(cargoVisibility({ ...placement, lengthMm: placement.lengthMm + 1 }, placement.step, end)).toBe('dim')
})

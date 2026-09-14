import assert from 'node:assert/strict'
import test from 'node:test'
import { BENCHMARK_COUNTS, benchmarkCountFromSearch, createBenchmarkPlan } from '../src/features/viewer3d/benchmark.mock.ts'
import { adaptLoadPlan, canonicalDimensions, orientDimensions } from '../src/features/viewer3d/viewer-scene-model.ts'
import { createViewerDraft, patchPlacement, resolveEffectiveScene } from '../src/features/viewer3d/viewer-draft.ts'
import { cargoVisibility, createInstanceLayout, sameGeometry } from '../src/features/viewer3d/scene/instance-layout.ts'
import type { Orientation, Placement } from '../src/types/load-plan.ts'

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
      assert.deepEqual(canonicalDimensions(source), BASE)
      assert.deepEqual(orientDimensions(BASE, targetOrientation), EXPECTED[targetOrientation])
      assert.deepEqual({ lengthMm: resolved.lengthMm, widthMm: resolved.widthMm, heightMm: resolved.heightMm }, EXPECTED[targetOrientation])
      assert.equal(resolved.orientation, targetOrientation)
      assert.deepEqual(plan, before)
    }
  }
})

test('adapter detaches and freezes snapshot without freezing or mutating source plan', () => {
  const plan = createBenchmarkPlan(132)
  const original = structuredClone(plan)
  const model = adaptLoadPlan(plan)
  assert.deepEqual(model.placements, plan.placements)
  assert.notEqual(model.placements[0], plan.placements[0])
  assert.notEqual(model.placements[0]!.position, plan.placements[0]!.position)
  plan.placements[0]!.position.x = 999
  plan.vehicle.frontAxle.loadKg = 0
  plan.stops[0]!.name = 'Đã sửa dữ liệu nguồn'
  assert.equal(model.placements[0]!.position.x, original.placements[0]!.position.x)
  assert.equal(model.vehicle.frontAxle.loadKg, original.vehicle.frontAxle.loadKg)
  assert.equal(model.stops[0]!.name, original.stops[0]!.name)
  assert.ok(Object.isFrozen(model.placements))
  assert.ok(Object.isFrozen(model.placements[0]!.position))
  assert.ok(!Object.isFrozen(plan))
})

test('draft merges by id, keeps unrelated source references, prunes resets and ignores unknown ids', () => {
  const model = adaptLoadPlan(createBenchmarkPlan(132))
  const source = model.placements[0]!
  const empty = createViewerDraft()
  assert.equal(patchPlacement(model, empty, 'missing', { pinned: true }), empty)
  assert.equal(patchPlacement(model, empty, source.id, { pinned: source.pinned }), empty)
  const position = { x: 120, y: 220, z: 320 }
  let draft = patchPlacement(model, empty, source.id, { position, orientation: 2 })
  position.x = 999
  draft = patchPlacement(model, draft, source.id, { pinned: !source.pinned })
  const effective = resolveEffectiveScene(model, draft)
  assert.deepEqual(effective.placementById.get(source.id)!.position, { x: 120, y: 220, z: 320 })
  assert.equal(effective.placementById.get(source.id)!.orientation, 2)
  assert.equal(effective.placementById.get(source.id)!.pinned, !source.pinned)
  assert.equal(effective.placements[1], model.placements[1])
  assert.equal(patchPlacement(model, draft, source.id, { pinned: !source.pinned }), draft)
  draft = patchPlacement(model, draft, source.id, { position: undefined })
  assert.equal(resolveEffectiveScene(model, draft).placements[0]!.position, source.position)
  draft = patchPlacement(model, draft, source.id, { orientation: source.orientation, pinned: source.pinned })
  assert.equal(draft.patches.size, 0)
  assert.equal(resolveEffectiveScene(model, draft).placements[0], source)
})

test('id lookup stays correct after source order changes; duplicate identities are rejected', () => {
  const plan = createBenchmarkPlan(132)
  const id = plan.placements[12]!.id
  plan.placements.reverse()
  const model = adaptLoadPlan(plan)
  const draft = patchPlacement(model, createViewerDraft(), id, { position: { x: 1, y: 2, z: 3 } })
  const effective = resolveEffectiveScene(model, draft)
  assert.deepEqual(effective.placementById.get(id)!.position, { x: 1, y: 2, z: 3 })
  assert.equal(effective.placements.find((p) => p.id === id), effective.placementById.get(id))
  plan.placements.push(plan.placements[0]!)
  assert.throws(() => adaptLoadPlan(plan), /Mã kiện bị trùng/)
})

function overlaps(a: Placement, b: Placement): boolean {
  return a.position.x < b.position.x + b.lengthMm && b.position.x < a.position.x + a.lengthMm &&
    a.position.y < b.position.y + b.widthMm && b.position.y < a.position.y + a.widthMm &&
    a.position.z < b.position.z + b.heightMm && b.position.z < a.position.z + a.heightMm
}

for (const count of BENCHMARK_COUNTS) {
  test(`benchmark ${count}: deterministic, bounded, distinct identities, multiple sizes/stops and no overlaps`, () => {
    const plan = createBenchmarkPlan(count)
    assert.deepEqual(plan, createBenchmarkPlan(count))
    assert.equal(plan.placements.length, count)
    assert.equal(new Set(plan.placements.map((p) => p.id)).size, count)
    assert.equal(new Set(plan.placements.map((p) => p.step)).size, count)
    assert.equal(new Set(plan.placements.map((p) => p.stop)).size, 4)
    assert.equal(new Set(plan.placements.map((p) => p.orientation)).size, 3)
    assert.ok(new Set(plan.placements.map((p) => `${p.lengthMm}/${p.widthMm}/${p.heightMm}`)).size >= 3)
    for (let index = 0; index < count; index++) {
      const p = plan.placements[index]!
      assert.ok(Number.isInteger(p.lengthMm) && p.lengthMm > 0)
      assert.ok(Number.isInteger(p.widthMm) && p.widthMm > 0)
      assert.ok(Number.isInteger(p.heightMm) && p.heightMm > 0)
      assert.ok(p.position.x >= 0 && p.position.x + p.lengthMm <= plan.vehicle.innerLengthMm)
      assert.ok(p.position.y >= 0 && p.position.y + p.widthMm <= plan.vehicle.innerWidthMm)
      assert.ok(p.position.z >= 0 && p.position.z + p.heightMm <= plan.vehicle.innerHeightMm)
      for (let other = index + 1; other < count; other++) {
        assert.ok(!overlaps(p, plan.placements[other]!), `${p.id} overlaps ${plan.placements[other]!.id}`)
      }
    }
    assert.equal(plan.stops.reduce((sum, stop) => sum + stop.packageCount, 0), count)
  })
}

test('benchmark parameters cannot alter normal product flow', () => {
  assert.equal(benchmarkCountFromSearch('?packages=1000'), undefined)
  assert.equal(benchmarkCountFromSearch('?debug'), undefined)
  assert.equal(benchmarkCountFromSearch('?debug&packages=999'), undefined)
  assert.equal(benchmarkCountFromSearch('?debug&packages=1000'), 1000)
})

test('all 1,000 GPU slots round-trip through placement identity independent of source order', () => {
  const placements = createBenchmarkPlan(1000).placements
  const originalOrder = placements.map((p) => p.id)
  const layout = createInstanceLayout(placements)
  const reversed = createInstanceLayout([...placements].reverse())
  const grouped = createInstanceLayout([...placements].sort((a, b) => a.stop - b.stop || b.step - a.step))
  assert.deepEqual(layout.instanceToPlacementId, reversed.instanceToPlacementId)
  assert.deepEqual(layout.instanceToPlacementId, grouped.instanceToPlacementId)
  assert.deepEqual(placements.map((p) => p.id), originalOrder)
  for (const placement of placements) {
    const slot = layout.placementIdToInstance.get(placement.id)!
    assert.equal(layout.instanceToPlacementId[slot], placement.id)
    assert.equal(layout.placementById.get(placement.id), placement)
    assert.equal(reversed.placementIdToInstance.get(placement.id), slot)
    assert.equal(grouped.placementIdToInstance.get(placement.id), slot)
  }
})

test('filtered/replaced instance layouts preserve correct identity even when GPU slots change', () => {
  const placements = createBenchmarkPlan(1000).placements
  const complete = createInstanceLayout(placements)
  const filteredPlacements = placements.filter((p) => p.step % 3 === 0)
  const filtered = createInstanceLayout(filteredPlacements)
  assert.equal(filtered.instanceToPlacementId.length, filteredPlacements.length)
  assert.ok(!filtered.placementIdToInstance.has(placements[0]!.id))
  for (const placement of filteredPlacements) {
    const slot = filtered.placementIdToInstance.get(placement.id)!
    assert.equal(filtered.instanceToPlacementId[slot], placement.id)
    assert.equal(filtered.placementById.get(placement.id), placement)
  }
  const changed = { ...placements[0]!, position: { x: 120, y: 40, z: 200 } }
  const replacement = createInstanceLayout([changed, ...placements.slice(1)])
  assert.equal(replacement.placementIdToInstance.get(changed.id), complete.placementIdToInstance.get(changed.id))
  assert.equal(replacement.placementById.get(changed.id), changed)
  assert.throws(() => createInstanceLayout([changed, changed]), /Mã kiện trong scene bị trùng/)
  const empty = createInstanceLayout([])
  assert.deepEqual(empty.instanceToPlacementId, [])
  assert.equal(empty.placementIdToInstance.size, 0)
})

test('matrix geometry dirty checks ignore metadata but detect every coordinate/dimension change', () => {
  const placement = createBenchmarkPlan(132).placements[0]!
  assert.ok(!sameGeometry(undefined, placement))
  assert.ok(sameGeometry(placement, { ...placement, pinned: !placement.pinned, stop: 2, weightKg: 5 }))
  for (const axis of ['x', 'y', 'z'] as const) {
    assert.ok(!sameGeometry(placement, { ...placement, position: { ...placement.position, [axis]: placement.position[axis] + 1 } }))
  }
  for (const dimension of ['lengthMm', 'widthMm', 'heightMm'] as const) {
    assert.ok(!sameGeometry(placement, { ...placement, [dimension]: placement[dimension] + 1 }))
  }
})

test('visibility respects full step resolution, exact slice boundary and effective geometry', () => {
  const placement = createBenchmarkPlan(1000).placements[500]!
  const end = placement.position.x + placement.lengthMm
  assert.equal(cargoVisibility(placement, placement.step - 1, end), 'hidden')
  assert.equal(cargoVisibility(placement, placement.step - 1, end - 1), 'hidden')
  assert.equal(cargoVisibility(placement, placement.step, end), 'opaque')
  assert.equal(cargoVisibility(placement, placement.step, end - 1), 'dim')
  assert.equal(cargoVisibility({ ...placement, position: { ...placement.position, x: placement.position.x + 1 } }, placement.step, end), 'dim')
  assert.equal(cargoVisibility({ ...placement, lengthMm: placement.lengthMm + 1 }, placement.step, end), 'dim')
})

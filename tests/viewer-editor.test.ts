import assert from 'node:assert/strict'
import test from 'node:test'
import { createBenchmarkPlan } from '../src/features/viewer3d/benchmark.mock.ts'
import { adaptLoadPlan } from '../src/features/viewer3d/viewer-scene-model.ts'
import { resolveEffectiveScene } from '../src/features/viewer3d/viewer-draft.ts'
import { commitCommand, createDraftHistory, travelHistory } from '../src/features/viewer3d/editor/draft-history.ts'
import { EDITOR_RULES, overlaps, supportCoverage, validatePlacement } from '../src/features/viewer3d/editor/geometry.ts'
import { snapPosition } from '../src/features/viewer3d/editor/snapping.ts'
import type { Placement } from '../src/types/load-plan.ts'

const plan = createBenchmarkPlan(1000)
const vehicle = plan.vehicle
const box = (id: string, x = 0, y = 0, z = 0, extra: Partial<Placement> = {}): Placement => ({
  ...plan.placements[0]!, id, lengthMm: 100, widthMm: 100, heightMm: 100, fragile: false,
  position: { x, y, z }, ...extra,
})

test('touching faces are valid; even 1 mm penetration is a hard overlap', () => {
  const a = box('a'), b = box('b', 100)
  assert.equal(overlaps(a, b), false)
  assert.equal(validatePlacement(a, [a, b], vehicle).valid, true)
  b.position.x = 99
  assert.deepEqual(validatePlacement(a, [a, b], vehicle).overlapIds, ['b'])
  assert.equal(validatePlacement(a, [a, b], vehicle).valid, false)
})

test('every container boundary, finite integer positions, and self exclusion', () => {
  for (const [x, y, z] of [[-1, 0, 0], [7101, 0, 0], [0, -1, 0], [0, 2251, 0], [0, 0, -1], [0, 0, 2301], [0.5, 0, 0], [NaN, 0, 0]]) {
    assert.equal(validatePlacement(box('a', x, y, z), [], vehicle).valid, false)
  }
  const a = box('a', 7100, 2250, 2300)
  assert.equal(validatePlacement(a, [a], vehicle).valid, true)
})

test('support is the union of contacts, including partial and multiple surfaces', () => {
  const top = box('top', 0, 0, 100)
  const left = box('left', 0, 0, 0, { lengthMm: 60 })
  const right = box('right', 40, 0, 0, { lengthMm: 60 })
  assert.equal(supportCoverage(top, [left, right]).ratio, 1, 'overlapping projected areas cannot exceed 100%')
  assert.equal(supportCoverage(top, [box('partial', 0, 0, 0, { lengthMm: 43 })]).ratio, 0.43)
  assert.equal(supportCoverage(box('floor'), []).ratio, 1)
  assert.equal(supportCoverage(box('floating', 0, 0, 110), [left, right]).ratio, 0, '10 mm gap is not contact')
})

test('weak support, fragile loads and manual edits remain advisories', () => {
  const fragile = box('fragile', 0, 0, 0, { fragile: true })
  const top = box('top', 0, 0, 100)
  const onFragile = validatePlacement(top, [fragile], vehicle, true)
  assert.equal(onFragile.valid, true)
  assert.ok(onFragile.advisories.some((text) => text.includes('Đặt trên kiện dễ vỡ')))
  assert.ok(onFragile.advisories.some((text) => text.includes('thủ công')))
  assert.ok(validatePlacement(fragile, [top], vehicle).advisories.some((text) => text.includes('đỡ hàng')))
  assert.equal(validatePlacement(box('floating', 0, 0, 500), [], vehicle).valid, true)
})

test('snapping chooses floor/walls/grid/cargo faces in integer mm with fixed axes', () => {
  const p = box('a')
  assert.deepEqual(snapPosition(p, { x: 8, y: 2258, z: 12 }, [], vehicle).position, { x: 0, y: 2250, z: 0 })
  assert.deepEqual(snapPosition(p, { x: 151.4, y: 500, z: 0 }, [], vehicle).position, { x: 150, y: 500, z: 0 })
  const neighbor = box('b', 267, 0, 0)
  const snapped = snapPosition(p, { x: 172, y: 0, z: 0 }, [neighbor], vehicle)
  assert.equal(snapped.position.x, 167)
  assert.ok(snapped.sources.some((s) => s.includes('Mặt kiện b')))
  assert.equal(overlaps({ ...p, position: snapped.position }, neighbor), false)
  assert.equal(snapPosition(p, { x: 172, y: 700, z: 0 }, [neighbor], vehicle).position.x, 172, 'remote face does not attract')
  assert.equal(snapPosition(p, { x: 8, y: 8, z: 12 }, [], vehicle, ['x', 'y']).position.z, 12)
  const first = snapPosition(p, { x: 172.2, y: 0, z: 0 }, [neighbor], vehicle)
  assert.deepEqual(snapPosition(p, first.position, [neighbor], vehicle).position, first.position, 'no conversion drift')
})

test('mixed history commands undo/redo exact patches without mutating 1,000-placement snapshot', () => {
  const model = adaptLoadPlan(plan)
  const before = structuredClone(plan)
  const id = model.placements[0]!.id
  let h = createDraftHistory()
  h = commitCommand(model, h, 'MOVE', id, { position: { x: 30, y: 20, z: 0 } })
  h = commitCommand(model, h, 'ROTATE', id, { orientation: 2 })
  h = commitCommand(model, h, 'PIN', id, { pinned: true })
  h = commitCommand(model, h, 'UNPIN', id, { pinned: false })
  const edited = h.draft
  h = commitCommand(model, h, 'RESET_PLACEMENT', id)
  assert.equal(h.draft.patches.size, 0)
  h = travelHistory(h, 'undo')
  assert.deepEqual(h.draft, edited)
  h = commitCommand(model, h, 'MOVE', model.placements[2]!.id, { position: { x: 35, y: 500, z: 0 } })
  assert.equal(h.future.length, 0)
  const twoEdits = h.draft
  h = commitCommand(model, h, 'RESET_DRAFT')
  assert.equal(h.draft.patches.size, 0)
  h = travelHistory(h, 'undo')
  assert.deepEqual(h.draft, twoEdits)
  h = travelHistory(h, 'redo')
  assert.equal(h.draft.patches.size, 0)
  assert.equal(resolveEffectiveScene(model, h.draft).placements[999], model.placements[999])
  assert.deepEqual(plan, before)
})

test('history ignores no-ops, branches after undo, and stays bounded', () => {
  const model = adaptLoadPlan(plan), id = model.placements[0]!.id
  let h = createDraftHistory()
  assert.equal(commitCommand(model, h, 'RESET_DRAFT'), h)
  assert.equal(commitCommand(model, h, 'MOVE', 'missing', { pinned: true }), h)
  for (let i = 0; i < EDITOR_RULES.historyLimit + 5; i++) h = commitCommand(model, h, 'MOVE', id, { position: { x: i, y: 0, z: 0 } })
  assert.equal(h.past.length, EDITOR_RULES.historyLimit)
  assert.equal(h.past.at(-1)!.changes.length, 1)
  h = travelHistory(h, 'undo')
  h = commitCommand(model, h, 'PIN', id, { pinned: true })
  assert.equal(h.future.length, 0)
})

test('measure scan + snapping at each benchmark count (no hardware-dependent assertion)', () => {
  const results = []
  for (const count of [132, 300, 500, 1000] as const) {
    const data = createBenchmarkPlan(count), times: number[] = []
    for (let i = 0; i < 1100; i++) {
      const p = data.placements[i % count]!
      const start = performance.now()
      const position = snapPosition(p, { ...p.position, x: p.position.x + i % 20 }, data.placements, data.vehicle).position
      validatePlacement({ ...p, position }, data.placements, data.vehicle, true)
      if (i >= 100) times.push(performance.now() - start)
    }
    times.sort((a, b) => a - b)
    results.push({ count, medianMs: times[500], p95Ms: times[950], maxMs: times.at(-1) })
  }
  console.log('EDITOR_BENCHMARK', JSON.stringify(results))
})

import { expect, test } from 'vitest'
import { createBenchmarkPlan } from '@/features/viewer3d/benchmark.mock'
import { adaptLoadPlan } from '@/features/viewer3d/viewer-scene-model'
import { resolveEffectiveScene } from '@/features/viewer3d/viewer-draft'
import { commitCommand, createDraftHistory, travelHistory } from '@/features/viewer3d/editor/draft-history'
import { EDITOR_RULES, overlaps, supportCoverage, validatePlacement } from '@/features/viewer3d/editor/geometry'
import { snapPosition } from '@/features/viewer3d/editor/snapping'
import type { Placement } from '@/types/load-plan'

const plan = createBenchmarkPlan(1000)
const vehicle = plan.vehicle
const box = (id: string, x = 0, y = 0, z = 0, extra: Partial<Placement> = {}): Placement => ({
  ...plan.placements[0]!, id, lengthMm: 100, widthMm: 100, heightMm: 100, fragile: false,
  position: { x, y, z }, ...extra,
})

test('touching faces are valid; even 1 mm penetration is a hard overlap', () => {
  const a = box('a'), b = box('b', 100)
  expect(overlaps(a, b)).toBe(false)
  expect(validatePlacement(a, [a, b], vehicle).valid).toBe(true)
  b.position.x = 99
  expect(validatePlacement(a, [a, b], vehicle).overlapIds).toStrictEqual(['b'])
  expect(validatePlacement(a, [a, b], vehicle).valid).toBe(false)
})

test('every container boundary, finite integer positions, and self exclusion', () => {
  for (const [x, y, z] of [[-1, 0, 0], [7101, 0, 0], [0, -1, 0], [0, 2251, 0], [0, 0, -1], [0, 0, 2301], [0.5, 0, 0], [NaN, 0, 0]]) {
    expect(validatePlacement(box('a', x, y, z), [], vehicle).valid).toBe(false)
  }
  const a = box('a', 7100, 2250, 2300)
  expect(validatePlacement(a, [a], vehicle).valid).toBe(true)
})

test('support is the union of contacts, including partial and multiple surfaces', () => {
  const top = box('top', 0, 0, 100)
  const left = box('left', 0, 0, 0, { lengthMm: 60 })
  const right = box('right', 40, 0, 0, { lengthMm: 60 })
  expect(supportCoverage(top, [left, right]).ratio, 'overlapping projected areas cannot exceed 100%').toBe(1)
  expect(supportCoverage(top, [box('partial', 0, 0, 0, { lengthMm: 43 })]).ratio).toBe(0.43)
  expect(supportCoverage(box('floor'), []).ratio).toBe(1)
  expect(supportCoverage(box('floating', 0, 0, 110), [left, right]).ratio, '10 mm gap is not contact').toBe(0)
})

test('weak support, fragile loads and manual edits remain advisories', () => {
  const fragile = box('fragile', 0, 0, 0, { fragile: true })
  const top = box('top', 0, 0, 100)
  const onFragile = validatePlacement(top, [fragile], vehicle, true)
  expect(onFragile.valid).toBe(true)
  expect(onFragile.advisories.some((text) => text.includes('Đặt trên kiện dễ vỡ'))).toBeTruthy()
  expect(onFragile.advisories.some((text) => text.includes('thủ công'))).toBeTruthy()
  expect(validatePlacement(fragile, [top], vehicle).advisories.some((text) => text.includes('đỡ hàng'))).toBeTruthy()
  expect(validatePlacement(box('floating', 0, 0, 500), [], vehicle).valid).toBe(true)
})

test('snapping chooses floor/walls/grid/cargo faces in integer mm with fixed axes', () => {
  const p = box('a')
  expect(snapPosition(p, { x: 8, y: 2258, z: 12 }, [], vehicle).position).toStrictEqual({ x: 0, y: 2250, z: 0 })
  expect(snapPosition(p, { x: 151.4, y: 500, z: 0 }, [], vehicle).position).toStrictEqual({ x: 150, y: 500, z: 0 })
  const neighbor = box('b', 267, 0, 0)
  const snapped = snapPosition(p, { x: 172, y: 0, z: 0 }, [neighbor], vehicle)
  expect(snapped.position.x).toBe(167)
  expect(snapped.sources.some((s) => s.includes('Mặt kiện b'))).toBeTruthy()
  expect(overlaps({ ...p, position: snapped.position }, neighbor)).toBe(false)
  expect(snapPosition(p, { x: 172, y: 700, z: 0 }, [neighbor], vehicle).position.x, 'remote face does not attract').toBe(172)
  expect(snapPosition(p, { x: 8, y: 8, z: 12 }, [], vehicle, ['x', 'y']).position.z).toBe(12)
  const first = snapPosition(p, { x: 172.2, y: 0, z: 0 }, [neighbor], vehicle)
  expect(snapPosition(p, first.position, [neighbor], vehicle).position, 'no conversion drift').toStrictEqual(first.position)
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
  expect(h.draft.patches.size).toBe(0)
  h = travelHistory(h, 'undo')
  expect(h.draft).toStrictEqual(edited)
  h = commitCommand(model, h, 'MOVE', model.placements[2]!.id, { position: { x: 35, y: 500, z: 0 } })
  expect(h.future.length).toBe(0)
  const twoEdits = h.draft
  h = commitCommand(model, h, 'RESET_DRAFT')
  expect(h.draft.patches.size).toBe(0)
  h = travelHistory(h, 'undo')
  expect(h.draft).toStrictEqual(twoEdits)
  h = travelHistory(h, 'redo')
  expect(h.draft.patches.size).toBe(0)
  expect(resolveEffectiveScene(model, h.draft).placements[999]).toBe(model.placements[999])
  expect(plan).toStrictEqual(before)
})

test('history ignores no-ops, branches after undo, and stays bounded', () => {
  const model = adaptLoadPlan(plan), id = model.placements[0]!.id
  let h = createDraftHistory()
  expect(commitCommand(model, h, 'RESET_DRAFT')).toBe(h)
  expect(commitCommand(model, h, 'MOVE', 'missing', { pinned: true })).toBe(h)
  for (let i = 0; i < EDITOR_RULES.historyLimit + 5; i++) h = commitCommand(model, h, 'MOVE', id, { position: { x: i, y: 0, z: 0 } })
  expect(h.past.length).toBe(EDITOR_RULES.historyLimit)
  expect(h.past.at(-1)!.changes.length).toBe(1)
  h = travelHistory(h, 'undo')
  h = commitCommand(model, h, 'PIN', id, { pinned: true })
  expect(h.future.length).toBe(0)
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

import { expect, test } from 'vitest'
import { resolveEffectiveScene } from '@/features/viewer3d/viewer-draft'
import { commitCommand, createDraftHistory, travelHistory } from '@/features/viewer3d/editor/draft-history'
import { EDITOR_RULES, overlaps, supportCoverage, validatePlacement } from '@/features/viewer3d/editor/geometry'
import { snapPosition } from '@/features/viewer3d/editor/snapping'
import { benchmarkScene, sceneBox as box } from '@/test/scene'

const model = benchmarkScene(1000)
const vehicle = model.vehicle

test('touching faces are valid; even 0.1 cm penetration is a hard overlap', () => {
  const a = box('a'), b = box('b', 10)
  expect(overlaps(a, b)).toBe(false)
  expect(validatePlacement(a, [a, b], vehicle).valid).toBe(true)
  const sunk = box('b', 9.9)
  expect(validatePlacement(a, [a, sunk], vehicle).overlapIds).toStrictEqual(['b'])
  expect(validatePlacement(a, [a, sunk], vehicle).valid).toBe(false)
})

test('every container boundary, 0.1 cm positions, and self exclusion', () => {
  for (const [x, y, z] of [[-0.1, 0, 0], [710.1, 0, 0], [0, -0.1, 0], [0, 225.1, 0], [0, 0, -0.1], [0, 0, 230.1], [0.05, 0, 0], [NaN, 0, 0]]) {
    expect(validatePlacement(box('a', x, y, z), [], vehicle).valid).toBe(false)
  }
  const a = box('a', 710, 225, 230)
  expect(validatePlacement(a, [a], vehicle).valid).toBe(true)
})

test('support is the union of contacts, including partial and multiple surfaces', () => {
  const top = box('top', 0, 0, 10)
  const left = box('left', 0, 0, 0, { lengthCm: 6 })
  const right = box('right', 4, 0, 0, { lengthCm: 6 })
  expect(supportCoverage(top, [left, right]).ratio, 'overlapping projected areas cannot exceed 100%').toBe(1)
  expect(supportCoverage(top, [box('partial', 0, 0, 0, { lengthCm: 4.3 })]).ratio).toBe(0.43)
  expect(supportCoverage(box('floor'), []).ratio).toBe(1)
  expect(supportCoverage(box('floating', 0, 0, 11), [left, right]).ratio, '1 cm gap is not contact').toBe(0)
})

test('weak support, fragile loads and manual edits remain advisories', () => {
  const fragile = box('fragile', 0, 0, 0, { fragile: true })
  const top = box('top', 0, 0, 10)
  const onFragile = validatePlacement(top, [fragile], vehicle, true)
  expect(onFragile.valid).toBe(true)
  expect(onFragile.advisories.some((text) => text.includes('Đặt trên kiện dễ vỡ'))).toBeTruthy()
  expect(onFragile.advisories.some((text) => text.includes('thủ công'))).toBeTruthy()
  expect(validatePlacement(fragile, [top], vehicle).advisories.some((text) => text.includes('đỡ hàng'))).toBeTruthy()
  expect(validatePlacement(box('floating', 0, 0, 50), [], vehicle).valid).toBe(true)
})

test('snapping chooses floor/walls/5 cm grid/cargo faces within 2 cm, with fixed axes', () => {
  const p = box('a')
  expect(snapPosition(p, { x: 0.8, y: 225.8, z: 1.2 }, [], vehicle).position).toStrictEqual({ x: 0, y: 225, z: 0 })
  expect(snapPosition(p, { x: 15.14, y: 50, z: 0 }, [], vehicle).position).toStrictEqual({ x: 15, y: 50, z: 0 })
  const neighbor = box('b', 26.7, 0, 0)
  const snapped = snapPosition(p, { x: 17.2, y: 0, z: 0 }, [neighbor], vehicle)
  expect(snapped.position.x).toBe(16.7)
  expect(snapped.sources.some((s) => s.includes('Mặt kiện b'))).toBeTruthy()
  expect(overlaps({ ...p, position: snapped.position }, neighbor)).toBe(false)
  expect(snapPosition(p, { x: 17.2, y: 70, z: 0 }, [neighbor], vehicle).position.x, 'remote face does not attract').toBe(17.2)
  expect(snapPosition(p, { x: 0.8, y: 0.8, z: 1.2 }, [], vehicle, ['x', 'y']).position.z).toBe(1.2)
  const first = snapPosition(p, { x: 17.22, y: 0, z: 0 }, [neighbor], vehicle)
  expect(snapPosition(p, first.position, [neighbor], vehicle).position, 'no conversion drift').toStrictEqual(first.position)
})

test('mixed history commands undo/redo exact patches without mutating 1,000-placement snapshot', () => {
  const before = structuredClone(model.placements)
  const id = model.placements[0]!.id
  let h = createDraftHistory()
  h = commitCommand(model, h, 'MOVE', id, { position: { x: 3, y: 2, z: 0 } })
  h = commitCommand(model, h, 'ROTATE', id, { orientation: 'HWL' })
  h = commitCommand(model, h, 'PIN', id, { pinned: true })
  h = commitCommand(model, h, 'UNPIN', id, { pinned: false })
  const edited = h.draft
  h = commitCommand(model, h, 'RESET_PLACEMENT', id)
  expect(h.draft.patches.size).toBe(0)
  h = travelHistory(h, 'undo')
  expect(h.draft).toStrictEqual(edited)
  h = commitCommand(model, h, 'MOVE', model.placements[2]!.id, { position: { x: 3.5, y: 50, z: 0 } })
  expect(h.future.length).toBe(0)
  const twoEdits = h.draft
  h = commitCommand(model, h, 'RESET_DRAFT')
  expect(h.draft.patches.size).toBe(0)
  h = travelHistory(h, 'undo')
  expect(h.draft).toStrictEqual(twoEdits)
  h = travelHistory(h, 'redo')
  expect(h.draft.patches.size).toBe(0)
  expect(resolveEffectiveScene(model, h.draft).placements[999]).toBe(model.placements[999])
  expect(model.placements).toStrictEqual(before)
})

test('history ignores no-ops, branches after undo, and stays bounded', () => {
  const id = model.placements[0]!.id
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
    const data = benchmarkScene(count), times: number[] = []
    for (let i = 0; i < 1100; i++) {
      const p = data.placements[i % count]!
      const start = performance.now()
      const position = snapPosition(p, { ...p.position, x: p.position.x + (i % 20) / 10 }, data.placements, data.vehicle).position
      validatePlacement({ ...p, position }, data.placements, data.vehicle, true)
      if (i >= 100) times.push(performance.now() - start)
    }
    times.sort((a, b) => a - b)
    results.push({ count, medianMs: times[500], p95Ms: times[950], maxMs: times.at(-1) })
  }
  console.log('EDITOR_BENCHMARK', JSON.stringify(results))
})

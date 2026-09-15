import { expect, test } from 'vitest'
import { countLifoIssues, createLifoIndex, unloadSequence } from '@/features/viewer3d/operations/unloading'
import { benchmarkScene, sceneBox as box, seedScene } from '@/test/scene'

const ids = (items: readonly { id: string }[]) => items.map((p) => p.id)

test('unloading follows the result unloadingOrder when every placement carries one', () => {
  const items = [box('c', 0, 0, 0, { unloadingOrder: 3 }), box('a', 20, 0, 0, { unloadingOrder: 1 }), box('b', 40, 0, 0, { unloadingOrder: 2 })]
  const before = structuredClone(items)
  expect(unloadSequence(items)).toStrictEqual({ ordered: [items[1], items[2], items[0]], fromResult: true })
  expect(items).toStrictEqual(before)
})

test('a legacy plan without unloadingOrder falls back to a derived order: stop ascending, high first, then rearward', () => {
  const items = [box('stop2', 50, 0, 50, { stop: 2, unloadingOrder: 0 }), box('low', 50, 0, 0, { unloadingOrder: 0 }),
    box('front-high', 0, 0, 20, { unloadingOrder: 0 }), box('rear-high', 40, 0, 20, { unloadingOrder: 0 })]
  const { ordered, fromResult } = unloadSequence(items)
  expect(ids(ordered)).toStrictEqual(['rear-high', 'front-high', 'low', 'stop2'])
  expect(fromResult).toBe(false)
  // Một kiện thiếu thứ tự là cả phương án không có thứ tự dỡ của service
  expect(unloadSequence([box('a', 0, 0, 0, { unloadingOrder: 1 }), box('b', 20, 0, 0, { unloadingOrder: 0 })]).fromResult).toBe(false)
})

test('a later stop in the rear corridor covering the whole rear face blocks the target', () => {
  const target = box('target'), later = box('later', 20, 0, 0, { stop: 2 })
  expect(createLifoIndex([target, later]).blockage(target)).toStrictEqual({ code: 'LIFO_BLOCKED', coverage: 1, blockers: [later] })
})

test('half of the rear face covered by a later stop is only partial', () => {
  // mặt cắt đích y 0–10, z 0–10; kiện chắn y 5–15: phần giao 5 × 10 = 50 trên 100 cm²
  const target = box('target'), later = box('later', 20, 5, 0, { stop: 2 })
  expect(createLifoIndex([target, later]).blockage(target)).toStrictEqual({ code: 'LIFO_PARTIAL', coverage: 0.5, blockers: [later] })
})

test('same or earlier stops, boxes in front and boxes only touching the section never block', () => {
  const target = box('target', 10, 0, 0, { stop: 2 })
  const sameStop = box('same', 30, 0, 0, { stop: 2 }), earlier = box('earlier', 50, 0, 0, { stop: 1 })
  const front = box('front', 0, 0, 0, { stop: 3 }), above = box('above', 30, 0, 10, { stop: 3 }), side = box('side', 30, 10, 0, { stop: 3 })
  const index = createLifoIndex([target, sameStop, earlier, front, above, side])
  expect(index.blockage(target)).toBe(null)
  expect(ids(index.corridor(target)), 'the straight corridor still holds the same-stop and earlier-stop boxes').toStrictEqual(['same', 'earlier'])
})

test('blockers are sorted by distance from the target, and removed placements leave and re-enter the grid', () => {
  const target = box('target'), far = box('far', 40, 0, 0, { stop: 3 }), near = box('near', 20, 0, 0, { stop: 2 })
  const index = createLifoIndex([target, far, near])
  expect(ids(index.blockage(target)!.blockers)).toStrictEqual(['near', 'far'])
  expect(index.blockage(target, new Set(['near', 'far']))).toBe(null)
  expect(ids(index.blockage(target, new Set(['near']))!.blockers)).toStrictEqual(['far'])
  expect(ids(index.blockage(target)!.blockers)).toStrictEqual(['near', 'far'])
  expect(ids(index.corridor(target, new Set(['far'])))).toStrictEqual(['near'])
})

test('approval counts blocked and partial placements on the whole plan', () => {
  const plan = [box('a'), box('b', 20, 0, 0, { stop: 2 }), box('c', 0, 50), box('d', 20, 55, 0, { stop: 2 })]
  expect(countLifoIssues(plan)).toStrictEqual({ blocked: 1, partial: 1 })
  expect(countLifoIssues([])).toStrictEqual({ blocked: 0, partial: 0 })
})

test('the approved seed has no LIFO issue; the benchmark carries exactly one blocked package for the browser suite', async () => {
  expect(countLifoIssues((await seedScene()).placements)).toStrictEqual({ blocked: 0, partial: 0 })
  const bench = benchmarkScene(1000)
  expect(countLifoIssues(bench.placements)).toStrictEqual({ blocked: 1, partial: 0 })
  const { ordered, fromResult } = unloadSequence(bench.placements)
  expect(fromResult).toBe(true)
  // 250 kiện điểm 1 rồi 250 kiện điểm 2; kiện bị chắn là kiện điểm 2 dỡ cuối cùng
  expect(ordered.slice(0, 250).every((p) => p.stop === 1)).toBe(true)
  expect(ordered.slice(250, 500).every((p) => p.stop === 2)).toBe(true)
  const index = createLifoIndex(bench.placements)
  const removed = new Set(ordered.slice(0, 499).map((p) => p.id))
  expect(index.blockage(ordered[499]!, removed)?.code).toBe('LIFO_BLOCKED')
})

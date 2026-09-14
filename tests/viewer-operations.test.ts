import { expect, test } from 'vitest'
import { createBenchmarkPlan } from '@/features/viewer3d/benchmark.mock'
import { accessibilitySummary, cargoCenterOfMass, potentialBlockers, stopDistribution, stopOrderConsistent, suggestedUnloadOrder, timelineBins } from '@/features/viewer3d/operations/operations-model'
import { deriveSceneSemantics } from '@/features/viewer3d/operations/scene-semantics'
import { placementMeasurements } from '@/features/viewer3d/operations/placement-measurements'
import { createQualityPolicy, observeQuality, QUALITY_COOLDOWN_MS } from '@/features/viewer3d/quality-policy'
import type { Placement } from '@/types/load-plan'

const plan = createBenchmarkPlan(1000)
const box = (id: string, x = 0, y = 0, z = 0, extra: Partial<Placement> = {}): Placement => ({ ...plan.placements[0]!,
  id, lengthMm: 100, widthMm: 100, heightMm: 100, position: { x, y, z }, weightKg: 10, stop: 1, ...extra })

test('stop-order consistency never implies extraction accessibility', () => {
  const a = box('a', 0, 0, 0, { stop: 2, step: 1 }), b = box('b', 200, 0, 0, { stop: 2, step: 2 })
  expect(stopOrderConsistent([b, a])).toBe(true)
  expect(potentialBlockers(a, [a, b], plan.vehicle).map((p) => p.id)).toStrictEqual(['b'])
  expect(accessibilitySummary([a, b], plan.vehicle)).toBe(1)
  expect(stopOrderConsistent([a, { ...b, stop: 3 }])).toBe(false)
})

test('corridor points toward +X rear door, excludes touching side/top faces and previous stops when simulated removed', () => {
  const target = box('target', 100), front = box('front'), rear = box('rear', 200), side = box('side', 200, 100), above = box('above', 200, 0, 100)
  expect(potentialBlockers(target, [front, rear, side, above], plan.vehicle).map((p) => p.id)).toStrictEqual(['rear'])
  expect(potentialBlockers(box('door', 7100), [rear], plan.vehicle)).toStrictEqual([])
  const semantics = deriveSceneSemantics([target, rear], plan.vehicle, { kind: 'unloading', step: 0, currentId: target.id,
    unloadedIds: new Set([rear.id]), inspectId: target.id, focusStop: 1 })
  expect(semantics.blockers.length).toBe(0)
})

test('suggested unload order is stable, by ascending stop, high then rearward, without mutating placements', () => {
  const items = [box('stop2', 500, 0, 500, { stop: 2 }), box('low', 500), box('front-high', 0, 0, 200), box('rear-high', 400, 0, 200)]
  const before = structuredClone(items)
  expect(suggestedUnloadOrder(items).map((p) => p.id)).toStrictEqual(['rear-high', 'front-high', 'low', 'stop2'])
  expect(items).toStrictEqual(before)
})

test('cargo mass uses oriented box centers weighted by cargo mass, including empty/invalid-weight case', () => {
  const a = box('a'), b = box('b', 200, 100, 100, { weightKg: 30, lengthMm: 200 })
  expect(cargoCenterOfMass([a, b])).toStrictEqual({ position: { x: 237.5, y: 125, z: 125 }, weightKg: 40 })
  expect(cargoCenterOfMass([])).toBe(null)
  expect(cargoCenterOfMass([{ ...a, weightKg: 0 }, { ...b, weightKg: NaN }])).toBe(null)
})

test('stop distribution keeps mixed stops and clips exact volume into bins', () => {
  const bins = stopDistribution([box('a', 0), box('b', 0, 100, 0, { stop: 2 })], 200, 2)
  expect(bins[0]!.portions).toStrictEqual([{ stop: 1, ratio: 0.5 }, { stop: 2, ratio: 0.5 }])
  expect(bins[1]!.portions).toStrictEqual([])
  expect(stopDistribution([], 0).length).toBe(0)
})

test('loading semantic states, focus and isolation preserve placement identity and source geometry', () => {
  const a = box('a', 0, 0, 0, { step: 1, stop: 2 }), b = box('b', 200, 0, 0, { step: 2, stop: 1 }), c = box('c', 400, 0, 0, { step: 3 })
  const items = [a, b, c], before = structuredClone(items)
  const initial = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 1 })
  expect(initial.appearanceById.get('a')!.state).toBe('current')
  expect(initial.appearanceById.get('b')!.state).toBe('next')
  expect(initial.appearanceById.get('b')!.visibility).toBe('dim')
  expect(initial.appearanceById.get('c')!.visibility).toBe('hidden')
  const loaded = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 2 })
  expect(loaded.appearanceById.get('a')!.tone).toBe('muted')
  expect(loaded.massPlacements.length).toBe(2)
  const focus = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 1, focusStop: 2 })
  expect(focus.appearanceById.get('b')!.visibility).toBe('hidden')
  const isolate = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 2, isolateId: 'b' })
  expect([...isolate.appearanceById.values()].filter((p) => p.visibility !== 'hidden').length).toBe(1)
  expect(items).toStrictEqual(before)
})

test('unloading focus hides previous/delivered cargo, ghosts future stops and warns on potential blockers', () => {
  const target = box('target', 100, 0, 0, { stop: 2 }), blocker = box('blocker', 300, 0, 0, { stop: 3 }), past = box('past', 500)
  const view = deriveSceneSemantics([target, blocker, past], plan.vehicle, { kind: 'unloading', step: 0, focusStop: 2, currentId: target.id })
  expect(view.appearanceById.get('past')!.visibility).toBe('hidden')
  expect(view.appearanceById.get('blocker')!.visibility).toBe('dim')
  const inspected = deriveSceneSemantics([target, blocker, past], plan.vehicle, { kind: 'unloading', step: 0, focusStop: 2, currentId: target.id, inspectId: target.id })
  expect(inspected.appearanceById.get('blocker')!.tone).toBe('blocker')
  expect(inspected.blockers.map((p) => p.id)).toStrictEqual([blocker.id])
  expect(inspected.massPlacements.length).toBe(2)
})

test('timeline bins stay bounded and cover all 1,000 placements exactly once', () => {
  const bins = timelineBins(plan.placements)
  expect(bins.length <= 80).toBeTruthy()
  expect(bins[0]!.start).toBe(0)
  expect(bins.at(-1)!.end).toBe(1000)
  expect(bins.reduce((sum, bin) => sum + bin.end - bin.start, 0)).toBe(1000)
  expect(timelineBins([])).toStrictEqual([])
})

test('measurements use actual extents, not mock row spacing', () => {
  const p = box('a', 200, 300, 400)
  const m = placementMeasurements(p, [p], plan.vehicle)
  expect(m.frontMm).toBe(200); expect(m.leftMm).toBe(300); expect(m.floorMm).toBe(400)
  expect(m.rearMm).toBe(6900); expect(m.rightMm).toBe(1950); expect(m.ceilingMm).toBe(1900)
})

test('quality adaptation has consecutive samples, hysteresis, cooldown and ignores idle/sparse intervals', () => {
  let q = createQualityPolicy('high')
  for (let i = 0; i < 2; i++) q = observeQuality(q, { frameTimeMs: 40, idle: false }, i * 500)
  expect(q.tier).toBe('high')
  q = observeQuality(q, { frameTimeMs: 40, idle: false }, 1000)
  expect(q.tier).toBe('balanced')
  for (let i = 0; i < 10; i++) q = observeQuality(q, { frameTimeMs: 10, idle: false }, 2000 + i * 500)
  expect(q.tier, 'cooldown prevents an immediate upgrade').toBe('balanced')
  q = observeQuality(q, { frameTimeMs: null, idle: true }, 20_000)
  for (let i = 0; i < 7; i++) q = observeQuality(q, { frameTimeMs: 10, idle: false }, 21_000 + i * 500)
  expect(q.tier).toBe('balanced')
  q = observeQuality(q, { frameTimeMs: 10, idle: false }, 25_000)
  expect(q.tier).toBe('high')
  expect(QUALITY_COOLDOWN_MS >= 10_000).toBeTruthy()
})

test('measure operations derivation and approval heuristic at 1,000 placements', () => {
  const start = performance.now()
  for (let i = 0; i < 100; i++) deriveSceneSemantics(plan.placements, plan.vehicle, { kind: 'loading', step: i + 1 })
  const deriveMs = (performance.now() - start) / 100
  const approvalStart = performance.now()
  const potentiallyBlocked = accessibilitySummary(plan.placements, plan.vehicle)
  console.log('OPERATIONS_BENCHMARK', JSON.stringify({ count: 1000, deriveMeanMs: deriveMs,
    approvalMs: performance.now() - approvalStart, potentiallyBlocked }))
})

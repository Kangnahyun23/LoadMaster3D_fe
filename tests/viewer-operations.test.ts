import assert from 'node:assert/strict'
import test from 'node:test'
import { createBenchmarkPlan } from '../src/features/viewer3d/benchmark.mock.ts'
import { accessibilitySummary, cargoCenterOfMass, potentialBlockers, stopDistribution, stopOrderConsistent, suggestedUnloadOrder, timelineBins } from '../src/features/viewer3d/operations/operations-model.ts'
import { deriveSceneSemantics } from '../src/features/viewer3d/operations/scene-semantics.ts'
import { placementMeasurements } from '../src/features/viewer3d/operations/placement-measurements.ts'
import { createQualityPolicy, observeQuality, QUALITY_COOLDOWN_MS } from '../src/features/viewer3d/quality-policy.ts'
import type { Placement } from '../src/types/load-plan.ts'

const plan = createBenchmarkPlan(1000)
const box = (id: string, x = 0, y = 0, z = 0, extra: Partial<Placement> = {}): Placement => ({ ...plan.placements[0]!,
  id, lengthMm: 100, widthMm: 100, heightMm: 100, position: { x, y, z }, weightKg: 10, stop: 1, ...extra })

test('stop-order consistency never implies extraction accessibility', () => {
  const a = box('a', 0, 0, 0, { stop: 2, step: 1 }), b = box('b', 200, 0, 0, { stop: 2, step: 2 })
  assert.equal(stopOrderConsistent([b, a]), true)
  assert.deepEqual(potentialBlockers(a, [a, b], plan.vehicle).map((p) => p.id), ['b'])
  assert.equal(accessibilitySummary([a, b], plan.vehicle), 1)
  assert.equal(stopOrderConsistent([a, { ...b, stop: 3 }]), false)
})

test('corridor points toward +X rear door, excludes touching side/top faces and previous stops when simulated removed', () => {
  const target = box('target', 100), front = box('front'), rear = box('rear', 200), side = box('side', 200, 100), above = box('above', 200, 0, 100)
  assert.deepEqual(potentialBlockers(target, [front, rear, side, above], plan.vehicle).map((p) => p.id), ['rear'])
  assert.deepEqual(potentialBlockers(box('door', 7100), [rear], plan.vehicle), [])
  const semantics = deriveSceneSemantics([target, rear], plan.vehicle, { kind: 'unloading', step: 0, currentId: target.id,
    unloadedIds: new Set([rear.id]), inspectId: target.id, focusStop: 1 })
  assert.equal(semantics.blockers.length, 0)
})

test('suggested unload order is stable, by ascending stop, high then rearward, without mutating placements', () => {
  const items = [box('stop2', 500, 0, 500, { stop: 2 }), box('low', 500), box('front-high', 0, 0, 200), box('rear-high', 400, 0, 200)]
  const before = structuredClone(items)
  assert.deepEqual(suggestedUnloadOrder(items).map((p) => p.id), ['rear-high', 'front-high', 'low', 'stop2'])
  assert.deepEqual(items, before)
})

test('cargo mass uses oriented box centers weighted by cargo mass, including empty/invalid-weight case', () => {
  const a = box('a'), b = box('b', 200, 100, 100, { weightKg: 30, lengthMm: 200 })
  assert.deepEqual(cargoCenterOfMass([a, b]), { position: { x: 237.5, y: 125, z: 125 }, weightKg: 40 })
  assert.equal(cargoCenterOfMass([]), null)
  assert.equal(cargoCenterOfMass([{ ...a, weightKg: 0 }, { ...b, weightKg: NaN }]), null)
})

test('stop distribution keeps mixed stops and clips exact volume into bins', () => {
  const bins = stopDistribution([box('a', 0), box('b', 0, 100, 0, { stop: 2 })], 200, 2)
  assert.deepEqual(bins[0]!.portions, [{ stop: 1, ratio: 0.5 }, { stop: 2, ratio: 0.5 }])
  assert.deepEqual(bins[1]!.portions, [])
  assert.equal(stopDistribution([], 0).length, 0)
})

test('loading semantic states, focus and isolation preserve placement identity and source geometry', () => {
  const a = box('a', 0, 0, 0, { step: 1, stop: 2 }), b = box('b', 200, 0, 0, { step: 2, stop: 1 }), c = box('c', 400, 0, 0, { step: 3 })
  const items = [a, b, c], before = structuredClone(items)
  const initial = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 1 })
  assert.equal(initial.appearanceById.get('a')!.state, 'current')
  assert.equal(initial.appearanceById.get('b')!.state, 'next')
  assert.equal(initial.appearanceById.get('b')!.visibility, 'dim')
  assert.equal(initial.appearanceById.get('c')!.visibility, 'hidden')
  const loaded = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 2 })
  assert.equal(loaded.appearanceById.get('a')!.tone, 'muted')
  assert.equal(loaded.massPlacements.length, 2)
  const focus = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 1, focusStop: 2 })
  assert.equal(focus.appearanceById.get('b')!.visibility, 'hidden')
  const isolate = deriveSceneSemantics(items, plan.vehicle, { kind: 'loading', step: 2, isolateId: 'b' })
  assert.equal([...isolate.appearanceById.values()].filter((p) => p.visibility !== 'hidden').length, 1)
  assert.deepEqual(items, before)
})

test('unloading focus hides previous/delivered cargo, ghosts future stops and warns on potential blockers', () => {
  const target = box('target', 100, 0, 0, { stop: 2 }), blocker = box('blocker', 300, 0, 0, { stop: 3 }), past = box('past', 500)
  const view = deriveSceneSemantics([target, blocker, past], plan.vehicle, { kind: 'unloading', step: 0, focusStop: 2, currentId: target.id })
  assert.equal(view.appearanceById.get('past')!.visibility, 'hidden')
  assert.equal(view.appearanceById.get('blocker')!.visibility, 'dim')
  const inspected = deriveSceneSemantics([target, blocker, past], plan.vehicle, { kind: 'unloading', step: 0, focusStop: 2, currentId: target.id, inspectId: target.id })
  assert.equal(inspected.appearanceById.get('blocker')!.tone, 'blocker')
  assert.deepEqual(inspected.blockers.map((p) => p.id), [blocker.id])
  assert.equal(inspected.massPlacements.length, 2)
})

test('timeline bins stay bounded and cover all 1,000 placements exactly once', () => {
  const bins = timelineBins(plan.placements)
  assert.ok(bins.length <= 80)
  assert.equal(bins[0]!.start, 0)
  assert.equal(bins.at(-1)!.end, 1000)
  assert.equal(bins.reduce((sum, bin) => sum + bin.end - bin.start, 0), 1000)
  assert.deepEqual(timelineBins([]), [])
})

test('measurements use actual extents, not mock row spacing', () => {
  const p = box('a', 200, 300, 400)
  const m = placementMeasurements(p, [p], plan.vehicle)
  assert.equal(m.frontMm, 200); assert.equal(m.leftMm, 300); assert.equal(m.floorMm, 400)
  assert.equal(m.rearMm, 6900); assert.equal(m.rightMm, 1950); assert.equal(m.ceilingMm, 1900)
})

test('quality adaptation has consecutive samples, hysteresis, cooldown and ignores idle/sparse intervals', () => {
  let q = createQualityPolicy('high')
  for (let i = 0; i < 2; i++) q = observeQuality(q, { frameTimeMs: 40, idle: false }, i * 500)
  assert.equal(q.tier, 'high')
  q = observeQuality(q, { frameTimeMs: 40, idle: false }, 1000)
  assert.equal(q.tier, 'balanced')
  for (let i = 0; i < 10; i++) q = observeQuality(q, { frameTimeMs: 10, idle: false }, 2000 + i * 500)
  assert.equal(q.tier, 'balanced', 'cooldown prevents an immediate upgrade')
  q = observeQuality(q, { frameTimeMs: null, idle: true }, 20_000)
  for (let i = 0; i < 7; i++) q = observeQuality(q, { frameTimeMs: 10, idle: false }, 21_000 + i * 500)
  assert.equal(q.tier, 'balanced')
  q = observeQuality(q, { frameTimeMs: 10, idle: false }, 25_000)
  assert.equal(q.tier, 'high')
  assert.ok(QUALITY_COOLDOWN_MS >= 10_000)
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

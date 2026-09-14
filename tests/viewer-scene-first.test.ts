import assert from 'node:assert/strict'
import test from 'node:test'
import { createBenchmarkPlan } from '../src/features/viewer3d/benchmark.mock.ts'
import { interiorStopMap } from '../src/features/viewer3d/operations/stop-map.ts'
import { editorMeasurements, overlapRegions, snapFeedbackBoxes } from '../src/features/viewer3d/editor/spatial-feedback.ts'
import { snapPosition } from '../src/features/viewer3d/editor/snapping.ts'
import type { Placement } from '../src/types/load-plan.ts'

const plan = createBenchmarkPlan(1000), vehicle = plan.vehicle
const box = (id: string, x = 0, y = 0, z = 0): Placement => ({ ...plan.placements[0]!, id,
  lengthMm: 100, widthMm: 100, heightMm: 100, position: { x, y, z } })

test('stop map vertices stay inside the bay for every fixture and a narrow bay', () => {
  for (const count of [132, 300, 500, 1000] as const) {
    const p = createBenchmarkPlan(count)
    for (const v of [p.vehicle, { ...p.vehicle, innerWidthMm: 50 }]) {
      const map = interiorStopMap(p.placements, v)
      assert.ok(map.length > 0)
      for (const { vertices } of map) for (let i = 0; i < vertices.length; i += 3) {
        assert.ok(vertices[i]! >= 0 && vertices[i]! <= v.innerLengthMm)
        assert.ok(vertices[i + 1]! > 0 && vertices[i + 1]! < 10, 'map belongs to the floor, not an exterior truck stripe')
        assert.ok(vertices[i + 2]! > 0 && vertices[i + 2]! < v.innerWidthMm)
      }
    }
  }
  assert.deepEqual(interiorStopMap([], vehicle), [])
})

test('interleaved stops retain both actual contributions in the floor map', () => {
  const placements = [{ ...box('a'), stop: 1 }, { ...box('b', 0, 100), stop: 2 }]
  const parts = interiorStopMap(placements, vehicle)
  assert.deepEqual(new Set(parts.map((p) => p.stop)), new Set([1, 2]))
  assert.equal(parts[0]!.vertices[0], parts[1]!.vertices[0])
  assert.equal(parts[0]!.vertices[8], parts[1]!.vertices[2], 'mixed portions share a boundary without overlapping')
})

test('snap feedback identifies the actual neighbor face and bounded face geometry', () => {
  const p = box('a'), neighbor = box('b', 267)
  const snap = snapPosition(p, { x: 172, y: 0, z: 0 }, [neighbor], vehicle)
  const target = snap.targets.find((t) => t.axis === 'x')!
  assert.equal(target.placementId, 'b')
  assert.equal(target.coordinateMm, 267)
  const faces = snapFeedbackBoxes({ ...p, position: snap.position }, snap.targets, [neighbor])
  assert.ok(faces.length <= 3)
  assert.deepEqual(faces[0], { position: { x: 265, y: 0, z: 0 }, lengthMm: 4, widthMm: 100, heightMm: 100 })
})

test('overlap feedback renders the intersection, not the whole collided package', () => {
  const p = box('a'), q = box('b', 90, 20, 30)
  assert.deepEqual(overlapRegions(p, [q], ['b']), [{ position: { x: 90, y: 20, z: 30 }, lengthMm: 10, widthMm: 80, heightMm: 70 }])
  assert.equal(overlapRegions(p, [q], ['missing']).length, 0)
  assert.equal(overlapRegions(p, [q], Array(8).fill('b')).length, 4)
})

test('distance guides use the closest walls and highest actual supporting footprint', () => {
  const top = box('top', 7100, 2250, 300), below = box('below', 7100, 2250, 100)
  const unrelated = box('remote', 6000, 0, 190)
  const guides = editorMeasurements(top, [top, below, unrelated], vehicle)
  assert.deepEqual(guides.map((g) => [g.label, g.mm]), [['Cửa', 0], ['Vách phải', 0], ['Mặt đỡ', 100]])
  assert.equal(editorMeasurements(box('floor'), [], vehicle)[2]!.mm, 0)
})

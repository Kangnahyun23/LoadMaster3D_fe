import { expect, test } from 'vitest'
import { createBenchmarkPlan } from '@/features/viewer3d/benchmark.mock'
import { interiorStopMap } from '@/features/viewer3d/operations/stop-map'
import { editorMeasurements, overlapRegions, snapFeedbackBoxes } from '@/features/viewer3d/editor/spatial-feedback'
import { snapPosition } from '@/features/viewer3d/editor/snapping'
import type { Placement } from '@/types/load-plan'

const plan = createBenchmarkPlan(1000), vehicle = plan.vehicle
const box = (id: string, x = 0, y = 0, z = 0): Placement => ({ ...plan.placements[0]!, id,
  lengthMm: 100, widthMm: 100, heightMm: 100, position: { x, y, z } })

test('stop map vertices stay inside the bay for every fixture and a narrow bay', () => {
  for (const count of [132, 300, 500, 1000] as const) {
    const p = createBenchmarkPlan(count)
    for (const v of [p.vehicle, { ...p.vehicle, innerWidthMm: 50 }]) {
      const map = interiorStopMap(p.placements, v)
      expect(map.length > 0).toBeTruthy()
      for (const { vertices } of map) for (let i = 0; i < vertices.length; i += 3) {
        expect(vertices[i]! >= 0 && vertices[i]! <= v.innerLengthMm).toBeTruthy()
        expect(vertices[i + 1]! > 0 && vertices[i + 1]! < 10, 'map belongs to the floor, not an exterior truck stripe').toBeTruthy()
        expect(vertices[i + 2]! > 0 && vertices[i + 2]! < v.innerWidthMm).toBeTruthy()
      }
    }
  }
  expect(interiorStopMap([], vehicle)).toStrictEqual([])
})

test('interleaved stops retain both actual contributions in the floor map', () => {
  const placements = [{ ...box('a'), stop: 1 }, { ...box('b', 0, 100), stop: 2 }]
  const parts = interiorStopMap(placements, vehicle)
  expect(new Set(parts.map((p) => p.stop))).toStrictEqual(new Set([1, 2]))
  expect(parts[0]!.vertices[0]).toBe(parts[1]!.vertices[0])
  expect(parts[0]!.vertices[8], 'mixed portions share a boundary without overlapping').toBe(parts[1]!.vertices[2])
})

test('snap feedback identifies the actual neighbor face and bounded face geometry', () => {
  const p = box('a'), neighbor = box('b', 267)
  const snap = snapPosition(p, { x: 172, y: 0, z: 0 }, [neighbor], vehicle)
  const target = snap.targets.find((t) => t.axis === 'x')!
  expect(target.placementId).toBe('b')
  expect(target.coordinateMm).toBe(267)
  const faces = snapFeedbackBoxes({ ...p, position: snap.position }, snap.targets, [neighbor])
  expect(faces.length <= 3).toBeTruthy()
  expect(faces[0]).toStrictEqual({ position: { x: 265, y: 0, z: 0 }, lengthMm: 4, widthMm: 100, heightMm: 100 })
})

test('overlap feedback renders the intersection, not the whole collided package', () => {
  const p = box('a'), q = box('b', 90, 20, 30)
  expect(overlapRegions(p, [q], ['b'])).toStrictEqual([{ position: { x: 90, y: 20, z: 30 }, lengthMm: 10, widthMm: 80, heightMm: 70 }])
  expect(overlapRegions(p, [q], ['missing']).length).toBe(0)
  expect(overlapRegions(p, [q], Array(8).fill('b')).length).toBe(4)
})

test('distance guides use the closest walls and highest actual supporting footprint', () => {
  const top = box('top', 7100, 2250, 300), below = box('below', 7100, 2250, 100)
  const unrelated = box('remote', 6000, 0, 190)
  const guides = editorMeasurements(top, [top, below, unrelated], vehicle)
  expect(guides.map((g) => [g.label, g.mm])).toStrictEqual([['Cửa', 0], ['Vách phải', 0], ['Mặt đỡ', 100]])
  expect(editorMeasurements(box('floor'), [], vehicle)[2]!.mm).toBe(0)
})

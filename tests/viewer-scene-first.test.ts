import { expect, test } from 'vitest'
import { interiorStopMap } from '@/features/viewer3d/operations/stop-map'
import { editorMeasurements, overlapRegions, snapFeedbackBoxes } from '@/features/viewer3d/editor/spatial-feedback'
import { snapPosition } from '@/features/viewer3d/editor/snapping'
import { containerSize } from '@/features/viewer3d/scene/units'
import { benchmarkScene, sceneBox as box } from '@/test/scene'

const vehicle = benchmarkScene(1000).vehicle

test('a 600 × 240 × 250 cm cargo space becomes 6 × 2.5 × 2.4 scene units (length × height × width)', () => {
  expect(containerSize({ innerLengthCm: 600, innerWidthCm: 240, innerHeightCm: 250 })).toStrictEqual({ length: 6, height: 2.5, width: 2.4 })
})

test('stop map vertices stay inside the bay for every fixture and a narrow bay', () => {
  for (const count of [132, 300, 500, 1000] as const) {
    const p = benchmarkScene(count)
    for (const v of [p.vehicle, { ...p.vehicle, innerWidthCm: 5 }]) {
      const map = interiorStopMap(p.placements, v)
      expect(map.length > 0).toBeTruthy()
      for (const { vertices } of map) for (let i = 0; i < vertices.length; i += 3) {
        expect(vertices[i]! >= 0 && vertices[i]! <= v.innerLengthCm).toBeTruthy()
        expect(vertices[i + 1]! > 0 && vertices[i + 1]! < 1, 'map belongs to the floor, not an exterior truck stripe').toBeTruthy()
        expect(vertices[i + 2]! > 0 && vertices[i + 2]! < v.innerWidthCm).toBeTruthy()
      }
    }
  }
  expect(interiorStopMap([], vehicle)).toStrictEqual([])
})

test('interleaved stops retain both actual contributions in the floor map', () => {
  const placements = [{ ...box('a'), stop: 1 }, { ...box('b', 0, 10), stop: 2 }]
  const parts = interiorStopMap(placements, vehicle)
  expect(new Set(parts.map((p) => p.stop))).toStrictEqual(new Set([1, 2]))
  expect(parts[0]!.vertices[0]).toBe(parts[1]!.vertices[0])
  expect(parts[0]!.vertices[8], 'mixed portions share a boundary without overlapping').toBe(parts[1]!.vertices[2])
})

test('snap feedback identifies the actual neighbor face and bounded face geometry', () => {
  const p = box('a'), neighbor = box('b', 26.7)
  const snap = snapPosition(p, { x: 17.2, y: 0, z: 0 }, [neighbor], vehicle)
  const target = snap.targets.find((t) => t.axis === 'x')!
  expect(target.placementId).toBe('b')
  expect(target.coordinateCm).toBe(26.7)
  const faces = snapFeedbackBoxes({ ...p, position: snap.position }, snap.targets, [neighbor])
  expect(faces.length <= 3).toBeTruthy()
  expect(faces[0]).toStrictEqual({ position: { x: 26.5, y: 0, z: 0 }, lengthCm: 0.4, widthCm: 10, heightCm: 10 })
})

test('overlap feedback renders the intersection, not the whole collided package', () => {
  const p = box('a'), q = box('b', 9, 2, 3)
  expect(overlapRegions(p, [q], ['b'])).toStrictEqual([{ position: { x: 9, y: 2, z: 3 }, lengthCm: 1, widthCm: 8, heightCm: 7 }])
  expect(overlapRegions(p, [q], ['missing']).length).toBe(0)
  expect(overlapRegions(p, [q], Array(8).fill('b')).length).toBe(4)
})

test('distance guides use the closest walls and highest actual supporting footprint', () => {
  const top = box('top', 710, 225, 30), below = box('below', 710, 225, 10)
  const unrelated = box('remote', 600, 0, 19)
  const guides = editorMeasurements(top, [top, below, unrelated], vehicle)
  expect(guides.map((g) => [g.label, g.cm])).toStrictEqual([['Cửa', 0], ['Vách phải', 0], ['Mặt đỡ', 10]])
  expect(editorMeasurements(box('floor'), [], vehicle)[2]!.cm).toBe(0)
})

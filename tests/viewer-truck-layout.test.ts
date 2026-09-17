import { expect, test } from 'vitest'
import { truckLayout } from '@/features/viewer3d/scene/truck-layout'

const L = 7.2, W = 2.35

test('without configured axles the truck gets a steer axle under the cab and a dual-wheel tandem at the rear', () => {
  const layout = truckLayout(L, W)
  expect(layout.axles.map(({ kind, dual }) => ({ kind, dual }))).toStrictEqual([
    { kind: 'steer', dual: false },
    { kind: 'drive', dual: true },
    { kind: 'drive', dual: true },
  ])
  // Vị trí minh hoạ giữ như bản trước: cầu trước dưới cabin, cầu sau ở 72% chiều dài thùng, cách nhau 1,15 m
  expect(layout.axles[0]!.x).toBe(-1)
  expect(layout.axles[1]!.x).toBeCloseTo(5.184, 6)
  expect(layout.axles[2]!.x).toBeCloseTo(6.334, 6)
  // 2 bánh trước + 4 bánh mỗi trục sau
  expect(layout.wheels).toHaveLength(10)
})

test('configured axles place wheels at positionXCm from the front wall; the first is the steer axle', () => {
  const layout = truckLayout(L, W, [
    { id: 'A2', name: 'Trục sau', positionXCm: 480, emptyLoadKg: 0, maxLoadKg: 0 },
    { id: 'A1', name: 'Trục trước', positionXCm: -120, emptyLoadKg: 0, maxLoadKg: 0 },
  ])
  expect(layout.axles.map(({ x, kind, dual }) => ({ x, kind, dual }))).toStrictEqual([
    { x: -1.2, kind: 'steer', dual: false },
    { x: 4.8, kind: 'drive', dual: true },
  ])
  expect(layout.wheels).toHaveLength(6)
})

test('dual wheels sit inside the body width, outer wheel flush with the side and inner wheel next to it', () => {
  const rear = truckLayout(L, W).wheels.filter((wheel) => wheel.x > 6)
  const zs = rear.map((wheel) => wheel.z).sort((a, b) => a - b)
  expect(zs[0]).toBeGreaterThan(0)
  expect(zs[3]).toBeLessThan(W)
  expect(zs[1]! - zs[0]!).toBeCloseTo(0.32, 6)
})

test('the frame runs from the front bumper to just past the rear door and the driveshaft reaches every drive axle', () => {
  const layout = truckLayout(L, W)
  expect(layout.frame.fromX).toBeLessThan(-1.75)
  expect(layout.frame.toX).toBeGreaterThan(L)
  expect(layout.driveshaft.map((segment) => segment.toX)).toStrictEqual(layout.axles.filter((a) => a.kind === 'drive').map((a) => a.x))
})

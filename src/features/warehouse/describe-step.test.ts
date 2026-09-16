import { expect, test } from 'vitest'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { VehicleObstacle } from '@/domain/models'
import { sceneBox } from '@/test/scene'
import { measureStep, nearestObstacle, orientationHint, stepNote } from './describe-step'

/** Lòng thùng Truck 6m của Spec: 600 × 240 × 250 cm, hốc bánh xe OBS-001 ở x 0–120, y 0–30, z 0–45. */
const TRUCK = SPEC_TRUCK_6M

test('kiện trên sàn: lớp 1, không có kiện dưới, khoảng cách tới vách và cửa theo cm', () => {
  const box = sceneBox('PKG-A', 100.4, 30.2, 0, { lengthCm: 120.7, widthCm: 60.1, heightCm: 45 })
  // 600 − 100,4 − 120,7 = 378,9 và 240 − 30,2 − 60,1 = 149,7 (máy tính ra 378,90000000000003 và 149,70000000000002)
  expect(measureStep(box, [box], TRUCK)).toStrictEqual({
    layer: 1, belowId: undefined, frontCm: 100.4, rearCm: 378.9, leftCm: 30.2, rightCm: 149.7, floorCm: 0,
  })
})

test('kiện chồng: lớp đếm theo kiện đỡ phía dưới, kiện dưới gần nhất là kiện cao nhất ngay dưới đáy', () => {
  const floor = sceneBox('PKG-SAN', 200, 0, 0, { heightCm: 45.3 })
  const middle = sceneBox('PKG-GIUA', 200, 0, 45.3, { heightCm: 45.1 })
  // 45,3 + 45,1 = 90,4
  const top = sceneBox('PKG-TREN', 205, 5, 90.4)
  const all = [top, floor, middle]
  expect(measureStep(top, all, TRUCK)).toMatchObject({ layer: 3, belowId: 'PKG-GIUA', floorCm: 90.4 })
  expect(measureStep(middle, all, TRUCK)).toMatchObject({ layer: 2, belowId: 'PKG-SAN' })
})

test('kiện chỉ chạm cạnh bên không tính là kiện phía dưới', () => {
  const left = sceneBox('PKG-TRAI', 200, 0, 0)
  const raised = sceneBox('PKG-PHAI', 210, 0, 10)
  expect(measureStep(raised, [left, raised], TRUCK)).toMatchObject({ layer: 1, belowId: undefined })
})

test('vật cản gần nhất: kiện chạm hốc bánh xe có khe 0 cm', () => {
  const box = sceneBox('PKG-A', 120, 0, 0, { lengthCm: 120, widthCm: 60, heightCm: 45 })
  expect(nearestObstacle(box, TRUCK.obstacles)).toStrictEqual({ obstacle: TRUCK.obstacles[0], gapCm: 0 })
})

test('vật cản gần nhất: chọn vật gần hơn trong ngưỡng, bỏ vật ở xa', () => {
  const cooling: VehicleObstacle = {
    id: 'OBS-002', type: 'COOLING_UNIT', xCm: 0, yCm: 170, zCm: 200, lengthCm: 40, widthCm: 60, heightCm: 50, loadBearing: false,
  }
  const obstacles = [...TRUCK.obstacles, cooling]
  // Cách hốc bánh xe 3 cm theo x và 4 cm theo z: khe hypot(3, 4) = 5 cm
  const nearArch = sceneBox('PKG-B', 123, 0, 49)
  expect(nearestObstacle(nearArch, obstacles)).toStrictEqual({ obstacle: TRUCK.obstacles[0], gapCm: 5 })
  // Kiện y 158–168, dàn lạnh từ y 170: khe 2 cm; hốc bánh xe ở xa (y 0–30, z 0–45)
  const nearCooling = sceneBox('PKG-C', 0, 170 - 2 - 10, 200)
  expect(nearestObstacle(nearCooling, obstacles)).toStrictEqual({ obstacle: cooling, gapCm: 2 })
  expect(nearestObstacle(sceneBox('PKG-D', 400, 100, 0), obstacles)).toBeUndefined()
})

test('ghi chú bước: dễ vỡ, kiện dưới dễ vỡ, nặng, không đứng thẳng, mặc định', () => {
  const below = sceneBox('PKG-DUOI', 0, 0, 0, { fragile: true })
  expect(stepNote(sceneBox('PKG-1', 50, 0, 0, { fragile: true }), [])).toStrictEqual({ tone: 'warning', code: 'fragile' })
  const onFragile = sceneBox('PKG-2', 0, 0, 10)
  expect(stepNote(onFragile, [below, onFragile])).toStrictEqual({ tone: 'warning', code: 'fragileBelow' })
  expect(stepNote(sceneBox('PKG-3', 50, 0, 0, { weightKg: 50 }), [])).toStrictEqual({ tone: 'neutral', code: 'heavy' })
  expect(stepNote(sceneBox('PKG-4', 50, 0, 0, { orientation: 'HLW' }), [])).toStrictEqual({ tone: 'neutral', code: 'notUpright' })
  expect(stepNote(sceneBox('PKG-5', 50, 0, 0, { weightKg: 49.99 }), [])).toStrictEqual({ tone: 'neutral', code: 'default' })
})

test('hướng đặt: trục thùng chứa cạnh cao danh nghĩa của kiện theo 6 mã Spec', () => {
  expect(orientationHint('LWH')).toStrictEqual({ upright: true, heightAxis: 'z' })
  expect(orientationHint('WLH')).toStrictEqual({ upright: true, heightAxis: 'z' })
  expect(orientationHint('LHW')).toStrictEqual({ upright: false, heightAxis: 'y' })
  expect(orientationHint('WHL')).toStrictEqual({ upright: false, heightAxis: 'y' })
  expect(orientationHint('HLW')).toStrictEqual({ upright: false, heightAxis: 'x' })
  expect(orientationHint('HWL')).toStrictEqual({ upright: false, heightAxis: 'x' })
})

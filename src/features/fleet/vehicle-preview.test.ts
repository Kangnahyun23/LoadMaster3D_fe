import { describe, expect, test } from 'vitest'
import { EMPTY_PREVIEW, nextPreview, previewVehicle } from './vehicle-preview'

/** Giá trị form của xe Hyundai HD210 trong seed: thùng 720 × 235 × 240 cm, hai hốc bánh ở x = 420, dài 110 cm. */
function hd210(overrides: Record<string, unknown> = {}) {
  return {
    id: 'VEHICLE-002',
    name: '',
    innerLengthCm: 720,
    innerWidthCm: 235,
    innerHeightCm: 240,
    maxPayloadKg: Number.NaN,
    doorWidthCm: 225,
    doorHeightCm: 230,
    clearanceCm: 0,
    obstacles: [
      { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 420, yCm: 0, zCm: 0, lengthCm: 110, widthCm: 25, heightCm: 32, loadBearing: false, maxTopLoadKg: null },
      { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 420, yCm: 210, zCm: 0, lengthCm: 110, widthCm: 25, heightCm: 32, loadBearing: false, maxTopLoadKg: null },
    ],
    axles: [],
    ...overrides,
  }
}

describe('previewVehicle', () => {
  test('keeps the geometry and ignores fields the preview does not draw', () => {
    // Tên trống và tải trọng chưa nhập (NaN) không chặn hình
    const vehicle = previewVehicle(hd210())
    expect(vehicle?.innerLengthCm).toBe(720)
    expect(vehicle?.obstacles.map((o) => o.id)).toEqual(['OBS-001', 'OBS-002'])
  })

  test('an empty number field is not a picture', () => {
    expect(previewVehicle(hd210({ innerLengthCm: Number.NaN }))).toBeNull()
  })

  test('typing 600 into the length: 6 and 60 leave the wheel arches (ending at 530 cm) outside, 600 fits', () => {
    expect(previewVehicle(hd210({ innerLengthCm: 6 }))).toBeNull()
    expect(previewVehicle(hd210({ innerLengthCm: 60 }))).toBeNull()
    expect(previewVehicle(hd210({ innerLengthCm: 600 }))?.innerLengthCm).toBe(600)
  })

  test('a door wider than the cargo space is not a picture', () => {
    expect(previewVehicle(hd210({ doorWidthCm: 250 }))).toBeNull()
  })
})

describe('nextPreview', () => {
  const start = nextPreview(EMPTY_PREVIEW, previewVehicle(hd210()))

  test('an invalid value keeps the last valid picture and marks it pending', () => {
    const next = nextPreview(start, null)
    expect(next.vehicle).toBe(start.vehicle)
    expect(next.frame).toBe(start.frame)
    expect(next.pending).toBe(true)
  })

  test('the same geometry returns the same state object', () => {
    expect(nextPreview(start, previewVehicle(hd210({ name: 'Xe mới' })))).toBe(start)
  })

  test('moving an obstacle changes the picture but not the camera frame', () => {
    const moved = hd210()
    moved.obstacles[0]!.xCm = 300
    const next = nextPreview(nextPreview(start, null), previewVehicle(moved))
    expect(next.vehicle).not.toBe(start.vehicle)
    expect(next.vehicle?.obstacles[0]?.xCm).toBe(300)
    expect(next.frame).toBe(start.frame)
    expect(next.pending).toBe(false)
  })

  test('a new cargo length re-frames the camera', () => {
    const next = nextPreview(start, previewVehicle(hd210({ innerLengthCm: 600 })))
    expect(next.frame).not.toBe(start.frame)
    expect(next.frame?.innerLengthCm).toBe(600)
  })

  test('a door change within the same cargo space keeps the frame', () => {
    const next = nextPreview(start, previewVehicle(hd210({ doorWidthCm: 200 })))
    expect(next.vehicle?.doorWidthCm).toBe(200)
    expect(next.frame).toBe(start.frame)
  })
})

import { expect, test } from 'vitest'
import type { PackagePlacement } from '@/domain/models'
import { adaptResult } from '@/features/viewer3d/scene-input'
import type { Revision, Trip } from '@/lib/mock-db'
import { twoCartonRequest, twoCartonResult, twoCartonTrip } from '@/test/mock-db-samples'
import { pickDriverPlan, stopDeliveries } from './driver-plan'

function trip(id: string): Trip {
  return { ...twoCartonTrip(), id, inputVersion: 1 }
}

function revision(id: string, tripId: string, approvedAt?: string): Revision {
  return {
    id, jobId: `JOB-${id}`, tripId, request: twoCartonRequest(), result: twoCartonResult(), inputVersion: 1,
    createdAt: '2026-09-14T01:00:00.000Z', manuallyEdited: false, ordersRecomputed: approvedAt !== undefined,
    ...(approvedAt ? { approvedAt } : {}),
  }
}

test('không chỉ định chuyến: lấy chuyến đầu tiên theo thứ tự kho có revision đã duyệt, bản duyệt mới nhất', () => {
  const plans = [
    { trip: trip('TRIP-A'), revisions: [revision('REV-001', 'TRIP-A')] },
    { trip: trip('TRIP-B'), revisions: [revision('REV-002', 'TRIP-B', '2026-09-14T02:00:00.000Z'), revision('REV-003', 'TRIP-B', '2026-09-14T03:00:00.000Z'), revision('REV-004', 'TRIP-B')] },
    { trip: trip('TRIP-C'), revisions: [revision('REV-005', 'TRIP-C', '2026-09-14T04:00:00.000Z')] },
  ]
  const picked = pickDriverPlan(plans)
  expect(picked?.trip.id).toBe('TRIP-B')
  expect(picked?.revision.id).toBe('REV-003')
})

test('?chuyen chỉ định chuyến: chỉ đúng chuyến đó, không rơi sang chuyến khác', () => {
  const plans = [
    { trip: trip('TRIP-A'), revisions: [revision('REV-001', 'TRIP-A', '2026-09-14T02:00:00.000Z')] },
    { trip: trip('TRIP-B'), revisions: [revision('REV-002', 'TRIP-B')] },
  ]
  expect(pickDriverPlan(plans, 'TRIP-A')?.revision.id).toBe('REV-001')
  expect(pickDriverPlan(plans, 'TRIP-B')).toBeUndefined()
  expect(pickDriverPlan(plans, 'TRIP-X')).toBeUndefined()
  expect(pickDriverPlan([])).toBeUndefined()
})

test('điểm giao lấy tên, địa chỉ từ chuyến (số = vị trí + 1); kiện của điểm theo unloadingOrder của kết quả', () => {
  const result = twoCartonResult()
  // Ba kiện điểm 1 với unloadingOrder không trùng thứ tự placement lẫn thứ tự mã
  const extra = (id: string, xCm: number, zCm: number, unloadingOrder: number): PackagePlacement =>
    ({ ...result.placements[1]!, packageInstanceId: id, xCm, zCm, unloadingOrder })
  const request = twoCartonRequest()
  request.packages = [request.packages[0]!, { ...request.packages[1]!, quantity: 3 }]
  result.placements = [
    result.placements[0]!,
    extra('PKG-002-01', 240, 0, 3),
    extra('PKG-002-02', 480, 0, 1),
    extra('PKG-002-03', 240, 200, 2),
  ]
  const source = twoCartonTrip()
  const model = adaptResult({ trip: { id: 'TRIP-001', stops: source.stops }, revision: { request, result, ordersRecomputed: true } })

  const stops = stopDeliveries(source.stops, model)

  expect(stops.map(({ number, name, address }) => ({ number, name, address }))).toStrictEqual(
    source.stops.map(({ name, address }, index) => ({ number: index + 1, name, address })),
  )
  expect(stops[0]!.items.map((item) => [item.id, item.unloadingOrder])).toStrictEqual([
    ['PKG-002-02', 1], ['PKG-002-03', 2], ['PKG-002-01', 3],
  ])
  expect(stops[1]!.items).toStrictEqual([])
  expect(stops[2]!.items.map((item) => item.id)).toStrictEqual(['PKG-001-01'])
  // Carton A 120 × 60 × 45 cm, 30 kg; thùng 600 × 250 cm: tâm x 540 gần cửa, 300 giữa, 180 sát vách trước
  expect(stops[0]!.items.map(({ area, layer }) => [area, layer])).toStrictEqual([['door', 'floor'], ['middle', 'upper'], ['middle', 'floor']])
  expect(stops[2]!.items[0]).toMatchObject({ packageId: 'PKG-001', name: 'Carton A', weightKg: 30, area: 'front', layer: 'floor' })
})

test('lớp: trên sàn, lớp dưới khi tâm thấp hơn nửa chiều cao thùng, còn lại lớp trên', () => {
  const request = twoCartonRequest()
  const result = twoCartonResult()
  result.placements = [{ ...result.placements[0]!, zCm: 45 }, { ...result.placements[1]!, zCm: 102.5 }]
  const source = twoCartonTrip()
  const model = adaptResult({ trip: { id: 'TRIP-001', stops: source.stops }, revision: { request, result, ordersRecomputed: true } })
  const stops = stopDeliveries(source.stops, model)
  // Tâm z: 45 + 22,5 = 67,5 < 125 → lớp dưới; 102,5 + 22,5 = 125 = nửa chiều cao → lớp trên
  expect(stops[2]!.items[0]!.layer).toBe('lower')
  expect(stops[0]!.items[0]!.layer).toBe('upper')
})

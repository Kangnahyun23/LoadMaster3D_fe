import { expect, test } from 'vitest'
import type { DeliveryIssue, DeliveryProgress, LoadingProgress, TripPhase } from '@/lib/mock-db'
import { deliveryMode, deliverySummary, deliveryView, withUnload } from './delivery-progress'
import type { DeliveryItem, StopDelivery } from './driver-plan'

const item = (id: string, unloadingOrder: number): DeliveryItem => ({
  id, packageId: id.slice(0, 7), name: 'Thùng nước suối', weightKg: 12, unloadingOrder, area: 'door', layer: 'floor',
})
/** Điểm 1: ba kiện; điểm 2: hai kiện; điểm 3: không kiện nào. */
const stops: StopDelivery[] = [
  { number: 1, name: 'Bách Hoá Xanh Thủ Đức', address: '96 Võ Văn Ngân', phone: '0938 552 109', items: [item('PKG-001-01', 1), item('PKG-001-02', 2), item('PKG-001-03', 3)] },
  { number: 2, name: 'Mega Market An Phú', address: '1 Mai Chí Thọ', items: [item('PKG-002-01', 4), item('PKG-002-02', 5)] },
  { number: 3, name: 'Circle K Phú Nhuận', address: '10 Phan Xích Long', items: [] },
]
const loading = (missing: string[] = []): LoadingProgress => ({
  revisionId: 'REV-001', startedAt: '2026-09-14T00:00:00.000Z', startedBy: null, completedAt: '2026-09-14T00:30:00.000Z',
  steps: missing.map((packageInstanceId) => ({ packageInstanceId, outcome: 'missing' as const, at: '2026-09-14T00:10:00.000Z' })),
})
const issue = (stopNumber: number, packageInstanceId: string, kind: DeliveryIssue['kind'], id = 'ISS-001'): DeliveryIssue => ({
  id, stopNumber, packageInstanceId, kind, note: 'Khách đổi đơn', at: '2026-09-14T02:00:00.000Z', reportedBy: 'US-0004',
})
const delivery = (overrides: Partial<DeliveryProgress> = {}): DeliveryProgress => ({
  startedAt: '2026-09-14T01:00:00.000Z', startedBy: 'US-0004',
  stops: [{ number: 1, unloadedIds: [] }, { number: 2, unloadedIds: [] }, { number: 3, unloadedIds: [] }], issues: [], ...overrides,
})
const trip = (phase: TripPhase, progress?: DeliveryProgress, missing: string[] = []) => ({
  phase, loading: loading(missing), ...(progress ? { delivery: progress } : {}),
})

test('mode follows the trip phase: only a delivering trip records unloading', () => {
  const modes = (['planning', 'loading', 'loaded', 'delivering'] as const).map(deliveryMode)
  expect(modes).toStrictEqual(['preview', 'preview', 'ready', 'delivering'])
})

test('before delivery: stop 1 in unloading order, packages missing at the warehouse are not on the list', () => {
  const view = deliveryView(trip('loaded', undefined, ['PKG-001-02']), stops)
  expect(view?.mode).toBe('ready')
  expect(view?.stop.number).toBe(1)
  expect(view?.items.map((entry) => entry.item.id)).toStrictEqual(['PKG-001-01', 'PKG-001-03'])
  expect(view?.missingAtWarehouse).toStrictEqual(['PKG-001-02'])
  expect([view?.unloadedCount, view?.issueCount, view?.remaining, view?.completedStops.size]).toStrictEqual([0, 0, 2, 0])
})

test('delivering: the first stop not completed is current; an issue counts as handled, like an unloaded package', () => {
  const progress = delivery({
    stops: [{ number: 1, unloadedIds: ['PKG-001-01', 'PKG-001-02', 'PKG-001-03'], completedAt: '2026-09-14T02:10:00.000Z' }, { number: 2, unloadedIds: ['PKG-002-02'] }, { number: 3, unloadedIds: [] }],
    issues: [issue(1, 'PKG-001-02', 'damaged'), issue(2, 'PKG-002-01', 'damaged', 'ISS-002'), issue(2, 'PKG-002-01', 'refused', 'ISS-003')],
  })
  const view = deliveryView(trip('delivering', progress), stops)
  expect(view?.stop.number).toBe(2)
  expect(view?.items.map((entry) => [entry.item.id, entry.unloaded, entry.issue?.id])).toStrictEqual([
    ['PKG-002-01', false, 'ISS-003'],
    ['PKG-002-02', true, undefined],
  ])
  expect([view?.unloadedCount, view?.issueCount, view?.remaining]).toStrictEqual([1, 1, 0])
  expect([...(view?.completedStops ?? [])]).toStrictEqual([1])
})

test('a stop without packages on the vehicle is current with nothing to unload', () => {
  const progress = delivery({ stops: [{ number: 1, unloadedIds: [], completedAt: 'x' }, { number: 2, unloadedIds: [], completedAt: 'y' }, { number: 3, unloadedIds: [] }] })
  const view = deliveryView(trip('delivering', progress), stops)
  expect([view?.stop.number, view?.items.length, view?.remaining]).toStrictEqual([3, 0, 0])
})

test('marking and unmarking a package only touches that stop; a trip not delivering is returned as is', () => {
  const started = trip('delivering', delivery())
  const marked = withUnload(started, 2, 'PKG-002-01', true)
  expect(marked.delivery?.stops.map((stop) => stop.unloadedIds)).toStrictEqual([[], ['PKG-002-01'], []])
  expect(withUnload(withUnload(marked, 2, 'PKG-002-01', true), 2, 'PKG-002-01', false).delivery?.stops[1]?.unloadedIds).toStrictEqual([])
  const loaded = trip('loaded')
  expect(withUnload(loaded, 1, 'PKG-001-01', true)).toBe(loaded)
})

test('summary: stops of the trip, packages unloaded at every stop, all issues and the delivery times', () => {
  const progress = delivery({
    completedAt: '2026-09-14T04:00:00.000Z',
    stops: [{ number: 1, unloadedIds: ['PKG-001-01', 'PKG-001-03'], completedAt: 'a' }, { number: 2, unloadedIds: ['PKG-002-01', 'PKG-002-02'], completedAt: 'b' }, { number: 3, unloadedIds: [], completedAt: 'c' }],
    issues: [issue(1, 'PKG-001-02', 'refused')],
  })
  const tripStops = stops.map(({ number, name, address }) => ({ id: `STOP-0${number}`, name, address }))
  expect(deliverySummary({ stops: tripStops, delivery: progress })).toStrictEqual({
    stopCount: 3, delivered: 4, issues: [issue(1, 'PKG-001-02', 'refused')], startedAt: '2026-09-14T01:00:00.000Z', completedAt: '2026-09-14T04:00:00.000Z',
  })
})

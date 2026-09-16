import { expect, test } from 'vitest'
import { selectWarehousePlan } from './select-plan'

/** Chỉ các trường việc chọn đọc; thứ tự mảng là thứ tự tạo của kho (cũ trước). */
const trip = (id: string, inputVersion = 1) => ({ id, inputVersion })
const revision = (id: string, approved: boolean, inputVersion = 1) => ({
  id,
  inputVersion,
  ...(approved ? { approvedAt: '2026-09-16T01:00:00.000Z' } : {}),
})

test('không chỉ định chuyến: lấy chuyến đầu tiên theo thứ tự kho có bản đã duyệt', () => {
  const plan = selectWarehousePlan([
    { trip: trip('TRIP-A'), revisions: [revision('REV-001', false)] },
    { trip: trip('TRIP-B'), revisions: [revision('REV-002', true)] },
    { trip: trip('TRIP-C'), revisions: [revision('REV-003', true)] },
  ])
  expect(plan?.trip.id).toBe('TRIP-B')
  expect(plan?.revision.id).toBe('REV-002')
})

test('lấy bản đã duyệt mới nhất, bỏ qua bản chưa duyệt mới hơn', () => {
  const plan = selectWarehousePlan([
    { trip: trip('TRIP-A'), revisions: [revision('REV-001', true), revision('REV-002', true), revision('REV-003', false)] },
  ])
  expect(plan?.revision.id).toBe('REV-002')
})

test('chỉ định chuyến: đọc đúng chuyến đó, không lấy chuyến khác thay khi nó chưa có bản duyệt', () => {
  const entries = [
    { trip: trip('TRIP-A'), revisions: [revision('REV-001', true)] },
    { trip: trip('TRIP-B'), revisions: [revision('REV-002', true)] },
    { trip: trip('TRIP-C'), revisions: [revision('REV-003', false)] },
  ]
  expect(selectWarehousePlan(entries, 'TRIP-B')?.revision.id).toBe('REV-002')
  expect(selectWarehousePlan(entries, 'TRIP-C')).toBeNull()
  expect(selectWarehousePlan(entries, 'TRIP-KHONG-CO')).toBeNull()
})

test('không chuyến nào có bản duyệt → null', () => {
  expect(selectWarehousePlan([{ trip: trip('TRIP-A'), revisions: [revision('REV-001', false)] }])).toBeNull()
  expect(selectWarehousePlan([])).toBeNull()
})

test('bản duyệt lỗi thời vẫn trả về, gắn cờ stale', () => {
  const entries = [{ trip: trip('TRIP-A', 2), revisions: [revision('REV-001', true, 1)] }]
  expect(selectWarehousePlan(entries)).toMatchObject({ revision: { id: 'REV-001' }, stale: true })
  expect(selectWarehousePlan([{ trip: trip('TRIP-A', 1), revisions: [revision('REV-001', true, 1)] }])?.stale).toBe(false)
})

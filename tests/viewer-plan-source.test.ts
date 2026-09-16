import { expect, test } from 'vitest'
import { fetchPlanSource } from '@/features/viewer3d/viewer-api'

const TRIP_ID = 'TRIP-2026-0914'

/** Seed: REV-001 là kết quả tối ưu, REV-002 là bản đã duyệt từ REV-001 (cùng `jobId`). */
test('the Planner opens the approved revision by default, by job, and the exact revision by id', async () => {
  const byDefault = await fetchPlanSource(TRIP_ID)
  expect(byDefault.revision?.approvedAt).toBeDefined()
  const approved = byDefault.revision!

  expect((await fetchPlanSource(TRIP_ID, approved.jobId)).revision?.id).toBe(approved.id)
  const source = await fetchPlanSource(TRIP_ID, 'REV-001')
  expect(source.revision?.id).toBe('REV-001')
  expect(source.revision?.approvedAt).toBeUndefined()
  expect((await fetchPlanSource(TRIP_ID, 'KHONG-CO')).revision).toBeUndefined()
})

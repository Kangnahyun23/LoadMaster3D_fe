import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { expect, test, vi } from 'vitest'
import { LOAD_PLAN } from '@/lib/load-plan.mock'
import { useLoadingSession } from './useLoadingSession'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn(), info: vi.fn() } }))

/** LM-053 (D-20): phiên xếp hàng không có thao tác nào chỉ hiện toast mà không làm gì. */
test('không còn "Ghi nhận sai lệch" — thao tác chỉ báo thành công giả', () => {
  const { result } = renderHook(() => useLoadingSession(LOAD_PLAN, 1))
  expect(result.current).not.toHaveProperty('reportDeviation')
})

test('kiện không có ở kho: chuyển bước và toast chỉ nói đúng việc đã làm', () => {
  const { result } = renderHook(() => useLoadingSession(LOAD_PLAN, 1))
  const skippedId = result.current.current?.id

  act(() => result.current.reportMissing())

  expect(result.current.step).toBe(2)
  expect(toast.warning).toHaveBeenCalledTimes(1)
  expect(toast.warning).toHaveBeenCalledWith(`Đã bỏ qua ${skippedId}`, { description: 'Chuyển sang bước kế tiếp.' })
})

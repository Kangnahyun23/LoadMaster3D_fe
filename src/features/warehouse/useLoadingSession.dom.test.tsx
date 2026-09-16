import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { expect, test, vi } from 'vitest'
import { seedScene } from '@/test/scene'
import { useLoadingSession } from './useLoadingSession'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn(), info: vi.fn() } }))

const { placements } = await seedScene()

/** LM-053 (D-20): phiên xếp hàng không có thao tác nào chỉ hiện toast mà không làm gì. */
test('không còn "Ghi nhận sai lệch" — thao tác chỉ báo thành công giả', () => {
  const { result } = renderHook(() => useLoadingSession(placements))
  expect(result.current).not.toHaveProperty('reportDeviation')
})

test('bước 1 là kiện có loadingOrder = 1 của revision đã duyệt (LM-060)', () => {
  const { result } = renderHook(() => useLoadingSession(placements))
  expect(result.current.step).toBe(1)
  expect(result.current.totalSteps).toBe(placements.length)
  expect(result.current.current?.id).toBe(placements.find((p) => p.step === 1)?.id)
  expect(result.current.next?.id).toBe(placements.find((p) => p.step === 2)?.id)
})

test('kiện không có ở kho: chuyển bước và toast chỉ nói đúng việc đã làm', () => {
  const { result } = renderHook(() => useLoadingSession(placements))
  const skippedId = result.current.current?.id

  act(() => result.current.reportMissing())

  expect(result.current.step).toBe(2)
  expect(toast.warning).toHaveBeenCalledTimes(1)
  expect(toast.warning).toHaveBeenCalledWith(`Đã bỏ qua ${skippedId}`, { description: 'Chuyển sang bước kế tiếp.' })
})

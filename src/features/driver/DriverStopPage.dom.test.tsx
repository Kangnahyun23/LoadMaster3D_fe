import { act, render, renderHook, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { MemoryRouter } from 'react-router'
import { expect, test, vi } from 'vitest'
import { DriverStopPage } from './DriverStopPage'
import { DELIVERY_STOP } from './driver.mock'
import { useDeliveryStop } from './useDeliveryStop'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn(), info: vi.fn() } }))

/** LM-053 (D-20): tab "Chuyến", "Kiện hàng", "Tài khoản" không có màn riêng — chúng mở lại đúng màn này. */
test('không có thanh tab dẫn tới màn chưa tồn tại', () => {
  render(
    <MemoryRouter initialEntries={['/tai-xe/diem-giao']}>
      <DriverStopPage />
    </MemoryRouter>,
  )
  expect(screen.getByRole('button', { name: 'Hoàn tất điểm giao' })).toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Điều hướng tài xế' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Tài khoản' })).not.toBeInTheDocument()
})

test('hoàn tất điểm giao không hứa đồng bộ hay chuyển điểm khi không làm việc đó', () => {
  const allUnloaded = {
    ...DELIVERY_STOP,
    initiallyDone: DELIVERY_STOP.items.map((item) => item.id).filter((id) => !DELIVERY_STOP.rejected.includes(id)),
  }
  const { result } = renderHook(() => useDeliveryStop(allUnloaded))

  act(() => result.current.complete())

  expect(toast.success).toHaveBeenCalledWith(`Đã dỡ đủ kiện tại điểm giao ${DELIVERY_STOP.number}`)
})

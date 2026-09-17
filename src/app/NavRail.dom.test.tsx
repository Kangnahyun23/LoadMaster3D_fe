import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { NavRail } from './NavRail'

/** LM-053 (D-20): nút Cài đặt chưa mở màn nào nên không hiển thị. */
test('nav rail không có nút Cài đặt', () => {
  render(
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <MemoryRouter>
            <NavRail />
          </MemoryRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  expect(screen.getByRole('link', { name: 'Chuyến hàng' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cài đặt' })).not.toBeInTheDocument()
})

/** Mục đang mở phải nhận ra được bằng trình đọc màn hình (aria-current) và mỗi mục có nhãn chữ nhìn thấy được. */
test('nav rail đánh dấu mục đang mở và hiện nhãn chữ cho từng mục', () => {
  render(
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <MemoryRouter initialEntries={['/chuyen/TRIP-2026-0914']}>
            <NavRail />
          </MemoryRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  const trips = screen.getByRole('link', { name: 'Chuyến hàng' })
  expect(trips).toHaveAttribute('aria-current', 'page')
  expect(trips).toHaveTextContent('Chuyến hàng')
  expect(screen.getByRole('link', { name: 'Bảng điều khiển' })).not.toHaveAttribute('aria-current')
})

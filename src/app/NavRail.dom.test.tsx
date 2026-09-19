import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { NavRail } from './NavRail'

/** LM-053 (D-20): nút Cài đặt chưa mở màn nào nên không hiển thị. */
test('nav rail không có nút Cài đặt', () => {
  signedInAs('dispatcher')
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
  signedInAs('dispatcher')
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

/** D-41: mỗi vai trò chỉ thấy mục nav của màn mình được mở; quản trị thấy tất cả. */
test.each<[Role, string[]]>([
  ['dispatcher', ['Bảng điều khiển', 'Chuyến hàng', 'Đội xe']],
  ['manager', ['Bảng điều khiển', 'Chuyến hàng', 'Đội xe']],
  ['warehouse', ['Kho']],
  ['driver', ['Tài xế']],
  ['admin', ['Bảng điều khiển', 'Chuyến hàng', 'Kho', 'Tài xế', 'Đội xe', 'Người dùng', 'Nhật ký']],
])('nav rail của %s chỉ có mục được phép', (role, items) => {
  signedInAs(role)
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
  const nav = screen.getByRole('navigation')
  expect([...nav.querySelectorAll('a')].map((link) => link.textContent)).toStrictEqual(items)
})

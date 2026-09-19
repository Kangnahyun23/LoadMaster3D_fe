import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { NavRail } from './NavRail'

function renderRail(role: Role, route = '/') {
  signedInAs(role)
  // Chuông thông báo (LM-098) đọc kho qua TanStack Query
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <MemoryRouter initialEntries={[route]}>
              <NavRail />
            </MemoryRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

/** LM-053 (D-20): nút Cài đặt chưa mở màn nào nên không hiển thị. */
test('nav rail không có nút Cài đặt', () => {
  renderRail('dispatcher')
  expect(screen.getByRole('link', { name: 'Chuyến hàng' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cài đặt' })).not.toBeInTheDocument()
})

/** Mục đang mở phải nhận ra được bằng trình đọc màn hình (aria-current) và mỗi mục có nhãn chữ nhìn thấy được. */
test('nav rail đánh dấu mục đang mở và hiện nhãn chữ cho từng mục', () => {
  renderRail('dispatcher', '/chuyen/TRIP-2026-0914')
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
  renderRail(role)
  const nav = screen.getByRole('navigation')
  expect([...nav.querySelectorAll('a')].map((link) => link.textContent)).toStrictEqual(items)
})

/** LM-098: chuông chỉ có ở vai trò có loại thông báo; kho và tài xế không có nút không làm gì (D-20). */
test.each<[Role, boolean]>([
  ['dispatcher', true],
  ['manager', true],
  ['admin', true],
  ['warehouse', false],
  ['driver', false],
])('chuông thông báo của %s: %s', (role, shown) => {
  renderRail(role)
  expect(screen.queryByRole('button', { name: /^Thông báo/ }) !== null).toBe(shown)
})

/** LM-096: menu tài khoản mở hồ sơ cá nhân trước mục đăng xuất. */
test('menu tài khoản có mục Hồ sơ cá nhân mở /ho-so', async () => {
  const user = userEvent.setup()
  renderRail('manager')
  await user.click(screen.getByRole('button', { name: 'Tài khoản Trần Thị Mai' }))
  const items = await screen.findAllByRole('menuitem')
  expect(items.map((item) => item.textContent)).toStrictEqual(['Hồ sơ cá nhân', 'Đăng xuất'])
  expect(items[0]).toHaveAttribute('href', '/ho-so')
})

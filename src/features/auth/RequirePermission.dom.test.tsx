import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { AuthProvider } from './AuthProvider'
import { RequirePermission } from './RequirePermission'

function renderUsersRoute(role: Role) {
  signedInAs(role)
  render(
    <I18nProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/nguoi-dung']}>
          <Routes>
            <Route element={<RequirePermission permission="users.manage" />}>
              <Route path="/nguoi-dung" element={<h1>Người dùng</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nProvider>,
  )
}

/** D-41: thiếu quyền thì màn 403 có lối về màn chính của vai trò, không để người dùng kẹt. */
test('a driver opening the users screen gets 403 with a way back to the driver screen', () => {
  renderUsersRoute('driver')
  expect(screen.getByRole('heading', { name: 'Không có quyền truy cập' })).toBeInTheDocument()
  expect(screen.getByText('403')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về màn chính' })).toHaveAttribute('href', '/tai-xe/diem-giao')
  expect(screen.queryByRole('heading', { name: 'Người dùng' })).not.toBeInTheDocument()
})

test('the admin opens the users screen', () => {
  renderUsersRoute('admin')
  expect(screen.getByRole('heading', { name: 'Người dùng' })).toBeInTheDocument()
})

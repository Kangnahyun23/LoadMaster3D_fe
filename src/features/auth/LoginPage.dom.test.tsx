import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, expect, test } from 'vitest'
import { NavRail } from '@/app/NavRail'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from './AuthProvider'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'

/** Hình minh hoạ màn đăng nhập đọc `prefers-reduced-motion`; jsdom chưa có `matchMedia`. */
window.matchMedia ??= (query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
})

function Where() {
  const location = useLocation()
  return <p>Đang ở {location.pathname + location.search}</p>
}

/** Seam: màn đăng nhập thật + tài khoản demo; route đích chỉ in đường dẫn. */
function renderLogin(from?: string) {
  render(
    <I18nProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/dang-nhap', state: from ? { from } : null }]}>
          <Routes>
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="*" element={<Where />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nProvider>,
  )
}

async function signInAs(email: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Mật khẩu'), 'loadmaster')
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }))
}

beforeEach(() => sessionStorage.clear())

test.each([
  ['kho@loadmaster.vn', '/kho'],
  ['taixe@loadmaster.vn', '/tai-xe/diem-giao'],
  ['dieuphoi@loadmaster.vn', '/chuyen'],
  ['quanly@loadmaster.vn', '/'],
  ['quantri@loadmaster.vn', '/nguoi-dung'],
])('%s opening the app root lands on %s', async (email, home) => {
  renderLogin('/')
  await signInAs(email)
  expect(await screen.findByText(`Đang ở ${home}`, {}, { timeout: 3000 })).toBeInTheDocument()
})

test('signing out and in as another role lands on that role screen, not on the page the previous user left', async () => {
  const user = userEvent.setup()
  render(
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <MemoryRouter initialEntries={['/dang-nhap']}>
            <Routes>
              <Route path="/dang-nhap" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="*" element={<><NavRail /><Where /></>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  await signInAs('dieuphoi@loadmaster.vn')
  expect(await screen.findByText('Đang ở /chuyen', {}, { timeout: 3000 })).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Đội xe' }))
  expect(screen.getByText('Đang ở /doi-xe')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /^Tài khoản/ }))
  await user.click(await screen.findByRole('menuitem', { name: 'Đăng xuất' }))

  await screen.findByLabelText('Email', {}, { timeout: 3000 })
  await signInAs('kho@loadmaster.vn')
  expect(await screen.findByText('Đang ở /kho', {}, { timeout: 3000 })).toBeInTheDocument()
}, 15_000)

test('a deep link opened before signing in is kept for any role', async () => {
  renderLogin('/chuyen/TRIP-2026-0914/phuong-an?revision=REV-002')
  await signInAs('kho@loadmaster.vn')
  expect(await screen.findByText('Đang ở /chuyen/TRIP-2026-0914/phuong-an?revision=REV-002', {}, { timeout: 3000 })).toBeInTheDocument()
})

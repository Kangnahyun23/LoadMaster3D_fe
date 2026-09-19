import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { expect, test } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import { FleetPage } from './FleetPage'

/**
 * Danh sách đội xe (LM-089) trên kho mock thật, seed neo 14/09/2026: VEHICLE-003/006/007 đang chạy TRIP-010/009/011,
 * VEHICLE-008 bảo dưỡng. Kiểm qua những gì người dùng thấy và địa chỉ trên URL.
 */

const SLOW = { timeout: 5000 }

function UrlProbe() {
  const location = useLocation()
  return <output data-testid="url">{location.pathname + location.search}</output>
}

function renderFleet(path = '/doi-xe') {
  const router = createMemoryRouter(
    [
      { path: '/doi-xe', element: <><FleetPage /><UrlProbe /></> },
      { path: '/doi-xe/:vehicleId', element: <p>Trang xe</p> },
      { path: '/chuyen/:tripId', element: <p>Trang chuyến</p> },
    ],
    { initialEntries: [path] },
  )
  signedInAs('dispatcher')
  render(
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  return userEvent.setup()
}

const url = () => screen.getByTestId('url').textContent
const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')
const vehicleIds = () => bodyRows().map((row) => /VEHICLE-\d+/.exec(row.textContent ?? '')?.[0])

test('each row shows the vehicle status: a running trip links to the trip, maintenance shows its note', async () => {
  renderFleet()

  const maintenance = await screen.findByRole('row', { name: /VEHICLE-008/ }, SLOW)
  expect(within(maintenance).getByText('Bảo dưỡng')).toBeInTheDocument()
  expect(within(maintenance).getByText('Thay má phanh và bảo dưỡng định kỳ 20.000 km')).toBeInTheDocument()

  const running = screen.getByRole('row', { name: /VEHICLE-007/ })
  expect(within(running).getByText('Đang chạy')).toBeInTheDocument()
  expect(within(running).getByRole('link', { name: 'TRIP-011' })).toHaveAttribute('href', '/chuyen/TRIP-011')

  expect(within(screen.getByRole('row', { name: /VEHICLE-001/ })).getByText('Sẵn sàng')).toBeInTheDocument()
  // Tên xe là liên kết cho bàn phím; mặc định sắp theo tên
  expect(within(running).getByRole('link', { name: 'Isuzu FVR 900 · 51D-622.14' })).toHaveAttribute('href', '/doi-xe/VEHICLE-007')
  expect(vehicleIds()[0]).toBe('VEHICLE-004')
})

test('the status filter, the accent-free search and the status sort keep their state on the URL', async () => {
  const user = renderFleet()
  await screen.findByRole('row', { name: /VEHICLE-008/ }, SLOW)

  await user.click(screen.getByRole('combobox', { name: 'Trạng thái' }))
  await user.click(await screen.findByRole('option', { name: 'Bảo dưỡng' }))
  expect(vehicleIds()).toStrictEqual(['VEHICLE-008'])
  expect(url()).toBe('/doi-xe?trang-thai=bao-duong')

  await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))
  await user.type(screen.getByRole('searchbox', { name: 'Tìm theo tên xe, biển số, mã xe' }), 'dong lanh')
  expect(vehicleIds()).toStrictEqual(['VEHICLE-004'])
  await user.clear(screen.getByRole('searchbox'))

  await user.click(screen.getByRole('button', { name: 'Trạng thái' }))
  expect(screen.getByRole('columnheader', { name: 'Trạng thái' })).toHaveAttribute('aria-sort', 'ascending')
  expect(vehicleIds().at(-1)).toBe('VEHICLE-008')
  expect(url()).toBe('/doi-xe?sap-xep=status')
})

test('opening the list from a URL with the running filter shows only the vehicles on a trip', async () => {
  renderFleet('/doi-xe?trang-thai=dang-chay')
  await screen.findByRole('row', { name: /VEHICLE-007/ }, SLOW)
  expect(vehicleIds().toSorted()).toStrictEqual(['VEHICLE-003', 'VEHICLE-006', 'VEHICLE-007'])
  expect(screen.getByRole('combobox', { name: 'Trạng thái' })).toHaveTextContent('Đang chạy')
})

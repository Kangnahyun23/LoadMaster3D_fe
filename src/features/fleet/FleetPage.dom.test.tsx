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
// Mã xe luôn ba chữ số; cột sau tên là lòng thùng (bắt đầu bằng số) nên không dùng `\d+`
const vehicleIds = () => bodyRows().map((row) => /VEHICLE-\d{3}/.exec(row.textContent ?? '')?.[0])

test('each row shows the vehicle status: a running trip links to the trip, maintenance shows its note', async () => {
  renderFleet()

  const maintenance = await screen.findByRole('row', { name: /VEHICLE-008/ }, SLOW)
  expect(within(maintenance).getByText('Bảo dưỡng')).toBeInTheDocument()
  expect(within(maintenance).getByText('Thay má phanh và bảo dưỡng định kỳ 20.000 km')).toBeInTheDocument()

  const running = screen.getByRole('row', { name: /VEHICLE-007/ })
  expect(within(running).getByText('Đang phục vụ chuyến')).toBeInTheDocument()
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
  expect(screen.getByRole('combobox', { name: 'Trạng thái' })).toHaveTextContent('Đang phục vụ chuyến')
})

/** Ô số liệu là một nhóm có nhãn, nên đọc đúng số của ô đó chứ không bắt nhầm số trùng ở bảng. */
const tile = (label: string) => within(screen.getByRole('group', { name: label }))

test('the summary tiles count the whole fleet from the repository', async () => {
  renderFleet('/doi-xe?q=dong+lanh')
  await screen.findByRole('group', { name: 'Xe trong danh mục' }, SLOW)
  // Seed: 8 xe — 4 sẵn sàng, VEHICLE-003/006/007 đang phục vụ, VEHICLE-008 bảo dưỡng. Ô tìm đang lọc còn 1 xe, ô số liệu không đổi.
  expect(tile('Xe trong danh mục').getByText('8')).toBeInTheDocument()
  expect(tile('Sẵn sàng').getByText('4')).toBeInTheDocument()
  expect(tile('Đang phục vụ chuyến').getByText('3')).toBeInTheDocument()
  expect(tile('Bảo dưỡng').getByText('1')).toBeInTheDocument()
  expect(tile('Bảo dưỡng').getByText('Không chọn được khi lập chuyến')).toBeInTheDocument()
  // Ô tổng chỉ hiển thị, không bấm được
  expect(tile('Xe trong danh mục').queryByRole('button')).toBeNull()
})

test('a status tile filters the list on the URL, shows it is pressed, and pressing it again clears the filter', async () => {
  const user = renderFleet()
  await screen.findByRole('row', { name: /VEHICLE-008/ }, SLOW)
  const maintenance = tile('Bảo dưỡng').getByRole('button')
  expect(maintenance).toHaveAttribute('aria-pressed', 'false')

  await user.click(maintenance)
  expect(url()).toBe('/doi-xe?trang-thai=bao-duong')
  expect(vehicleIds()).toStrictEqual(['VEHICLE-008'])
  expect(maintenance).toHaveAttribute('aria-pressed', 'true')
  // Ô chọn trạng thái đi cùng một bộ lọc nên cũng đổi theo
  expect(screen.getByRole('combobox', { name: 'Trạng thái' })).toHaveTextContent('Bảo dưỡng')

  // Chuyển thẳng sang ô khác bằng bàn phím
  tile('Đang phục vụ chuyến').getByRole('button').focus()
  await user.keyboard('{Enter}')
  expect(url()).toBe('/doi-xe?trang-thai=dang-chay')
  expect(maintenance).toHaveAttribute('aria-pressed', 'false')

  await user.click(tile('Đang phục vụ chuyến').getByRole('button'))
  expect(url()).toBe('/doi-xe')
  expect(vehicleIds()).toHaveLength(8)
})

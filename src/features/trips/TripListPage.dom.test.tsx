import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, test } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import { TripListPage } from './TripListPage'

const SLOW = { timeout: 4000 }

/** Seam: kho dùng chung (seed neo 14/09/2026) → `trips-api.ts` → hook → danh sách, trạng thái lọc trên URL (D-52). */
function renderList(url = '/chuyen') {
  signedInAs('dispatcher')
  const router = createMemoryRouter(
    [
      { path: '/chuyen', element: <TripListPage /> },
      { path: '/chuyen/:tripId', element: <p>Chi tiết chuyến</p> },
    ],
    { initialEntries: [url] },
  )
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  return { user: userEvent.setup(), router }
}

/** Mã chuyến của các dòng dữ liệu, theo thứ tự hiện trên bảng. */
function tripIds() {
  return screen.getAllByRole('row').slice(1).map((row) => within(row).getByRole('link').textContent)
}

test('newest run date first, with run date, driver and lifecycle status on every row', async () => {
  renderList()
  const first = await screen.findByRole('row', { name: /TRIP-014/ }, SLOW)
  expect(tripIds()[0]).toBe('TRIP-014')
  expect(first).toHaveTextContent('16/09/2026')
  expect(first).toHaveTextContent('Chưa gán')
  expect(first).toHaveTextContent('Nháp')
  expect(screen.getByRole('row', { name: /TRIP-009/ })).toHaveTextContent('Đang giao')
  expect(screen.getByRole('row', { name: /TRIP-004/ })).toHaveTextContent('Đã huỷ')
  expect(screen.getByRole('columnheader', { name: 'Ngày chạy' })).toHaveAttribute('aria-sort', 'descending')
})

test('filters read from the URL: status, and a driver-less trip through "Chưa gán"', async () => {
  const { user, router } = renderList('/chuyen?trang-thai=dang_giao')
  await screen.findByRole('row', { name: /TRIP-009/ }, SLOW)
  expect(tripIds()).toStrictEqual(['TRIP-009'])

  await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))
  await user.click(screen.getByRole('combobox', { name: 'Tài xế' }))
  await user.click(await screen.findByRole('option', { name: 'Chưa gán' }))
  expect(tripIds()).toStrictEqual(['TRIP-014'])
  expect(router.state.location.search).toBe('?tai-xe=chua-gan')
})

test('summary tiles count the whole list; a group tile filters by status group on the URL and pressing it again clears it', async () => {
  const { user, router } = renderList()
  await screen.findByRole('row', { name: /TRIP-014/ }, SLOW)
  const tile = (name: string) => within(screen.getByRole('group', { name }))
  // Seed: 15 chuyến; TRIP-009/010/011 đang giao / đã xếp xong / đang xếp; TRIP-012 đã tối ưu, TRIP-013 cần xem lại
  expect(tile('Chuyến trong danh sách').getByText('15')).toBeInTheDocument()
  expect(tile('Đang thực hiện').getByText('3')).toBeInTheDocument()
  expect(tile('Cần xem phương án').getByText('2')).toBeInTheDocument()

  await user.click(tile('Đang thực hiện').getByRole('button'))
  expect(router.state.location.search).toBe('?trang-thai=dang-thuc-hien')
  expect(tripIds().toSorted()).toStrictEqual(['TRIP-009', 'TRIP-010', 'TRIP-011'])
  expect(tile('Đang thực hiện').getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('combobox', { name: 'Trạng thái' })).toHaveTextContent('Đang thực hiện')

  await user.click(tile('Đang thực hiện').getByRole('button'))
  expect(router.state.location.search).toBe('')
})

test('search ignores diacritics and covers the driver name', async () => {
  const { user } = renderList()
  const search = await screen.findByRole('searchbox', { name: 'Tìm theo mã, tên, tuyến, xe, tài xế' }, SLOW)
  await user.type(search, 'quoc dung')
  expect(tripIds().toSorted()).toStrictEqual(['TRIP-002', 'TRIP-007', 'TRIP-010', 'TRIP-2026-0914'])
})

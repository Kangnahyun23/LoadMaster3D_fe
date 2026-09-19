import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, test } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { TripDetailPage } from './TripDetailPage'

const SLOW = { timeout: 4000 }

/** Seam: kho dùng chung → `trips-api.ts` → hook → màn Chi tiết chuyến, đăng nhập bằng tài khoản demo (không giả lập module nào). */
function renderDetail(tripId: string, role: Role = 'dispatcher') {
  signedInAs(role)
  const router = createMemoryRouter(
    [
      { path: '/chuyen/:tripId', element: <TripDetailPage /> },
      { path: '/chuyen/:tripId/sua', element: <p>Form sửa chuyến</p> },
      { path: '/chuyen/:tripId/toi-uu', element: <p>Thiết lập tối ưu</p> },
      { path: '/chuyen/:tripId/phuong-an', element: <p>Planner</p> },
    ],
    { initialEntries: [`/chuyen/${tripId}`] },
  )
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>,
  )
  return { user: userEvent.setup(), container: view.container }
}

/** Nút hoặc link mang nền primary của `Button` — mỗi màn đúng một (AGENTS mục 5). */
const primaryActions = (container: HTMLElement) => container.querySelectorAll('a.bg-primary, button.bg-primary')

test('a trip being loaded is locked: the banner says why, edit actions are gone, progress shows packages loaded so far', async () => {
  const { container } = renderDetail('TRIP-011')
  expect(await screen.findByText('Kho đang xếp hàng theo phương án đã duyệt nên xe, điểm giao và kiện đã khoá.', {}, SLOW)).toBeInTheDocument()
  expect(screen.getByText('Đang xếp hàng')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Chạy tối ưu' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Thêm kiện' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Đổi xe' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Kéo để đổi thứ tự/ })).not.toBeInTheDocument()
  // Hành động chính còn lại: mở phương án đã duyệt trong 3D
  expect(screen.getByRole('link', { name: 'Xem phương án 3D' })).toHaveAttribute('href', expect.stringContaining('/chuyen/TRIP-011/phuong-an?revision='))
  expect(primaryActions(container)).toHaveLength(1)

  const plan = (await getMockDb().listRevisions('TRIP-011')).findLast((revision) => revision.approvedAt !== undefined)
  const progress = within(screen.getByRole('heading', { name: 'Tiến trình' }).closest('div')!)
  expect(await progress.findByText(`Đã xếp 110 / ${plan!.result.placements.length} kiện`, {}, SLOW)).toBeInTheDocument()
  expect(progress.getByText('Xếp hàng')).toHaveTextContent('Xếp hàng, đang diễn ra')
  // Tài xế hiện cạnh xe
  expect(screen.getByText('Đặng Hoài Nam')).toBeInTheDocument()
})

test('cancelling a trip needs a reason, then shows "Đã huỷ" and writes the cancellation to the log', async () => {
  const { user } = renderDetail('TRIP-014')
  await user.click(await screen.findByRole('button', { name: 'Thao tác' }, SLOW))
  await user.click(await screen.findByRole('menuitem', { name: 'Huỷ chuyến' }))
  const dialog = await screen.findByRole('dialog', { name: 'Huỷ chuyến TRIP-014?' })
  await user.click(within(dialog).getByRole('button', { name: 'Huỷ chuyến' }))
  expect(await within(dialog).findByText('Nhập lý do huỷ chuyến')).toBeInTheDocument()
  expect((await getMockDb().getTrip('TRIP-014')).phase).toBe('planning')

  await user.type(within(dialog).getByLabelText('Lý do huỷ'), 'Khách hoãn đơn sang tuần sau')
  await user.click(within(dialog).getByRole('button', { name: 'Huỷ chuyến' }))
  // Banner nói lý do khoá, thẻ Tiến trình ghi mốc huỷ — cả hai có lý do
  expect(await screen.findAllByText(/Lý do: Khách hoãn đơn sang tuần sau/, {}, SLOW)).toHaveLength(2)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getAllByText('Đã huỷ').length).toBeGreaterThan(0)
  expect(screen.queryByRole('button', { name: 'Thao tác' })).not.toBeInTheDocument()

  const trip = await getMockDb().getTrip('TRIP-014')
  expect(trip).toMatchObject({ phase: 'cancelled', cancellation: { reason: 'Khách hoãn đơn sang tuần sau', by: 'US-0001' } })
  const [latest] = await getMockDb().listEvents({ targetId: 'TRIP-014' })
  expect(latest).toMatchObject({ action: 'trip.cancelled', actorId: 'US-0001', params: { reason: 'Khách hoãn đơn sang tuần sau' } })
})

test('a completed trip lists its delivery issues with kind, stop and note, and is read-only', async () => {
  renderDetail('TRIP-005')
  expect(await screen.findByText('1 sự cố giao hàng', {}, SLOW)).toBeInTheDocument()
  expect(screen.getByText('Thùng móp góc do xóc đường, khách vẫn nhận')).toBeInTheDocument()
  expect(screen.getByText(/Hàng hỏng · Điểm 2/)).toBeInTheDocument()
  expect(screen.getByText('Chuyến đã hoàn thành; màn này chỉ để xem.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Thao tác' })).not.toBeInTheDocument()
})

test('a package the warehouse reported missing is listed with its stop', async () => {
  renderDetail('TRIP-003')
  expect(await screen.findByText('1 kiện thiếu ở kho', {}, SLOW)).toBeInTheDocument()
  const trip = await getMockDb().getTrip('TRIP-003')
  const missing = trip.loading?.steps.find((step) => step.outcome === 'missing')
  expect(screen.getByText(missing!.packageInstanceId)).toBeInTheDocument()
  expect(await screen.findByText(/thiếu 1 kiện/)).toBeInTheDocument()
})

test('the manager reads a trip without the actions menu, with one primary action to view the plan', async () => {
  const { container } = renderDetail('TRIP-2026-0914', 'manager')
  expect(await screen.findByRole('heading', { name: 'Kiện hàng' }, SLOW)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Thao tác' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Chạy tối ưu' })).not.toBeInTheDocument()
  expect(await screen.findByRole('link', { name: 'Xem phương án 3D' })).toBeInTheDocument()
  expect(primaryActions(container)).toHaveLength(1)
})

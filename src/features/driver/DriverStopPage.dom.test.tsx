import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { toast } from 'sonner'
import { MemoryRouter } from 'react-router'
import { expect, test, vi } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { twoCartonTrip } from '@/test/mock-db-samples'
import { DriverStopPage } from './DriverStopPage'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn(), success: vi.fn(), info: vi.fn() } }))

/**
 * Seam: kho dùng chung (`@/lib/mock-db`) → `driver-api.ts` → hook → màn hình, không giả lập module dữ liệu nào (LM-061).
 * Test theo thứ tự: bài cuối sửa kho.
 */
const SEED_TRIP = 'TRIP-2026-0914'

function renderDriver(route = '/tai-xe/diem-giao', role: Role = 'dispatcher') {
  signedInAs(role)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <DriverStopPage />
          </MemoryRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

/** Mã kiện điểm `stop` theo `unloadingOrder` của revision đã duyệt mới nhất, đọc thẳng từ kho. */
async function approvedUnloadOrder(tripId: string, stop: number) {
  const revisions = await getMockDb().listRevisions(tripId)
  const approved = revisions.findLast((revision) => revision.approvedAt !== undefined)!
  const stopPackages = approved.request.packages.filter((pkg) => pkg.deliveryStop === stop).map((pkg) => `${pkg.id}-`)
  return approved.result.placements
    .filter((p) => stopPackages.some((prefix) => p.packageInstanceId.startsWith(prefix)))
    .toSorted((a, b) => a.unloadingOrder - b.unloadingOrder)
    .map((p) => p.packageInstanceId)
}

function rowIds(container: HTMLElement) {
  return [...container.querySelectorAll('li[data-package-id]')].map((row) => row.getAttribute('data-package-id'))
}

test('chuyến seed: điểm 1 lấy từ chuyến, kiện theo unloadingOrder của revision đã duyệt, không thanh tab, một nút primary', async () => {
  const { container } = renderDriver()
  expect(await screen.findByRole('heading', { name: 'Điểm 1 / 4' })).toBeInTheDocument()
  const trip = await getMockDb().getTrip(SEED_TRIP)
  expect(screen.getByText(trip.stops[0]!.name, { selector: 'span' })).toBeInTheDocument()
  expect(screen.getByText(trip.stops[0]!.address)).toBeInTheDocument()

  const expected = await approvedUnloadOrder(SEED_TRIP, 1)
  expect(expected.length).toBeGreaterThan(0)
  expect(rowIds(container)).toStrictEqual(expected)
  expect(screen.getByText(`Cần dỡ ${expected.length} kiện · Đã dỡ 0`)).toBeInTheDocument()

  expect(screen.queryByRole('navigation', { name: 'Điều hướng tài xế' })).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(container.querySelectorAll('a.bg-primary, button.bg-primary')).toHaveLength(1)
})

test('hoàn tất điểm giao: còn kiện thì cảnh báo; dỡ đủ thì chuyển sang điểm kế tiếp trong phiên', async () => {
  const { container } = renderDriver()
  await screen.findByRole('heading', { name: 'Điểm 1 / 4' })
  const complete = screen.getByRole('button', { name: 'Hoàn tất điểm giao' })

  fireEvent.click(complete)
  const count = rowIds(container).length
  expect(toast.warning).toHaveBeenCalledWith(`Còn ${count} kiện chưa dỡ`, { description: 'Đánh dấu hết các kiện đã dỡ trước khi hoàn tất.' })
  expect(screen.getByRole('heading', { name: 'Điểm 1 / 4' })).toBeInTheDocument()

  const list = screen.getByRole('list')
  for (const button of within(list).getAllByRole('button', { name: /^Đánh dấu đã dỡ / })) fireEvent.click(button)
  expect(screen.getByText('Còn 0 kiện chưa dỡ')).toBeInTheDocument()
  fireEvent.click(complete)

  expect(toast.success).toHaveBeenCalledWith('Đã dỡ đủ kiện tại điểm giao 1', { description: 'Chuyển sang điểm giao 2.' })
  expect(await screen.findByRole('heading', { name: 'Điểm 2 / 4' })).toBeInTheDocument()
  expect(rowIds(container)).toStrictEqual(await approvedUnloadOrder(SEED_TRIP, 2))
})

test('?chuyen trỏ tới chuyến chưa duyệt: trạng thái rỗng nói cần duyệt trước, không rơi sang chuyến khác', async () => {
  const trip = await getMockDb().createTrip(twoCartonTrip())
  renderDriver(`/tai-xe/diem-giao?chuyen=${trip.id}`)
  expect(await screen.findByText('Chưa có phương án đã duyệt')).toBeInTheDocument()
  expect(screen.getByText(`Chuyến ${trip.id} chưa có phương án đã duyệt. Điều phối viên cần duyệt phương án xếp hàng của chuyến trước.`)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về danh sách chuyến' })).toHaveAttribute('href', '/chuyen')
})

test('tài xế: nút thoát là Đăng xuất, không dẫn sang trang chuyến của điều phối viên', async () => {
  renderDriver('/tai-xe/diem-giao', 'driver')
  await screen.findByRole('heading', { name: 'Điểm 1 / 4' })
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Thoát màn hình tài xế' })).not.toBeInTheDocument()
})

test('bản duyệt lỗi thời vẫn hiện, kèm cảnh báo', async () => {
  const db = getMockDb()
  const trip = await db.getTrip(SEED_TRIP)
  await db.updateTrip(SEED_TRIP, { packages: trip.packages.map((pkg, i) => (i === 0 ? { ...pkg, weightKg: pkg.weightKg + 1 } : pkg)) })
  renderDriver(`/tai-xe/diem-giao?chuyen=${SEED_TRIP}`)
  expect(await screen.findByRole('alert')).toHaveTextContent('Phương án đã duyệt này đã lỗi thời')
  expect(screen.getByRole('heading', { name: 'Điểm 1 / 4' })).toBeInTheDocument()
})

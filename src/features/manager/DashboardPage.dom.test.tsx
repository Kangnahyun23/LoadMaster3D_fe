import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { DashboardPage } from './DashboardPage'

/**
 * Seam kiểm thử là kho dùng chung (`@/lib/mock-db`, seed neo 14/09/2026) → `dashboard-api.ts` → hook → màn: không giả lập module
 * nào, nên mọi số trên màn truy về kho (LM-090, D-48). Đồng hồ chỉ giả `Date` để "hôm nay" của kỳ trùng ngày neo của seed.
 *
 * Số kỳ vọng đếm từ `seed-trips.ts`: 15 chuyến, ngày chạy từ −27 tới +2 quanh ngày neo; hoàn thành TRIP-001, 002, 003, 005,
 * 006, 007, 008 (−27 … −3); hôm nay xe 003, 006, 007 đang chạy trên 8 xe.
 */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-14T03:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

/** Kho có độ trễ giả 300 ms mỗi lượt; chạy song song cả bộ thì chờ lâu hơn mức 1 giây mặc định. */
const SLOW = { timeout: 5000 }

/** Query của URL hiện tại, để khẳng định kỳ nằm trên URL. */
function SearchProbe() {
  return <p data-testid="search">{useLocation().search}</p>
}

const search = () => screen.getByTestId('search').textContent

function renderDashboard(role: Role, url = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  signedInAs(role)
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <I18nProvider>
          <MemoryRouter initialEntries={[url]}>
            <DashboardPage />
            <SearchProbe />
          </MemoryRouter>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

/** Ô KPI là một nhóm có nhãn, nên đọc đúng số của ô đó chứ không bắt nhầm số trùng ở bảng bên dưới. */
async function kpi(label: string) {
  return within(await screen.findByRole('group', { name: label }, SLOW))
}

test('kỳ mặc định 30 ngày: KPI theo kỳ lấy từ kho, mỗi ô nói nguồn', async () => {
  renderDashboard('manager')

  const trips = await kpi('Chuyến hoàn thành')
  // 30 ngày tới 14/09: 12 chuyến (−27 … 0), trong đó 7 hoàn thành
  expect(trips.getByText('7')).toBeInTheDocument()
  expect(trips.getByText('/ 12 chuyến')).toBeInTheDocument()
  expect(trips.getByText('Chuyến có ngày chạy trong kỳ, tổng gồm cả chuyến đã huỷ')).toBeInTheDocument()
  expect((await kpi('Xe đang chạy hôm nay')).getByText('/ 8 xe')).toBeInTheDocument()
  expect((await kpi('Xe đang chạy hôm nay')).getByText('3')).toBeInTheDocument()
  // Tỷ lệ lấp đầy từ kết quả mock mang nhãn MOCK RESULT
  const fill = await kpi('Lấp đầy thể tích trung bình')
  expect(fill.getByText('MOCK RESULT')).toBeInTheDocument()
  expect(fill.getByText(/^\d{1,3},\d%$/)).toBeInTheDocument()
  expect(screen.getByText('16/08/2026 – 14/09/2026')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '30 ngày' })).toHaveAttribute('aria-pressed', 'true')
})

test('đổi kỳ: KPI tính lại ngay và kỳ nằm trên URL', async () => {
  const user = userEvent.setup()
  renderDashboard('manager')
  await kpi('Chuyến hoàn thành')

  await user.click(screen.getByRole('button', { name: '7 ngày' }))
  // 08/09 → 14/09: TRIP-008 (−3, hoàn thành), 009, 010, 011 và chuyến chính (hôm nay)
  expect((await kpi('Chuyến hoàn thành')).getByText('/ 5 chuyến')).toBeInTheDocument()
  expect((await kpi('Chuyến hoàn thành')).getByText('1')).toBeInTheDocument()
  expect(search()).toBe('?ky=7-ngay')
  expect(screen.getByText('08/09/2026 – 14/09/2026')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Tháng này' }))
  // Tháng 9: từ TRIP-006 (04/09) tới TRIP-014 (16/09) — 10 chuyến, hoàn thành 006, 007, 008
  expect((await kpi('Chuyến hoàn thành')).getByText('/ 10 chuyến')).toBeInTheDocument()
  expect(search()).toBe('?ky=thang-nay')

  await user.click(screen.getByRole('button', { name: 'Tuỳ chọn' }))
  // Tuỳ chọn bắt đầu từ khoảng ngày đang xem
  expect(search()).toBe('?ky=tuy-chon&tu=2026-09-01&den=2026-09-30')
  expect(screen.getByLabelText('Từ ngày')).toHaveValue('2026-09-01')
})

test('kỳ không có chuyến: KPI bằng 0 hoặc "—", trạng thái rỗng thay biểu đồ và bảng', async () => {
  renderDashboard('manager', '/?ky=tuy-chon&tu=2026-07-01&den=2026-07-31')

  expect((await kpi('Chuyến hoàn thành')).getByText('/ 0 chuyến')).toBeInTheDocument()
  expect((await kpi('Lấp đầy thể tích trung bình')).getByText('—')).toBeInTheDocument()
  expect(screen.getByText('Không có chuyến nào trong kỳ')).toBeInTheDocument()
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  expect(screen.queryByText('Chuyến trong kỳ')).not.toBeInTheDocument()
})

test('ba biểu đồ có bảng số cho trình đọc màn hình; bảng chuyến dẫn tới chi tiết và Planner', async () => {
  renderDashboard('manager')

  const status = await screen.findByRole('table', { name: 'Bảng số của biểu đồ Chuyến theo trạng thái' }, SLOW)
  // Chuyến chính đã duyệt; 011 đang xếp, 010 đã xếp xong, 009 đang giao; 7 hoàn thành; TRIP-004 huỷ
  expect(within(status).getAllByRole('row').slice(1).map((row) => row.textContent)).toStrictEqual([
    'Đã duyệt1', 'Đang xếp hàng1', 'Đã xếp xong1', 'Đang giao1', 'Hoàn thành7', 'Đã huỷ1',
  ])
  expect(screen.getByRole('figure', { name: 'Lấp đầy theo ngày' })).toBeInTheDocument()
  expect(screen.getByRole('table', { name: 'Bảng số của biểu đồ Khối lượng đã giao theo xe' })).toBeInTheDocument()
  expect(screen.getByRole('table', { name: 'Bảng số của biểu đồ Lấp đầy theo ngày' })).toBeInTheDocument()

  expect(screen.getByRole('link', { name: 'Tuyến Q.7 – Thủ Dầu Một – Dĩ An – Biên Hoà TRIP-2026-0914' }))
    .toHaveAttribute('href', '/chuyen/TRIP-2026-0914')
  expect(screen.getByRole('link', { name: 'Mở phương án của Tuyến Q.7 – Thủ Dầu Một – Dĩ An – Biên Hoà' }))
    .toHaveAttribute('href', '/chuyen/TRIP-2026-0914/phuong-an?revision=REV-002')
})

test('một nút primary theo quyền: quản lý xuất báo cáo; điều phối tạo kế hoạch; quản trị có cả hai', async () => {
  renderDashboard('manager')
  const exportButton = await screen.findByRole('button', { name: 'Xuất báo cáo' }, SLOW)
  expect(exportButton).toHaveClass('bg-primary')
  expect(screen.queryByRole('link', { name: 'Tạo kế hoạch xếp' })).not.toBeInTheDocument()
})

test('điều phối viên không có quyền xuất báo cáo: chỉ còn "Tạo kế hoạch xếp"', async () => {
  renderDashboard('dispatcher')
  await kpi('Chuyến hoàn thành')
  expect(screen.getByRole('link', { name: 'Tạo kế hoạch xếp' })).toHaveAttribute('href', '/chuyen/moi')
  expect(screen.queryByRole('button', { name: 'Xuất báo cáo' })).not.toBeInTheDocument()
})

test('quản trị: "Tạo kế hoạch xếp" là primary, "Xuất báo cáo" là nút phụ', async () => {
  renderDashboard('admin')
  await kpi('Chuyến hoàn thành')
  expect(screen.getByRole('link', { name: 'Tạo kế hoạch xếp' })).toHaveClass('bg-primary')
  expect(screen.getByRole('button', { name: 'Xuất báo cáo' })).not.toHaveClass('bg-primary')
})

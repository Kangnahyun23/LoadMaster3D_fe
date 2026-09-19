import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { DashboardPage } from './DashboardPage'

/**
 * Seam kiểm thử là kho dữ liệu dùng chung (`@/lib/mock-db`) → `dashboard-api.ts` → hook → màn hình: không giả lập
 * module nào, nên test chứng minh đúng thứ tiêu chí nghiệm thu LM-052 đòi — mọi số trên màn truy về repository.
 */
function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
  return client
}

/** Ô KPI là một nhóm có nhãn, nên đọc đúng số của ô đó chứ không bắt nhầm số trùng ở bảng bên dưới. */
async function kpi(label: string) {
  return within(await screen.findByRole('group', { name: label }))
}

test('KPI, job gần nhất và kế hoạch gần đây lấy số từ kho dữ liệu', async () => {
  renderDashboard()

  // Seed neo 14/09 (LM-083): 15 chuyến, 2.863 instance, 55.305 kg; 8 xe.
  expect((await kpi('Tổng số kiện')).getByText('2.863')).toBeInTheDocument()
  expect((await kpi('Tổng khối lượng hàng')).getByText('55.305 kg')).toBeInTheDocument()
  expect((await kpi('Xe trong đội')).getByText('8')).toBeInTheDocument()

  // Revision seed là kết quả mock đã duyệt của chuyến seed.
  expect(screen.getByText('MOCK RESULT')).toBeInTheDocument()
  const planLink = screen.getByRole('link', { name: /Tuyến Q.7/ })
  expect(planLink).toHaveAttribute(
    'href',
    expect.stringContaining('/chuyen/TRIP-2026-0914/phuong-an?revision='),
  )

  expect(screen.getByRole('link', { name: 'Tạo kế hoạch xếp' })).toHaveAttribute('href', '/chuyen/moi')
})

test('thêm một kiện vào chuyến rồi mở lại: tổng số kiện và khối lượng cập nhật', async () => {
  const db = getMockDb()
  const trip = (await db.listTrips())[0]
  if (trip === undefined) throw new Error('Kho seed phải có ít nhất một chuyến')
  const first = trip.packages[0]
  if (first === undefined) throw new Error('Chuyến seed phải có ít nhất một dòng kiện')

  await db.updateTrip(trip.id, {
    packages: [...trip.packages, { ...first, id: 'PKG-099', name: 'Thùng bổ sung', weightKg: 10, quantity: 2 }],
  })

  renderDashboard()

  // 2.863 + 2 instance, 55.305 + 20 kg.
  expect((await kpi('Tổng số kiện')).getByText('2.865')).toBeInTheDocument()
  expect((await kpi('Tổng khối lượng hàng')).getByText('55.325 kg')).toBeInTheDocument()
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { optimizedTwoCartonTrip } from '@/test/mock-db-samples'
import { LoadingStepPage } from './LoadingStepPage'

/**
 * Seam: kho dùng chung (`@/lib/mock-db`) → `warehouse-api.ts` → hook → màn kho, không giả lập module nào (LM-060).
 * Kỳ vọng lấy từ revision trong kho, không từ mock mm cũ.
 */
const SEED_TRIP = 'TRIP-2026-0914'
const LOAD = { timeout: 3000 }

/**
 * Ô 3D lazy-load thật trong jsdom: `usePerformanceFlags` đọc `prefers-reduced-motion` qua `matchMedia`, jsdom chưa có.
 * Canvas không có kích thước nên không dựng WebGL; test chỉ đọc phần DOM của màn.
 */
window.matchMedia ??= (query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
})

function renderWarehouse(route = '/kho', role: Role = 'dispatcher') {
  signedInAs(role)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="/kho" element={<LoadingStepPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

async function approvedTwoCartonTrip() {
  const db = getMockDb()
  const { trip, revision } = await optimizedTwoCartonTrip(db)
  const approved = await db.approveRevision(revision.id, [])
  return { db, trip, approved }
}

test('không tham số: chuyến seed, bước 1 là kiện loadingOrder = 1 của bản đã duyệt mới nhất, có MOCK RESULT và nhãn tính lại ở FE', async () => {
  const approved = (await getMockDb().listRevisions(SEED_TRIP)).findLast((revision) => revision.approvedAt !== undefined)
  const first = approved?.result.placements.find((placement) => placement.loadingOrder === 1)
  if (!approved || !first) throw new Error('Seed phải có bản duyệt với loadingOrder = 1')
  renderWarehouse()

  expect(await screen.findByRole('heading', { level: 1, name: first.packageInstanceId }, LOAD)).toBeInTheDocument()
  expect(screen.getByText(/^Bước/)).toHaveTextContent(`Bước 1 / ${approved.result.placements.length}`)
  expect(screen.getByText(SEED_TRIP)).toBeInTheDocument()
  expect(screen.getByText('MOCK RESULT')).toBeInTheDocument()
  expect(screen.getByText('Thứ tự tính lại ở FE')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Kiện này không có ở kho' })).toBeInTheDocument()
})

test('chuyến chỉ định chưa có bản duyệt: trạng thái rỗng dẫn về danh sách chuyến, không lấy chuyến khác thay', async () => {
  const { trip } = await optimizedTwoCartonTrip(getMockDb())
  renderWarehouse(`/kho?chuyen=${trip.id}`)

  expect(await screen.findByText('Chưa có phương án đã duyệt', {}, LOAD)).toBeInTheDocument()
  expect(screen.getByText(`Chuyến ${trip.id} chưa có phương án đã duyệt. Mở chuyến trong Planner và bấm Duyệt phương án trước.`)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Tới danh sách chuyến' })).toHaveAttribute('href', '/chuyen')
  expect(screen.getByRole('link', { name: 'Thoát màn kho' })).toHaveAttribute('href', '/chuyen')
  expect(screen.queryByRole('button', { name: 'Xác nhận đã xếp' })).not.toBeInTheDocument()
})

test('nhân viên kho: nút thoát và nút ở trạng thái rỗng là Đăng xuất, không dẫn sang trang chuyến của điều phối viên', async () => {
  const { trip } = await optimizedTwoCartonTrip(getMockDb())
  renderWarehouse(`/kho?chuyen=${trip.id}`, 'warehouse')

  expect(await screen.findByText('Chưa có phương án đã duyệt', {}, LOAD)).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Thoát màn kho' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Tới danh sách chuyến' })).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Đăng xuất' })).toHaveLength(2)
})

test('nhân viên kho đang xếp: nút thoát ở thanh trên là Đăng xuất', async () => {
  renderWarehouse('/kho', 'warehouse')
  expect(await screen.findByRole('button', { name: 'Xác nhận đã xếp' }, LOAD)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Thoát phiên xếp hàng' })).not.toBeInTheDocument()
})

test('quản lý mở màn kho: thoát về màn chính của quản lý', async () => {
  renderWarehouse('/kho', 'manager')
  expect(await screen.findByRole('link', { name: 'Thoát phiên xếp hàng' }, LOAD)).toHaveAttribute('href', '/')
})

test('chuyến chỉ định đã duyệt: khoảng cách cm theo locale, hướng đặt theo mã, vật cản sát kiện', async () => {
  const { trip, approved } = await approvedTwoCartonTrip()
  const first = approved.result.placements.find((placement) => placement.loadingOrder === 1)
  if (!first) throw new Error('Bản duyệt phải có loadingOrder = 1')
  renderWarehouse(`/kho?chuyen=${trip.id}`)

  const heading = await screen.findByRole('heading', { level: 1, name: first.packageInstanceId }, LOAD)
  const card = within(heading.closest('div.overflow-y-auto') as HTMLElement)
  expect(screen.getByText(/^Bước/)).toHaveTextContent('Bước 1 / 2')
  // Truck 6m dài 600 cm, Carton A 120 × 60 × 45 cm, 30 kg, hướng LWH, đặt trên sàn tại y = 0
  const rear = 600 - first.xCm - 120
  expect(card.getByText('Cách cửa sau').nextSibling).toHaveTextContent(`${rear} cm`)
  expect(card.getByText('Cách vách trước').nextSibling).toHaveTextContent(`${first.xCm} cm`)
  expect(card.getByText('Cách vách phải').nextSibling).toHaveTextContent('180 cm')
  expect(card.getByText(`Lớp 1 · Cách cửa ${rear} cm`)).toBeInTheDocument()
  expect(card.getByText('Hướng đặt').nextSibling).toHaveTextContent('LWH · Đứng thẳng · cạnh dài dọc thùng')
  expect(card.getByText('30 kg')).toBeInTheDocument()
  expect(card.getByText('120 × 60 × 45 cm')).toBeInTheDocument()
  expect(card.getByRole('img', { name: /^Minh hoạ hướng đặt LWH/ })).toBeInTheDocument()
  // Bước 1 là PKG-001-01 (điểm 3, trong cùng, x = 120) — chạm hốc bánh xe OBS-001 chiếm x 0–120
  expect(first).toMatchObject({ packageInstanceId: 'PKG-001-01', xCm: 120 })
  expect(card.getByText('Hốc bánh xe OBS-001 · khe 0 cm')).toBeInTheDocument()
})

test('kiện cách xa mọi vật cản: không nhắc vật cản', async () => {
  const { trip, approved } = await approvedTwoCartonTrip()
  renderWarehouse(`/kho?chuyen=${trip.id}`)
  await screen.findByRole('heading', { level: 1, name: 'PKG-001-01' }, LOAD)
  expect(screen.getByText('Vật cản gần nhất')).toBeInTheDocument()
  // Bước 2 (PKG-002-01, x = 240) cách hốc bánh xe 120 cm
  expect(approved.result.placements.find((placement) => placement.loadingOrder === 2)?.xCm).toBe(240)
  await userEvent.click(screen.getByRole('button', { name: 'Kiện này không có ở kho' }))
  await screen.findByRole('heading', { level: 1, name: 'PKG-002-01' })
  expect(screen.queryByText('Vật cản gần nhất')).not.toBeInTheDocument()
})

test('bản duyệt lỗi thời vẫn hiện, kèm cảnh báo', async () => {
  const { db, trip } = await approvedTwoCartonTrip()
  await db.updateTrip(trip.id, { packages: trip.packages.map((pkg) => ({ ...pkg, weightKg: pkg.weightKg + 1 })) })
  renderWarehouse(`/kho?chuyen=${trip.id}`)

  expect(await screen.findByRole('alert', {}, LOAD)).toHaveTextContent('Phương án đã duyệt này lỗi thời')
  expect(screen.getByRole('button', { name: 'Xác nhận đã xếp' })).toBeInTheDocument()
})

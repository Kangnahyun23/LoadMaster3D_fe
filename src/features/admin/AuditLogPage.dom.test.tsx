import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { expect, test } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { AuditLogPage } from './AuditLogPage'

/**
 * Seam: kho dùng chung (seed neo 14/09/2026) → `audit-api.ts` → hook → màn `/nhat-ky` (LM-091). Các test trong file dùng chung một
 * kho; sự kiện test ghi thêm luôn là mới nhất.
 */
const SLOW = { timeout: 5000 }

function SearchProbe() {
  return <p data-testid="search">{useLocation().search}</p>
}

function renderLog(url = '/nhat-ky') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter initialEntries={[url]}>
          <AuditLogPage />
          <SearchProbe />
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

/** Hàng dữ liệu (bỏ hàng tiêu đề), mỗi hàng là chữ của từng ô. */
async function dataRows() {
  const table = await screen.findByRole('table', {}, SLOW)
  return within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell').map((cell) => cell.textContent ?? ''))
}

test('sự kiện vừa ghi đứng đầu: người làm, hành động, đối tượng dẫn tới chuyến, chi tiết đã dịch', async () => {
  const db = getMockDb()
  // Điều phối viên huỷ chuyến ngày mai (TRIP-012 đã tối ưu, chưa xếp)
  db.restoreSession('US-0001')
  await db.cancelTrip('TRIP-012', 'Khách đổi lịch nhận hàng')
  renderLog()

  const [first] = await dataRows()
  expect(first?.slice(1)).toStrictEqual(['Nguyễn Thanh Tùng', 'Huỷ chuyến', 'Tuyến Bình Chánh – Biên Hoà TRIP-012', 'Lý do: Khách đổi lịch nhận hàng'])
  const firstRow = within(screen.getByRole('table')).getAllByRole('row')[1]
  expect(within(firstRow!).getByRole('link', { name: 'Tuyến Bình Chánh – Biên Hoà' })).toHaveAttribute('href', '/chuyen/TRIP-012')
  // Mặc định 50 dòng một trang, mới nhất trước
  expect(await dataRows()).toHaveLength(50)
  expect(screen.getByRole('columnheader', { name: 'Thời điểm' })).toHaveAttribute('aria-sort', 'descending')
})

test('lọc theo người làm: chỉ còn sự kiện của người đó, bộ lọc nằm trên URL', async () => {
  const user = userEvent.setup()
  renderLog()
  await dataRows()

  await user.click(screen.getByRole('combobox', { name: 'Người làm' }))
  await user.click(await screen.findByRole('option', { name: 'Lê Văn Hải' }))

  expect(await screen.findByTestId('search')).toHaveTextContent('?nguoi-lam=US-0003')
  // Bảng cũ còn hiện (mờ) trong lúc đọc lại: chờ tới khi mọi hàng là của người được chọn
  await waitFor(async () => {
    expect(new Set((await dataRows()).map((row) => row[1]))).toStrictEqual(new Set(['Lê Văn Hải']))
  }, SLOW)
})

test('tìm theo mã đối tượng và lọc nhóm hành động', async () => {
  renderLog('/nhat-ky?q=TRIP-004')
  // TRIP-004: tạo, tối ưu, duyệt, huỷ — mới nhất trước
  await screen.findByText('4 sự kiện', {}, SLOW)
  expect((await dataRows()).map((row) => row[2])).toStrictEqual(['Huỷ chuyến', 'Duyệt phương án', 'Lưu kết quả tối ưu', 'Tạo chuyến'])
  expect((await dataRows())[0]?.[4]).toBe('Lý do: Khách hoãn nhận hàng do kiểm kê kho cuối tháng')
})

test('nhóm hành động "Chuyến" kết hợp mã đối tượng', async () => {
  renderLog('/nhat-ky?q=TRIP-004&nhom=trip')
  await screen.findByText('2 sự kiện', {}, SLOW)
  expect((await dataRows()).map((row) => row[2])).toStrictEqual(['Huỷ chuyến', 'Tạo chuyến'])
  expect(screen.getByRole('combobox', { name: 'Nhóm hành động' })).toHaveTextContent('Chuyến')
})

test('khoảng ngày tính theo giờ Việt Nam: ngày chạy của TRIP-001 (18/08) có 7 sự kiện xếp và giao', async () => {
  renderLog('/nhat-ky?tu=2026-08-18&den=2026-08-18')
  // Seed: xếp từ 05:30, 30 giây mỗi kiện × 230 kiện → xếp xong 07:25:30; xuất phát 20 phút sau; điểm 1–3 xong 08:55, 10:05, 11:15
  await screen.findByText('7 sự kiện', {}, SLOW)
  const rows = await dataRows()
  expect(rows.map((row) => row[2])).toStrictEqual([
    'Hoàn thành chuyến', 'Hoàn tất điểm giao', 'Hoàn tất điểm giao', 'Hoàn tất điểm giao', 'Xuất phát giao hàng', 'Xếp xong', 'Bắt đầu xếp hàng',
  ])
  expect(rows.every((row) => row[3]?.endsWith('TRIP-001'))).toBe(true)
})

test('không có sự kiện khớp: bảng nói rõ và có nút xoá lọc', async () => {
  const user = userEvent.setup()
  renderLog('/nhat-ky?q=KHONG-CO')
  expect(await screen.findByText('Không có sự kiện khớp bộ lọc.', {}, SLOW)).toBeInTheDocument()
  await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Xoá lọc' }))
  expect(await dataRows()).toHaveLength(50)
})

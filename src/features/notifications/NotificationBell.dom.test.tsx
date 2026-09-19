import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb, SEED_PASSWORD } from '@/lib/mock-db'
import { signedInAs } from '@/test/signed-in'
import type { Role } from '@/types/user'
import { NotificationBell } from './NotificationBell'

/**
 * Chuông thông báo (LM-098) qua kho dùng chung (seed neo 14/09/2026). Đồng hồ chỉ giả `Date`: 18:00 ngày neo, nên cửa sổ 7 ngày bắt
 * đầu 18:00 07/09. Sự kiện kỳ vọng đọc từ nhật ký seed: điều phối có 4 (xếp xong TRIP-010, TRIP-009 sáng 14/09; hoàn thành và xếp xong
 * TRIP-008 ngày 11/09 — hoàn thành TRIP-007 lúc 10:03 07/09 đã quá mốc); quản lý có 1 (hoàn thành TRIP-008); việc của quản trị viên
 * trong seed đều do chính họ làm. Việc của người khác giả lập bằng cách đổi phiên của kho như một người dùng khác đang thao tác.
 */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-14T11:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

const SLOW = { timeout: 4000 }

function Elsewhere() {
  return <output aria-label="route">{useLocation().pathname + useLocation().search}</output>
}

function renderBell(role: Role) {
  const account = signedInAs(role)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <NotificationBell />
            <Routes>
              <Route path="*" element={<Elsewhere />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>,
  )
  return account
}

/** Làm một việc như người dùng `userId` đang đăng nhập ở máy khác, rồi trả phiên cho người đang xem. */
async function actAs<T>(userId: string | null, backTo: string, action: () => Promise<T>) {
  const db = getMockDb()
  db.restoreSession(userId)
  try {
    return await action()
  } finally {
    db.restoreSession(backTo)
  }
}

/** Các dòng thông báo (bỏ mục "Đánh dấu đã đọc"): hành động, đối tượng, thời điểm, đã đọc hay chưa, nơi mở. */
function notificationRows() {
  return within(screen.getByRole('menu'))
    .getAllByRole('menuitem')
    .filter((item) => item.querySelector('time'))
    .map((item) => ({
      text: [...item.querySelectorAll(':scope > span > span > span:first-child, :scope > span > span.truncate')].map((part) => part.textContent),
      at: item.querySelector('time')?.getAttribute('datetime'),
      unread: item.textContent?.endsWith('Chưa đọc') ?? false,
      href: item.getAttribute('href'),
    }))
}

test('the dispatcher sees what others did in the last seven days; opening one marks it read, then mark all read', async () => {
  const user = userEvent.setup()
  renderBell('dispatcher')
  const bell = await screen.findByRole('button', { name: 'Thông báo, 4 chưa đọc' }, SLOW)
  expect(within(bell).getByText('4')).toBeInTheDocument()

  await user.click(bell)
  await screen.findByRole('menu')
  expect(notificationRows()).toStrictEqual([
    { text: ['Xếp xong', 'Tuyến Thủ Đức – An Phú – Phú Nhuận · TRIP-010'], at: '2026-09-13T23:30:30.000Z', unread: true, href: '/chuyen/TRIP-010' },
    { text: ['Xếp xong', 'Tuyến Thủ Dầu Một – Sóng Thần · TRIP-009'], at: '2026-09-13T23:05:30.000Z', unread: true, href: '/chuyen/TRIP-009' },
    { text: ['Hoàn thành chuyến', 'Tuyến Biên Hoà – Thủ Đức – Bình Thạnh – Q.3 · TRIP-008'], at: '2026-09-11T06:50:30.000Z', unread: true, href: '/chuyen/TRIP-008' },
    { text: ['Xếp xong', 'Tuyến Biên Hoà – Thủ Đức – Bình Thạnh – Q.3 · TRIP-008'], at: '2026-09-11T01:50:30.000Z', unread: true, href: '/chuyen/TRIP-008' },
  ])
  expect(screen.getByText('Sự kiện 7 ngày gần nhất, không gồm việc bạn làm.')).toBeInTheDocument()

  // Bàn phím: mũi tên xuống tới "Hoàn thành chuyến" rồi Enter mở chuyến
  await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}')
  expect(await screen.findByRole('status', { name: 'route' })).toHaveTextContent('/chuyen/TRIP-008')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Thông báo, 3 chưa đọc' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Thông báo, 3 chưa đọc' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Đánh dấu đã đọc' }))
  // Danh sách vẫn mở, mọi dòng đã đọc, nút chuông hết số
  expect(notificationRows().map((row) => row.unread)).toStrictEqual([false, false, false, false])
  expect(screen.queryByRole('menuitem', { name: 'Đánh dấu đã đọc' })).not.toBeInTheDocument()
  // Menu đang mở che phần còn lại khỏi cây truy cập: đóng rồi mới đọc nhãn chuông
  await user.keyboard('{Escape}')
  expect(screen.getByRole('button', { name: 'Thông báo' })).not.toHaveTextContent(/\d/)
})

test('the manager gets completed and cancelled trips; opening the bell reads the store again', async () => {
  const user = userEvent.setup()
  const manager = renderBell('manager')
  const bell = await screen.findByRole('button', { name: 'Thông báo, 1 chưa đọc' }, SLOW)

  await actAs('US-0001', manager.id, () => getMockDb().cancelTrip('TRIP-012', 'Khách đổi lịch nhận hàng'))
  await user.click(bell)
  await waitFor(() => expect(notificationRows()).toHaveLength(2), SLOW)
  expect(notificationRows().map(({ text, href }) => ({ text, href }))).toStrictEqual([
    { text: ['Huỷ chuyến', 'Tuyến Bình Chánh – Biên Hoà · TRIP-012'], href: '/chuyen/TRIP-012' },
    { text: ['Hoàn thành chuyến', 'Tuyến Biên Hoà – Thủ Đức – Bình Thạnh – Q.3 · TRIP-008'], href: '/chuyen/TRIP-008' },
  ])
  await user.keyboard('{Escape}')
  expect(screen.getByRole('button', { name: 'Thông báo, 2 chưa đọc' })).toHaveTextContent('2')
})

test('the admin: empty at first, then account events by others and failed sign-ins', async () => {
  const user = userEvent.setup()
  const admin = renderBell('admin')
  await user.click(screen.getByRole('button', { name: 'Thông báo' }))
  expect(await screen.findByText('Không có thông báo nào trong 7 ngày qua.', {}, SLOW)).toBeInTheDocument()
  await user.keyboard('{Escape}')

  await actAs(null, admin.id, () => getMockDb().authenticate('ai-do@example.vn', 'doan-bua').catch(() => null))
  await actAs('US-0003', admin.id, () => getMockDb().changePassword(SEED_PASSWORD, 'kho-long-binh-2026'))
  await user.click(screen.getByRole('button', { name: /^Thông báo/ }))
  await waitFor(() => expect(notificationRows()).toHaveLength(2), SLOW)
  expect(notificationRows().map(({ text, href }) => ({ text, href }))).toStrictEqual([
    { text: ['Đổi mật khẩu', 'Lê Văn Hải · US-0003'], href: '/nguoi-dung?q=US-0003' },
    // Email lạ không có trang để mở: dòng chỉ đánh dấu đã đọc
    { text: ['Đăng nhập không thành công', 'ai-do@example.vn'], href: null },
  ])
})

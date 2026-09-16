import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { TripFormPage } from './TripFormPage'

/** Seam: kho dùng chung → `trips-api.ts` → hook → form, không giả lập module nào (LM-053: không báo thành công giả). */
function renderForm(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/chuyen/moi" element={<TripFormPage />} />
            <Route path="/chuyen/:tripId/sua" element={<TripFormPage />} />
            <Route path="/chuyen/:tripId" element={<p>Chi tiết chuyến</p>} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

test('creating a trip writes it to the repository with its stops, then opens its detail', async () => {
  const user = userEvent.setup()
  renderForm('/chuyen/moi')
  await user.click(screen.getByRole('button', { name: 'Tạo chuyến' }))
  expect(await screen.findByText('Nhập tên chuyến')).toBeInTheDocument()
  expect(screen.getByText('Chọn xe')).toBeInTheDocument()
  expect(screen.getByText('Nhập tên điểm giao')).toBeInTheDocument()

  const [vehicle] = await getMockDb().listVehicles()
  await user.type(screen.getByLabelText('Tên chuyến'), 'Tuyến Q.9 – Thủ Đức')
  await user.click(screen.getByRole('combobox', { name: 'Xe' }))
  await user.click(await screen.findByRole('option', { name: vehicle!.name }))
  await user.type(screen.getByLabelText('Tên điểm giao 1'), 'Q.9')
  await user.click(screen.getByRole('button', { name: 'Thêm điểm giao' }))
  await user.type(screen.getByLabelText('Tên điểm giao 2'), 'Thủ Đức')
  await user.type(screen.getByLabelText('Địa chỉ điểm giao 2'), 'Võ Văn Ngân')
  await user.click(screen.getByRole('button', { name: 'Tạo chuyến' }))

  expect(await screen.findByText('Chi tiết chuyến', {}, { timeout: 3000 })).toBeInTheDocument()
  const created = (await getMockDb().listTrips()).find((trip) => trip.name === 'Tuyến Q.9 – Thủ Đức')
  expect(created).toMatchObject({
    vehicleId: vehicle!.id, packages: [],
    stops: [{ id: 'STOP-01', name: 'Q.9', address: '' }, { id: 'STOP-02', name: 'Thủ Đức', address: 'Võ Văn Ngân' }],
  })
})

test('editing renames the trip in the repository and keeps its stops', async () => {
  const user = userEvent.setup()
  const [trip] = await getMockDb().listTrips()
  renderForm(`/chuyen/${trip!.id}/sua`)
  const name = await screen.findByLabelText('Tên chuyến', {}, { timeout: 3000 })
  await user.clear(name)
  await user.type(name, 'Tuyến đã đổi tên')
  await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
  expect(await screen.findByText('Chi tiết chuyến', {}, { timeout: 3000 })).toBeInTheDocument()
  const saved = await getMockDb().getTrip(trip!.id)
  expect(saved.name).toBe('Tuyến đã đổi tên')
  expect(saved.stops).toStrictEqual(trip!.stops)
})

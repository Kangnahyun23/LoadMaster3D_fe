import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import type { CargoPackage } from '@/domain/models'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { OptimizationSetupPage } from './OptimizationSetupPage'

const TRIP_ID = 'TRIP-2026-0914'

/** Seam: kho dùng chung → `optimization-api.ts` → hook → màn hình, không giả lập module nào. */
function renderSetup(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter initialEntries={[`/chuyen/${TRIP_ID}/toi-uu`]}>
          <Routes><Route path="/chuyen/:tripId/toi-uu" element={<OptimizationSetupPage />} /></Routes>
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
}

test('the seed trip is ready to optimize, and the screen never says "AI"', async () => {
  renderSetup()
  expect(await screen.findByText('Không có lỗi — có thể tối ưu.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tối ưu' })).toBeEnabled()
  expect(document.body.textContent ?? '').not.toMatch(/\bAI\b/)
})

test('a package with no usable orientation disables Optimize and the summary links to exactly that package', async () => {
  const db = getMockDb()
  const trip = await db.getTrip(TRIP_ID)
  const source = trip.packages[0] as CargoPackage
  const broken: CargoPackage = { ...source, id: 'PKG-900', allowedOrientations: ['HWL'], keepUpright: true }
  await db.updateTrip(TRIP_ID, { packages: [...trip.packages, broken] })

  renderSetup()
  const summary = within(await screen.findByRole('region', { name: 'Kiểm tra trước khi tối ưu' }))
  const link = await summary.findByRole('link', { name: /PKG-900/ })
  expect(link).toHaveAttribute('href', `/chuyen/${TRIP_ID}?kien=PKG-900`)
  expect(summary.getAllByRole('link')).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Tối ưu' })).toBeDisabled()

  await db.updateTrip(TRIP_ID, { packages: trip.packages })
})

test('fixing the cargo and coming back enables Optimize without touching the settings (LM-054)', async () => {
  const db = getMockDb()
  const trip = await db.getTrip(TRIP_ID)
  const source = trip.packages[0] as CargoPackage
  const broken: CargoPackage = { ...source, id: 'PKG-901', allowedOrientations: ['HWL'], keepUpright: true }
  await db.updateTrip(TRIP_ID, { packages: [...trip.packages, broken] })

  // Cùng QueryClient như app: lần mở lại đọc bản cache còn lỗi trước, rồi mới nhận dữ liệu đã sửa
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const first = renderSetup(client)
  expect(await screen.findByRole('link', { name: /PKG-901/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tối ưu' })).toBeDisabled()
  first.unmount()

  await db.updateTrip(TRIP_ID, { packages: trip.packages })
  void client.invalidateQueries({ queryKey: ['trips', TRIP_ID] })
  renderSetup(client)
  expect(await screen.findByText('Không có lỗi — có thể tối ưu.')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tối ưu' })).toBeEnabled())
})

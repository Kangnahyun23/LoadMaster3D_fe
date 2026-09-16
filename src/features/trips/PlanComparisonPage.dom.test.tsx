import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, test } from 'vitest'
import { createFormatter } from '@/lib/format'
import { I18nProvider } from '@/lib/i18n'
import { getMockDb } from '@/lib/mock-db'
import { twoCartonRequest, twoCartonResult, twoCartonTrip } from '@/test/mock-db-samples'
import { PlanComparisonPage } from './PlanComparisonPage'

/**
 * Seam kiểm thử là kho dùng chung (`@/lib/mock-db`) → `trips-api.ts` → hook → màn hình, không giả lập module nào:
 * số trên thẻ phải truy về `result.metrics` của revision (tiêu chí nghiệm thu LM-051).
 */
const SEED_TRIP = 'TRIP-2026-0914'
const vi = createFormatter('vi-VN')

function renderComparison(tripId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const { container } = render(
    <QueryClientProvider client={client}>
      <I18nProvider>
        <MemoryRouter initialEntries={[`/chuyen/${tripId}/so-sanh`]}>
          <Routes>
            <Route path="/chuyen/:tripId/so-sanh" element={<PlanComparisonPage />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  )
  return container
}

/** Nút hoặc link mang lớp nền primary của `Button` — màn chỉ được có đúng một (AGENTS.md mục 5). */
function primaryActions(container: HTMLElement) {
  return container.querySelectorAll('a.bg-primary, button.bg-primary')
}

test('thẻ revision của chuyến seed: số khớp result.metrics, bản duyệt và bản nguồn tách bạch, một nút primary', async () => {
  const [source, approved] = await getMockDb().listRevisions(SEED_TRIP)
  if (!source || !approved) throw new Error('Seed phải có revision nguồn và revision đã duyệt')
  const container = renderComparison(SEED_TRIP)

  const sourceCard = within(await screen.findByRole('article', { name: source.id }))
  const approvedCard = within(screen.getByRole('article', { name: approved.id }))

  for (const [card, revision] of [[sourceCard, source], [approvedCard, approved]] as const) {
    const { metrics } = revision.result
    expect(card.getByText('MOCK RESULT')).toBeInTheDocument()
    expect(card.getByText(vi.percent(metrics.volumeUtilizationPercent))).toBeInTheDocument()
    expect(card.getByText(vi.percent(metrics.payloadUtilizationPercent))).toBeInTheDocument()
    expect(card.getByText(`${vi.integer(metrics.placedCount)} kiện`)).toBeInTheDocument()
    expect(card.getByText(`${vi.integer(metrics.unplacedCount)} kiện`)).toBeInTheDocument()
    expect(card.getByText(`${vi.integer(metrics.runtimeMs)} ms`)).toBeInTheDocument()
    expect(card.getByText(String(revision.request.settings.randomSeed))).toBeInTheDocument()
    expect(card.getByText('Mock (xếp kệ tất định)')).toBeInTheDocument()
  }
  // Số seed kiểm bằng máy: 16.552.000 / 40.608.000 cm³ = 40,76%; 5.844 / 9.500 kg = 61,52%; 132 kiện, seed 20260914, LIFO bật.
  expect(approvedCard.getByText('40,8%')).toBeInTheDocument()
  expect(approvedCard.getByText('61,5%')).toBeInTheDocument()
  expect(approvedCard.getByText('132 kiện')).toBeInTheDocument()
  expect(approvedCard.getByText('20260914')).toBeInTheDocument()
  expect(approvedCard.getByText('30 giây')).toBeInTheDocument()

  expect(approvedCard.getByText('Đã duyệt')).toBeInTheDocument()
  expect(approvedCard.getByText('Mới nhất')).toBeInTheDocument()
  expect(approvedCard.getByText(`Duyệt từ ${source.id}`)).toBeInTheDocument()
  expect(sourceCard.queryByText('Đã duyệt')).not.toBeInTheDocument()
  expect(sourceCard.queryByText('Mới nhất')).not.toBeInTheDocument()
  expect(sourceCard.getByText(`Đã duyệt thành ${approved.id}`)).toBeInTheDocument()
  expect(screen.queryByText('Lỗi thời')).not.toBeInTheDocument()

  // Mặc định chọn bản đã duyệt; chọn bản nguồn thì hành động chính đổi theo, vẫn chỉ một nút primary.
  const plannerHref = `/chuyen/${SEED_TRIP}/phuong-an?revision=${encodeURIComponent(approved.id)}`
  expect(screen.getByRole('link', { name: `Mở ${approved.id} trong 3D` })).toHaveAttribute('href', plannerHref)
  expect(primaryActions(container)).toHaveLength(1)
  expect(screen.getByRole('link', { name: 'Chạy thêm phương án' })).toHaveAttribute('href', `/chuyen/${SEED_TRIP}/toi-uu`)

  await userEvent.setup().click(sourceCard.getByRole('button', { name: 'Chọn phương án này' }))
  expect(sourceCard.getByRole('button', { name: 'Đang chọn' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('link', { name: `Mở ${source.id} trong 3D` })).toHaveAttribute(
    'href',
    `/chuyen/${SEED_TRIP}/phuong-an?revision=${encodeURIComponent(source.id)}`,
  )
  expect(primaryActions(container)).toHaveLength(1)
})

test('chuyến chưa có revision: trạng thái rỗng dẫn tới Thiết lập tối ưu', async () => {
  const trip = await getMockDb().createTrip(twoCartonTrip())
  const container = renderComparison(trip.id)

  expect(await screen.findByText('Chưa đủ phương án để so sánh')).toBeInTheDocument()
  expect(screen.getByText(/mới có 0 phương án đã lưu/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Thiết lập tối ưu' })).toHaveAttribute('href', `/chuyen/${trip.id}/toi-uu`)
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  expect(primaryActions(container)).toHaveLength(1)
})

test('chuyến có đúng một revision: trạng thái rỗng, kèm lối mở revision đó', async () => {
  const db = getMockDb()
  const trip = await db.createTrip(twoCartonTrip())
  const only = await db.addRevision({ tripId: trip.id, request: twoCartonRequest(), result: twoCartonResult() })
  renderComparison(trip.id)

  expect(await screen.findByText('Chưa đủ phương án để so sánh')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Mở phương án đã có' })).toHaveAttribute(
    'href',
    `/chuyen/${trip.id}/phuong-an?revision=${only.id}`,
  )
  expect(screen.getByRole('link', { name: 'Thiết lập tối ưu' })).toHaveAttribute('href', `/chuyen/${trip.id}/toi-uu`)
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, test } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { FleetPage } from './FleetPage'
import { VehicleDetailPage } from './VehicleDetailPage'

/**
 * Ba ca nghiệm thu của LM-040 / LM-041, chạy qua kho mock thật (không giả lập kho):
 * cửa rộng hơn lòng thùng, vật cản vượt ra ngoài thùng, và lưu xe mới rồi thấy nó trong danh sách.
 */

const SLOW = { timeout: 5000 }

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/doi-xe', element: <FleetPage /> },
      { path: '/doi-xe/moi', element: <VehicleDetailPage /> },
      { path: '/doi-xe/:vehicleId', element: <VehicleDetailPage /> },
    ],
    { initialEntries: [path] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>,
  )
  return userEvent.setup()
}

/** Ô số: xoá giá trị cũ rồi gõ giá trị mới. */
async function retype(user: ReturnType<typeof userEvent.setup>, field: HTMLElement, value: string) {
  await user.clear(field)
  await user.type(field, value)
}

test('a door wider than the cargo space fails on the door field with the Spec sentence', async () => {
  const user = renderAt('/doi-xe/VEHICLE-001')

  // Truck 6m của Spec mục 12: lòng thùng rộng 240 cm, cửa 220 cm
  const doorWidth = await screen.findByLabelText('Chiều rộng cửa', {}, SLOW)
  await retype(user, doorWidth, '250')
  await user.click(screen.getByRole('button', { name: 'Lưu' }))

  const sentence = 'Chiều rộng cửa 250 cm không được lớn hơn chiều rộng lòng thùng 240 cm.'
  expect(await screen.findAllByText(sentence)).not.toHaveLength(0)
  expect(doorWidth).toHaveAttribute('aria-invalid', 'true')
})

test('an obstacle sticking out of the cargo space fails on its own row', async () => {
  const user = renderAt('/doi-xe/VEHICLE-001')

  // Hốc bánh xe OBS-001 dài 120 cm đặt ở x = 0; thùng dài 600 cm
  const length = await screen.findByLabelText('Dài OBS-001', {}, SLOW)
  await retype(user, length, '700')
  await user.click(screen.getByRole('button', { name: 'Lưu' }))

  const rowErrors = await screen.findByRole('list', { name: 'Lỗi theo dòng vật cản' }, SLOW)
  expect(within(rowErrors).getByText('Vật cản OBS-001 vượt chiều dài thùng 100 cm.')).toBeInTheDocument()
  // Lỗi thuộc cả dòng, không thuộc riêng ô chiều dài
  expect(length).not.toHaveAttribute('aria-invalid')
})

test('a saved new vehicle shows up in the fleet list without reloading the page', async () => {
  const user = renderAt('/doi-xe/moi')
  const name = 'Hino FC9J đông lạnh · 51C-190.08'

  await user.type(screen.getByLabelText(/^Tên xe/), name)
  await user.click(screen.getByRole('button', { name: 'Lưu' }))

  expect(await screen.findByRole('heading', { name: 'Đội xe' }, SLOW)).toBeInTheDocument()
  expect(await screen.findByText(name, {}, SLOW)).toBeInTheDocument()
})

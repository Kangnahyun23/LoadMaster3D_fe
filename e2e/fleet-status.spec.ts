import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { MOCK_DB, navigateInApp, SEED_TRIP } from './spec-flow-helpers'

/**
 * Trạng thái xe và bảo dưỡng (LM-089, D-53). Seed neo hôm nay: VEHICLE-003/006/007 đang chạy, VEHICLE-008 bảo dưỡng. Kho nằm
 * trong bộ nhớ trang nên sau khi ghi chỉ đổi route phía client.
 */
test.use({ collectConsoleErrors: true })

const row = (page: Page, vehicleId: string) => page.getByRole('row', { name: new RegExp(vehicleId) })

test('putting a vehicle into maintenance and ending it changes its status on the list', async ({ page, login, browserErrors }) => {
  await login('/doi-xe')
  await expect(row(page, 'VEHICLE-001')).toContainText('Sẵn sàng')
  await expect(row(page, 'VEHICLE-008')).toContainText('Bảo dưỡng')
  await expect(row(page, 'VEHICLE-007').getByRole('link', { name: 'TRIP-011', exact: true })).toHaveAttribute('href', '/chuyen/TRIP-011')

  await page.getByRole('link', { name: 'Truck 6m', exact: true }).click()
  await page.waitForURL(/\/doi-xe\/VEHICLE-001$/)
  await page.getByRole('button', { name: 'Đưa vào bảo dưỡng', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Đưa xe Truck 6m vào bảo dưỡng?' })
  await dialog.getByLabel('Ghi chú bảo dưỡng').fill('Thay lốp cầu sau')
  await dialog.getByRole('button', { name: 'Đưa vào bảo dưỡng', exact: true }).click()
  await expect(page.getByText('Đã đưa xe Truck 6m vào bảo dưỡng')).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Xe đang bảo dưỡng từ' })).toContainText('Ghi chú: Thay lốp cầu sau')

  await page.getByRole('link', { name: 'Quay lại đội xe', exact: true }).click()
  await expect(row(page, 'VEHICLE-001')).toContainText('Bảo dưỡng')
  await expect(row(page, 'VEHICLE-001')).toContainText('Thay lốp cầu sau')
  await page.getByRole('combobox', { name: 'Trạng thái', exact: true }).click()
  await page.getByRole('option', { name: 'Bảo dưỡng', exact: true }).click()
  await expect(page).toHaveURL(/\/doi-xe\?trang-thai=bao-duong$/)
  await expect(page.getByRole('row').filter({ hasText: /VEHICLE-\d+/ })).toHaveCount(2)

  await row(page, 'VEHICLE-001').click()
  await page.getByRole('button', { name: 'Kết thúc bảo dưỡng', exact: true }).click()
  await expect(page.getByText('Xe Truck 6m đã sẵn sàng trở lại')).toBeVisible()
  await expect(page.locator('header').filter({ hasText: 'Truck 6m' })).toContainText('Sẵn sàng')
  expect(browserErrors).toStrictEqual([])
})

test('a vehicle becomes "on a trip" when the warehouse starts loading, and its configuration locks', async ({ page, login, browserErrors }) => {
  await login('/doi-xe')
  await expect(row(page, 'VEHICLE-002')).toContainText('Sẵn sàng')

  // Kho bắt đầu xếp chuyến chính (đã duyệt, xe VEHICLE-002) — cùng hàm màn kho gọi.
  await page.evaluate(async ({ db, tripId }) => {
    const { getMockDb } = (await import(db)) as typeof import('@/lib/mock-db')
    await getMockDb().startLoading(tripId)
  }, { db: MOCK_DB, tripId: SEED_TRIP })
  await navigateInApp(page, '/doi-xe/VEHICLE-002')

  const banner = page.getByRole('status').filter({ hasText: 'Xe đang chạy chuyến' })
  await expect(banner).toContainText(`Xe đang chạy chuyến ${SEED_TRIP}: cấu hình bị khoá tới khi chuyến kết thúc`)
  await expect(banner.getByRole('link', { name: `Xem chuyến ${SEED_TRIP}`, exact: true })).toHaveAttribute('href', `/chuyen/${SEED_TRIP}`)
  await expect(page.getByRole('spinbutton', { name: 'Chiều rộng cửa', exact: true })).toBeDisabled()
  for (const name of ['Lưu', 'Xoá xe', 'Đưa vào bảo dưỡng']) await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0)

  await page.getByRole('link', { name: 'Quay lại đội xe', exact: true }).click()
  await expect(row(page, 'VEHICLE-002')).toContainText('Đang phục vụ chuyến')
  await expect(row(page, 'VEHICLE-002').getByRole('link', { name: SEED_TRIP, exact: true })).toBeVisible()
  expect(browserErrors).toStrictEqual([])
})
